import { Suspense } from "react";

import { AIInsightsPage } from "@/components/ai-insights/ai-insights-page";

export default function AIInsights() {
  return (
    <Suspense fallback={null}>
      <AIInsightsPage />
    </Suspense>
  );
}
