"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";

import { cn } from "@/utils/cn";
import { prefersReducedMotion } from "@/utils/motion";

function getStaggerTargets(container) {
  const directChildren = Array.from(container.children);

  if (directChildren.length === 1 && directChildren[0].children.length > 1) {
    return Array.from(directChildren[0].children);
  }

  return directChildren;
}

export function AnimatedMain({ children, className }) {
  const containerRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const container = containerRef.current;

    if (!container || prefersReducedMotion()) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const targets = getStaggerTargets(container);

      if (!targets.length) {
        gsap.fromTo(
          container,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            duration: 0.8,
            ease: "power3.out",
            y: 0,
          }
        );
        return;
      }

      gsap.fromTo(
        targets,
        { autoAlpha: 0, scale: 0.97, y: 44 },
        {
          autoAlpha: 1,
          clearProps: "transform",
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.11,
          y: 0,
          scale: 1,
        }
      );
    }, container);

    return () => ctx.revert();
  }, [pathname]);

  return (
    <div className={cn(className)} ref={containerRef}>
      {children}
    </div>
  );
}
