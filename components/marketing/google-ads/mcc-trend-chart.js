"use client";

import dynamic from "next/dynamic";

export const MccTrendChart = dynamic(
  () =>
    import("@/components/marketing/google-ads/mcc-trend-chart-client").then(
      (module) => module.MccTrendChartClient
    ),
  {
    loading: () => <div className="h-80 rounded-xl bg-zinc-50" />,
    ssr: false,
  }
);
