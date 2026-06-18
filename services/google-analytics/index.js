import { BetaAnalyticsDataClient } from "@google-analytics/data";

import {
  getComparisonDateRanges,
  getPercentChange,
  resolveDateRange,
} from "@/utils/date-range";

function getGoogleAnalyticsConfig(propertyIdOverride) {
  const propertyId = propertyIdOverride || process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  const credentials = getGoogleAnalyticsCredentials();

  if (!propertyId) {
    throw new Error(
      "Missing GA4 property ID. Select a project with a GA4 Property ID or set GOOGLE_ANALYTICS_PROPERTY_ID."
    );
  }

  return {
    propertyId,
    ...credentials,
  };
}

export async function getGoogleAnalyticsTopPageUrls(
  propertyIdOverride,
  website,
  limit = 20
) {
  const { propertyId } = getGoogleAnalyticsConfig(propertyIdOverride);
  const analyticsDataClient = createAnalyticsClient();
  const dateRange = resolveDateRange({ range: "last_3_months" });
  const pageLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const origin = new URL(website).origin;
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: "pagePath" }],
    metrics: [
      { name: "screenPageViews" },
      { name: "activeUsers" },
      { name: "sessions" },
    ],
    limit: pageLimit,
    orderBys: [
      {
        metric: {
          metricName: "screenPageViews",
        },
        desc: true,
      },
    ],
  });

  return (response.rows || []).map((row) => {
    const path = row.dimensionValues?.[0]?.value || "/";
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return {
      activeUsers: getMetricValue(row, 1),
      pageViews: getMetricValue(row, 0),
      path: normalizedPath === "/" ? "Homepage" : normalizedPath,
      sessions: getMetricValue(row, 2),
      url: `${origin}${normalizedPath}`,
    };
  });
}

function getGoogleAnalyticsCredentials() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing shared Google service account env vars: GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
    );
  }

  return {
    clientEmail,
    privateKey,
  };
}

function createAnalyticsClient() {
  const { clientEmail, privateKey } = getGoogleAnalyticsCredentials();

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

function getDateRange(dateRangeOverride = {}) {
  if (dateRangeOverride.startDate && dateRangeOverride.endDate) {
    return dateRangeOverride;
  }

  return resolveDateRange({
    endDate: process.env.GOOGLE_ANALYTICS_END_DATE,
    range: dateRangeOverride.range,
    startDate: process.env.GOOGLE_ANALYTICS_START_DATE,
  });
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

function formatYearMonthLabel(yearMonth) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(new Date(`${yearMonth.slice(0, 4)}-${yearMonth.slice(4, 6)}-01T00:00:00`));
}

function getMonthKey(date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthlyDateRange(months) {
  const end = new Date();

  const start = new Date(end);
  start.setDate(1);
  start.setMonth(start.getMonth() - months + 1);

  return {
    endDate: end.toISOString().slice(0, 10),
    startDate: start.toISOString().slice(0, 10),
  };
}

function getMonthlyKeys(months) {
  const end = new Date();
  end.setDate(1);

  return Array.from({ length: months }, (_, index) => {
    const date = new Date(end);
    date.setMonth(end.getMonth() - months + index + 1);
    const key = getMonthKey(date);

    return {
      key,
      label: formatYearMonthLabel(key),
    };
  });
}

function getOverviewFromRow(row) {
  return {
    activeUsers: getMetricValue(row, 0),
    newUsers: getMetricValue(row, 1),
    sessions: getMetricValue(row, 2),
    pageViews: getMetricValue(row, 3),
    eventCount: getMetricValue(row, 4),
    engagementRate: getMetricValue(row, 5),
    bounceRate: getMetricValue(row, 6),
    averageSessionDuration: getMetricValue(row, 7),
  };
}

function createEmptyMonthValues(months) {
  return Object.fromEntries(months.map((month) => [month.key, 0]));
}

function formatSeconds(value) {
  const roundedValue = Math.round(value || 0);
  const minutes = Math.floor(roundedValue / 60);
  const seconds = roundedValue % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getMonthValue(row, index) {
  return row.dimensionValues?.[index]?.value || "";
}

function pivotRows(rows, months, labelIndex, metricIndex = 0) {
  const byLabel = new Map();

  rows.forEach((row) => {
    const month = getMonthValue(row, 0);
    const label = getMonthValue(row, labelIndex) || "Unknown";
    const current = byLabel.get(label) || {
      label,
      values: createEmptyMonthValues(months),
    };

    current.values[month] = getMetricValue(row, metricIndex);
    byLabel.set(label, current);
  });

  return Array.from(byLabel.values());
}

function sortRowsByLatestMonth(rows, latestMonthKey) {
  return rows.sort(
    (first, second) =>
      (second.values[latestMonthKey] || 0) - (first.values[latestMonthKey] || 0)
  );
}

function getOverviewComparison(current, previous, twoPeriodsAgo) {
  return Object.fromEntries(
    Object.keys(current).map((key) => [
      key,
      {
        changeFromPrevious: getPercentChange(current[key], previous[key]),
        current: current[key],
        previous: previous[key],
        twoPeriodsAgo: twoPeriodsAgo[key],
      },
    ])
  );
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

export async function getGoogleAnalyticsDashboard(
  propertyIdOverride,
  dateRangeOverride
) {
  const { propertyId } = getGoogleAnalyticsConfig(propertyIdOverride);
  const analyticsDataClient = createAnalyticsClient();
  const dateRange = getDateRange(dateRangeOverride);
  const comparisonDateRanges = getComparisonDateRanges(dateRange);

  const overviewMetrics = [
    { name: "activeUsers" },
    { name: "newUsers" },
    { name: "sessions" },
    { name: "screenPageViews" },
    { name: "eventCount" },
    { name: "engagementRate" },
    { name: "bounceRate" },
    { name: "averageSessionDuration" },
  ];

  const [
    overviewResponse,
    previousOverviewResponse,
    twoPeriodsAgoOverviewResponse,
    trendResponse,
    pagesResponse,
    countriesResponse,
    pageDetailsResponse,
  ] = await Promise.all([
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      metrics: overviewMetrics,
    }),
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [comparisonDateRanges.previous],
      metrics: overviewMetrics,
    }),
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [comparisonDateRanges.twoPeriodsAgo],
      metrics: overviewMetrics,
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

  const overview = getOverviewFromRow(overviewResponse[0].rows?.[0]);
  const previousOverview = getOverviewFromRow(
    previousOverviewResponse[0].rows?.[0]
  );
  const twoPeriodsAgoOverview = getOverviewFromRow(
    twoPeriodsAgoOverviewResponse[0].rows?.[0]
  );

  return {
    comparison: {
      dateRanges: comparisonDateRanges,
      overview: getOverviewComparison(
        overview,
        previousOverview,
        twoPeriodsAgoOverview
      ),
    },
    dateRange,
    overview,
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

export async function getGoogleAnalyticsMonthlyComparison(
  propertyIdOverride,
  months = 3
) {
  const { propertyId } = getGoogleAnalyticsConfig(propertyIdOverride);
  const analyticsDataClient = createAnalyticsClient();
  const normalizedMonths = Math.min(Math.max(Number(months) || 3, 1), 12);
  const monthColumns = getMonthlyKeys(normalizedMonths);
  const latestMonthKey = monthColumns.at(-1)?.key;
  const dateRange = getMonthlyDateRange(normalizedMonths);

  const [
    overviewResponse,
    sourceResponse,
    aiSourceResponse,
    deviceResponse,
    pageResponse,
  ] = await Promise.all([
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "yearMonth" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "newUsers" },
      ],
      orderBys: [{ dimension: { dimensionName: "yearMonth" } }],
    }),
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "yearMonth" }, { name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      limit: 250,
    }),
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "yearMonth" }, { name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      limit: 500,
    }),
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "yearMonth" }, { name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
      limit: 100,
    }),
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "yearMonth" }, { name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      limit: 1000,
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    }),
  ]);

  const overviewByMonth = new Map(
    (overviewResponse[0].rows || []).map((row) => [
      getMonthValue(row, 0),
      {
        activeUsers: getMetricValue(row, 1),
        averageSessionDuration: getMetricValue(row, 3),
        newUsers: getMetricValue(row, 4),
        pageViews: getMetricValue(row, 2),
        returningUsers: Math.max(
          getMetricValue(row, 1) - getMetricValue(row, 4),
          0
        ),
        sessions: getMetricValue(row, 0),
      },
    ])
  );

  const overallTraffic = [
    {
      label: "Sessions",
      values: Object.fromEntries(
        monthColumns.map((month) => [
          month.key,
          overviewByMonth.get(month.key)?.sessions || 0,
        ])
      ),
    },
    {
      label: "Users",
      values: Object.fromEntries(
        monthColumns.map((month) => [
          month.key,
          overviewByMonth.get(month.key)?.activeUsers || 0,
        ])
      ),
    },
    {
      label: "Pageviews",
      values: Object.fromEntries(
        monthColumns.map((month) => [
          month.key,
          overviewByMonth.get(month.key)?.pageViews || 0,
        ])
      ),
    },
    {
      label: "Avg. Eng Time",
      valueType: "duration",
      values: Object.fromEntries(
        monthColumns.map((month) => [
          month.key,
          overviewByMonth.get(month.key)?.averageSessionDuration || 0,
        ])
      ),
    },
  ];

  const newVsReturning = [
    {
      label: "New Visits",
      values: Object.fromEntries(
        monthColumns.map((month) => [
          month.key,
          overviewByMonth.get(month.key)?.newUsers || 0,
        ])
      ),
    },
    {
      label: "Returning Visits",
      values: Object.fromEntries(
        monthColumns.map((month) => [
          month.key,
          overviewByMonth.get(month.key)?.returningUsers || 0,
        ])
      ),
    },
  ];

  const aiMatchers = [
    { label: "ChatGPT", regex: /chatgpt|openai/i },
    { label: "Gemini", regex: /gemini|bard/i },
    { label: "Perplexity", regex: /perplexity/i },
  ];
  const aiTrafficSources = aiMatchers.map((matcher) => ({
    label: matcher.label,
    values: createEmptyMonthValues(monthColumns),
  }));

  (aiSourceResponse[0].rows || []).forEach((row) => {
    const month = getMonthValue(row, 0);
    const source = getMonthValue(row, 1);
    const match = aiMatchers.find((matcher) => matcher.regex.test(source));

    if (match) {
      const item = aiTrafficSources.find((sourceItem) => sourceItem.label === match.label);
      item.values[month] += getMetricValue(row, 0);
    }
  });

  const sourceWiseTraffic = sortRowsByLatestMonth(
    pivotRows(sourceResponse[0].rows || [], monthColumns, 1),
    latestMonthKey
  ).slice(0, 8);
  const deviceWiseTraffic = sortRowsByLatestMonth(
    pivotRows(deviceResponse[0].rows || [], monthColumns, 1),
    latestMonthKey
  );
  const pageRows = sortRowsByLatestMonth(
    pivotRows(pageResponse[0].rows || [], monthColumns, 1),
    latestMonthKey
  );
  const newsRows = pageRows
    .filter((row) => row.label.includes("/news-and-insights"))
    .slice(0, 10);

  return {
    dateRange,
    formatters: {
      duration: formatSeconds,
    },
    monthColumns,
    reports: {
      aiTrafficSources,
      deviceWiseTraffic,
      mostVisitedNewsPages: newsRows,
      mostVisitedPages: pageRows.slice(0, 10),
      newVsReturning,
      overallTraffic,
      sourceWiseTraffic,
    },
  };
}
