"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Clock,
  Eye,
  Globe2,
  MousePointerClick,
  Percent,
  RefreshCw,
  UserPlus,
  Users,
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

const emptyAnalytics = {
  dateRange: {
    startDate: "30daysAgo",
    endDate: "today",
  },
  overview: {
    activeUsers: 0,
    newUsers: 0,
    sessions: 0,
    pageViews: 0,
    eventCount: 0,
    engagementRate: 0,
    bounceRate: 0,
    averageSessionDuration: 0,
  },
  trend: [],
  topPages: [],
  countries: [],
  pageDetails: [],
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

function formatDuration(seconds) {
  const roundedSeconds = Math.round(seconds || 0);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Live GA4
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

function AnalyticsTrendChart({ data }) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-zinc-50 text-sm font-medium text-zinc-500">
        No trend data returned for this date range.
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
            <linearGradient id="gaUsersGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#18181b" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gaViewsGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
              name === "activeUsers" ? "Active Users" : "Page Views",
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
            dataKey="activeUsers"
            fill="url(#gaUsersGradient)"
            stroke="#18181b"
            strokeWidth={3}
            type="monotone"
          />
          <Area
            activeDot={{
              fill: "#10b981",
              r: 5,
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            dataKey="pageViews"
            fill="url(#gaViewsGradient)"
            stroke="#10b981"
            strokeWidth={3}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TopPagesTable({ pages }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Pages</CardTitle>
        <CardDescription>
          Pages ranked by GA4 screen/page views for the selected project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pages.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Path</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Events</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.path}>
                  <TableCell className="font-medium text-zinc-950">
                    {page.path}
                  </TableCell>
                  <TableCell>{formatNumber(page.pageViews)}</TableCell>
                  <TableCell>{formatNumber(page.activeUsers)}</TableCell>
                  <TableCell>{formatNumber(page.eventCount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-xl bg-zinc-50 p-10 text-center text-sm font-medium text-zinc-500">
            No page data returned for this property yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CountriesTable({ countries }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Country Performance</CardTitle>
        <CardDescription>
          Country-wise sessions, users, views, and engagement from GA4.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {countries.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>New Users</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country) => (
                <TableRow key={country.country}>
                  <TableCell className="font-medium text-zinc-950">
                    {country.country}
                  </TableCell>
                  <TableCell>{formatNumber(country.sessions)}</TableCell>
                  <TableCell>{formatNumber(country.activeUsers)}</TableCell>
                  <TableCell>{formatNumber(country.newUsers)}</TableCell>
                  <TableCell>{formatNumber(country.pageViews)}</TableCell>
                  <TableCell>{formatPercent(country.engagementRate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-xl bg-zinc-50 p-10 text-center text-sm font-medium text-zinc-500">
            No country data returned for this property yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PageDetailsTable({ pages }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Title And Screen Class</CardTitle>
        <CardDescription>
          GA4 page title and screen class report ranked by screen/page views.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pages.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Title</TableHead>
                <TableHead>Screen Class</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Events</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={`${page.pageTitle}-${page.screenClass}`}>
                  <TableCell className="max-w-sm font-medium text-zinc-950">
                    {page.pageTitle}
                  </TableCell>
                  <TableCell>{page.screenClass}</TableCell>
                  <TableCell>{formatNumber(page.pageViews)}</TableCell>
                  <TableCell>{formatNumber(page.sessions)}</TableCell>
                  <TableCell>{formatNumber(page.activeUsers)}</TableCell>
                  <TableCell>{formatNumber(page.eventCount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-xl bg-zinc-50 p-10 text-center text-sm font-medium text-zinc-500">
            No page title or screen class data returned for this property yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GoogleAnalyticsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const analyticsProjects = useMemo(
    () => projects.filter((project) => project.ga4PropertyId),
    [projects]
  );

  const selectedProject = useMemo(
    () =>
      analyticsProjects.find((project) => project.id === selectedProjectId) ||
      null,
    [analyticsProjects, selectedProjectId]
  );

  useEffect(() => {
    let isActive = true;

    getProjects()
      .then((data) => {
        if (!isActive) {
          return;
        }

        setProjects(data);
        setSelectedProjectId(
          data.find((project) => project.ga4PropertyId)?.id || ""
        );
        setError("");
      })
      .catch((loadError) => {
        console.error("Google Analytics projects load error:", loadError);

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
    if (!selectedProject?.ga4PropertyId) {
      return;
    }

    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        setIsLoadingAnalytics(true);
        setError("");

        return fetch(
          `/api/google-analytics/summary?propertyId=${encodeURIComponent(
            selectedProject.ga4PropertyId
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
          throw new Error(data.error || "Unable to load Google Analytics data.");
        }

        return data;
      })
      .then((data) => {
        setAnalytics(data);
      })
      .catch((loadError) => {
        if (loadError.name === "AbortError") {
          return;
        }

        console.error("Google Analytics dashboard error:", loadError);
        setAnalytics(emptyAnalytics);
        setError(loadError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingAnalytics(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [refreshKey, selectedProject]);

  const metrics = [
    {
      icon: Users,
      label: "Active Users",
      value: formatNumber(analytics.overview.activeUsers),
      helper: "Users active in the selected GA4 date range.",
    },
    {
      icon: UserPlus,
      label: "New Users",
      value: formatNumber(analytics.overview.newUsers),
      helper: "First-time users reported by GA4.",
    },
    {
      icon: MousePointerClick,
      label: "Sessions",
      value: formatNumber(analytics.overview.sessions),
      helper: "Total sessions captured for this project.",
    },
    {
      icon: Eye,
      label: "Page Views",
      value: formatNumber(analytics.overview.pageViews),
      helper: "Screen/page views reported by GA4.",
    },
    {
      icon: Activity,
      label: "Events",
      value: formatNumber(analytics.overview.eventCount),
      helper: "All tracked GA4 events in the period.",
    },
    {
      icon: Percent,
      label: "Engagement Rate",
      value: formatPercent(analytics.overview.engagementRate),
      helper: "Share of sessions that were engaged.",
    },
    {
      icon: Percent,
      label: "Bounce Rate",
      value: formatPercent(analytics.overview.bounceRate),
      helper: "Share of sessions without meaningful engagement.",
    },
    {
      icon: Clock,
      label: "Avg Session Duration",
      value: formatDuration(analytics.overview.averageSessionDuration),
      helper: "Average session length in GA4.",
    },
    {
      icon: Globe2,
      label: "Countries",
      value: formatNumber(analytics.countries.length),
      helper: "Countries returned in the selected report.",
    },
  ];

  return (
    <DashboardLayout eyebrow="Google Analytics">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Analytics</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              Google Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Select a project and view live GA4 traffic, sessions, page views,
              events, country-wise sessions, and page title reports from the
              linked property.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Project
              </span>
              <select
                className="mt-2 h-11 min-w-64 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors focus:border-zinc-400"
                disabled={isLoadingProjects || analyticsProjects.length === 0}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                value={selectedProjectId}
              >
                {analyticsProjects.length > 0 ? (
                  analyticsProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))
                ) : (
                  <option value="">No GA4 projects found</option>
                )}
              </select>
            </label>
            <Button
              disabled={!selectedProject || isLoadingAnalytics}
              onClick={() => setRefreshKey((current) => current + 1)}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              {isLoadingAnalytics ? "Loading..." : "Refresh"}
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
                GA4 Property ID: {selectedProject.ga4PropertyId}
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

        {!isLoadingProjects && analyticsProjects.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-base font-semibold text-zinc-950">
                Add a GA4 Property ID to a project
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Projects with a GA4 Property ID will appear in this dropdown.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </section>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Traffic Trend</CardTitle>
                    <CardDescription>
                      Active users and page views from GA4.
                    </CardDescription>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {analytics.dateRange.startDate} to{" "}
                    {analytics.dateRange.endDate}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <div className="h-72 animate-pulse rounded-xl bg-zinc-50" />
                ) : (
                  <AnalyticsTrendChart data={analytics.trend} />
                )}
              </CardContent>
            </Card>

            <TopPagesTable pages={analytics.topPages} />

            <section className="grid gap-4 xl:grid-cols-2">
              <CountriesTable countries={analytics.countries} />
              <PageDetailsTable pages={analytics.pageDetails} />
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
