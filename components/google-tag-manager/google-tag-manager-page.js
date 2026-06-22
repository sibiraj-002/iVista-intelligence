"use client";

import { useEffect, useMemo, useState } from "react";
import { Braces, Code2, GitFork, Layers, RefreshCw, Tag } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProjects } from "@/services/projects";

const emptyTagManager = {
  accountId: "",
  container: null,
  containerId: "",
  overview: {
    tags: 0,
    triggers: 0,
    variables: 0,
    workspaces: 0,
  },
  tags: [],
  triggers: [],
  variables: [],
  workspace: null,
  workspaces: [],
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function getProjectTagManagerIds(project) {
  return {
    accountId: project.gtmAccountId || "",
    containerId: project.gtmContainerId || "",
  };
}

function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
            Live GTM
          </span>
        </div>
        <p className="mt-5 text-sm font-medium text-zinc-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          {value}
        </p>
        <p className="mt-2 text-sm text-zinc-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

function TagsTable({ tags }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>
          Tags from the selected GTM workspace and their firing setup.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tags.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Firing Triggers</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.tagId || tag.name}>
                  <TableCell className="font-medium text-zinc-950">
                    {tag.name}
                  </TableCell>
                  <TableCell>{tag.typeLabel}</TableCell>
                  <TableCell>{formatNumber(tag.firingTriggerCount)}</TableCell>
                  <TableCell>{tag.paused ? "Paused" : "Active"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-xl bg-zinc-50 p-10 text-center text-sm font-medium text-zinc-500">
            No tags returned for this workspace.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SimpleTable({ emptyMessage, labelTitle, rows, title, valueTitle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          GTM resources from the selected container workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{labelTitle}</TableHead>
                <TableHead>{valueTitle}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.triggerId || row.variableId || row.name}>
                  <TableCell className="font-medium text-zinc-950">
                    {row.name}
                  </TableCell>
                  <TableCell>{row.type || row.value || "Not set"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-xl bg-zinc-50 p-10 text-center text-sm font-medium text-zinc-500">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GoogleTagManagerPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tagManager, setTagManager] = useState(emptyTagManager);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingTagManager, setIsLoadingTagManager] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const selectedProject = useMemo(
    () =>
      projects.find((project) => project.id === selectedProjectId) ||
      null,
    [projects, selectedProjectId]
  );
  const selectedIds = selectedProject
    ? getProjectTagManagerIds(selectedProject)
    : { accountId: "", containerId: "" };
  const hasProjectTagManagerContainer = Boolean(selectedIds.containerId);

  useEffect(() => {
    let isActive = true;

    getProjects()
      .then((data) => {
        if (!isActive) {
          return;
        }

        setProjects(data);
        setSelectedProjectId(data[0]?.id || "");
        setError("");
      })
      .catch((loadError) => {
        console.error("Google Tag Manager projects load error:", loadError);

        if (isActive) {
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingProjects(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProject) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();

    if (selectedIds.accountId) {
      params.set("accountId", selectedIds.accountId);
    }

    if (selectedIds.containerId) {
      params.set("containerId", selectedIds.containerId);
    }

    Promise.resolve()
      .then(() => {
        setIsLoadingTagManager(true);
        setError("");

        return fetch(
          `/api/google-tag-manager/summary${
            params.toString() ? `?${params.toString()}` : ""
          }`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );
      })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load GTM data.");
        }

        return data;
      })
      .then((data) => {
        setTagManager(data);
      })
      .catch((loadError) => {
        if (loadError.name === "AbortError") {
          return;
        }

        console.error("Google Tag Manager dashboard error:", loadError);
        setTagManager(emptyTagManager);
        setError(loadError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingTagManager(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    hasProjectTagManagerContainer,
    refreshKey,
    selectedIds.accountId,
    selectedIds.containerId,
    selectedProject,
  ]);

  const metrics = [
    {
      icon: Tag,
      label: "Tags",
      value: formatNumber(tagManager.overview.tags),
      helper: "Tags configured in the selected workspace.",
    },
    {
      icon: GitFork,
      label: "Triggers",
      value: formatNumber(tagManager.overview.triggers),
      helper: "Triggers available for tag firing rules.",
    },
    {
      icon: Braces,
      label: "Variables",
      value: formatNumber(tagManager.overview.variables),
      helper: "Workspace variables available to tags and triggers.",
    },
    {
      icon: Layers,
      label: "Workspaces",
      value: formatNumber(tagManager.overview.workspaces),
      helper: "GTM workspaces found in the selected container.",
    },
  ];

  return (
    <DashboardLayout eyebrow="Google Tag Manager">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Tracking</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              Google Tag Manager
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Select a project and review live GTM container, workspace, tag,
              trigger, and variable details using the shared Google service
              account credentials.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Project
              </span>
              <select
                className="mt-2 h-11 min-w-64 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors focus:border-zinc-400"
                disabled={isLoadingProjects || projects.length === 0}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                value={selectedProjectId}
              >
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))
                ) : (
                  <option value="">No GTM projects found</option>
                )}
              </select>
            </label>
            <Button
              disabled={!selectedProject || isLoadingTagManager}
              onClick={() => setRefreshKey((current) => current + 1)}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              {isLoadingTagManager ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {selectedProject ? (
          <Card>
            <CardContent className="flex flex-col gap-2 p-4 text-sm text-zinc-600 lg:flex-row lg:items-center lg:justify-between">
              <span>
                Showing data for{" "}
                <strong className="font-semibold text-zinc-950">
                  {selectedProject.name}
                </strong>
              </span>
              <span className="font-medium">
                Account: {selectedIds.accountId || "from env"} | Container:{" "}
                {selectedIds.containerId || "from env"}
              </span>
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

        {!isLoadingProjects && projects.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-base font-semibold text-zinc-950">
                Add a project
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Projects will appear in this dropdown. GTM Account ID and
                Container ID can come from the project or environment settings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </section>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Container Details</CardTitle>
                    <CardDescription>
                      Metadata returned by the Google Tag Manager container API.
                    </CardDescription>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    <Code2 className="h-3.5 w-3.5" />
                    {tagManager.container?.publicId || "GTM container"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTagManager ? (
                  <div className="h-24 animate-pulse rounded-xl bg-zinc-50" />
                ) : (
                  <div className="grid gap-4 rounded-xl bg-zinc-50 p-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Container Name
                      </p>
                      <p className="mt-1 text-sm font-semibold text-zinc-950">
                        {tagManager.container?.name || "Not returned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Public ID
                      </p>
                      <p className="mt-1 text-sm font-semibold text-zinc-950">
                        {tagManager.container?.publicId || "Not returned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Workspace
                      </p>
                      <p className="mt-1 text-sm font-semibold text-zinc-950">
                        {tagManager.workspace?.name || "Not returned"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <TagsTable tags={tagManager.tags} />

            <section className="flex flex-col gap-4">
              <SimpleTable
                emptyMessage="No triggers returned for this workspace."
                labelTitle="Trigger"
                rows={tagManager.triggers}
                title="Triggers"
                valueTitle="Type"
              />
              <SimpleTable
                emptyMessage="No variables returned for this workspace."
                labelTitle="Variable"
                rows={tagManager.variables}
                title="Variables"
                valueTitle="Type"
              />
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
