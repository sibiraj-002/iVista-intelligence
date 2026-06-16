"use client";

import dynamic from "next/dynamic";

export const TrafficOverviewChart = dynamic(
  () =>
    import("@/components/dashboard/traffic-overview-chart-client").then(
      (module) => module.TrafficOverviewChartClient
    ),
  {
    loading: () => <div className="h-72 rounded-xl bg-zinc-50" />,
    ssr: false,
  }
);
