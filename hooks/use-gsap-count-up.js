"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { prefersReducedMotion } from "@/utils/motion";

export function useGsapCountUp(value, deps = []) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return undefined;
    }

    if (value == null || Number.isNaN(Number(value))) {
      element.textContent = "--";
      return undefined;
    }

    const numericValue = Number(value);

    if (prefersReducedMotion()) {
      element.textContent = String(numericValue);
      return undefined;
    }

    const counter = { val: 0 };

    const tween = gsap.to(counter, {
      duration: 1.15,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = String(Math.round(counter.val));
      },
      snap: { val: 1 },
      val: numericValue,
    });

    return () => tween.kill();
    // Caller controls when the counter should replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return elementRef;
}
