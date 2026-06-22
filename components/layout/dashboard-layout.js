"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AnimatedMain } from "@/components/animations/animated-main";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { prefersReducedMotion } from "@/utils/motion";

export function DashboardLayout({ children, eyebrow }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navbarRef = useRef(null);

  useEffect(() => {
    if (!navbarRef.current || prefersReducedMotion()) {
      return undefined;
    }

    gsap.fromTo(
      navbarRef.current,
      { autoAlpha: 0, y: -16 },
      { autoAlpha: 1, duration: 0.6, ease: "power3.out", y: 0 }
    );
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f5f5] text-zinc-950">
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
          <Sidebar />
        </div>
        <MobileSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="lg:pl-72">
          <div ref={navbarRef}>
            <TopNavbar
              eyebrow={eyebrow}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          </div>
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <AnimatedMain>{children}</AnimatedMain>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
