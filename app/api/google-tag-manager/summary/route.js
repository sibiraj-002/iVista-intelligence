import { NextResponse } from "next/server";

import { getGoogleTagManagerDashboard } from "@/services/google-tag-manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const containerId = searchParams.get("containerId");

  try {
    const data = await getGoogleTagManagerDashboard(accountId, containerId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Google Tag Manager summary API error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
