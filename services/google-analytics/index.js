import { BetaAnalyticsDataClient } from "@google-analytics/data";

function getGoogleAnalyticsConfig(propertyIdOverride) {
  const propertyId = propertyIdOverride || process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  const clientEmail = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_ANALYTICS_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!propertyId) {
    throw new Error(
      "Missing GA4 property ID. Select a project with a GA4 Property ID or set GOOGLE_ANALYTICS_PROPERTY_ID."
    );
  }

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing Google Analytics env vars: GOOGLE_ANALYTICS_CLIENT_EMAIL, GOOGLE_ANALYTICS_PRIVATE_KEY"
    );
  }

  return {
    propertyId,
    clientEmail,
    privateKey,
  };
}

function createAnalyticsClient() {
  const { clientEmail, privateKey } = getGoogleAnalyticsConfig();

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

function getDateRange() {
  return {
    startDate: process.env.GOOGLE_ANALYTICS_START_DATE || "30daysAgo",
    endDate: process.env.GOOGLE_ANALYTICS_END_DATE || "today",
  };
}

function getMetricValue(row, index) {
  return Number(row?.metricValues?.[index]?.value || 0);
}

function formatDateForLabel(date) {
  const normalizedDate = /^\d{8}$/.test(date)
    ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
    : date;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${normalizedDate}T00:00:00`));
}

async function getMetric(metricName, propertyIdOverride) {
  const { propertyId } = getGoogleAnalyticsConfig(propertyIdOverride);
  const analyticsDataClient = createAnalyticsClient();
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [getDateRange()],
    metrics: [
      {
        name: metricName,
      },
    ],
  });

  return Number(response.rows?.[0]?.metricValues?.[0]?.value || 0);
}

export async function getUsers(propertyId) {
  return getMetric("activeUsers", propertyId);
}

export async function getSessions(propertyId) {
  return getMetric("sessions", propertyId);
}

export async function getPageViews(propertyId) {
  return getMetric("screenPageViews", propertyId);
}

export async function getGoogleAnalyticsDashboard(propertyIdOverride) {
  const { propertyId } = getGoogleAnalyticsConfig(propertyIdOverride);
  const analyticsDataClient = createAnalyticsClient();
  const dateRange = getDateRange();

  const [
    overviewResponse,
    trendResponse,
    pagesResponse,
    countriesResponse,
    pageDetailsResponse,
  ] = await Promise.all([
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "eventCount" },
        { name: "engagementRate" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    }),
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
      orderBys: [
        {
          dimension: {
            dimensionName: "date",
          },
        },
      ],
    }),
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
        { name: "eventCount" },
      ],
      limit: 10,
      orderBys: [
        {
          metric: {
            metricName: "screenPageViews",
          },
          desc: true,
        },
      ],
    }),
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "country" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
      ],
      limit: 20,
      orderBys: [
        {
          metric: {
            metricName: "sessions",
          },
          desc: true,
        },
      ],
    }),
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "pageTitle" }, { name: "unifiedScreenClass" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "eventCount" },
      ],
      limit: 20,
      orderBys: [
        {
          metric: {
            metricName: "screenPageViews",
          },
          desc: true,
        },
      ],
    }),
  ]);

  const overviewRow = overviewResponse[0].rows?.[0];

  return {
    dateRange,
    overview: {
      activeUsers: getMetricValue(overviewRow, 0),
      newUsers: getMetricValue(overviewRow, 1),
      sessions: getMetricValue(overviewRow, 2),
      pageViews: getMetricValue(overviewRow, 3),
      eventCount: getMetricValue(overviewRow, 4),
      engagementRate: getMetricValue(overviewRow, 5),
      bounceRate: getMetricValue(overviewRow, 6),
      averageSessionDuration: getMetricValue(overviewRow, 7),
    },
    trend: (trendResponse[0].rows || []).map((row) => {
      const date = row.dimensionValues?.[0]?.value;

      return {
        date,
        label: formatDateForLabel(date),
        activeUsers: getMetricValue(row, 0),
        sessions: getMetricValue(row, 1),
        pageViews: getMetricValue(row, 2),
      };
    }),
    topPages: (pagesResponse[0].rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || "/",
      pageViews: getMetricValue(row, 0),
      activeUsers: getMetricValue(row, 1),
      eventCount: getMetricValue(row, 2),
    })),
    countries: (countriesResponse[0].rows || []).map((row) => ({
      country: row.dimensionValues?.[0]?.value || "Unknown",
      sessions: getMetricValue(row, 0),
      activeUsers: getMetricValue(row, 1),
      newUsers: getMetricValue(row, 2),
      pageViews: getMetricValue(row, 3),
      engagementRate: getMetricValue(row, 4),
    })),
    pageDetails: (pageDetailsResponse[0].rows || []).map((row) => ({
      pageTitle: row.dimensionValues?.[0]?.value || "(not set)",
      screenClass: row.dimensionValues?.[1]?.value || "(not set)",
      pageViews: getMetricValue(row, 0),
      sessions: getMetricValue(row, 1),
      activeUsers: getMetricValue(row, 2),
      eventCount: getMetricValue(row, 3),
    })),
  };
}
