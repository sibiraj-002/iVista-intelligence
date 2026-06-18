import { NextResponse } from "next/server";

import { generateAiInsightsPpt } from "@/services/ai-insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      {
        error: "Project ID is required.",
      },
      { status: 400 }
    );
  }

  try {
    const { buffer, filename } = await generateAiInsightsPpt(projectId);

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${sanitizeFilename(filename)}"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
    });
  } catch (error) {
    console.error("AI insights PPT API error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
