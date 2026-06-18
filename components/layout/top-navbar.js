"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bell, LogOut, Menu, Search } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { getProjects } from "@/services/projects";

export function TopNavbar({ onOpenSidebar, eyebrow = "Workspace" }) {
  const { logout, user, userProfile } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const displayName = userProfile?.name || user?.displayName || user?.email || "Team";
  const initials =
    displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "IV";

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return projects
      .filter((project) =>
        [project.name, project.website, project.industry]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      )
      .slice(0, 6);
  }, [projects, query]);

  useEffect(() => {
    let isActive = true;

    Promise.resolve()
      .then(() => getProjects())
      .then((data) => {
        if (isActive) {
          setProjects(data);
        }
      })
      .catch((error) => {
        console.error("Header projects search load error:", error);
      });

    function handleProjectsChange() {
      getProjects()
        .then((data) => setProjects(data))
        .catch((error) => {
          console.error("Header projects search refresh error:", error);
        });
    }

    window.addEventListener("projects-change", handleProjectsChange);

    return () => {
      isActive = false;
      window.removeEventListener("projects-change", handleProjectsChange);
    };
  }, []);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  function openProject(projectId) {
    const params = new URLSearchParams(window.location.search);

    params.set("projectId", projectId);
    window.localStorage.setItem("selectedProjectId", projectId);
    setQuery("");
    setIsSearchFocused(false);
    router.push(`/seo?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          aria-label="Open sidebar"
          className="lg:hidden"
          onClick={onOpenSidebar}
          size="icon"
          variant="ghost"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
            {eyebrow}
          </p>
          <p className="text-sm font-semibold text-zinc-950">
            Performance Intelligence
          </p>
        </div>
      </div>

      <div className="relative hidden w-full max-w-sm md:block">
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
          <Search className="h-4 w-4" />
          <input
            className="w-full bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
            onBlur={() => {
              window.setTimeout(() => setIsSearchFocused(false), 150);
            }}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search clients..."
            value={query}
          />
        </div>

        {isSearchFocused && query.trim() ? (
          <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <button
                  className="block w-full px-4 py-3 text-left text-sm transition-colors hover:bg-zinc-50"
                  key={project.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => openProject(project.id)}
                  type="button"
                >
                  <span className="block font-semibold text-zinc-950">
                    {project.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-500">
                    {project.website || project.industry || "Client project"}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-zinc-500">
                No clients found
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Button aria-label="Notifications" size="icon" variant="ghost">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-2 text-sm font-medium text-zinc-700 shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
            {initials}
          </span>
          <span className="hidden max-w-36 truncate sm:inline">
            {displayName}
          </span>
        </div>
        <Button
          aria-label="Logout"
          onClick={handleLogout}
          size="icon"
          variant="ghost"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
