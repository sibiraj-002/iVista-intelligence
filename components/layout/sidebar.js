"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Command, Plus, Scale, Settings } from "lucide-react";

import {
  projectToolNavigation,
  sidebarNavigation,
} from "@/components/layout/navigation";
import { getProjects } from "@/services/projects";
import { cn } from "@/utils/cn";

export function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");

  useEffect(() => {
    let isActive = true;

    Promise.resolve()
      .then(() => {
        setCurrentSearch(window.location.search);

        return getProjects();
      })
      .then((data) => {
        if (!isActive) {
          return;
        }

        const params = new URLSearchParams(window.location.search);
        const projectId =
          params.get("projectId") ||
          window.localStorage.getItem("selectedProjectId") ||
          data[0]?.id ||
          "";

        setProjects(data);
        setSelectedProjectId(projectId);
      })
      .catch((error) => {
        console.error("Sidebar projects load error:", error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    function handleWorkspaceSearchChange(event) {
      setCurrentSearch(event.detail || window.location.search);
    }

    function handleProjectsChange() {
      getProjects()
        .then((data) => setProjects(data))
        .catch((error) => {
          console.error("Sidebar projects refresh error:", error);
        });
    }

    window.addEventListener(
      "workspace-search-change",
      handleWorkspaceSearchChange
    );
    window.addEventListener("projects-change", handleProjectsChange);

    return () => {
      window.removeEventListener(
        "workspace-search-change",
        handleWorkspaceSearchChange
      );
      window.removeEventListener("projects-change", handleProjectsChange);
    };
  }, []);

  function getProjectToolHref(projectId, href = "/seo") {
    const params = new URLSearchParams(currentSearch);

    params.set("projectId", projectId);

    return `${href}?${params.toString()}`;
  }

  function handleProjectClick(projectId) {
    window.localStorage.setItem("selectedProjectId", projectId);
    setSelectedProjectId(projectId);
    onNavigate?.();
  }

  return (
    <aside className="flex h-full w-72 flex-col border-r border-zinc-200 bg-white/95">
      <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
          <Command className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-zinc-950">
            iVistaz Intelligence
          </p>
          <p className="text-xs text-zinc-500">Growth Command Center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {sidebarNavigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive
                    ? "text-white"
                    : "text-zinc-400 group-hover:text-zinc-700"
                )}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}

        <div className="pt-5">
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Clients
            </span>
            <Link
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
              href="/projects/new"
              onClick={onNavigate}
            >
              <Plus className="h-3.5 w-3.5" />
              Create New Project
            </Link>
          </div>
          <div className="max-h-[68vh] space-y-1 overflow-y-auto pr-1">
            {projects.length > 0 ? (
              projects.map((project) => {
                const isActive = selectedProjectId === project.id;

                return (
                  <div key={project.id}>
                    <Link
                      className={cn(
                        "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-zinc-950 text-white shadow-sm"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                      )}
                      href={getProjectToolHref(project.id)}
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <span className="block truncate">{project.name}</span>
                      <span
                        className={cn(
                          "mt-0.5 block truncate text-xs",
                          isActive ? "text-zinc-300" : "text-zinc-400"
                        )}
                      >
                        {project.website}
                      </span>
                    </Link>

                    {isActive ? (
                      <div className="ml-3 mt-1 space-y-1 border-l border-zinc-200 pl-3">
                        {projectToolNavigation.map((item) => {
                          const Icon = item.icon;
                          const isToolActive = pathname === item.href;

                          return (
                            <Link
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                                isToolActive
                                  ? "bg-zinc-100 text-zinc-950"
                                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                              )}
                              href={getProjectToolHref(project.id, item.href)}
                              key={item.href}
                              onClick={() => handleProjectClick(project.id)}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {item.title}
                            </Link>
                          );
                        })}
                        <div className="my-1 border-t border-zinc-100" />
                        <Link
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                            pathname === "/compare"
                              ? "bg-zinc-100 text-zinc-950"
                              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                          )}
                          href={getProjectToolHref(project.id, "/compare")}
                          onClick={() => handleProjectClick(project.id)}
                        >
                          <Scale className="h-3.5 w-3.5" />
                          Monthly Compare
                        </Link>
                        <Link
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                            pathname === `/projects/${project.id}`
                              ? "bg-zinc-100 text-zinc-950"
                              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                          )}
                          href={`/projects/${project.id}`}
                          onClick={() => handleProjectClick(project.id)}
                        >
                          <Settings className="h-3.5 w-3.5" />
                          Project Settings
                        </Link>
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
                No clients yet
              </p>
            )}
          </div>
        </div>
      </nav>

      <div className="border-t border-zinc-200 p-3">
        <Link
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-zinc-950 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
          )}
          href="/settings"
          onClick={onNavigate}
        >
          <Settings
            className={cn(
              "h-4 w-4",
              pathname === "/settings"
                ? "text-white"
                : "text-zinc-400 group-hover:text-zinc-700"
            )}
          />
          Settings
        </Link>
      </div>
    </aside>
  );
}
