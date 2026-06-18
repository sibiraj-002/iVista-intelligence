"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Command, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.replace(redirectTo);
    } catch (loginError) {
      setError(getAuthErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-200/60 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden bg-zinc-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-950">
              <Command className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">iVistaz Intelligence</p>
              <p className="text-sm text-zinc-400">Growth Command Center</p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-tight">
              Enterprise intelligence for modern ecommerce growth teams.
            </p>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Monitor SEO, analytics, projects, and AI recommendations from one
              focused operating system.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
              <Command className="h-5 w-5" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Sign in to continue to your intelligence dashboard.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Email</span>
              <input
                autoComplete="email"
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
                type="email"
                value={email}
              />
            </label>
            <label className="block">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-zinc-700">
                  Password
                </span>
                <Link
                  className="text-sm font-medium text-zinc-950 hover:underline"
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-2">
                <input
                  autoComplete="current-password"
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 pr-11 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>

            {error ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              className="font-medium text-zinc-950 hover:underline"
              href="/register"
            >
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
