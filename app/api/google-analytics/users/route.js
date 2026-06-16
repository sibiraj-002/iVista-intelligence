import { NextResponse } from "next/server";

import { getUsers } from "@/services/googleAnalytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const value = await getUsers();

    return NextResponse.json({ metric: "users", value });
  } catch (error) {
    console.error("Google Analytics users API error:", error);

    return NextResponse.json(
      {
        error: error.message,
        metric: "users",
        value: null,
      },
      { status: 500 }
    );
  }
}
