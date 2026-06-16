import { NextResponse } from "next/server";

import { getPageViews } from "@/services/google-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const value = await getPageViews();

    return NextResponse.json({ metric: "pageViews", value });
  } catch (error) {
    console.error("Google Analytics page views API error:", error);

    return NextResponse.json(
      {
        error: error.message,
        metric: "pageViews",
        value: null,
      },
      { status: 500 }
    );
  }
}
