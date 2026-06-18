import { NextResponse } from "next/server";

import { getGoogleAnalyticsMonthlyComparison } from "@/services/google-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  const months = searchParams.get("months") || "3";

  try {
    const data = await getGoogleAnalyticsMonthlyComparison(propertyId, months);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Google Analytics compare API error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
