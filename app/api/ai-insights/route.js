import { NextResponse } from "next/server";

import {
  generateAiInsights,
  getSavedAiInsightReports,
  getSavedAiInsights,
} from "@/services/ai-insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  try {
    if (!projectId) {
      const reports = await getSavedAiInsightReports();

      return NextResponse.json({
        reports,
      });
    }

    const report = await getSavedAiInsights(projectId);

    return NextResponse.json({
      report,
    });
  } catch (error) {
    console.error("Saved AI insights API error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { endDate, projectId, range, startDate } = body;

    if (!projectId) {
      return NextResponse.json(
        {
          error: "Project ID is required.",
        },
        { status: 400 }
      );
    }

    const data = await generateAiInsights({
      endDate,
      projectId,
      range,
      startDate,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("AI insights API error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
