"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { prefersReducedMotion } from "@/utils/motion";

function animateStatValue(element) {
  const raw = element.dataset.statValue;

  if (!raw) {
    return;
  }

  if (raw === "Live") {
    element.textContent = "Live";
    gsap.fromTo(
      element,
      { autoAlpha: 0, scale: 0.6 },
      { autoAlpha: 1, duration: 0.7, ease: "back.out(3)", scale: 1 }
    );
    return;
  }

  const match = raw.match(/^(\d+)(.*)$/);

  if (!match) {
    element.textContent = raw;
    return;
  }

  const target = Number(match[1]);
  const suffix = match[2] || "";
  const counter = { val: 0 };

  gsap.fromTo(
    element,
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, duration: 0.4, y: 0 }
  );

  gsap.to(counter, {
    duration: 1.6,
    ease: "power3.out",
    onUpdate: () => {
      element.textContent = `${Math.round(counter.val)}${suffix}`;
    },
    val: target,
  });
}

function bindInputAnimations(root) {
  const inputs = gsap.utils.toArray("[data-auth-input]", root);

  return inputs.map((input) => {
    function handleFocus() {
      gsap.to(input, {
        borderColor: "#a1a1aa",
        boxShadow: "0 10px 28px -14px rgba(0, 0, 0, 0.25)",
        duration: 0.35,
        ease: "power2.out",
        scale: 1.015,
        y: -2,
      });
    }

    function handleBlur() {
      gsap.to(input, {
        borderColor: "#e4e4e7",
        boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
        duration: 0.35,
        ease: "power2.out",
        scale: 1,
        y: 0,
      });
    }

    input.addEventListener("focus", handleFocus);
    input.addEventListener("blur", handleBlur);

    return () => {
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("blur", handleBlur);
    };
  });
}

function bindHoverAnimations(root) {
  const hovers = gsap.utils.toArray("[data-auth-hover]", root);

  return hovers.map((element) => {
    function handleEnter() {
      gsap.to(element, {
        duration: 0.3,
        ease: "power2.out",
        scale: 1.04,
        y: -1,
      });
    }

    function handleLeave() {
      gsap.to(element, {
        duration: 0.35,
        ease: "power2.out",
        scale: 1,
        y: 0,
      });
    }

    element.addEventListener("mouseenter", handleEnter);
    element.addEventListener("mouseleave", handleLeave);

    return () => {
      element.removeEventListener("mouseenter", handleEnter);
      element.removeEventListener("mouseleave", handleLeave);
    };
  });
}

export function useGsapLogin() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || prefersReducedMotion()) {
      return undefined;
    }

    const inputCleanups = bindInputAnimations(root);
    const hoverCleanups = bindHoverAnimations(root);

    const ctx = gsap.context(() => {
      const mesh = root.querySelector("[data-login-mesh]");
      const formGlow = root.querySelector("[data-login-form-glow]");
      const particles = gsap.utils.toArray("[data-auth-particle]", root);
      const blobs = gsap.utils.toArray("[data-login-blob]", root);
      const statValues = gsap.utils.toArray("[data-stat-value]", root);
      const logoImage = root.querySelector("[data-login-logo] img");

      const timeline = gsap.timeline({
        defaults: { ease: "power4.out" },
      });

      timeline
        .fromTo(
          "[data-login-curtain]",
          { scaleY: 1 },
          {
            duration: 1.1,
            ease: "power4.inOut",
            scaleY: 0,
            transformOrigin: "top center",
          },
          0
        )
        .fromTo(
          "[data-login-curtain-accent]",
          { scaleX: 0 },
          {
            duration: 0.9,
            ease: "power3.inOut",
            scaleX: 1,
            transformOrigin: "left center",
          },
          0.15
        )
        .fromTo(
          "[data-login-mesh]",
          { autoAlpha: 0, scale: 1.12 },
          { autoAlpha: 1, duration: 1.5, scale: 1 },
          0.35
        )
        .fromTo(
          blobs,
          { autoAlpha: 0, scale: 0.4 },
          {
            autoAlpha: 1,
            duration: 1.2,
            scale: 1,
            stagger: 0.15,
          },
          0.4
        )
        .fromTo(
          particles,
          { autoAlpha: 0, scale: 0 },
          {
            autoAlpha: 1,
            duration: 0.7,
            scale: 1,
            stagger: { amount: 1.1, from: "random" },
          },
          0.45
        )
        .fromTo(
          "[data-login-grid]",
          { autoAlpha: 0 },
          { autoAlpha: 0.4, duration: 1 },
          0.5
        )
        .fromTo(
          "[data-login-beam]",
          { autoAlpha: 0, scaleX: 0 },
          {
            autoAlpha: 0.85,
            duration: 1.2,
            scaleX: 1,
            transformOrigin: "left center",
          },
          0.55
        )
        .fromTo(
          "[data-login-logo]",
          { autoAlpha: 0, rotate: -6, scale: 0.8, y: 30 },
          { autoAlpha: 1, duration: 1, rotate: 0, scale: 1, y: 0 },
          0.65
        )
        .fromTo(
          "[data-auth-char]",
          { autoAlpha: 0, y: "110%" },
          {
            autoAlpha: 1,
            duration: 0.55,
            stagger: 0.018,
            y: "0%",
          },
          0.78
        )
        .fromTo(
          "[data-auth-word]",
          { autoAlpha: 0, rotate: 6, y: "120%" },
          {
            autoAlpha: 1,
            duration: 0.85,
            rotate: 0,
            stagger: 0.045,
            y: "0%",
            ease: "back.out(1.7)",
          },
          0.88
        )
        .fromTo(
          "[data-login-accent-bar]",
          { scaleX: 0 },
          { duration: 1, scaleX: 1, transformOrigin: "left center" },
          1.05
        )
        .fromTo(
          "[data-login-copy]",
          { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" },
          {
            autoAlpha: 1,
            clipPath: "inset(0 0% 0 0)",
            duration: 0.8,
            stagger: 0.1,
          },
          1.1
        )
        .fromTo(
          "[data-login-highlight-line]",
          { scaleX: 0 },
          {
            duration: 0.7,
            scaleX: 1,
            stagger: 0.12,
            transformOrigin: "left center",
          },
          1.15
        )
        .fromTo(
          "[data-login-stat]",
          { autoAlpha: 0, rotateX: -75, y: 40 },
          {
            autoAlpha: 1,
            duration: 0.9,
            rotateX: 0,
            stagger: 0.14,
            transformPerspective: 900,
            y: 0,
            ease: "back.out(1.6)",
          },
          1.2
        )
        .fromTo(
          "[data-login-form-shell]",
          { autoAlpha: 0, rotateY: 18, scale: 0.88, x: 60 },
          {
            autoAlpha: 1,
            duration: 1.1,
            rotateY: 0,
            scale: 1,
            transformPerspective: 1200,
            x: 0,
            ease: "power3.out",
          },
          0.95
        )
        .fromTo(
          "[data-auth-reveal]",
          { autoAlpha: 0, x: 28, y: 12 },
          {
            autoAlpha: 1,
            duration: 0.65,
            stagger: 0.07,
            x: 0,
            y: 0,
            ease: "power3.out",
          },
          1.25
        );

      statValues.forEach((element, index) => {
        timeline.call(() => animateStatValue(element), null, 1.35 + index * 0.12);
      });

      if (mesh) {
        gsap.to(mesh, {
          "--mesh-x": "70%",
          "--mesh-y": "35%",
          duration: 9,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(mesh, {
          "--mesh-x2": "18%",
          "--mesh-y2": "75%",
          duration: 12,
          delay: 0.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(mesh, {
          "--mesh-x3": "55%",
          "--mesh-y3": "55%",
          duration: 15,
          delay: 0.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      blobs.forEach((blob, index) => {
        gsap.to(blob, {
          duration: 5 + index * 1.5,
          ease: "sine.inOut",
          repeat: -1,
          scale: 1.15 + index * 0.05,
          x: `+=${20 + index * 12}`,
          y: `+=${-15 + index * 10}`,
          yoyo: true,
        });
      });

      gsap.to("[data-login-beam]", {
        autoAlpha: 0.4,
        duration: 2.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      if (formGlow) {
        gsap.to(formGlow, {
          rotation: 360,
          duration: 8,
          ease: "none",
          repeat: -1,
        });
      }

      if (logoImage) {
        gsap.to(logoImage, {
          duration: 2.2,
          ease: "sine.inOut",
          repeat: -1,
          y: -8,
          yoyo: true,
        });
      }

      gsap.to("[data-login-grid]", {
        backgroundPosition: "56px 56px",
        duration: 24,
        ease: "none",
        repeat: -1,
      });

      particles.forEach((particle, index) => {
        gsap.to(particle, {
          duration: 2.2 + (index % 6) * 0.5,
          ease: "sine.inOut",
          repeat: -1,
          x: `+=${index % 2 === 0 ? 8 : -8}`,
          y: `+=${12 + (index % 5) * 4}`,
          yoyo: true,
        });
      });

      gsap.to("[data-login-shine]", {
        duration: 4,
        ease: "none",
        repeat: -1,
        x: "260%",
      });

      gsap.to("[data-auth-cta]", {
        boxShadow:
          "0 20px 50px -14px rgba(0, 0, 0, 0.55), 0 0 0 0 rgba(0, 0, 0, 0)",
        duration: 1.8,
        ease: "sine.inOut",
        repeat: -1,
        y: -2,
        yoyo: true,
      });
    }, root);

    return () => {
      inputCleanups.forEach((cleanup) => cleanup());
      hoverCleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, []);

  return rootRef;
}

export function animateLoginError(formElement) {
  if (!formElement || prefersReducedMotion()) {
    return;
  }

  gsap.timeline()
    .to(formElement, {
      duration: 0.08,
      ease: "power2.inOut",
      keyframes: [
        { x: -12 },
        { x: 12 },
        { x: -8 },
        { x: 8 },
        { x: 0 },
      ],
    })
    .fromTo(
      gsap.utils.toArray("[data-auth-reveal]", formElement),
      { x: 0 },
      {
        duration: 0.35,
        keyframes: [{ x: -3 }, { x: 3 }, { x: 0 }],
        stagger: 0.03,
      },
      0
    );
}

export function animateLoginSubmit(buttonElement) {
  if (!buttonElement || prefersReducedMotion()) {
    return undefined;
  }

  return gsap.timeline()
    .to(buttonElement, {
      duration: 0.15,
      ease: "power2.out",
      scale: 0.96,
    })
    .to(buttonElement, {
      boxShadow: "0 0 0 4px rgba(0, 0, 0, 0.12)",
      duration: 0.35,
      ease: "power2.out",
      scale: 1,
    });
}
