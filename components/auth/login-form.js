"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  animateLoginError,
  animateLoginSubmit,
} from "@/hooks/use-gsap-login";
import { cn } from "@/utils/cn";

const highlights = [
  "GA4, Search Console & Google Ads in one view",
  "AI recommendations tuned for growth teams",
  "Secure access for your intelligence workspace",
];

function getAuthErrorMessage(error) {
  if (error?.code === "auth/invalid-credential") {
    return "Invalid email or password.";
  }

  if (error?.code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }

  if (error?.code === "auth/missing-password") {
    return "Enter your password.";
  }

  return "Unable to sign in. Check your Firebase configuration and credentials.";
}

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const formRef = useRef(null);
  const submitRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    animateLoginSubmit(submitRef.current);

    try {
      await login(email, password);
      router.replace(redirectTo);
    } catch (loginError) {
      setError(getAuthErrorMessage(loginError));
      animateLoginError(formRef.current);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      description="Monitor SEO, analytics, paid media, and AI recommendations from one focused operating system — designed for agencies that move fast."
      headlineAccent="built for growth teams."
      headlinePrimary="Enterprise intelligence"
      highlights={highlights}
    >
      <div data-auth-reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Welcome back
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
          Sign in to your workspace
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Access dashboards, client projects, and AI insights.
        </p>
      </div>

      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <label className="block" data-auth-reveal>
          <span className="text-sm font-medium text-zinc-700">Email</span>
          <input
            autoComplete="email"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/90 px-4 text-sm text-zinc-950 outline-none"
            data-auth-input
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block" data-auth-reveal>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-zinc-700">Password</span>
            <Link
              className="text-sm font-medium text-[#ed2225]"
              data-auth-hover
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-2">
            <input
              autoComplete="current-password"
              className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/90 px-4 pr-20 text-sm text-zinc-950 outline-none"
              data-auth-input
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500"
              data-auth-hover
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {error ? (
          <div
            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
            data-auth-reveal
          >
            {error}
          </div>
        ) : null}

        <div data-auth-reveal ref={submitRef}>
          <Button
            className={cn(
              "h-12 w-full rounded-xl text-sm font-semibold shadow-[0_16px_40px_-14px_rgba(0,0,0,0.45)]",
              isSubmitting && "pointer-events-none opacity-90"
            )}
            data-auth-cta
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>

      <p className="mt-7 text-center text-sm text-zinc-500" data-auth-reveal>
        Don&apos;t have an account?{" "}
        <Link
          className="font-semibold text-[#ed2225]"
          data-auth-hover
          href="/register"
        >
          Create one
        </Link>
      </p>
    </AuthPageShell>
  );
}
