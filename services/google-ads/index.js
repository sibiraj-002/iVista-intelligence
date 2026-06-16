import { GoogleAdsApi } from "google-ads-api";

const MICROS = 1_000_000;

function cleanCustomerId(customerId) {
  return String(customerId || "").replaceAll("-", "");
}

function toNumber(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "object" && "value" in value) {
    return Number(value.value || 0);
  }

  return Number(value || 0);
}

function fromMicros(value) {
  return toNumber(value) / MICROS;
}

function getGoogleAdsConfig() {
  const config = {
    clientId: process.env.GOOGLE_ADS_CLIENT_ID,
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    managerCustomerId: cleanCustomerId(process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID),
    dateRange: process.env.GOOGLE_ADS_DATE_RANGE || "LAST_30_DAYS",
  };

  const missingKeys = Object.entries(config)
    .filter(([key, value]) => key !== "dateRange" && !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Missing Google Ads env vars: ${missingKeys.join(", ")}`);
  }

  return config;
}

function createGoogleAdsClient() {
  const { clientId, clientSecret, developerToken } = getGoogleAdsConfig();

  return new GoogleAdsApi({
    client_id: clientId,
    client_secret: clientSecret,
    developer_token: developerToken,
  });
}

function createCustomer(client, customerId) {
  const { managerCustomerId, refreshToken } = getGoogleAdsConfig();

  return client.Customer({
    customer_id: cleanCustomerId(customerId),
    login_customer_id: managerCustomerId,
    refresh_token: refreshToken,
  });
}

function createManagerCustomer(client) {
  const { managerCustomerId } = getGoogleAdsConfig();

  return createCustomer(client, managerCustomerId);
}

function calculateCtr(clicks, impressions) {
  return impressions > 0 ? (clicks / impressions) * 100 : 0;
}

function calculateAverageCpc(spend, clicks) {
  return clicks > 0 ? spend / clicks : 0;
}

function formatDateForLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

async function getManagedAccounts(client) {
  const managerCustomer = createManagerCustomer(client);
  const rows = await managerCustomer.query(`
    SELECT
      customer_client.client_customer,
      customer_client.descriptive_name,
      customer_client.id,
      customer_client.status,
      customer_client.manager,
      customer_client.hidden
    FROM customer_client
    WHERE customer_client.manager = FALSE
      AND customer_client.hidden = FALSE
  `);

  return rows.map((row) => ({
    customerId: cleanCustomerId(row.customer_client?.id),
    name:
      row.customer_client?.descriptive_name ||
      `Customer ${row.customer_client?.id}`,
    status: row.customer_client?.status || "UNKNOWN",
  }));
}

async function getAccountMetrics(client, account) {
  const { dateRange } = getGoogleAdsConfig();
  const customer = createCustomer(client, account.customerId);
  const rows = await customer.query(`
    SELECT
      customer.id,
      customer.descriptive_name,
      customer.status,
      metrics.cost_micros,
      metrics.clicks,
      metrics.impressions,
      metrics.conversions
    FROM customer
    WHERE segments.date DURING ${dateRange}
  `);
  const row = rows[0] || {};
  const clicks = toNumber(row.metrics?.clicks);
  const impressions = toNumber(row.metrics?.impressions);
  const spend = fromMicros(row.metrics?.cost_micros);
  const conversions = toNumber(row.metrics?.conversions);

  return {
    accountName: row.customer?.descriptive_name || account.name,
    customerId: account.customerId,
    status: row.customer?.status || account.status,
    spend,
    clicks,
    impressions,
    conversions,
    ctr: calculateCtr(clicks, impressions),
    averageCpc: calculateAverageCpc(spend, clicks),
  };
}

async function getCampaignMetrics(client, account) {
  const { dateRange } = getGoogleAdsConfig();
  const customer = createCustomer(client, account.customerId);
  const rows = await customer.query(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.cost_micros,
      metrics.clicks,
      metrics.impressions,
      metrics.conversions
    FROM campaign
    WHERE segments.date DURING ${dateRange}
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
    LIMIT 50
  `);

  return rows.map((row) => {
    const clicks = toNumber(row.metrics?.clicks);
    const impressions = toNumber(row.metrics?.impressions);

    return {
      campaignId: String(row.campaign?.id || ""),
      campaignName: row.campaign?.name || "Unnamed Campaign",
      campaignStatus: row.campaign?.status || "UNKNOWN",
      accountName: account.name,
      customerId: account.customerId,
      spend: fromMicros(row.metrics?.cost_micros),
      clicks,
      impressions,
      ctr: calculateCtr(clicks, impressions),
      conversions: toNumber(row.metrics?.conversions),
    };
  });
}

async function getTrendMetrics(client, account) {
  const { dateRange } = getGoogleAdsConfig();
  const customer = createCustomer(client, account.customerId);
  const rows = await customer.query(`
    SELECT
      segments.date,
      metrics.cost_micros,
      metrics.clicks,
      metrics.impressions,
      metrics.conversions
    FROM customer
    WHERE segments.date DURING ${dateRange}
    ORDER BY segments.date ASC
  `);

  return rows.map((row) => ({
    date: row.segments?.date,
    spend: fromMicros(row.metrics?.cost_micros),
    clicks: toNumber(row.metrics?.clicks),
    impressions: toNumber(row.metrics?.impressions),
    conversions: toNumber(row.metrics?.conversions),
  }));
}

function aggregateOverview(accounts) {
  const totals = accounts.reduce(
    (current, account) => ({
      spend: current.spend + account.spend,
      clicks: current.clicks + account.clicks,
      impressions: current.impressions + account.impressions,
      conversions: current.conversions + account.conversions,
    }),
    {
      spend: 0,
      clicks: 0,
      impressions: 0,
      conversions: 0,
    }
  );

  return {
    totalSpend: totals.spend,
    totalClicks: totals.clicks,
    totalImpressions: totals.impressions,
    totalConversions: totals.conversions,
    averageCtr: calculateCtr(totals.clicks, totals.impressions),
    averageCpc: calculateAverageCpc(totals.spend, totals.clicks),
  };
}

function aggregateTrend(rows) {
  const byDate = new Map();

  rows.forEach((row) => {
    const current = byDate.get(row.date) || {
      date: row.date,
      label: formatDateForLabel(row.date),
      spend: 0,
      clicks: 0,
      impressions: 0,
      conversions: 0,
    };

    current.spend += row.spend;
    current.clicks += row.clicks;
    current.impressions += row.impressions;
    current.conversions += row.conversions;

    byDate.set(row.date, current);
  });

  return Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export async function getMccGoogleAdsDashboard() {
  const client = createGoogleAdsClient();
  const accounts = await getManagedAccounts(client);
  const accountResults = await Promise.allSettled(
    accounts.map((account) => getAccountMetrics(client, account))
  );
  const campaignResults = await Promise.allSettled(
    accounts.map((account) => getCampaignMetrics(client, account))
  );
  const trendResults = await Promise.allSettled(
    accounts.map((account) => getTrendMetrics(client, account))
  );

  const accountMetrics = accountResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
  const campaigns = campaignResults
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .sort((a, b) => b.spend - a.spend);
  const trendRows = trendResults
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);

  return {
    overview: aggregateOverview(accountMetrics),
    accounts: accountMetrics,
    campaigns,
    trend: aggregateTrend(trendRows),
    failures: [
      ...accountResults,
      ...campaignResults,
      ...trendResults,
    ].filter((result) => result.status === "rejected").length,
  };
}
