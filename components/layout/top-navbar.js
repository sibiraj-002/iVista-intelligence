"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function TopNavbar({ onOpenSidebar, eyebrow = "Workspace" }) {
  const { logout, user, userProfile } = useAuth();
  const router = useRouter();
  const displayName = userProfile?.name || user?.displayName || user?.email || "Team";
  const initials =
    displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "IV";

  async function handleLogout() {
    await logout();
    router.replace("/login");
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

      <div className="hidden w-full max-w-sm items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 md:flex">
        <Search className="h-4 w-4" />
        <span>Search projects, reports, keywords...</span>
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
