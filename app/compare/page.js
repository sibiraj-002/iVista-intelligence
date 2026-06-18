import { Suspense } from "react";

import { GoogleAnalyticsComparePage } from "@/components/google-analytics/google-analytics-compare-page";

export default function Compare() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsComparePage />
    </Suspense>
  );
}
