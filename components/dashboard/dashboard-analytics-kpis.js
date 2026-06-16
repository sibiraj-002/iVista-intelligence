"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Eye,
  FolderKanban,
  Users,
} from "lucide-react";

import { dashboardData } from "@/components/dashboard/dashboard-data";
import { KpiCard } from "@/components/dashboard/kpi-card";

const defaultMetrics = {
  users: null,
  sessions: null,
  pageViews: null,
};

function formatMetric(value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

async function fetchMetric(path) {
  try {
    const response = await fetch(path, {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      console.warn("Google Analytics metric unavailable:", {
        path,
        error: data.error,
      });

      return null;
    }

    return data.value;
  } catch (error) {
    console.warn("Google Analytics metric request failed:", {
      path,
      error,
    });

    return null;
  }
}

export function DashboardAnalyticsKpis() {
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadAnalyticsMetrics() {
      const [users, sessions, pageViews] = await Promise.all([
        fetchMetric("/api/google-analytics/users"),
        fetchMetric("/api/google-analytics/sessions"),
        fetchMetric("/api/google-analytics/page-views"),
      ]);

      if (isActive) {
        setMetrics({ users, sessions, pageViews });
        setHasError([users, sessions, pageViews].some((value) => value === null));
        setIsLoading(false);
      }
    }

    loadAnalyticsMetrics();

    return () => {
      isActive = false;
    };
  }, []);

  const helperText = hasError
    ? "GA access unavailable"
    : "From GA Data API";

  const kpis = [
    {
      label: "Total Projects",
      value: dashboardData.kpis[0].value,
      change: dashboardData.kpis[0].change,
      icon: FolderKanban,
    },
    {
      label: "Users",
      value: isLoading ? "Loading..." : formatMetric(metrics.users),
      change: helperText,
      icon: Users,
    },
    {
      label: "Sessions",
      value: isLoading ? "Loading..." : formatMetric(metrics.sessions),
      change: helperText,
      icon: BarChart3,
    },
    {
      label: "Page Views",
      value: isLoading ? "Loading..." : formatMetric(metrics.pageViews),
      change: helperText,
      icon: Eye,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard
          change={kpi.change}
          icon={kpi.icon}
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
        />
      ))}
    </section>
  );
}
