"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { prefersReducedMotion } from "@/utils/motion";

const defaultOptions = {
  delay: 0,
  duration: 0.85,
  selector: "[data-reveal]",
  stagger: 0.12,
  y: 44,
};

export function useGsapReveal(deps = [], options = {}) {
  const containerRef = useRef(null);
  const mergedOptions = { ...defaultOptions, ...options };

  useEffect(() => {
    const container = containerRef.current;

    if (!container || prefersReducedMotion()) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const targets = container.querySelectorAll(mergedOptions.selector);

      if (!targets.length) {
        return;
      }

      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: mergedOptions.y },
        {
          autoAlpha: 1,
          clearProps: "transform",
          delay: mergedOptions.delay,
          duration: mergedOptions.duration,
          ease: "power3.out",
          stagger: mergedOptions.stagger,
          y: 0,
        }
      );
    }, container);

    return () => ctx.revert();
    // Caller controls when the reveal should replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}
