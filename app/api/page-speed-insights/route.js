import { NextResponse } from "next/server";

import {
  getPageSpeedInsights,
  getPageSpeedSiteInsights,
  isUsefulAuditPage,
} from "@/services/page-speed-insights";
import {
  deletePageSpeedReportFromFirestore,
  getPageSpeedReportFromFirestore,
  savePageSpeedReportToFirestore,
  updatePageSpeedReportPageInFirestore,
} from "@/services/page-speed-insights/firestore";
import { getGoogleAnalyticsTopPageUrls } from "@/services/google-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const scanJobs =
  globalThis.__pageSpeedScanJobs instanceof Map
    ? globalThis.__pageSpeedScanJobs
    : new Map();
globalThis.__pageSpeedScanJobs = scanJobs;

function createScanToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isScanActive(projectId, token) {
  return scanJobs.get(projectId) === token;
}

async function prepareTopPagesReport({ projectId, propertyId, url }) {
  const topPages = propertyId
    ? await getGoogleAnalyticsTopPageUrls(propertyId, url)
    : [{ path: "Homepage", url }];
  const pages = topPages
    .filter((topPage) => isUsefulAuditPage(topPage.url))
    .map((topPage) => ({
      desktop: null,
      mobile: null,
      path: topPage.path,
      scanStatus: "queued",
      source: "analytics-top-pages",
      topPageStats: {
        activeUsers: topPage.activeUsers || 0,
        pageViews: topPage.pageViews || 0,
        sessions: topPage.sessions || 0,
      },
      url: topPage.url,
    }));

  return savePageSpeedReportToFirestore(projectId, {
    generatedAt: new Date().toISOString(),
    pages,
    requestedUrl: url,
    scanStatus: "running",
    source: "analytics-top-pages",
  });
}

async function scanPageSpeedReportInBackground({ projectId, propertyId, url }) {
  if (scanJobs.has(projectId)) {
    return;
  }

  const scanToken = createScanToken();

  scanJobs.set(projectId, scanToken);

  try {
    const preparedReport = await prepareTopPagesReport({ projectId, propertyId, url });

    if (!isScanActive(projectId, scanToken)) {
      return;
    }

    for (const page of preparedReport.pages || []) {
      if (!isScanActive(projectId, scanToken)) {
        return;
      }

      await updatePageSpeedReportPageInFirestore(projectId, {
        ...page,
        scanStatus: "running",
      });

      const [auditedPage] = (
        await getPageSpeedSiteInsights({
          pages: [page],
          url,
        })
      ).pages;

      if (!isScanActive(projectId, scanToken)) {
        return;
      }

      await updatePageSpeedReportPageInFirestore(projectId, {
        ...auditedPage,
        scanStatus: "completed",
      });
    }

    if (!isScanActive(projectId, scanToken)) {
      return;
    }

    const cachedReport = await getPageSpeedReportFromFirestore(projectId);
    await savePageSpeedReportToFirestore(projectId, {
      ...(cachedReport || {}),
      generatedAt: new Date().toISOString(),
      scanStatus: "completed",
    });
  } catch (error) {
    console.error("PageSpeed background scan error:", error);
    if (!isScanActive(projectId, scanToken)) {
      return;
    }

    const cachedReport = await getPageSpeedReportFromFirestore(projectId);

    await savePageSpeedReportToFirestore(projectId, {
      ...(cachedReport || {}),
      scanError: error.message,
      scanStatus: "failed",
    });
  } finally {
    if (isScanActive(projectId, scanToken)) {
      scanJobs.delete(projectId);
    }
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "single";
  const projectId = searchParams.get("projectId");
  const strategy = searchParams.get("strategy") || "mobile";
  const url = searchParams.get("url");

  try {
    if (mode === "site") {
      const cachedReport = await getPageSpeedReportFromFirestore(projectId);

      if (cachedReport) {
        return NextResponse.json({
          ...cachedReport,
          fromCache: true,
        });
      }

      return NextResponse.json({
        fromCache: true,
        generatedAt: null,
        pages: [],
        projectId,
        requestedUrl: url,
        scanStatus: "idle",
        source: "analytics-top-pages",
      });
    }

    const data = await getPageSpeedInsights({ strategy, url });

    return NextResponse.json(data);
  } catch (error) {
    console.error("PageSpeed Insights API error:", error);

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
    const { action, page, projectId, propertyId, url } = body;

    if (action === "stop-clear") {
      if (!projectId) {
        return NextResponse.json(
          {
            error: "Project ID is required.",
          },
          { status: 400 }
        );
      }

      scanJobs.delete(projectId);
      await deletePageSpeedReportFromFirestore(projectId);

      return NextResponse.json({
        cleared: true,
        projectId,
        scanStatus: "idle",
      });
    }

    if (action === "start-scan") {
      if (!projectId || !url) {
        return NextResponse.json(
          {
            error: "Project ID and URL are required.",
          },
          { status: 400 }
        );
      }

      scanPageSpeedReportInBackground({ projectId, propertyId, url }).catch(
        (scanError) => {
          console.error("PageSpeed scan start error:", scanError);
        }
      );

      return NextResponse.json({
        projectId,
        scanStatus: "running",
        started: true,
      });
    }

    if (action === "prepare") {
      const report = await prepareTopPagesReport({ projectId, propertyId, url });

      return NextResponse.json({
        ...report,
        fromCache: false,
      });
    }

    if (action === "scan-page") {
      const [auditedPage] = (
        await getPageSpeedSiteInsights({
          pages: [page],
          url,
        })
      ).pages;
      const savedReport = await updatePageSpeedReportPageInFirestore(projectId, {
        ...auditedPage,
        scanStatus: "completed",
      });

      return NextResponse.json({
        page: auditedPage,
        report: savedReport,
      });
    }

    if (action === "complete") {
      const cachedReport = await getPageSpeedReportFromFirestore(projectId);
      const report = await savePageSpeedReportToFirestore(projectId, {
        ...(cachedReport || {}),
        generatedAt: new Date().toISOString(),
        scanStatus: "completed",
      });

      return NextResponse.json(report);
    }

    return NextResponse.json(
      {
        error: "Unsupported PageSpeed action.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("PageSpeed Insights API action error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
