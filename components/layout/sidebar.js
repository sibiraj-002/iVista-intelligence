"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Minus, Plus, Scale, Settings } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";

import {
  projectToolNavigation,
  sidebarNavigation,
} from "@/components/layout/navigation";
import { useGsapSidebar } from "@/hooks/use-gsap-sidebar";
import { getProjects } from "@/services/projects";
import { cn } from "@/utils/cn";

function isProjectToolPath(pathname) {
  return (
    projectToolNavigation.some((item) => pathname === item.href) ||
    pathname === "/compare" ||
    pathname.startsWith("/projects/")
  );
}

function ProjectServicesPanel({ isExpanded, children }) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div className="overflow-hidden">
        <div className="ml-3 space-y-1 border-l border-[#2d2d2d] pl-3 pt-1 pb-0.5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const sidebarRef = useGsapSidebar();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [expandedProjectId, setExpandedProjectId] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    let isActive = true;

    setCurrentSearch(window.location.search);

    getProjects()
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

        if (projectId) {
          setExpandedProjectId(projectId);
          window.localStorage.setItem("selectedProjectId", projectId);
        }
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
        .then((data) => {
          setProjects(data);

          const storedId = window.localStorage.getItem("selectedProjectId");
          const activeId =
            data.find((project) => project.id === storedId)?.id ||
            data[0]?.id ||
            "";

          if (!activeId) {
            return;
          }

          setSelectedProjectId(activeId);
          setExpandedProjectId((current) => current || activeId);
        })
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

  useEffect(() => {
    const params = new URLSearchParams(currentSearch);
    const projectId =
      params.get("projectId") ||
      window.localStorage.getItem("selectedProjectId") ||
      "";

    if (!projectId) {
      return;
    }

    setSelectedProjectId(projectId);

    if (isProjectToolPath(pathname)) {
      setExpandedProjectId(projectId);
    }
  }, [pathname, currentSearch]);

  const getProjectToolHref = useCallback(
    (projectId, href = "/seo") => {
      const params = new URLSearchParams(currentSearch);

      params.set("projectId", projectId);

      return `${href}?${params.toString()}`;
    },
    [currentSearch]
  );

  const handleProjectSelect = useCallback((projectId) => {
    window.localStorage.setItem("selectedProjectId", projectId);
    setSelectedProjectId(projectId);
  }, []);

  const handleProjectToolClick = useCallback(
    (projectId) => {
      handleProjectSelect(projectId);
      onNavigate?.();
    },
    [handleProjectSelect, onNavigate]
  );

  const toggleProjectExpanded = useCallback(
    (projectId) => {
      startTransition(() => {
        setExpandedProjectId((current) => {
          if (current === projectId) {
            return "";
          }

          window.localStorage.setItem("selectedProjectId", projectId);
          setSelectedProjectId(projectId);
          return projectId;
        });
      });
    },
    [startTransition]
  );

  return (
    <aside
      className="flex h-full w-72 flex-col border-r border-[#2d2d2d] bg-black text-white"
      ref={sidebarRef}
    >
      <div
        className="relative z-20 shrink-0 space-y-2 border-b border-dashed border-[#2d2d2d] bg-black px-4 py-4"
        data-sidebar-brand
      >
        <BrandLogo href="/dashboard" priority width={168} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Intelligence
        </p>
      </div>

      <nav className="relative z-10 flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-3">
        {sidebarNavigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#ed2225] text-white shadow-sm"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              )}
              data-sidebar-nav
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive
                    ? "text-white"
                    : "text-zinc-500 group-hover:text-white"
                )}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}

        <div className="pt-5">
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Clients
            </span>
            <Link
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-300 transition-colors duration-150 hover:bg-white/10 hover:text-white active:scale-[0.98]"
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
                const isSelected = selectedProjectId === project.id;
                const isExpanded = expandedProjectId === project.id;

                return (
                  <div className="space-y-0" key={project.id}>
                    <div
                      className={cn(
                        "flex items-start gap-1 rounded-xl transition-colors duration-150",
                        isSelected
                          ? "bg-[#ed2225] text-white shadow-sm"
                          : "text-zinc-300 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <button
                        className="min-w-0 flex-1 px-3 py-2.5 text-left text-sm font-medium transition-opacity duration-150 active:opacity-80"
                        onClick={() => handleProjectSelect(project.id)}
                        type="button"
                      >
                        <span className="block truncate">{project.name}</span>
                        <span
                          className={cn(
                            "mt-0.5 block truncate text-xs",
                            isSelected ? "text-white/80" : "text-zinc-500"
                          )}
                        >
                          {project.website}
                        </span>
                      </button>
                      <button
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded
                            ? `Collapse ${project.name} services`
                            : `Expand ${project.name} services`
                        }
                        className={cn(
                          "mr-2 mt-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-[transform,background-color,color] duration-150 ease-out active:scale-90 motion-reduce:active:scale-100",
                          isSelected
                            ? "text-white hover:bg-white/15"
                            : "text-zinc-400 hover:bg-white/10 hover:text-white"
                        )}
                        onClick={() => toggleProjectExpanded(project.id)}
                        type="button"
                      >
                        <span
                          className={cn(
                            "inline-flex transition-transform duration-200 ease-out motion-reduce:transition-none",
                            isExpanded && "rotate-180"
                          )}
                        >
                          {isExpanded ? (
                            <Minus className="h-3.5 w-3.5" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </button>
                    </div>

                    <ProjectServicesPanel isExpanded={isExpanded}>
                        {projectToolNavigation.map((item) => {
                          const Icon = item.icon;
                          const isToolActive = pathname === item.href;

                          return (
                            <Link
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors duration-150 active:bg-white/20",
                                isToolActive
                                  ? "bg-white/15 text-white"
                                  : "text-zinc-400 hover:bg-white/10 hover:text-white"
                              )}
                              href={getProjectToolHref(project.id, item.href)}
                              key={item.href}
                              onClick={() => handleProjectToolClick(project.id)}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {item.title}
                            </Link>
                          );
                        })}
                        <div className="my-1 border-t border-[#2d2d2d]" />
                        <Link
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors duration-150 active:bg-white/20",
                            pathname === "/compare"
                              ? "bg-white/15 text-white"
                              : "text-zinc-400 hover:bg-white/10 hover:text-white"
                          )}
                          href={getProjectToolHref(project.id, "/compare")}
                          onClick={() => handleProjectToolClick(project.id)}
                        >
                          <Scale className="h-3.5 w-3.5" />
                          Monthly Compare
                        </Link>
                        <Link
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors duration-150 active:bg-white/20",
                            pathname === `/projects/${project.id}`
                              ? "bg-white/15 text-white"
                              : "text-zinc-400 hover:bg-white/10 hover:text-white"
                          )}
                          href={`/projects/${project.id}`}
                          onClick={() => handleProjectToolClick(project.id)}
                        >
                          <Settings className="h-3.5 w-3.5" />
                          Project Settings
                        </Link>
                    </ProjectServicesPanel>
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl bg-white/5 px-3 py-2 text-sm text-zinc-400">
                No clients yet
              </p>
            )}
          </div>
        </div>
      </nav>

      <div className="border-t border-dashed border-[#2d2d2d] p-3" data-sidebar-footer>
        <Link
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-[#ed2225] text-white shadow-sm"
              : "text-zinc-300 hover:bg-white/10 hover:text-white"
          )}
          data-sidebar-nav
          href="/settings"
          onClick={onNavigate}
        >
          <Settings
            className={cn(
              "h-4 w-4",
              pathname === "/settings"
                ? "text-white"
                : "text-zinc-500 group-hover:text-white"
            )}
          />
          Settings
        </Link>
      </div>
    </aside>
  );
}
