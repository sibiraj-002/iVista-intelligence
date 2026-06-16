"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, Sparkles } from "lucide-react";

import { sidebarNavigation } from "@/components/layout/navigation";
import { cn } from "@/utils/cn";

export function Sidebar({ onNavigate }) {
  const pathname = usePathname();

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

      <nav className="flex-1 space-y-1 px-3 py-4">
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
      </nav>

      <div className="m-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
          <Sparkles className="h-4 w-4 text-zinc-950" />
        </div>
        <p className="text-sm font-semibold text-zinc-950">
          AI opportunity scan
        </p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Review ranking gaps, competitor movement, and campaign anomalies.
        </p>
      </div>
    </aside>
  );
}
