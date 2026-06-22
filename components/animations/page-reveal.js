"use client";

import { cn } from "@/utils/cn";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";

export function PageReveal({ children, className, deps = [], revealOptions }) {
  const containerRef = useGsapReveal(deps, revealOptions);

  return (
    <div className={cn(className)} ref={containerRef}>
      {children}
    </div>
  );
}
