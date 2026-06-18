import { Suspense } from "react";

import { GoogleSearchConsolePage } from "@/components/google-search-console/google-search-console-page";

export default function SearchConsole() {
  return (
    <Suspense fallback={null}>
      <GoogleSearchConsolePage />
    </Suspense>
  );
}
