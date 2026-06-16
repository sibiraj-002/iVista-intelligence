import { NextResponse } from "next/server";

import { getSessions } from "@/services/google-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const value = await getSessions();

    return NextResponse.json({ metric: "sessions", value });
  } catch (error) {
    console.error("Google Analytics sessions API error:", error);

    return NextResponse.json(
      {
        error: error.message,
        metric: "sessions",
        value: null,
      },
      { status: 500 }
    );
  }
}
