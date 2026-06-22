"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  Download,
  Loader2,
  Sparkles,
} from "lucide-react";

import gsap from "gsap";

import { PageReveal } from "@/components/animations/page-reveal";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectWorkspaceControls } from "@/components/project-workspace/project-workspace-controls";
import { Button } from "@/components/ui/button";
import { useGsapCountUp } from "@/hooks/use-gsap-count-up";
import { getProjects } from "@/services/projects";
import { cn } from "@/utils/cn";
import { prefersReducedMotion } from "@/utils/motion";

const statusStyles = {
  critical: "from-slate-950 via-slate-900 to-blue-950",
  good: "from-slate-950 via-slate-900 to-teal-950",
  needs_attention: "from-slate-950 via-slate-900 to-slate-800",
};

const emptyAnalysis = {
  comments: [],
  issues: [],
  pptSlides: [],
  recommendations: [],
  tableInsights: [],
  wins: [],
};

function getReadiness(project, dataAvailability) {
  return [
    {
      isReady: Boolean(project?.ga4PropertyId),
      label: "GA4",
      status: dataAvailability?.analytics,
    },
    {
      isReady: Boolean(project?.searchConsoleSiteUrl),
      label: "Search Console",
      status: dataAvailability?.searchConsole,
    },
    {
      isReady: Boolean(project?.googleAdsCustomerId),
      label: "Google Ads",
      status: dataAvailability?.googleAds,
    },
    {
      isReady: true,
      label: "PageSpeed",
      status: dataAvailability?.pageSpeed,
    },
  ];
}

function ReadinessPill({ item }) {
  const isAvailable = item.status
    ? item.status === "fulfilled"
    : item.isReady;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        isAvailable
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-500"
      )}
    >
      {isAvailable ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : null}
      {item.label}
    </span>
  );
}

function normalizeAnalysis(analysis) {
  return {
    ...emptyAnalysis,
    ...(analysis || {}),
    comments: Array.isArray(analysis?.comments) ? analysis.comments : [],
    issues: Array.isArray(analysis?.issues) ? analysis.issues : [],
    pptSlides: Array.isArray(analysis?.pptSlides) ? analysis.pptSlides : [],
    recommendations: Array.isArray(analysis?.recommendations)
      ? analysis.recommendations
      : [],
    tableInsights: Array.isArray(analysis?.tableInsights)
      ? analysis.tableInsights
      : [],
    wins: Array.isArray(analysis?.wins) ? analysis.wins : [],
  };
}

const insightTitles = {
  aiTrafficSources: "AI Traffic Sources",
  deviceWiseTraffic: "Device Wise Traffic",
  mostVisitedNewsPages: "News Pages",
  mostVisitedPages: "Most Visited Pages",
  newVsReturning: "New vs Returning",
  overallTraffic: "Overall Traffic",
  sourceWiseTraffic: "Source Wise Traffic",
};

function formatTableNumber(row, monthKey) {
  const value = row.values?.[monthKey] || 0;

  if (row.valueType === "duration") {
    const roundedValue = Math.round(value || 0);
    const minutes = Math.floor(roundedValue / 60);
    const seconds = roundedValue % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function getLatestRowValue(rows, label, latestMonthKey) {
  const row = rows.find((item) => item.label === label);

  if (!row || !latestMonthKey) {
    return "--";
  }

  return formatTableNumber(row, latestMonthKey);
}

function ExecutiveMetricCard({ label, value }) {
  return (
    <div
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      data-reveal
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function InsightCard({ insight, index }) {
  return (
    <div
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      data-reveal
    >
      <div className="border-b border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Signal {index + 1}
              </p>
              <h3 className="text-base font-semibold text-slate-950">
                {insight.title ||
                  insightTitles[insight.reportKey] ||
                  "Monthly Signal"}
              </h3>
            </div>
          </div>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            AI
          </span>
        </div>
      </div>
      <div className="grid gap-3 p-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Comment
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {insight.comment || "Generate a fresh report to see AI analysis."}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Recommendation
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {insight.recommendation ||
              "AI recommendation will appear after report generation."}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AIInsightsPage() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("projectId");
  const range = searchParams.get("range") || "this_month";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");

  const selectedProject = useMemo(
    () =>
      projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );
  const analysis = normalizeAnalysis(analysisResult?.analysis);
  const monthlyComparison = analysisResult?.sourceSummary?.monthlyComparison || {};
  const monthColumns = monthlyComparison.monthColumns || [];
  const monthlyReports = monthlyComparison.reports || {};
  const latestMonthKey = monthColumns.at(-1)?.key;
  const visibleInsights = analysis.tableInsights.length
    ? analysis.tableInsights
    : analysis.comments.map((comment, index) => ({
        comment: comment.detail,
        recommendation: analysis.recommendations[index]?.action,
        title: comment.title,
      }));
  const executiveMetrics = [
    {
      label: "Months Compared",
      value: monthColumns.length || "--",
    },
    {
      label: "Latest Sessions",
      value: getLatestRowValue(
        monthlyReports.overallTraffic || [],
        "Sessions",
        latestMonthKey
      ),
    },
    {
      label: "Latest Pageviews",
      value: getLatestRowValue(
        monthlyReports.overallTraffic || [],
        "Pageviews",
        latestMonthKey
      ),
    },
    {
      label: "Recommendations",
      value: analysis.recommendations.length || "--",
    },
  ];
  const readiness = getReadiness(
    selectedProject,
    analysisResult?.dataAvailability
  );
  const status = analysis.status || "needs_attention";
  const healthScoreRef = useGsapCountUp(analysis.healthScore, [
    analysis.healthScore,
    analysisResult?.generatedAt,
  ]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return undefined;
    }

    const orbs = gsap.utils.toArray(".hero-orb");

    if (!orbs.length) {
      return undefined;
    }

    const tweens = orbs.map((orb, index) =>
      gsap.to(orb, {
        duration: 3.6 + index * 0.8,
        ease: "sine.inOut",
        repeat: -1,
        y: index % 2 === 0 ? 14 : -10,
        yoyo: true,
      })
    );

    return () => {
      tweens.forEach((tween) => tween.kill());
    };
  }, [selectedProjectId]);

  useEffect(() => {
    let isActive = true;

    Promise.resolve()
      .then(() => getProjects())
      .then((data) => {
        if (!isActive) {
          return;
        }

        const selectedProject =
          data.find((project) => project.id === projectIdParam) ||
          data[0];

        setProjects(data);
        setSelectedProjectId(selectedProject?.id || "");
        setError("");
      })
      .catch((loadError) => {
        console.error("AI insights projects load error:", loadError);

        if (isActive) {
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingProjects(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [projectIdParam]);

  function handleProjectChange(projectId) {
    setSelectedProjectId(projectId);
    setAnalysisResult(null);
  }

  useEffect(() => {
    if (!selectedProjectId) {
      return;
    }

    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        setIsLoadingReport(true);

        return fetch(
          `/api/ai-insights?${new URLSearchParams({
            projectId: selectedProjectId,
          }).toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );
      })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load saved AI report.");
        }

        return data.report;
      })
      .then((report) => {
        setAnalysisResult(report || null);
      })
      .catch((loadError) => {
        if (loadError.name === "AbortError") {
          return;
        }

        console.error("Saved AI insights load error:", loadError);
        setError(loadError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingReport(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [selectedProjectId]);

  async function generateAnalysis() {
    if (!selectedProjectId) {
      setError("Select a project before generating AI analysis.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/ai-insights", {
        body: JSON.stringify({
          endDate,
          projectId: selectedProjectId,
          range,
          startDate,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate AI analysis.");
      }

      setAnalysisResult(data);
    } catch (generateError) {
      console.error("AI insights generation error:", generateError);
      setError(generateError.message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function downloadPpt() {
    if (!selectedProjectId || !analysisResult) {
      setError("Generate an AI report before downloading PPT.");
      return;
    }

    setIsDownloading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/ai-insights/ppt?${new URLSearchParams({
          projectId: selectedProjectId,
        }).toString()}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to download PPT report.");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition?.match(/filename="([^"]+)"/)?.[1] ||
        "ai-analysis-report.pptx";
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      console.error("AI insights PPT download error:", downloadError);
      setError(downloadError.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <DashboardLayout eyebrow="AI Insights">
      <PageReveal
        className="space-y-6"
        deps={[selectedProjectId]}
        revealOptions={{ stagger: 0.08, y: 24 }}
      >
        <div
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          data-reveal
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              AI report builder
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              Monthly compare intelligence
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Convert the last 3 months GA4 comparison data into visual AI
              signals, action cards, and a presentation-ready PPT.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="rounded-full bg-slate-950 px-5 hover:bg-slate-800"
              disabled={isGenerating || isLoadingProjects || !selectedProjectId}
              onClick={generateAnalysis}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {analysisResult ? "Regenerate Report" : "Generate Report"}
            </Button>
            <Button
              className="rounded-full"
              disabled={!analysisResult || isDownloading}
              onClick={downloadPpt}
              variant="outline"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download PPT
            </Button>
          </div>
        </div>

        <div data-reveal>
          <ProjectWorkspaceControls
            isLoadingProjects={isLoadingProjects}
            metaLabel="AI model"
            metaValue="Gemini 2.5 Flash"
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={handleProjectChange}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {error}
          </div>
        ) : null}

        {isLoadingReport ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Loading saved AI report...
          </div>
        ) : null}

        <section
          className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm"
          data-reveal
        >
          <div
            className={cn(
              "relative overflow-hidden bg-linear-to-r p-7 text-white",
              statusStyles[status] || statusStyles.needs_attention
            )}
          >
            <div className="hero-orb absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
            <div className="hero-orb absolute right-36 top-14 h-32 w-32 rounded-full bg-blue-300/10 blur-xl" />
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  <Bot className="h-3.5 w-3.5" />
                  Last 3 months monthly comparison
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                  Monthly performance pulse
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    {analysis.status || "not generated"}
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    {visibleInsights.length || 0} AI signals
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    PPT ready
                  </span>
                </div>
                {analysisResult?.generatedAt ? (
                  <p className="mt-3 text-sm font-medium text-white/75">
                    Saved report from{" "}
                    {new Date(analysisResult.generatedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
              <div className="relative rounded-3xl border border-white/20 bg-white/15 p-5 text-center backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Health Score
                </p>
                <p className="mt-2 text-5xl font-semibold" ref={healthScoreRef}>
                  --
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 bg-slate-50 p-5 lg:grid-cols-4">
            {executiveMetrics.map((metric) => (
              <ExecutiveMetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        <section
          className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm"
          data-reveal
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Data readiness
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Connected report sources
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {readiness.map((item) => (
                <ReadinessPill item={item} key={item.label} />
              ))}
            </div>
          </div>
        </section>

        <PageReveal
          className="space-y-4"
          deps={[visibleInsights.length, analysisResult?.generatedAt]}
          revealOptions={{ delay: 0.05, stagger: 0.09, y: 32 }}
        >
          <div data-reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              AI insight board
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              What the data is telling us
            </h2>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {visibleInsights.length ? (
              visibleInsights.map((insight, index) => (
                <InsightCard
                  index={index}
                  insight={insight}
                  key={`${insight.reportKey || insight.title}-${index}`}
                />
              ))
            ) : (
              <div
                className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center"
                data-reveal
              >
                <Sparkles className="mx-auto h-8 w-8 text-blue-600" />
                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Generate a report to create AI insight cards.
                </p>
              </div>
            )}
          </div>
        </PageReveal>
      </PageReveal>
    </DashboardLayout>
  );
}
