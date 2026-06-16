import { BetaAnalyticsDataClient } from "@google-analytics/data";

function getGoogleAnalyticsConfig() {
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  const clientEmail = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_ANALYTICS_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!propertyId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Google Analytics env vars: GOOGLE_ANALYTICS_PROPERTY_ID, GOOGLE_ANALYTICS_CLIENT_EMAIL, GOOGLE_ANALYTICS_PRIVATE_KEY"
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

async function getMetric(metricName) {
  const { propertyId } = getGoogleAnalyticsConfig();
  const analyticsDataClient = createAnalyticsClient();
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: process.env.GOOGLE_ANALYTICS_START_DATE || "30daysAgo",
        endDate: process.env.GOOGLE_ANALYTICS_END_DATE || "today",
      },
    ],
    metrics: [
      {
        name: metricName,
      },
    ],
  });

  return Number(response.rows?.[0]?.metricValues?.[0]?.value || 0);
}

export async function getUsers() {
  return getMetric("activeUsers");
}

export async function getSessions() {
  return getMetric("sessions");
}

export async function getPageViews() {
  return getMetric("screenPageViews");
}
