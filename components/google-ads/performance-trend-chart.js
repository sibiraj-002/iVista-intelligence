"use client";

import dynamic from "next/dynamic";

export const PerformanceTrendChart = dynamic(
  () =>
    import("@/components/google-ads/performance-trend-chart-client").then(
      (module) => module.PerformanceTrendChartClient
    ),
  {
    loading: () => <div className="h-80 rounded-xl bg-zinc-50" />,
    ssr: false,
  }
);
