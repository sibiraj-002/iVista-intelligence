"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Eye,
  Gauge,
  Link2,
  MousePointerClick,
  Percent,
  RefreshCw,
  SearchCheck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

const emptySearchConsole = {
  dateRange: {
    startDate: "",
    endDate: "",
  },
  overview: {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
  },
  siteUrl: "",
  trend: [],
  topQueries: [],
  topPages: [],
  countries: [],
  devices: [],
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatPercent(value) {
  return `${((value || 0) * 100).toFixed(1)}%`;
}

function formatPosition(value) {
  return (value || 0).toFixed(1);
}

function normalizeWebsiteForSearchConsole(website) {
  if (!website) {
    return "";
  }

  if (website.startsWith("sc-domain:")) {
    return website;
  }

  try {
    const url = new URL(website);

    return `${url.origin}/`;
  } catch {
    return website;
  }
}

function getProjectSearchConsoleSiteUrl(project) {
  return (
    project.searchConsoleSiteUrl ||
    normalizeWebsiteForSearchConsole(project.website)
  );
}

function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Live GSC
          </span>
        </div>
        <p className="mt-5 text-sm font-medium text-zinc-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          {value}
        </p>
        <p className="mt-2 text-sm text-zinc-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

function SearchTrendChart({ data }) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-zinc-50 text-sm font-medium text-zinc-500">
        No Search Console trend data returned for this date range.
      </div>
    );
  }

  return (
    <div className="h-72 min-w-0">
      <ResponsiveContainer height="100%" minWidth={0} width="100%">
        <AreaChart
          data={data}
          margin={{ bottom: 0, left: -12, right: 8, top: 10 }}
        >
          <defs>
            <linearGradient id="gscClicksGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#18181b" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="gscImpressionsGradient"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#e4e4e7"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            axisLine={false}
            dataKey="label"
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickFormatter={formatNumber}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #e4e4e7",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(24, 24, 27, 0.08)",
            }}
            formatter={(value, name) => [
              formatNumber(value),
              name === "clicks" ? "Clicks" : "Impressions",
            ]}
            labelStyle={{ color: "#18181b", fontWeight: 600 }}
          />
          <Area
            activeDot={{
              fill: "#18181b",
              r: 5,
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            dataKey="clicks"
            fill="url(#gscClicksGradient)"
            stroke="#18181b"
            strokeWidth={3}
            type="monotone"
          />
          <Area
            activeDot={{
              fill: "#2563eb",
              r: 5,
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            dataKey="impressions"
            fill="url(#gscImpressionsGradient)"
            stroke="#2563eb"
            strokeWidth={3}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function PerformanceTable({ emptyMessage, labelKey, labelTitle, rows, title }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Search Console rows ranked by clicks for the selected property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{labelTitle}</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${labelKey}-${row[labelKey]}`}>
                  <TableCell className="max-w-md font-medium text-zinc-950">
                    {row[labelKey]}
                  </TableCell>
                  <TableCell>{formatNumber(row.clicks)}</TableCell>
                  <TableCell>{formatNumber(row.impressions)}</TableCell>
                  <TableCell>{formatPercent(row.ctr)}</TableCell>
                  <TableCell>{formatPosition(row.position)}</TableCell>
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

export function GoogleSearchConsolePage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [searchConsole, setSearchConsole] = useState(emptySearchConsole);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingSearchConsole, setIsLoadingSearchConsole] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const searchConsoleProjects = useMemo(
    () => projects.filter((project) => getProjectSearchConsoleSiteUrl(project)),
    [projects]
  );

  const selectedProject = useMemo(
    () =>
      searchConsoleProjects.find(
        (project) => project.id === selectedProjectId
      ) || null,
    [searchConsoleProjects, selectedProjectId]
  );
  const selectedSiteUrl = selectedProject
    ? getProjectSearchConsoleSiteUrl(selectedProject)
    : "";

  useEffect(() => {
    let isActive = true;

    getProjects()
      .then((data) => {
        if (!isActive) {
          return;
        }

        setProjects(data);
        setSelectedProjectId(
          data.find((project) => getProjectSearchConsoleSiteUrl(project))?.id ||
            ""
        );
        setError("");
      })
      .catch((loadError) => {
        console.error("Search Console projects load error:", loadError);

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
  }, []);

  useEffect(() => {
    if (!selectedSiteUrl) {
      return;
    }

    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        setIsLoadingSearchConsole(true);
        setError("");

        return fetch(
          `/api/google-search-console/summary?siteUrl=${encodeURIComponent(
            selectedSiteUrl
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
          throw new Error(
            data.error || "Unable to load Google Search Console data."
          );
        }

        return data;
      })
      .then((data) => {
        setSearchConsole(data);
      })
      .catch((loadError) => {
        if (loadError.name === "AbortError") {
          return;
        }

        console.error("Search Console dashboard error:", loadError);
        setSearchConsole(emptySearchConsole);
        setError(loadError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingSearchConsole(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [refreshKey, selectedSiteUrl]);

  const averagePosition =
    searchConsole.overview.averagePosition || searchConsole.overview.position;

  const metrics = [
    {
      icon: MousePointerClick,
      label: "Clicks",
      value: formatNumber(searchConsole.overview.clicks),
      helper: "Organic Google Search clicks in the selected date range.",
    },
    {
      icon: Eye,
      label: "Impressions",
      value: formatNumber(searchConsole.overview.impressions),
      helper: "Times pages appeared in Google Search results.",
    },
    {
      icon: Percent,
      label: "Average CTR",
      value: formatPercent(searchConsole.overview.ctr),
      helper: "Click-through rate across search results.",
    },
    {
      icon: Gauge,
      label: "Average Position",
      value: formatPosition(averagePosition),
      helper: "Impression-weighted average ranking position.",
    },
    {
      icon: SearchCheck,
      label: "Queries",
      value: formatNumber(searchConsole.topQueries.length),
      helper: "Top search queries returned for the property.",
    },
    {
      icon: Link2,
      label: "Pages",
      value: formatNumber(searchConsole.topPages.length),
      helper: "Landing pages receiving organic search visibility.",
    },
  ];

  return (
    <DashboardLayout eyebrow="Search Console">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">SEO</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              Google Search Console
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Select a project and review live organic search clicks,
              impressions, CTR, ranking position, query performance, landing
              pages, countries, and devices.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Project
              </span>
              <select
                className="mt-2 h-11 min-w-64 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors focus:border-zinc-400"
                disabled={
                  isLoadingProjects || searchConsoleProjects.length === 0
                }
                onChange={(event) => setSelectedProjectId(event.target.value)}
                value={selectedProjectId}
              >
                {searchConsoleProjects.length > 0 ? (
                  searchConsoleProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))
                ) : (
                  <option value="">No Search Console projects found</option>
                )}
              </select>
            </label>
            <Button
              disabled={!selectedProject || isLoadingSearchConsole}
              onClick={() => setRefreshKey((current) => current + 1)}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              {isLoadingSearchConsole ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {selectedProject ? (
          <Card>
            <CardContent className="flex flex-col gap-2 p-4 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing data for{" "}
                <strong className="font-semibold text-zinc-950">
                  {selectedProject.name}
                </strong>
              </span>
              <span className="font-medium">
                Property: {selectedSiteUrl}
              </span>
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

        {!isLoadingProjects && searchConsoleProjects.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-base font-semibold text-zinc-950">
                Add a Search Console Site URL to a project
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Projects with a Search Console property URL or website will
                appear in this dropdown.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </section>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Organic Search Trend</CardTitle>
                    <CardDescription>
                      Clicks and impressions from Google Search Console.
                    </CardDescription>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {searchConsole.dateRange.startDate || "Start"} to{" "}
                    {searchConsole.dateRange.endDate || "End"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingSearchConsole ? (
                  <div className="h-72 animate-pulse rounded-xl bg-zinc-50" />
                ) : (
                  <SearchTrendChart data={searchConsole.trend} />
                )}
              </CardContent>
            </Card>

            <section className="grid gap-4 xl:grid-cols-2">
              <PerformanceTable
                emptyMessage="No query data returned for this property yet."
                labelKey="query"
                labelTitle="Query"
                rows={searchConsole.topQueries}
                title="Top Queries"
              />
              <PerformanceTable
                emptyMessage="No landing page data returned for this property yet."
                labelKey="page"
                labelTitle="Page"
                rows={searchConsole.topPages}
                title="Top Pages"
              />
              <PerformanceTable
                emptyMessage="No country data returned for this property yet."
                labelKey="country"
                labelTitle="Country"
                rows={searchConsole.countries}
                title="Countries"
              />
              <PerformanceTable
                emptyMessage="No device data returned for this property yet."
                labelKey="device"
                labelTitle="Device"
                rows={searchConsole.devices}
                title="Devices"
              />
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
