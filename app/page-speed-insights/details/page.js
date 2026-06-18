import { Suspense } from "react";

import { PageSpeedInsightsDetailPage } from "@/components/page-speed-insights/page-speed-insights-detail-page";

export default function PageSpeedDetails() {
  return (
    <Suspense fallback={null}>
      <PageSpeedInsightsDetailPage />
    </Suspense>
  );
}
