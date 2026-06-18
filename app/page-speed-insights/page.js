import { Suspense } from "react";

import { PageSpeedInsightsPage } from "@/components/page-speed-insights/page-speed-insights-page";

export default function PageSpeedInsights() {
  return (
    <Suspense fallback={null}>
      <PageSpeedInsightsPage />
    </Suspense>
  );
}
