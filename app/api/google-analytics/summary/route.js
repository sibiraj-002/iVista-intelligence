import { NextResponse } from "next/server";

import { getGoogleAnalyticsDashboard } from "@/services/google-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");

  try {
    const data = await getGoogleAnalyticsDashboard(propertyId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Google Analytics summary API error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
