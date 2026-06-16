"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Grid2X2,
  ListFilter,
  Search,
  Table2,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { projects, projectStatuses } from "@/components/projects/projects-data";
import { getScoreStyles } from "@/components/projects/score-styles";
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
import { cn } from "@/utils/cn";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Review: "bg-amber-50 text-amber-700 ring-amber-100",
  Paused: "bg-zinc-100 text-zinc-600 ring-zinc-200",
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

function SeoScore({ score }) {
  const scoreStyles = getScoreStyles(score);

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cn("h-full rounded-full", scoreStyles.bar)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-semibold ring-1",
          scoreStyles.badge
        )}
      >
        {score}
      </span>
    </div>
  );
}

function ProjectCard({ project }) {
  const scoreStyles = getScoreStyles(project.seoScore);

  return (
    <Card
      className={cn(
        "border-l-4 transition-shadow hover:shadow-md",
        scoreStyles.border
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>{project.domain}</CardDescription>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 rounded-xl bg-zinc-50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Traffic
            </p>
            <p className="mt-1 text-xl font-semibold text-zinc-950">
              {project.traffic}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              SEO Score
            </p>
            <div className="mt-2">
              <SeoScore score={project.seoScore} />
            </div>
          </div>
        </div>
        <Link
          className={buttonVariants({
            className: "mt-5 w-full",
            variant: "outline",
          })}
          href={`/projects/${project.id}`}
        >
          View Analytics
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

function ProjectsTable({ filteredProjects }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Traffic</TableHead>
            <TableHead>SEO Score</TableHead>
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
              <TableCell className="text-zinc-500">{project.domain}</TableCell>
              <TableCell className="font-medium">{project.traffic}</TableCell>
              <TableCell>
                <SeoScore score={project.seoScore} />
              </TableCell>
              <TableCell>
                <StatusBadge status={project.status} />
              </TableCell>
              <TableCell className="text-right">
                <Link
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                  href={`/projects/${project.id}`}
                >
                  View Analytics
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [view, setView] = useState("grid");

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesQuery =
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.domain.toLowerCase().includes(normalizedQuery);
      const matchesStatus = status === "All" || project.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

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
          <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm">
            {filteredProjects.length} projects found
          </div>
        </div>

        <Card>
          <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects or domains..."
                value={query}
              />
            </label>

            <label className="relative block">
              <ListFilter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <select
                className="h-10 w-full appearance-none rounded-xl border border-zinc-200 bg-white pl-9 pr-8 text-sm font-medium text-zinc-700 outline-none transition-colors focus:border-zinc-400 md:w-44"
                onChange={(event) => setStatus(event.target.value)}
                value={status}
              >
                {projectStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
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

        {filteredProjects.length > 0 ? (
          view === "grid" ? (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </section>
          ) : (
            <ProjectsTable filteredProjects={filteredProjects} />
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
