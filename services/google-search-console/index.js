import { google } from "googleapis";

const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

function getDateString(date) {
  return date.toISOString().slice(0, 10);
}

function getSearchConsoleDateRange() {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 2);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 27);

  return {
    startDate:
      process.env.GOOGLE_SEARCH_CONSOLE_START_DATE || getDateString(startDate),
    endDate: process.env.GOOGLE_SEARCH_CONSOLE_END_DATE || getDateString(endDate),
  };
}

function getSearchConsoleConfig(siteUrlOverride) {
  const siteUrl =
    siteUrlOverride || process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || "";
  const clientEmail =
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL ||
    process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
  const privateKey = (
    process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY ||
    process.env.GOOGLE_ANALYTICS_PRIVATE_KEY ||
    ""
  ).replace(/\\n/g, "\n");

  if (!siteUrl) {
    throw new Error(
      "Missing Search Console site URL. Select a project with a Search Console Site URL or set GOOGLE_SEARCH_CONSOLE_SITE_URL."
    );
  }

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing Search Console credentials. Set GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL and GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY, or reuse the Google Analytics service-account env vars."
    );
  }

  return {
    clientEmail,
    privateKey,
    siteUrl,
  };
}

function createSearchConsoleClient(siteUrlOverride) {
  const { clientEmail, privateKey } = getSearchConsoleConfig(siteUrlOverride);
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [SEARCH_CONSOLE_SCOPE],
  });

  return google.searchconsole({
    auth,
    version: "v1",
  });
}

function formatDateForLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatDimensionValue(value, fallback = "Unknown") {
  return value || fallback;
}

function normalizeRow(row, keys = []) {
  return keys.reduce(
    (current, key, index) => ({
      ...current,
      [key]: row.keys?.[index] || "",
    }),
    {
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    }
  );
}

function summarizeOverview(rows) {
  const totals = rows.reduce(
    (current, row) => ({
      clicks: current.clicks + (row.clicks || 0),
      impressions: current.impressions + (row.impressions || 0),
      weightedPosition:
        current.weightedPosition +
        (row.position || 0) * (row.impressions || 0),
    }),
    {
      clicks: 0,
      impressions: 0,
      weightedPosition: 0,
    }
  );

  return {
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
    averagePosition:
      totals.impressions > 0 ? totals.weightedPosition / totals.impressions : 0,
  };
}

export async function getSearchConsoleDashboard(siteUrlOverride) {
  const { siteUrl } = getSearchConsoleConfig(siteUrlOverride);
  const searchConsole = createSearchConsoleClient(siteUrlOverride);
  const dateRange = getSearchConsoleDateRange();

  async function runSearchAnalyticsQuery(dimensions = [], rowLimit = 25) {
    const response = await searchConsole.searchanalytics.query({
      requestBody: {
        ...dateRange,
        dimensions,
        rowLimit,
      },
      siteUrl,
    });

    return response.data.rows || [];
  }

  const [overviewRows, trendRows, queryRows, pageRows, countryRows, deviceRows] =
    await Promise.all([
      runSearchAnalyticsQuery([], 1),
      runSearchAnalyticsQuery(["date"], 90),
      runSearchAnalyticsQuery(["query"], 25),
      runSearchAnalyticsQuery(["page"], 25),
      runSearchAnalyticsQuery(["country"], 25),
      runSearchAnalyticsQuery(["device"], 10),
    ]);

  const overview = overviewRows[0]
    ? normalizeRow(overviewRows[0])
    : summarizeOverview(trendRows);

  return {
    dateRange,
    overview,
    siteUrl,
    trend: trendRows.map((row) => {
      const item = normalizeRow(row, ["date"]);

      return {
        ...item,
        label: formatDateForLabel(item.date),
      };
    }),
    topQueries: queryRows.map((row) => normalizeRow(row, ["query"])),
    topPages: pageRows.map((row) => normalizeRow(row, ["page"])),
    countries: countryRows.map((row) => {
      const item = normalizeRow(row, ["country"]);

      return {
        ...item,
        country: formatDimensionValue(item.country),
      };
    }),
    devices: deviceRows.map((row) => {
      const item = normalizeRow(row, ["device"]);

      return {
        ...item,
        device: formatDimensionValue(item.device),
      };
    }),
  };
}
