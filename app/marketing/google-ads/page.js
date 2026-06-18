import { Suspense } from "react";

import { GoogleAdsMccPage } from "@/components/marketing/google-ads/google-ads-mcc-page";

export default function MarketingGoogleAds() {
  return (
    <Suspense fallback={null}>
      <GoogleAdsMccPage />
    </Suspense>
  );
}
