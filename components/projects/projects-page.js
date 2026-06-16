"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  Grid2X2,
  Plus,
  Search,
  Table2,
  Trash2,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { deleteProject, getProjects } from "@/services/projects";
import { cn } from "@/utils/cn";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Paused: "bg-amber-50 text-amber-700 ring-amber-100",
  Draft: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}

function ProjectCard({ onDelete, project }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>{project.website}</CardDescription>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 rounded-xl bg-zinc-50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Industry
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-950">
              {project.industry}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              GA4 Property
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-950">
              {project.ga4PropertyId || "Not set"}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link
            className={buttonVariants({
              className: "w-full",
              variant: "outline",
            })}
            href={`/projects/${project.id}`}
          >
            Manage
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Button
            className="w-full"
            onClick={() => onDelete(project)}
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectsTable({ filteredProjects, onDelete }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Google Ads ID</TableHead>
            <TableHead>GA4 Property ID</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProjects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-semibold text-zinc-950">
                {project.name}
              </TableCell>
              <TableCell className="text-zinc-500">
                <a
                  className="inline-flex items-center gap-1 hover:text-zinc-950"
                  href={project.website}
                  rel="noreferrer"
                  target="_blank"
                >
                  {project.website}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </TableCell>
              <TableCell>{project.googleAdsCustomerId || "Not set"}</TableCell>
              <TableCell>{project.ga4PropertyId || "Not set"}</TableCell>
              <TableCell>{project.industry}</TableCell>
              <TableCell>
                <StatusBadge status={project.status} />
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Link
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                  href={`/projects/${project.id}`}
                >
                  Edit
                </Link>
                <Button
                  onClick={() => onDelete(project)}
                  size="sm"
                  variant="ghost"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProjects() {
    setIsLoading(true);
    setError("");

    try {
      const data = await getProjects();
      setProjects(data);
    } catch (loadError) {
      console.error("Firestore projects load error:", loadError);
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    getProjects()
      .then((data) => {
        if (isActive) {
          setProjects(data);
          setError("");
        }
      })
      .catch((loadError) => {
        console.error("Firestore projects load error:", loadError);

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
  }, []);

  async function handleDelete(project) {
    const shouldDelete = window.confirm(
      `Delete ${project.name}? This cannot be undone.`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteProject(project.id);
      await loadProjects();
    } catch (deleteError) {
      console.error("Firestore project delete error:", deleteError);
      setError(deleteError.message);
    }
  }

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesQuery =
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.website.toLowerCase().includes(normalizedQuery) ||
        project.industry.toLowerCase().includes(normalizedQuery);

      return matchesQuery;
    });
  }, [projects, query]);

  return (
    <DashboardLayout eyebrow="Projects">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              Projects
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Search, filter, and monitor SEO performance across every active
              client website and growth project.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm">
              {filteredProjects.length} projects found
            </div>
            <Link className={buttonVariants()} href="/projects/new">
              <Plus className="h-4 w-4" />
              Add Project
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects or domains..."
                value={query}
              />
            </label>

            <div className="grid grid-cols-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
              <Button
                className={cn(view === "grid" && "bg-white shadow-sm")}
                onClick={() => setView("grid")}
                size="sm"
                variant="ghost"
              >
                <Grid2X2 className="h-4 w-4" />
                Grid
              </Button>
              <Button
                className={cn(view === "table" && "bg-white shadow-sm")}
                onClick={() => setView("table")}
                size="sm"
                variant="ghost"
              >
                <Table2 className="h-4 w-4" />
                Table
              </Button>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Card>
            <CardContent className="p-4 text-sm font-medium text-red-700">
              {error}
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <Card>
            <CardContent className="p-10 text-center text-sm font-medium text-zinc-500">
              Loading projects...
            </CardContent>
          </Card>
        ) : filteredProjects.length > 0 ? (
          view === "grid" ? (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  onDelete={handleDelete}
                  project={project}
                />
              ))}
            </section>
          ) : (
            <ProjectsTable
              filteredProjects={filteredProjects}
              onDelete={handleDelete}
            />
          )
        ) : (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-base font-semibold text-zinc-950">
                No projects found
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Try another search term or status filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
