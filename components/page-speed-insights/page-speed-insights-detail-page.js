"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Activity } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SelectedPageDetails } from "@/components/page-speed-insights/page-speed-insights-page";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProjects } from "@/services/projects";

const emptySiteReport = {
  pages: [],
};

export function PageSpeedInsightsDetailPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const pageUrl = searchParams.get("url") || "";
  const [projects, setProjects] = useState([]);
  const [siteReport, setSiteReport] = useState(emptySiteReport);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId) || null,
    [projectId, projects]
  );
  const selectedPage = useMemo(
    () => siteReport.pages.find((page) => page.url === pageUrl) || null,
    [pageUrl, siteReport.pages]
  );

  useEffect(() => {
    let isActive = true;

    Promise.all([getProjects()])
      .then(([projectData]) => {
        if (!isActive) {
          return null;
        }

        setProjects(projectData);
        const project = projectData.find((currentProject) => currentProject.id === projectId);

        if (!project?.website) {
          throw new Error("Project website is missing.");
        }

        return fetch(
          `/api/page-speed-insights?${new URLSearchParams({
            mode: "site",
            projectId,
            url: project.website,
          }).toString()}`,
          {
            cache: "no-store",
          }
        );
      })
      .then(async (response) => {
        if (!response) {
          return null;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load saved PageSpeed report.");
        }

        return data;
      })
      .then((data) => {
        if (isActive && data) {
          setSiteReport(data);
          setError("");
        }
      })
      .catch((loadError) => {
        console.error("PageSpeed detail load error:", loadError);

        if (isActive) {
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [pageUrl, projectId]);

  return (
    <DashboardLayout eyebrow="PageSpeed Details">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              PageSpeed Analysis Report
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {selectedProject?.name || "Selected project"} mobile and desktop
              analysis from the saved insights report.
            </p>
          </div>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={projectId ? `/page-speed-insights?projectId=${projectId}` : "/page-speed-insights"}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pages
          </Link>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="flex h-48 items-center justify-center gap-2 text-sm font-medium text-zinc-500">
              <Activity className="h-4 w-4 animate-pulse" />
              Loading saved PageSpeed details...
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card>
            <CardContent className="p-4 text-sm font-medium text-red-700">
              {error}
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !error && !selectedPage ? (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-base font-semibold text-zinc-950">
                Page not found in saved report
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Go back and run Re-insights if this page was recently added.
              </p>
            </CardContent>
          </Card>
        ) : null}

        <SelectedPageDetails page={selectedPage} />
      </div>
    </DashboardLayout>
  );
}
