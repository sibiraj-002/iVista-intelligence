"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectWorkspaceControls } from "@/components/project-workspace/project-workspace-controls";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProjects } from "@/services/projects";
import { cn } from "@/utils/cn";

const emptySiteReport = {
  generatedAt: null,
  pageLimit: 8,
  pages: [],
  requestedUrl: "",
};
const PAGE_SIZE = 8;

function formatScore(score) {
  if (score === null || score === undefined) {
    return "--";
  }

  return score;
}

function getScoreStyle(score) {
  if (score === null || score === undefined) {
    return "bg-zinc-100 text-zinc-500 ring-zinc-200";
  }

  if (score >= 90) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (score >= 50) {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-red-50 text-red-700 ring-red-100";
}

function getAudit(audits, key) {
  return audits.find((audit) => audit.key === key) || null;
}

function getIssueCount(result) {
  if (!result) {
    return 0;
  }

  const auditIssues = result.audits.filter(
    (audit) => audit.score !== null && audit.score < 90
  ).length;

  return auditIssues + result.opportunities.length + (result.error ? 1 : 0);
}

function getResultStatus(result) {
  if (!result) {
    return "Pending";
  }

  if (result.error) {
    return "Error";
  }

  return `${getIssueCount(result)} issues`;
}

function getCoreWebVitalsLabel(status) {
  if (status === "passed") {
    return "Passed";
  }

  if (status === "failed") {
    return "Failed";
  }

  return "Not applicable";
}

function getFieldData(result) {
  if (!result?.fieldData) {
    return null;
  }

  return result.fieldData.url.coreWebVitalsStatus !== "not_applicable"
    ? result.fieldData.url
    : result.fieldData.origin;
}

function getAssessmentStyle(status) {
  if (status === "passed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "failed") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function ScoreGauge({ label, score }) {
  const color =
    score >= 90 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <div className="rounded-3xl border border-zinc-100 bg-white p-5 text-center shadow-sm">
      <div
        className={cn(
          "mx-auto flex h-24 w-24 items-center justify-center rounded-full border-8 bg-white text-3xl font-semibold",
          color,
          score >= 90
            ? "border-emerald-100"
            : score >= 50
              ? "border-amber-100"
              : "border-red-100"
        )}
      >
        {formatScore(score)}
      </div>
      <p className="mt-3 text-sm font-semibold text-zinc-950">{label}</p>
      <p className="mt-1 text-xs text-zinc-500">Lighthouse performance score</p>
    </div>
  );
}

function CoreMetricPill({ metric }) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-zinc-400">
          {metric.label}
        </p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            metric.category === "FAST"
              ? "bg-emerald-50 text-emerald-700"
              : metric.category === "AVERAGE"
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700"
          )}
        >
          {metric.category}
        </span>
      </div>
      <p className="mt-2 text-xl font-semibold text-zinc-950">{metric.value}</p>
      <p className="mt-1 text-xs text-zinc-500">75th percentile field data</p>
    </div>
  );
}

function getDetailHeadings(details) {
  return (details?.headings || [])
    .filter((heading) => heading.key)
    .slice(0, 4);
}

function formatDetailValue(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? value : value.toFixed(1);
  }

  if (typeof value === "object") {
    return value.text || value.url || value.value || "-";
  }

  return String(value);
}

function InsightDetailsTable({ details }) {
  const headings = getDetailHeadings(details);
  const items = (details?.items || []).slice(0, 6);

  if (headings.length === 0 || items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50">
            {headings.map((heading) => (
              <TableHead key={heading.key}>{heading.label || heading.key}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={`${item.url || item.node?.path || "item"}-${index}`}>
              {headings.map((heading) => (
                <TableCell className="max-w-xs truncate text-xs" key={heading.key}>
                  {formatDetailValue(item[heading.key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function InsightRow({ insight, isOpen, onToggle }) {
  const isBad = insight.score === null || insight.score < 50;

  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      <button
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-zinc-50"
        onClick={onToggle}
        type="button"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center text-sm",
              isBad ? "text-red-500" : "text-amber-500"
            )}
          >
            {isBad ? "▲" : "■"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-950">
              {insight.title}
              {insight.displayValue ? (
                <span className="font-medium text-red-700">
                  {" "}
                  — {insight.displayValue}
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-zinc-400 transition-transform",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      {isOpen ? (
        <div className="px-11 pb-5">
          {insight.description ? (
            <p className="text-sm leading-6 text-zinc-600">{insight.description}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            {insight.score !== null && insight.score !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                  getScoreStyle(insight.score)
                )}
              >
                Score {formatScore(insight.score)}
              </span>
            ) : null}
            {insight.details?.type ? (
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                {insight.details.type}
              </span>
            ) : null}
          </div>
          <InsightDetailsTable details={insight.details} />
        </div>
      ) : null}
    </div>
  );
}

function InsightsTabs({ desktopIssues, mobileIssues }) {
  const [activeTab, setActiveTab] = useState("mobile");
  const [openIssueKey, setOpenIssueKey] = useState("mobile-0");
  const tabs = [
    { label: "Mobile", value: "mobile", issues: mobileIssues },
    { label: "Desktop", value: "desktop", issues: desktopIssues },
  ];
  const activeIssues =
    tabs.find((tab) => tab.value === activeTab)?.issues || [];

  function handleTabChange(value) {
    setActiveTab(value);
    setOpenIssueKey(`${value}-0`);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Insights</CardTitle>
            <CardDescription>
              PageSpeed-style issue details saved for AI analysis.
            </CardDescription>
          </div>
          <div className="inline-flex rounded-xl bg-zinc-100 p-1">
            {tabs.map((tab) => (
              <button
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                  activeTab === tab.value
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-950"
                )}
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                type="button"
              >
                {tab.label} ({tab.issues.length})
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeIssues.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200">
            {activeIssues.map((insight, index) => {
              const key = `${activeTab}-${index}`;

              return (
                <InsightRow
                  insight={insight}
                  isOpen={openIssueKey === key}
                  key={`${insight.title}-${index}`}
                  onToggle={() =>
                    setOpenIssueKey((current) => (current === key ? "" : key))
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-zinc-50 p-10 text-center text-sm font-medium text-zinc-500">
            No major {activeTab} insights returned yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "Not crawled yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function PageScoresTable({ currentPage, onPageChange, pages, projectId }) {
  const pageCount = Math.max(Math.ceil(pages.length / PAGE_SIZE), 1);
  const startIndex = currentPage * PAGE_SIZE;
  const visiblePages = pages.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Pages</CardTitle>
        <CardDescription>
          Mobile and desktop PageSpeed scores for top pages from GA4.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pages.length > 0 ? (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Desktop</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visiblePages.map((page) => (
                  <TableRow
                    className="cursor-pointer transition-colors hover:bg-cyan-50/60"
                    key={page.url}
                  >
                    <TableCell>
                      <Link
                        className="block max-w-xl"
                        href={`/page-speed-insights/details?${new URLSearchParams({
                          projectId,
                          url: page.url,
                        }).toString()}`}
                      >
                        <p className="font-semibold text-zinc-950">{page.path}</p>
                        <p className="truncate text-xs text-zinc-500">{page.url}</p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                          getScoreStyle(page.mobile?.scores?.performance)
                        )}
                      >
                        {page.scanStatus === "queued"
                          ? "Queued"
                          : formatScore(page.mobile?.scores?.performance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                          getScoreStyle(page.desktop?.scores?.performance)
                        )}
                      >
                        {page.scanStatus === "running"
                          ? "Running"
                          : formatScore(page.desktop?.scores?.performance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {getIssueCount(page.mobile) + getIssueCount(page.desktop)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pageCount > 1 ? (
              <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-sm">
                <p className="text-zinc-500">
                  Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, pages.length)} of{" "}
                  {pages.length} pages
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={currentPage === 0}
                    onClick={() => onPageChange((page) => Math.max(page - 1, 0))}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={currentPage >= pageCount - 1}
                    onClick={() =>
                      onPageChange((page) => Math.min(page + 1, pageCount - 1))
                    }
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl bg-zinc-50 p-10 text-center text-sm font-medium text-zinc-500">
            Saved PageSpeed data will appear here after the first insights run.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConfirmActionModal({
  confirmLabel,
  description,
  isOpen,
  onClose,
  onConfirm,
  tone = "default",
  title,
}) {
  if (!isOpen) {
    return null;
  }

  const isDanger = tone === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <div
          className={cn(
            "p-5",
            isDanger
              ? "bg-linear-to-r from-rose-50 via-white to-orange-50"
              : "bg-linear-to-r from-cyan-50 via-white to-violet-50"
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg",
                isDanger
                  ? "bg-linear-to-br from-rose-600 to-red-700 shadow-rose-900/20"
                  : "bg-linear-to-br from-cyan-950 to-zinc-950 shadow-cyan-950/20"
              )}
            >
              {isDanger ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                {title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            className={cn(
              isDanger
                ? "bg-linear-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600"
                : "bg-linear-to-r from-cyan-950 to-zinc-950"
            )}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SelectedPageDetails({ page }) {
  if (!page) {
    return null;
  }

  if (!page.mobile || !page.desktop) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm font-medium text-zinc-500">
          This page is still waiting for PageSpeed data.
        </CardContent>
      </Card>
    );
  }

  const metricKeys = [
    "first-contentful-paint",
    "largest-contentful-paint",
    "total-blocking-time",
    "cumulative-layout-shift",
    "speed-index",
    "interactive",
  ];
  const mobileIssues = [
    ...page.mobile.opportunities,
    ...page.mobile.audits
      .filter((audit) => audit.score !== null && audit.score < 90)
      .map((audit) => ({
        description: audit.description,
        displayValue: audit.displayValue,
        score: audit.score,
        title: audit.label,
      })),
  ];
  const desktopIssues = [
    ...page.desktop.opportunities,
    ...page.desktop.audits
      .filter((audit) => audit.score !== null && audit.score < 90)
      .map((audit) => ({
        description: audit.description,
        displayValue: audit.displayValue,
        score: audit.score,
        title: audit.label,
      })),
  ];
  const mobileFieldData = getFieldData(page.mobile);
  const desktopFieldData = getFieldData(page.desktop);

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-zinc-100 bg-linear-to-br from-white via-cyan-50/50 to-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                PageSpeed Analysis Report
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                {page.path}
              </h2>
              <p className="mt-2 max-w-3xl break-all text-sm text-zinc-500">
                {page.url}
              </p>
              <p className="mt-3 text-sm text-zinc-600">
                Stored mobile and desktop PageSpeed data for AI analysis.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ScoreGauge label="Mobile" score={page.mobile.scores.performance} />
              <ScoreGauge label="Desktop" score={page.desktop.scores.performance} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discover What Real Users Are Experiencing</CardTitle>
          <CardDescription>
            Core Web Vitals assessment from PageSpeed field data when available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Mobile", mobileFieldData],
              ["Desktop", desktopFieldData],
            ].map(([label, fieldData]) => (
              <div
                className={cn(
                  "rounded-3xl border p-5",
                  getAssessmentStyle(fieldData?.coreWebVitalsStatus)
                )}
                key={label}
              >
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  {label}
                </p>
                <p className="mt-2 text-xl font-semibold">
                  Core Web Vitals Assessment:{" "}
                  {getCoreWebVitalsLabel(fieldData?.coreWebVitalsStatus)}
                </p>
                <p className="mt-1 text-xs opacity-70">
                  {fieldData?.originFallback
                    ? "Using origin-level field data fallback."
                    : "Using URL-level field data when available."}
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {(fieldData?.metrics || [])
                    .filter((metric) => ["lcp", "inp", "cls"].includes(metric.label))
                    .map((metric) => <CoreMetricPill key={metric.label} metric={metric} />)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnose Performance Issues</CardTitle>
          <CardDescription>
            Lab metrics from stored mobile and desktop Lighthouse runs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Desktop</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metricKeys.map((key) => {
                const mobileAudit = getAudit(page.mobile.audits, key);
                const desktopAudit = getAudit(page.desktop.audits, key);

                return (
                  <TableRow key={key}>
                    <TableCell className="font-semibold text-zinc-950">
                      {mobileAudit?.label || desktopAudit?.label || key}
                    </TableCell>
                    <TableCell>{mobileAudit?.displayValue || "Not available"}</TableCell>
                    <TableCell>{desktopAudit?.displayValue || "Not available"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InsightsTabs
        desktopIssues={desktopIssues.slice(0, 16)}
        mobileIssues={mobileIssues.slice(0, 16)}
      />
    </div>
  );
}

export function PageSpeedInsightsPage() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("projectId");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [url, setUrl] = useState("");
  const [siteReport, setSiteReport] = useState(emptySiteReport);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [hasCheckedSavedReport, setHasCheckedSavedReport] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [error, setError] = useState("");
  const initialScanKey = useRef("");

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  useEffect(() => {
    let isActive = true;

    getProjects()
      .then((data) => {
        if (!isActive) {
          return;
        }

        const firstProject =
          data.find(
            (project) => project.id === projectIdParam && project.website
          ) ||
          data.find((project) => project.website) ||
          null;

        setProjects(data);
        setSelectedProjectId(firstProject?.id || "");
        setUrl(firstProject?.website || "");
      })
      .catch((loadError) => {
        console.error("PageSpeed projects load error:", loadError);

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
    const project = projects.find((currentProject) => currentProject.id === projectId);

    setSelectedProjectId(projectId);
    setUrl(project?.website || "");
    setSiteReport(emptySiteReport);
    setCurrentPage(0);
    setHasCheckedSavedReport(false);
    setError("");
  }

  const startInsightsScan = useCallback(async () => {
    if (!selectedProjectId || !url || !selectedProject?.ga4PropertyId) {
      return;
    }

    setIsLoadingInsights(true);
    setError("");

    try {
      const response = await fetch("/api/page-speed-insights", {
        body: JSON.stringify({
          action: "start-scan",
          projectId: selectedProjectId,
          propertyId: selectedProject.ga4PropertyId,
          url,
        }),
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to start PageSpeed scan.");
      }

      setSiteReport((currentReport) => ({
        ...currentReport,
        scanStatus: data.scanStatus || "running",
      }));
    } catch (auditError) {
      console.error("PageSpeed audit error:", auditError);
      setError(auditError.message);
    }
  }, [selectedProject, selectedProjectId, url]);

  async function stopAndClearInsights() {
    if (!selectedProjectId) {
      return;
    }

    setError("");

    try {
      const response = await fetch("/api/page-speed-insights", {
        body: JSON.stringify({
          action: "stop-clear",
          projectId: selectedProjectId,
        }),
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to stop PageSpeed insights.");
      }

      setSiteReport({
        ...emptySiteReport,
        projectId: selectedProjectId,
        requestedUrl: url,
        scanStatus: "idle",
      });
      setCurrentPage(0);
      setIsLoadingInsights(false);
      setHasCheckedSavedReport(true);
      initialScanKey.current = selectedProjectId;
    } catch (clearError) {
      console.error("PageSpeed stop and clear error:", clearError);
      setError(clearError.message);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    if (!selectedProjectId || !url) {
      return undefined;
    }

    Promise.resolve()
      .then(() => {
        setIsLoadingInsights(true);
        setHasCheckedSavedReport(false);
        setError("");

        return fetch(
          `/api/page-speed-insights?url=${encodeURIComponent(
            url
          )}&mode=site&projectId=${encodeURIComponent(
            selectedProjectId
          )}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );
      })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load PageSpeed data.");
        }

        return data;
      })
      .then((data) => {
        setSiteReport(data);
        setCurrentPage(0);
        setIsLoadingInsights(data.scanStatus === "running");
      })
      .catch((loadError) => {
        if (loadError.name === "AbortError") {
          return;
        }

        console.error("PageSpeed cached report load error:", loadError);
        setSiteReport(emptySiteReport);
        setCurrentPage(0);
        setError(loadError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setHasCheckedSavedReport(true);
        }
      });

    return () => {
      controller.abort();
    };
  }, [selectedProjectId, url]);

  useEffect(() => {
    if (!selectedProjectId || !url || siteReport.scanStatus !== "running") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      fetch(
        `/api/page-speed-insights?url=${encodeURIComponent(
          url
        )}&mode=site&projectId=${encodeURIComponent(selectedProjectId)}`,
        {
          cache: "no-store",
        }
      )
        .then(async (response) => {
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Unable to refresh PageSpeed progress.");
          }

          return data;
        })
        .then((data) => {
          setSiteReport(data);
          setIsLoadingInsights(data.scanStatus === "running");
        })
        .catch((pollError) => {
          console.error("PageSpeed progress poll error:", pollError);
        });
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [selectedProjectId, siteReport.scanStatus, url]);

  useEffect(() => {
    if (
      isLoadingInsights ||
      !hasCheckedSavedReport ||
      !selectedProject?.ga4PropertyId ||
      !selectedProjectId ||
      !url ||
      siteReport.pages.length > 0 ||
      initialScanKey.current === selectedProjectId
    ) {
      return;
    }

    initialScanKey.current = selectedProjectId;
    startInsightsScan();
  }, [
    hasCheckedSavedReport,
    isLoadingInsights,
    selectedProject,
    selectedProjectId,
    siteReport.pages.length,
    startInsightsScan,
    url,
  ]);

  return (
    <DashboardLayout eyebrow="PageSpeed Insights">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              PageSpeed Insights
            </h1>
          </div>
        </div>

        <ProjectWorkspaceControls
          isLoadingProjects={isLoadingProjects}
          metaLabel="Website"
          metaValue={selectedProject?.website}
          onProjectChange={handleProjectChange}
          projects={projects}
          selectedProjectId={selectedProjectId}
          showDateRange={false}
        />

        <Card className="overflow-hidden border-cyan-100 bg-linear-to-br from-white via-white to-cyan-50/60">
          <CardHeader>
            <CardTitle>Saved PageSpeed Insights</CardTitle>
            <CardDescription>
              Cached report data is reused from the database to reduce API cost.
              Use Re-insights only when you want to recrawl the site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
              <div className="rounded-2xl border border-cyan-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Crawl source
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-zinc-950">
                  {url || "Select a project with a website"}
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  First insights run and every Re-insights action can take time
                  because mobile and desktop audits are run for multiple pages.
                </p>
                <p className="mt-2 text-xs font-semibold text-cyan-950">
                  Last saved: {formatDateTime(siteReport.updatedAt || siteReport.generatedAt)}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="h-11 rounded-xl border-red-200 bg-white text-red-700 hover:bg-red-50"
                  disabled={!selectedProjectId}
                  onClick={() => setConfirmAction("stop-clear")}
                  variant="outline"
                >
                  Stop & Clear
                </Button>
                <Button
                  className="h-11 rounded-xl bg-linear-to-r from-cyan-950 to-zinc-950 shadow-lg shadow-cyan-950/10"
                  disabled={!url || !selectedProject?.ga4PropertyId || isLoadingInsights}
                  onClick={() => setConfirmAction("reinsights")}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isLoadingInsights ? "animate-spin" : "")}
                  />
                  {isLoadingInsights ? "Recrawling..." : "Re-insights"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedProject ? (
          <Card>
            <CardContent className="flex flex-col gap-2 p-4 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Selected project{" "}
                <strong className="font-semibold text-zinc-950">
                  {selectedProject.name}
                </strong>
              </span>
              <span className="font-medium">{selectedProject.website}</span>
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card>
            <CardContent className="p-4 text-sm font-medium text-red-700">
              {error}
            </CardContent>
          </Card>
        ) : null}

        {isLoadingInsights ? (
          <Card>
            <CardContent className="flex h-48 items-center justify-center gap-2 text-sm font-medium text-zinc-500">
              <Activity className="h-4 w-4 animate-pulse" />
              Running mobile and desktop audits for top GA4 pages...
            </CardContent>
          </Card>
        ) : null}

        <PageScoresTable
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pages={siteReport.pages}
          projectId={selectedProjectId}
        />
      </div>
      <ConfirmActionModal
        confirmLabel="Run Re-insights"
        description="This will start a fresh PageSpeed run for the top GA4 pages. Mobile and desktop audits are run for every page, so this can take time."
        isOpen={confirmAction === "reinsights"}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          setConfirmAction(null);
          startInsightsScan();
        }}
        title="Run fresh PageSpeed insights?"
      />
      <ConfirmActionModal
        confirmLabel="Stop & Clear"
        description="This will stop the active PageSpeed run and remove the saved PageSpeed data for this project. You can run Re-insights again to start from fresh data."
        isOpen={confirmAction === "stop-clear"}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          setConfirmAction(null);
          stopAndClearInsights();
        }}
        title="Stop and clear PageSpeed data?"
        tone="danger"
      />
    </DashboardLayout>
  );
}
