"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { prefersReducedMotion } from "@/utils/motion";

export function useGsapSidebar() {
  const sidebarRef = useRef(null);

  useEffect(() => {
    const sidebar = sidebarRef.current;

    if (!sidebar || prefersReducedMotion()) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const brand = sidebar.querySelector("[data-sidebar-brand]");
      const navItems = sidebar.querySelectorAll("[data-sidebar-nav]");
      const footer = sidebar.querySelector("[data-sidebar-footer]");

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (brand) {
        timeline.fromTo(
          brand,
          { autoAlpha: 0, x: -24 },
          { autoAlpha: 1, duration: 0.65, x: 0 }
        );
      }

      if (navItems.length) {
        timeline.fromTo(
          navItems,
          { autoAlpha: 0, x: -20 },
          { autoAlpha: 1, duration: 0.55, stagger: 0.05, x: 0 },
          "-=0.35"
        );
      }

      if (footer) {
        timeline.fromTo(
          footer,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, duration: 0.5, y: 0 },
          "-=0.2"
        );
      }
    }, sidebar);

    return () => ctx.revert();
  }, []);

  return sidebarRef;
}
