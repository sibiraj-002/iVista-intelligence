import { NextResponse } from "next/server";

import { getMccGoogleAdsDashboard } from "@/services/google-ads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const range = searchParams.get("range") || "this_month";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const data = await getMccGoogleAdsDashboard(customerId, {
      endDate,
      range,
      startDate,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Google Ads MCC API error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
