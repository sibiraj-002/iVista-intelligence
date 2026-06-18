import PptxGenJS from "pptxgenjs";

import { getMccGoogleAdsDashboard } from "@/services/google-ads";
import {
  getGoogleAnalyticsDashboard,
  getGoogleAnalyticsMonthlyComparison,
} from "@/services/google-analytics";
import {
  getAiInsightReportFromFirestore,
  getAiInsightReportsFromFirestore,
  saveAiInsightReportToFirestore,
} from "@/services/ai-insights/firestore";
import { getPageSpeedReportFromFirestore } from "@/services/page-speed-insights/firestore";
import { getProjectFromFirestore } from "@/services/projects/firestore";
import { getSearchConsoleDashboard } from "@/services/google-search-console";

const GEMINI_MODEL = "gemini-2.5-flash";
const analysisResponseSchema = {
  properties: {
    executiveSummary: {
      type: "STRING",
    },
    healthScore: {
      type: "NUMBER",
    },
    comments: {
      items: {
        properties: {
          detail: {
            type: "STRING",
          },
          title: {
            type: "STRING",
          },
        },
        propertyOrdering: ["title", "detail"],
        type: "OBJECT",
      },
      type: "ARRAY",
    },
    issues: {
      items: {
        properties: {
          detail: {
            type: "STRING",
          },
          severity: {
            enum: ["high", "medium", "low"],
            type: "STRING",
          },
          source: {
            type: "STRING",
          },
          title: {
            type: "STRING",
          },
        },
        propertyOrdering: ["title", "severity", "source", "detail"],
        type: "OBJECT",
      },
      type: "ARRAY",
    },
    pptSlides: {
      items: {
        properties: {
          bullets: {
            items: {
              type: "STRING",
            },
            type: "ARRAY",
          },
          title: {
            type: "STRING",
          },
        },
        propertyOrdering: ["title", "bullets"],
        type: "OBJECT",
      },
      type: "ARRAY",
    },
    recommendations: {
      items: {
        properties: {
          action: {
            type: "STRING",
          },
          effort: {
            enum: ["low", "medium", "high"],
            type: "STRING",
          },
          impact: {
            enum: ["low", "medium", "high"],
            type: "STRING",
          },
          priority: {
            enum: ["high", "medium", "low"],
            type: "STRING",
          },
          title: {
            type: "STRING",
          },
        },
        propertyOrdering: ["title", "priority", "effort", "impact", "action"],
        type: "OBJECT",
      },
      type: "ARRAY",
    },
    status: {
      enum: ["good", "needs_attention", "critical"],
      type: "STRING",
    },
    tableInsights: {
      items: {
        properties: {
          comment: {
            type: "STRING",
          },
          recommendation: {
            type: "STRING",
          },
          reportKey: {
            enum: [
              "overallTraffic",
              "newVsReturning",
              "sourceWiseTraffic",
              "aiTrafficSources",
              "deviceWiseTraffic",
              "mostVisitedPages",
              "mostVisitedNewsPages",
            ],
            type: "STRING",
          },
          title: {
            type: "STRING",
          },
        },
        propertyOrdering: ["reportKey", "title", "comment", "recommendation"],
        type: "OBJECT",
      },
      type: "ARRAY",
    },
    wins: {
      items: {
        properties: {
          detail: {
            type: "STRING",
          },
          title: {
            type: "STRING",
          },
        },
        propertyOrdering: ["title", "detail"],
        type: "OBJECT",
      },
      type: "ARRAY",
    },
  },
  propertyOrdering: [
    "executiveSummary",
    "healthScore",
    "status",
    "comments",
    "tableInsights",
    "wins",
    "issues",
    "recommendations",
    "pptSlides",
  ],
  required: [
    "executiveSummary",
    "healthScore",
    "status",
    "comments",
    "tableInsights",
    "wins",
    "issues",
    "recommendations",
    "pptSlides",
  ],
  type: "OBJECT",
};

function take(items = [], limit = 8) {
  return Array.isArray(items) ? items.slice(0, limit) : [];
}

function pickOverview(data) {
  return data?.overview || null;
}

function pickComparison(data) {
  return data?.comparison
    ? {
        dateRanges: data.comparison.dateRanges,
        overview: data.comparison.overview,
      }
    : null;
}

function compactPageSpeedReport(report) {
  const pages = take(report?.pages, 8).map((page) => ({
    url: page.url,
    mobile: {
      score: page.mobile?.performanceScore,
      coreWebVitalsStatus: page.mobile?.coreWebVitals?.status,
      issues: take(page.mobile?.opportunities, 6).map((issue) => ({
        title: issue.title,
        displayValue: issue.displayValue,
        score: issue.score,
      })),
    },
    desktop: {
      score: page.desktop?.performanceScore,
      coreWebVitalsStatus: page.desktop?.coreWebVitals?.status,
      issues: take(page.desktop?.opportunities, 6).map((issue) => ({
        title: issue.title,
        displayValue: issue.displayValue,
        score: issue.score,
      })),
    },
  }));

  return {
    generatedAt: report?.generatedAt || null,
    scanStatus: report?.scanStatus || "not_available",
    pages,
  };
}

function compactMonthlyComparison(comparison) {
  if (!comparison) {
    return null;
  }

  return {
    dateRange: comparison.dateRange,
    monthColumns: comparison.monthColumns || [],
    reports: {
      aiTrafficSources: take(comparison.reports?.aiTrafficSources, 8),
      deviceWiseTraffic: take(comparison.reports?.deviceWiseTraffic, 8),
      mostVisitedNewsPages: take(comparison.reports?.mostVisitedNewsPages, 8),
      mostVisitedPages: take(comparison.reports?.mostVisitedPages, 10),
      newVsReturning: take(comparison.reports?.newVsReturning, 8),
      overallTraffic: take(comparison.reports?.overallTraffic, 8),
      sourceWiseTraffic: take(comparison.reports?.sourceWiseTraffic, 8),
    },
  };
}

async function settle(label, promise) {
  try {
    return {
      data: await promise,
      label,
      status: "fulfilled",
    };
  } catch (error) {
    return {
      error: error.message,
      label,
      status: "rejected",
    };
  }
}

function buildAnalysisPayload({
  analytics,
  ads,
  dateRange,
  pageSpeed,
  project,
  searchConsole,
  monthlyComparison,
}) {
  return {
    dateRange,
    project: {
      id: project.id,
      industry: project.industry,
      name: project.name,
      website: project.website,
    },
    dataAvailability: {
      analytics: analytics.status,
      googleAds: ads.status,
      monthlyComparison: monthlyComparison.status,
      pageSpeed: pageSpeed.status,
      searchConsole: searchConsole.status,
    },
    monthlyComparison:
      monthlyComparison.status === "fulfilled"
        ? compactMonthlyComparison(monthlyComparison.data)
        : { error: monthlyComparison.error },
    analytics:
      analytics.status === "fulfilled"
        ? {
            comparison: pickComparison(analytics.data),
            overview: pickOverview(analytics.data),
            topCountries: take(analytics.data?.countries, 8),
            topPages: take(analytics.data?.topPages, 8),
            topPageDetails: take(analytics.data?.pageDetails, 8),
          }
        : { error: analytics.error },
    searchConsole:
      searchConsole.status === "fulfilled"
        ? {
            comparison: pickComparison(searchConsole.data),
            overview: pickOverview(searchConsole.data),
            topPages: take(searchConsole.data?.topPages, 8),
            topQueries: take(searchConsole.data?.topQueries, 12),
            devices: take(searchConsole.data?.devices, 6),
          }
        : { error: searchConsole.error },
    googleAds:
      ads.status === "fulfilled"
        ? {
            comparison: pickComparison(ads.data),
            overview: pickOverview(ads.data),
            campaigns: take(ads.data?.campaigns, 8),
            failures: ads.data?.failures || 0,
          }
        : { error: ads.error },
    pageSpeed:
      pageSpeed.status === "fulfilled"
        ? compactPageSpeedReport(pageSpeed.data)
        : { error: pageSpeed.error },
  };
}

function buildPrompt(payload) {
  return `You are a senior SEO, paid media, and performance analyst.

Analyze this client data and produce an accurate monthly comparison report summary.
Use only the provided data. If a data source is unavailable, mention the limitation without guessing.
Primary focus: the last 3 months monthly comparison tables.
First provide AI comments on the monthly comparison tables, then recommendations.
Keep issue/risk analysis secondary and concise for now.
Create one tableInsights item for each monthly comparison table:
overallTraffic, newVsReturning, sourceWiseTraffic, aiTrafficSources, deviceWiseTraffic, mostVisitedPages, mostVisitedNewsPages.
Each tableInsight must explain what the table shows and one clear recommendation for that same table.

Return valid JSON only. Do not add markdown, comments, trailing commas, or text outside JSON.
Use these fields: executiveSummary, healthScore, status, comments, tableInsights, wins, issues, recommendations, pptSlides.
Use lowercase enum values for status, severity, priority, effort, and impact.

Client data:
${JSON.stringify(payload)}`;
}

function parseJsonResponse(text) {
  const cleaned = text
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    const jsonText =
      jsonStart >= 0 && jsonEnd > jsonStart
        ? cleaned.slice(jsonStart, jsonEnd + 1)
        : cleaned;
    const repaired = jsonText.replace(/,\s*([}\]])/g, "$1");

    try {
      return JSON.parse(repaired);
    } catch {
      console.error("Gemini JSON parse error:", {
        error: error.message,
        preview: cleaned.slice(0, 1000),
      });
      throw new Error("AI returned invalid JSON. Please regenerate the analysis.");
    }
  }
}

async function generateGeminiAnalysis(payload) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in .env.local.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildPrompt(payload),
              },
            ],
          },
        ],
        generationConfig: {
          responseSchema: analysisResponseSchema,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Unable to generate AI analysis from Gemini."
    );
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty analysis.");
  }

  return parseJsonResponse(text);
}

function formatNumber(value, options = {}) {
  const number = Number(value || 0);

  if (options.currency) {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      maximumFractionDigits: 0,
      style: "currency",
    }).format(number);
  }

  if (options.percent) {
    return `${number.toFixed(1)}%`;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: options.decimals ?? 0,
  }).format(number);
}

function addFooter(slide, projectName) {
  slide.addText(projectName || "iVistaz Intelligence", {
    color: "64748B",
    fontFace: "Aptos",
    fontSize: 9,
    x: 0.6,
    y: 7.02,
    w: 4,
  });
  slide.addText("Monthly Performance Report", {
    align: "right",
    color: "64748B",
    fontFace: "Aptos",
    fontSize: 9,
    x: 9.0,
    y: 7.02,
    w: 3.7,
  });
}

function addTitle(slide, title, subtitle) {
  slide.addText(title, {
    bold: true,
    color: "0F172A",
    fontFace: "Aptos Display",
    fontSize: 28,
    x: 0.6,
    y: 0.45,
    w: 8.8,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      color: "64748B",
      fontFace: "Aptos",
      fontSize: 12,
      x: 0.62,
      y: 0.98,
      w: 9.5,
    });
  }
}

function addMetricCard(slide, { label, value, x, y }) {
  slide.addShape("roundRect", {
    fill: { color: "F8FAFC" },
    line: { color: "E2E8F0" },
    radius: 0.18,
    x,
    y,
    w: 2.85,
    h: 1.0,
  });
  slide.addText(label, {
    color: "64748B",
    fontFace: "Aptos",
    fontSize: 8,
    margin: 0.08,
    x: x + 0.15,
    y: y + 0.16,
    w: 2.5,
  });
  slide.addText(String(value ?? "-"), {
    bold: true,
    color: "111827",
    fontFace: "Aptos Display",
    fontSize: 20,
    margin: 0.08,
    x: x + 0.15,
    y: y + 0.44,
    w: 2.5,
  });
}

function addBulletList(slide, items, { x, y, w, color = "334155" }) {
  slide.addText(
    items.map((item) => ({
      options: {
        bullet: { indent: 12 },
        breakLine: true,
      },
      text: item,
    })),
    {
      color,
      fit: "shrink",
      fontFace: "Aptos",
      fontSize: 13,
      h: 4.8,
      paraSpaceAfterPt: 8,
      x,
      y,
      w,
    }
  );
}

const monthlyReportTitles = {
  aiTrafficSources: "AI Traffic Sources",
  deviceWiseTraffic: "Device Wise Traffic",
  mostVisitedNewsPages: "Most Visited News Pages",
  mostVisitedPages: "Most Visited Pages",
  newVsReturning: "New vs Returning Visits",
  overallTraffic: "Overall Traffic",
  sourceWiseTraffic: "Source Wise Traffic",
};

function formatMonthlyValue(row, monthKey) {
  const value = row.values?.[monthKey] || 0;

  if (row.valueType === "duration") {
    const roundedValue = Math.round(value || 0);
    const minutes = Math.floor(roundedValue / 60);
    const seconds = roundedValue % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  return formatNumber(value);
}

function addMonthlyTableSlide(pptx, report, reportKey, rows) {
  const { project, sourceSummary } = report;
  const monthColumns = sourceSummary?.monthlyComparison?.monthColumns || [];
  const slideRows = take(rows, 10);
  const slide = pptx.addSlide();
  const firstColumnWidth = 5.4;
  const monthWidth = monthColumns.length ? 6.35 / monthColumns.length : 2.1;
  const startX = 0.6;
  const startY = 1.55;
  const rowHeight = 0.44;
  const tableWidth = firstColumnWidth + monthWidth * monthColumns.length;
  const tableHeight = rowHeight * (slideRows.length + 1);

  slide.background = { color: "FFFFFF" };
  slide.addShape("rect", {
    fill: { color: "0F172A" },
    line: { color: "0F172A" },
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.12,
  });
  addTitle(
    slide,
    monthlyReportTitles[reportKey] || reportKey,
    "Last 3 months monthly comparison"
  );

  slide.addShape("rect", {
    fill: { color: "FFFFFF" },
    line: { color: "CBD5E1" },
    x: startX,
    y: startY - 0.08,
    w: tableWidth,
    h: tableHeight + 0.16,
  });
  slide.addShape("rect", {
    fill: { color: "1E3A8A" },
    line: { color: "1E3A8A" },
    x: startX,
    y: startY,
    w: tableWidth,
    h: rowHeight,
  });
  slide.addText("Metric", {
    bold: true,
    color: "FFFFFF",
    fontFace: "Aptos",
    fontSize: 12,
    margin: 0.05,
    x: startX + 0.18,
    y: startY + 0.1,
    w: firstColumnWidth - 0.2,
  });
  monthColumns.forEach((month, index) => {
    slide.addText(month.label, {
      bold: true,
      color: "FFFFFF",
      fontFace: "Aptos",
      fontSize: 12,
      margin: 0.05,
      x: startX + firstColumnWidth + monthWidth * index,
      y: startY + 0.1,
      w: monthWidth,
    });
  });

  if (!slideRows.length) {
    slide.addText("No data returned for this table.", {
      color: "64748B",
      fontFace: "Aptos",
      fontSize: 16,
      x: startX,
      y: startY + 0.9,
      w: 8,
    });
  }

  slideRows.forEach((row, rowIndex) => {
    const y = startY + rowHeight * (rowIndex + 1);
    const isEven = rowIndex % 2 === 0;

    slide.addShape("rect", {
      fill: { color: isEven ? "F8FAFC" : "FFFFFF" },
      line: { color: "CBD5E1" },
      x: startX,
      y,
      w: tableWidth,
      h: rowHeight,
    });
    slide.addText(row.label, {
      color: "111827",
      fit: "shrink",
      fontFace: "Aptos",
      fontSize: 10.5,
      h: rowHeight,
      margin: 0.05,
      valign: "mid",
      x: startX + 0.18,
      y,
      w: firstColumnWidth - 0.25,
    });
    monthColumns.forEach((month, index) => {
      slide.addText(formatMonthlyValue(row, month.key), {
        color: "334155",
        fontFace: "Aptos",
        fontSize: 10.5,
        h: rowHeight,
        margin: 0.05,
        valign: "mid",
        x: startX + firstColumnWidth + monthWidth * index,
        y,
        w: monthWidth,
      });
    });
  });

  addFooter(slide, project?.name);
}

function buildMonthlyTableSlides(pptx, report) {
  const reports = report.sourceSummary?.monthlyComparison?.reports || {};

  Object.entries(monthlyReportTitles).forEach(([reportKey]) => {
    addMonthlyTableSlide(pptx, report, reportKey, reports[reportKey] || []);
  });
}

function buildMetricSlides(pptx, report) {
  const { project, sourceSummary } = report;
  const analytics = sourceSummary?.analytics || {};
  const searchConsole = sourceSummary?.searchConsole || {};
  const googleAds = sourceSummary?.googleAds || {};
  const pageSpeedPages = sourceSummary?.pageSpeed?.pages || [];
  const slide = pptx.addSlide();

  slide.background = { color: "FFFFFF" };
  addTitle(
    slide,
    "Last Two-Period Performance Snapshot",
    "Comparison numbers from the saved Analytics, Search Console, Google Ads, and PageSpeed data."
  );

  addMetricCard(slide, {
    label: "GA4 Sessions",
    value: formatNumber(analytics.overview?.sessions),
    x: 0.6,
    y: 1.55,
  });
  addMetricCard(slide, {
    label: "GA4 Active Users",
    value: formatNumber(analytics.overview?.activeUsers),
    x: 3.65,
    y: 1.55,
  });
  addMetricCard(slide, {
    label: "Page Views",
    value: formatNumber(analytics.overview?.pageViews || analytics.overview?.screenPageViews),
    x: 6.7,
    y: 1.55,
  });
  addMetricCard(slide, {
    label: "Search Clicks",
    value: formatNumber(searchConsole.overview?.clicks),
    x: 0.6,
    y: 2.85,
  });
  addMetricCard(slide, {
    label: "Search Impressions",
    value: formatNumber(searchConsole.overview?.impressions),
    x: 3.65,
    y: 2.85,
  });
  addMetricCard(slide, {
    label: "Avg Position",
    value: formatNumber(searchConsole.overview?.position, { decimals: 1 }),
    x: 6.7,
    y: 2.85,
  });
  addMetricCard(slide, {
    label: "Ad Spend",
    value: formatNumber(googleAds.overview?.spend, { currency: true }),
    x: 0.6,
    y: 4.15,
  });
  addMetricCard(slide, {
    label: "Ad Clicks",
    value: formatNumber(googleAds.overview?.clicks),
    x: 3.65,
    y: 4.15,
  });
  addMetricCard(slide, {
    label: "Pages Audited",
    value: formatNumber(pageSpeedPages.length),
    x: 6.7,
    y: 4.15,
  });

  const comparisonRange =
    analytics.comparison?.dateRanges || searchConsole.comparison?.dateRanges;

  if (comparisonRange?.current && comparisonRange?.previous) {
    slide.addShape("roundRect", {
      fill: { color: "EEF2FF" },
      line: { color: "C7D2FE" },
      radius: 0.14,
      x: 0.6,
      y: 5.55,
      w: 9.0,
      h: 0.72,
    });
    slide.addText(
      `Current: ${comparisonRange.current.startDate} to ${comparisonRange.current.endDate}  |  Previous: ${comparisonRange.previous.startDate} to ${comparisonRange.previous.endDate}`,
      {
        color: "3730A3",
        fontFace: "Aptos",
        fontSize: 12,
        margin: 0.08,
        x: 0.85,
        y: 5.78,
        w: 8.5,
      }
    );
  }

  addFooter(slide, project?.name);
}

function buildPpt(report) {
  const pptx = new PptxGenJS();
  const { generatedAt, project } = report;

  pptx.author = "iVistaz Intelligence";
  pptx.company = "iVistaz";
  pptx.layout = "LAYOUT_WIDE";
  pptx.subject = "Monthly comparison report";
  pptx.title = `${project?.name || "Client"} Monthly Comparison Report`;
  pptx.theme = {
    headFontFace: "Aptos Display",
    lang: "en-US",
    bodyFontFace: "Aptos",
  };

  const cover = pptx.addSlide();
  cover.background = { color: "FFFFFF" };
  cover.addShape("rect", {
    fill: { color: "0F172A" },
    line: { color: "0F172A" },
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.14,
  });
  cover.addText("Monthly Comparison Report", {
    bold: true,
    color: "0F172A",
    fontFace: "Aptos Display",
    fontSize: 36,
    x: 0.8,
    y: 1.35,
    w: 9.2,
  });
  cover.addText(project?.name || "Client", {
    color: "1E3A8A",
    fontFace: "Aptos",
    fontSize: 22,
    x: 0.85,
    y: 2.1,
    w: 8,
  });
  cover.addShape("rect", {
    fill: { color: "EFF6FF" },
    line: { color: "BFDBFE" },
    x: 0.85,
    y: 2.95,
    w: 4.65,
    h: 0.55,
  });
  cover.addText("Last 3 months | GA4 monthly comparison tables", {
    bold: true,
    color: "1E3A8A",
    fontFace: "Aptos",
    fontSize: 12,
    x: 1.06,
    y: 3.13,
    w: 4.2,
  });
  cover.addText(`Generated: ${new Date(generatedAt).toLocaleDateString("en-US")}`, {
    color: "64748B",
    fontFace: "Aptos",
    fontSize: 13,
    x: 0.85,
    y: 4.0,
    w: 5,
  });
  cover.addText("Prepared by iVistaz Intelligence", {
    color: "64748B",
    fontFace: "Aptos",
    fontSize: 12,
    x: 0.85,
    y: 6.45,
    w: 5,
  });

  buildMonthlyTableSlides(pptx, report);

  return pptx;
}

export async function getSavedAiInsights(projectId) {
  return getAiInsightReportFromFirestore(projectId);
}

export async function getSavedAiInsightReports() {
  return getAiInsightReportsFromFirestore();
}

export async function generateAiInsightsPpt(projectId) {
  const report = await getAiInsightReportFromFirestore(projectId);

  if (!report) {
    throw new Error("Generate and save an AI report before downloading PPT.");
  }

  const pptx = buildPpt(report);
  const buffer = await pptx.write({ outputType: "nodebuffer" });

  return {
    buffer,
    filename: `${report.project?.name || "client"}-ai-analysis-report.pptx`,
  };
}

export async function generateAiInsights({
  endDate,
  projectId,
  range = "this_month",
  startDate,
}) {
  const project = await getProjectFromFirestore(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  const dateRange = {
    endDate,
    range,
    startDate,
  };

  const [monthlyComparison, analytics, searchConsole, ads, pageSpeed] =
    await Promise.all([
      settle(
        "monthlyComparison",
        project.ga4PropertyId
          ? getGoogleAnalyticsMonthlyComparison(project.ga4PropertyId, 3)
          : Promise.reject(new Error("GA4 Property ID is missing."))
      ),
    settle(
      "analytics",
      project.ga4PropertyId
        ? getGoogleAnalyticsDashboard(project.ga4PropertyId, dateRange)
        : Promise.reject(new Error("GA4 Property ID is missing."))
    ),
    settle(
      "searchConsole",
      project.searchConsoleSiteUrl
        ? getSearchConsoleDashboard(project.searchConsoleSiteUrl, dateRange)
        : Promise.reject(new Error("Search Console site URL is missing."))
    ),
    settle(
      "googleAds",
      project.googleAdsCustomerId
        ? getMccGoogleAdsDashboard(project.googleAdsCustomerId, dateRange)
        : Promise.reject(new Error("Google Ads customer ID is missing."))
    ),
    settle(
      "pageSpeed",
      getPageSpeedReportFromFirestore(projectId).then((report) => {
        if (!report) {
          throw new Error("Saved PageSpeed report is missing.");
        }

        return report;
      })
    ),
  ]);

  const payload = buildAnalysisPayload({
    ads,
    analytics,
    dateRange,
    monthlyComparison,
    pageSpeed,
    project,
    searchConsole,
  });
  const analysis = await generateGeminiAnalysis(payload);
  const report = {
    analysis,
    dataAvailability: payload.dataAvailability,
    generatedAt: new Date().toISOString(),
    model: GEMINI_MODEL,
    project: payload.project,
    reportType: "last_3_month_monthly_comparison",
    sourceSummary: payload,
  };

  return saveAiInsightReportToFirestore(projectId, report);
}
