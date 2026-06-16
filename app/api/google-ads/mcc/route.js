import { NextResponse } from "next/server";

import { getMccGoogleAdsDashboard } from "@/services/google-ads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getMccGoogleAdsDashboard();

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
