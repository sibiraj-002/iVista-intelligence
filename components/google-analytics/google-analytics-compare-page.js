"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart3, CalendarRange, RefreshCw, Sparkles } from "lucide-react";
import ReactSelect from "react-select";

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
import { getProjects } from "@/services/projects";
import { cn } from "@/utils/cn";

const emptyComparison = {
  monthColumns: [],
  reports: {
    aiTrafficSources: [],
    deviceWiseTraffic: [],
    mostVisitedNewsPages: [],
    mostVisitedPages: [],
    newVsReturning: [],
    overallTraffic: [],
    sourceWiseTraffic: [],
  },
};

const compareOptions = [
  { label: "Current month", value: "1" },
  { label: "Last 2 months", value: "2" },
  { label: "Last 3 months", value: "3" },
  { label: "Last 6 months", value: "6" },
  { label: "Last 12 months", value: "12" },
];

const compareSelectClassNames = {
  control: ({ isFocused }) =>
    cn(
      "min-h-14 min-w-72 rounded-2xl border bg-white px-2 shadow-xl transition-all",
      isFocused
        ? "border-cyan-300 ring-4 ring-cyan-200/50"
        : "border-white/20 hover:border-cyan-200"
    ),
  dropdownIndicator: () => "px-2 text-zinc-500",
  indicatorSeparator: () => "hidden",
  menu: () =>
    "overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl",
  menuPortal: () => "z-[9999]",
  option: ({ isFocused, isSelected }) =>
    cn(
      "cursor-pointer rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
      isSelected
        ? "bg-cyan-950 text-white"
        : isFocused
          ? "bg-cyan-50 text-cyan-950"
          : "text-zinc-700"
    ),
  placeholder: () => "text-zinc-400",
  singleValue: () => "text-sm font-semibold text-zinc-950",
  valueContainer: () => "px-2",
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Math.round(value || 0));
}

function formatDuration(seconds) {
  const roundedValue = Math.round(seconds || 0);
  const minutes = Math.floor(roundedValue / 60);
  const remainingSeconds = roundedValue % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatValue(row, monthKey) {
  const value = row.values?.[monthKey] || 0;

  if (row.valueType === "duration") {
    return formatDuration(value);
  }

  return formatNumber(value);
}

function ReportTable({
  description,
  emptyMessage = "No data returned for this report.",
  labelHeader = "Metrics",
  months,
  rows,
  title,
}) {
  return (
    <Card data-reveal>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {rows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-cyan-950 hover:bg-cyan-950">
                <TableHead className="text-white">{labelHeader}</TableHead>
                {months.map((month) => (
                  <TableHead className="text-white" key={month.key}>
                    {month.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="max-w-xl font-medium text-zinc-950">
                    {row.label}
                  </TableCell>
                  {months.map((month) => (
                    <TableCell key={month.key}>{formatValue(row, month.key)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-xl bg-zinc-50 p-10 text-center text-sm font-medium text-zinc-500">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GoogleAnalyticsComparePage() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("projectId");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [months, setMonths] = useState("3");
  const [comparison, setComparison] = useState(emptyComparison);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

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

        const selectedProject =
          data.find((project) => project.id === projectIdParam) ||
          data.find((project) => project.ga4PropertyId) ||
          data[0];

        setProjects(data);
        setSelectedProjectId(selectedProject?.id || "");
        setError("");
      })
      .catch((loadError) => {
        console.error("Compare projects load error:", loadError);

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

  useEffect(() => {
    if (!selectedProject?.ga4PropertyId) {
      return;
    }

    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        setIsLoadingComparison(true);
        setError("");

        return fetch(
          `/api/google-analytics/compare?${new URLSearchParams({
            months,
            propertyId: selectedProject.ga4PropertyId,
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
          throw new Error(data.error || "Unable to load comparison data.");
        }

        return data;
      })
      .then((data) => {
        setComparison(data);
      })
      .catch((loadError) => {
        if (loadError.name === "AbortError") {
          return;
        }

        console.error("Compare dashboard error:", loadError);
        setComparison(emptyComparison);
        setError(loadError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingComparison(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [months, refreshKey, selectedProject]);

  const reports = comparison.reports;
  const selectedCompareOption =
    compareOptions.find((option) => option.value === months) || compareOptions[2];

  return (
    <DashboardLayout eyebrow="Compare">
      <PageReveal
        className="space-y-6"
        deps={[isLoadingComparison, comparison.monthColumns.length, refreshKey]}
        revealOptions={{ delay: 0.04, stagger: 0.07, y: 30 }}
      >
        <section
          className="relative overflow-hidden rounded-3xl border border-cyan-950/10 bg-linear-to-br from-cyan-950 via-slate-900 to-zinc-950 p-6 text-white shadow-2xl"
          data-reveal
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-20 left-12 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 ring-1 ring-white/15">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                SEO monthly report builder
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                Monthly Compare
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50/80">
                Generate the same month-wise tables your SEO team prepares
                manually, including the current month even when it is still in
                progress.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
                  {selectedProject?.name || "No client selected"}
                </span>
                {selectedProject?.ga4PropertyId ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
                    GA4 Property ID: {selectedProject.ga4PropertyId}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-50">
                <CalendarRange className="h-4 w-4" />
                Comparison window
              </div>
              <div className="mt-3 grid gap-2">
                <ReactSelect
                  classNamePrefix="monthly-compare"
                  classNames={compareSelectClassNames}
                  instanceId="monthly-compare-period"
                  isSearchable={false}
                  menuPlacement="auto"
                  menuPortalTarget={
                    typeof document === "undefined" ? undefined : document.body
                  }
                  menuPosition="fixed"
                  onChange={(option) => setMonths(option?.value || "3")}
                  options={compareOptions}
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                  unstyled
                  value={selectedCompareOption}
                />
                <Button
                  className="h-11 rounded-xl bg-cyan-300 font-semibold text-cyan-950 shadow-lg shadow-cyan-950/20 hover:bg-cyan-200"
                  disabled={!selectedProject || isLoadingComparison}
                  onClick={() => setRefreshKey((current) => current + 1)}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isLoadingComparison ? "animate-spin" : "")}
                  />
                  {isLoadingComparison ? "Updating..." : "Update Report"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <Card>
            <CardContent className="p-4 text-sm font-medium text-red-700">
              {error}
            </CardContent>
          </Card>
        ) : null}

        {!isLoadingProjects && projects.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-base font-semibold text-zinc-950">
                Add a project
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Create a client project before loading comparison reports.
              </p>
            </CardContent>
          </Card>
        ) : selectedProject && !selectedProject.ga4PropertyId ? (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-base font-semibold text-zinc-950">
                Add a GA4 Property ID
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Monthly comparison reports need this project&apos;s GA4 Property
                ID.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {isLoadingComparison ? (
              <Card className="border-cyan-100 bg-cyan-50/60">
                <CardContent className="flex items-center gap-3 p-4 text-sm font-semibold text-cyan-950">
                  <BarChart3 className="h-4 w-4 animate-pulse" />
                  Preparing monthly comparison tables...
                </CardContent>
              </Card>
            ) : null}
            <ReportTable
              description="Monthly traffic summary for SEO reporting."
              months={comparison.monthColumns}
              rows={reports.overallTraffic}
              title="Overall Traffic"
            />
            <ReportTable
              description="Sessions grouped by default channel group."
              months={comparison.monthColumns}
              rows={reports.sourceWiseTraffic}
              title="Source-Wise Traffic"
            />
            <ReportTable
              description="Traffic from AI discovery sources."
              months={comparison.monthColumns}
              rows={reports.aiTrafficSources}
              title="AI Traffic Sources"
            />
            <ReportTable
              labelHeader="Visitors"
              months={comparison.monthColumns}
              rows={reports.newVsReturning}
              title="New vs Returning"
            />
            <ReportTable
              labelHeader="Device"
              months={comparison.monthColumns}
              rows={reports.deviceWiseTraffic}
              title="Device-Wise Traffic"
            />
            <ReportTable
              labelHeader="Most Visited Pages"
              months={comparison.monthColumns}
              rows={reports.mostVisitedPages}
              title="Most Visited Pages - Overall Website"
            />
            <ReportTable
              labelHeader="Most Visited News & Insights Pages"
              months={comparison.monthColumns}
              rows={reports.mostVisitedNewsPages}
              title="Most Visited Pages - News & Insights"
            />
          </div>
        )}
      </PageReveal>
    </DashboardLayout>
  );
}
