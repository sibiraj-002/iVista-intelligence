"use client";

import { useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";

export function DashboardLayout({ children, eyebrow }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 text-zinc-950">
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
          <Sidebar />
        </div>
        <MobileSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="lg:pl-72">
          <TopNavbar
            eyebrow={eyebrow}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
