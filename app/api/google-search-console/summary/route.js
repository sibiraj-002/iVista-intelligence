import { NextResponse } from "next/server";

import { getSearchConsoleDashboard } from "@/services/google-search-console";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const siteUrl = searchParams.get("siteUrl");
  const range = searchParams.get("range") || "this_month";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const data = await getSearchConsoleDashboard(siteUrl, {
      endDate,
      range,
      startDate,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Google Search Console summary API error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
