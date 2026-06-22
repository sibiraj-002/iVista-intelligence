"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Loader2, RefreshCw } from "lucide-react";

import { PageReveal } from "@/components/animations/page-reveal";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
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

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatReportType(value) {
  if (!value) {
    return "Monthly comparison";
  }

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState("");
  const [error, setError] = useState("");

  const reportCount = reports.length;
  const latestReport = useMemo(() => reports[0] || null, [reports]);

  function loadReports() {
    setIsLoading(true);
    setError("");

    fetch("/api/ai-insights", {
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load saved reports.");
        }

        return data.reports || [];
      })
      .then((data) => {
        setReports(data);
      })
      .catch((loadError) => {
        console.error("Saved reports load error:", loadError);
        setError(loadError.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    Promise.resolve().then(() => loadReports());
  }, []);

  async function downloadReport(projectId) {
    if (!projectId) {
      setError("Project ID is missing for this report.");
      return;
    }

    setDownloadingId(projectId);
    setError("");

    try {
      const response = await fetch(
        `/api/ai-insights/ppt?${new URLSearchParams({
          projectId,
        }).toString()}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to download report.");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition?.match(/filename="([^"]+)"/)?.[1] ||
        "monthly-comparison-report.pptx";
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      console.error("Report download error:", downloadError);
      setError(downloadError.message);
    } finally {
      setDownloadingId("");
    }
  }

  return (
    <DashboardLayout eyebrow="Reports">
      <PageReveal
        className="space-y-6"
        deps={[isLoading, reportCount]}
        revealOptions={{ stagger: 0.09, y: 26 }}
      >
        <div
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          data-reveal
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Saved reports
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              Reports
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Download generated monthly comparison reports saved in the database.
            </p>
          </div>
          <Button
            className="rounded-full"
            disabled={isLoading}
            onClick={loadReports}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <Card data-reveal>
            <CardHeader>
              <CardDescription>Total saved reports</CardDescription>
              <CardTitle className="text-3xl">{reportCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="md:col-span-2" data-reveal>
            <CardHeader>
              <CardDescription>Latest report</CardDescription>
              <CardTitle>
                {latestReport?.project?.name || "No saved report yet"}
              </CardTitle>
              <CardDescription>
                {latestReport ? formatDate(latestReport.generatedAt) : "Generate a report from AI Analysis."}
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <Card data-reveal>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Saved Report Library
            </CardTitle>
            <CardDescription>
              Reports remain here until a project report is regenerated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="rounded-2xl bg-zinc-50 p-10 text-center text-sm font-medium text-zinc-500">
                Loading saved reports...
              </div>
            ) : reports.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-zinc-950">
                            {report.project?.name || "Untitled project"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {report.project?.website || report.projectId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatReportType(report.reportType)}</TableCell>
                      <TableCell>{formatDate(report.generatedAt)}</TableCell>
                      <TableCell>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                          Saved
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          disabled={downloadingId === report.projectId}
                          onClick={() => downloadReport(report.projectId)}
                          size="sm"
                          variant="outline"
                        >
                          {downloadingId === report.projectId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          PPT
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-2xl bg-zinc-50 p-10 text-center">
                <FileText className="mx-auto h-8 w-8 text-zinc-400" />
                <p className="mt-4 text-sm font-semibold text-zinc-700">
                  No saved reports yet.
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Generate a report from AI Analysis and it will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </PageReveal>
    </DashboardLayout>
  );
}
