import { Suspense } from "react";

import { GoogleAnalyticsPage } from "@/components/google-analytics/google-analytics-page";

export default function SEO() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsPage />
    </Suspense>
  );
}
