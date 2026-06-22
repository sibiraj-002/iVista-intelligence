"use client";

import { BrandLogo } from "@/components/brand/brand-logo";
import { AuthParticles } from "@/components/auth/auth-particles";
import { AuthSplitChars, AuthSplitWords } from "@/components/auth/auth-split-text";
import { useGsapLogin } from "@/hooks/use-gsap-login";

const defaultStats = [
  { label: "Client programs", value: "27+" },
  { label: "Data sources", value: "5" },
  { label: "AI insights", value: "Live" },
];

export function AuthPageShell({
  children,
  description,
  eyebrow = "Intelligence Platform",
  headlineAccent,
  headlinePrimary,
  highlights = [],
  stats = defaultStats,
}) {
  const rootRef = useGsapLogin();

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-black text-white"
      ref={rootRef}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-50 bg-black"
        data-login-curtain
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-[51] h-px w-full bg-linear-to-r from-zinc-600 via-zinc-800 to-transparent"
        data-login-curtain-accent
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0"
        data-login-mesh
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at var(--mesh-x, 32%) var(--mesh-y, 28%), rgba(237, 34, 37, 0.08), transparent 70%),
            radial-gradient(ellipse 50% 40% at var(--mesh-x2, 72%) var(--mesh-y2, 68%), rgba(255, 255, 255, 0.04), transparent 72%),
            radial-gradient(ellipse 45% 35% at var(--mesh-x3, 48%) var(--mesh-y3, 52%), rgba(20, 20, 20, 0.9), transparent 68%),
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0, 0, 0, 0.85), transparent 60%),
            linear-gradient(160deg, #000000 0%, #0a0a0a 45%, #050505 100%)
          `,
          "--mesh-x": "32%",
          "--mesh-x2": "72%",
          "--mesh-x3": "48%",
          "--mesh-y": "28%",
          "--mesh-y2": "68%",
          "--mesh-y3": "52%",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-white/5 blur-[90px]"
        data-login-blob
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-zinc-800/40 blur-[80px]"
        data-login-blob
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 h-48 w-48 rounded-full bg-[#ed2225]/6 blur-[70px]"
        data-login-blob
      />

      <AuthParticles />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0"
        data-login-grid
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundPosition: "0 0",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 40% 45%, black 15%, transparent 78%)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/3 h-px w-[min(62vw,720px)] bg-linear-to-r from-zinc-500/60 via-zinc-700/30 to-transparent"
        data-login-beam
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:flex-row">
        <section className="relative flex flex-1 flex-col justify-between px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
          <div data-login-logo>
            <BrandLogo href={null} priority width={188} />
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-zinc-500">
              <AuthSplitChars text={eyebrow} />
            </p>
          </div>

          <div className="mt-14 lg:mt-10">
            <h1 className="max-w-2xl text-[2.6rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.35rem]">
              <span className="block pb-1">
                <AuthSplitWords text={headlinePrimary} />
              </span>
              {headlineAccent ? (
                <span className="block pb-1">
                  <AuthSplitWords
                    text={headlineAccent}
                    wordClassName="text-zinc-300"
                  />
                </span>
              ) : null}
            </h1>

            <div
              className="mt-5 h-px w-24 bg-linear-to-r from-zinc-500 to-transparent"
              data-login-accent-bar
            />

            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-400" data-login-copy>
              {description}
            </p>

            {highlights.length > 0 ? (
              <ul className="mt-10 space-y-4">
                {highlights.map((text) => (
                  <li
                    className="flex items-start gap-4 text-sm leading-7 text-zinc-300"
                    data-login-copy
                    key={text}
                  >
                    <span
                      className="mt-2 h-px w-8 shrink-0 bg-linear-to-r from-zinc-500 to-transparent"
                      data-login-highlight-line
                    />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4 lg:mt-10">
            {stats.map((stat) => (
              <div
                className="rounded-2xl border border-white/8 bg-black/40 px-4 py-5 backdrop-blur-md"
                data-login-stat
                key={stat.label}
              >
                <p
                  className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
                  data-stat-value={stat.value}
                >
                  {stat.value === "Live" ? "\u00A0" : "0"}
                </p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative flex w-full items-center justify-center px-4 py-10 sm:px-8 lg:w-[min(560px,44%)] lg:shrink-0 lg:px-12 lg:py-16 lg:[perspective:1200px]">
          <div className="relative w-full" data-login-form-shell>
            <div className="absolute -inset-1 overflow-hidden rounded-[1.6rem]">
              <div
                aria-hidden
                className="absolute inset-[-120%] bg-[conic-gradient(from_0deg,#0a0a0a,#1a1a1a,#2d2d2d,#0a0a0a)] opacity-80"
                data-login-form-glow
              />
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-white p-8 text-zinc-950 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.75)] sm:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/50 to-transparent opacity-0"
                data-login-shine
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-zinc-900/30 blur-3xl"
              />
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
