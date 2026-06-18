const API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const DEFAULT_TOP_PAGE_LIMIT = 20;
const EXCLUDED_PAGE_PATTERNS = [
  "privacy",
  "terms",
  "cookie",
  "disclaimer",
  "refund",
  "return-policy",
  "shipping-policy",
  "conditions",
  "policy",
];

const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];
const FIELD_METRICS = {
  CUMULATIVE_LAYOUT_SHIFT_SCORE: "cls",
  EXPERIMENTAL_INTERACTION_TO_NEXT_PAINT: "inp",
  FIRST_CONTENTFUL_PAINT_MS: "fcp",
  LARGEST_CONTENTFUL_PAINT_MS: "lcp",
  TIME_TO_FIRST_BYTE_MS: "ttfb",
};

const AUDITS = [
  {
    key: "first-contentful-paint",
    label: "First Contentful Paint",
  },
  {
    key: "largest-contentful-paint",
    label: "Largest Contentful Paint",
  },
  {
    key: "total-blocking-time",
    label: "Total Blocking Time",
  },
  {
    key: "cumulative-layout-shift",
    label: "Cumulative Layout Shift",
  },
  {
    key: "speed-index",
    label: "Speed Index",
  },
  {
    key: "interactive",
    label: "Time to Interactive",
  },
];

function getApiKey() {
  const apiKey = process.env.PAGE_SPEED_INSIGHTS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing env var: PAGE_SPEED_INSIGHTS_API_KEY");
  }

  return apiKey;
}

function toScore(category) {
  if (!category || typeof category.score !== "number") {
    return null;
  }

  return Math.round(category.score * 100);
}

function getAuditValue(audits, key) {
  const audit = audits?.[key];

  return {
    description: audit?.description || "",
    displayValue: audit?.displayValue || "Not available",
    numericValue: typeof audit?.numericValue === "number" ? audit.numericValue : null,
    score: typeof audit?.score === "number" ? Math.round(audit.score * 100) : null,
    title: audit?.title || key,
  };
}

function normalizeUrl(url) {
  const value = url?.trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function getPathLabel(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname === "/" ? "Homepage" : parsedUrl.pathname;
  } catch {
    return url;
  }
}

export function isUsefulAuditPage(url) {
  try {
    const path = new URL(url).pathname.toLowerCase();

    return !EXCLUDED_PAGE_PATTERNS.some((pattern) => path.includes(pattern));
  } catch {
    return false;
  }
}

function formatFieldMetricValue(metricKey, percentile) {
  if (percentile === null || percentile === undefined) {
    return "N/A";
  }

  if (metricKey === "CUMULATIVE_LAYOUT_SHIFT_SCORE") {
    return (percentile / 100).toFixed(2).replace(/\.?0+$/, "");
  }

  return `${(percentile / 1000).toFixed(1)} s`;
}

function getCoreWebVitalsStatus(fieldExperience) {
  const metrics = fieldExperience?.metrics || {};
  const coreMetricKeys = [
    "LARGEST_CONTENTFUL_PAINT_MS",
    "EXPERIMENTAL_INTERACTION_TO_NEXT_PAINT",
    "CUMULATIVE_LAYOUT_SHIFT_SCORE",
  ];
  const availableCoreMetrics = coreMetricKeys
    .map((key) => metrics[key])
    .filter(Boolean);

  if (availableCoreMetrics.length === 0) {
    return "not_applicable";
  }

  return availableCoreMetrics.every((metric) => metric.category === "FAST")
    ? "passed"
    : "failed";
}

function normalizeFieldExperience(fieldExperience) {
  const metrics = fieldExperience?.metrics || {};

  return {
    coreWebVitalsStatus: getCoreWebVitalsStatus(fieldExperience),
    initialUrl: fieldExperience?.initial_url || "",
    originFallback: Boolean(fieldExperience?.origin_fallback),
    overallCategory: fieldExperience?.overall_category || "NONE",
    metrics: Object.entries(FIELD_METRICS).map(([key, label]) => {
      const metric = metrics[key];

      return {
        category: metric?.category || "NONE",
        distribution: metric?.distributions || [],
        key,
        label,
        percentile: metric?.percentile ?? null,
        value: formatFieldMetricValue(key, metric?.percentile),
      };
    }),
  };
}

function normalizePageSpeedResponse(data, strategy) {
  const lighthouse = data.lighthouseResult || {};
  const categories = lighthouse.categories || {};
  const audits = lighthouse.audits || {};

  return {
    analysisUTCTimestamp: lighthouse.fetchTime || null,
    finalUrl: lighthouse.finalDisplayedUrl || lighthouse.finalUrl || data.id,
    fieldData: {
      origin: normalizeFieldExperience(data.originLoadingExperience),
      url: normalizeFieldExperience(data.loadingExperience),
    },
    requestedUrl: data.id,
    strategy,
    scores: {
      accessibility: toScore(categories.accessibility),
      bestPractices: toScore(categories["best-practices"]),
      performance: toScore(categories.performance),
      seo: toScore(categories.seo),
    },
    audits: AUDITS.map((audit) => ({
      key: audit.key,
      label: audit.label,
      ...getAuditValue(audits, audit.key),
    })),
    opportunities: Object.values(audits)
      .filter(
        (audit) =>
          audit?.details &&
          audit.details.type !== "debugdata" &&
          audit.title &&
          (audit.score === null || audit.score < 0.9)
      )
      .map((audit) => ({
        description: audit.description || "",
        displayValue: audit.displayValue || "",
        details: audit.details || null,
        key: audit.id,
        score: typeof audit.score === "number" ? Math.round(audit.score * 100) : null,
        title: audit.title,
      }))
      .slice(0, 24),
  };
}

async function getStrategyResult(url, strategy) {
  try {
    return await getPageSpeedInsights({ strategy, url });
  } catch (error) {
    return {
      error: error.message,
      finalUrl: url,
      requestedUrl: url,
      scores: {
        accessibility: null,
        bestPractices: null,
        performance: null,
        seo: null,
      },
      audits: [],
      opportunities: [],
      strategy,
    };
  }
}

export async function getPageSpeedInsights({ strategy = "mobile", url }) {
  if (!url) {
    throw new Error("A URL is required to run PageSpeed Insights.");
  }

  const params = new URLSearchParams({
    key: getApiKey(),
    strategy,
    url,
  });

  CATEGORIES.forEach((category) => {
    params.append("category", category);
  });

  const response = await fetch(`${API_URL}?${params.toString()}`, {
    cache: "no-store",
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Unable to load PageSpeed Insights data."
    );
  }

  return normalizePageSpeedResponse(data, strategy);
}

export async function getPageSpeedSiteInsights({
  pages,
  url,
}) {
  const urls = (pages?.length ? pages : [{ url: normalizeUrl(url) }])
    .map((page) => ({
      ...page,
      url: normalizeUrl(page.url),
    }))
    .filter((page) => page.url && isUsefulAuditPage(page.url))
    .slice(0, DEFAULT_TOP_PAGE_LIMIT);
  const auditedPages = [];

  for (const page of urls) {
    const [mobile, desktop] = await Promise.all([
      getStrategyResult(page.url, "mobile"),
      getStrategyResult(page.url, "desktop"),
    ]);

    auditedPages.push({
      desktop,
      mobile,
      path: page.path || getPathLabel(page.url),
      source: page.source || "top-pages",
      topPageStats: page.topPageStats || null,
      url: page.url,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    pages: auditedPages,
    requestedUrl: normalizeUrl(url),
    source: "analytics-top-pages",
  };
}
