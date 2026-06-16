"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Command } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name, email, password });
      router.replace("/dashboard");
    } catch (error) {
      console.error("Firebase Registration Error:", error);
      console.error("Error Code:", error.code);
      console.error("Error Message:", error.message);

      setError(`${error.code} - ${error.message}`);
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
              Create a secure workspace for your growth intelligence team.
            </p>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Register with Firebase Authentication and store user profile data
              in Firestore.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create account
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Start using your intelligence dashboard.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Name</span>
              <input
                autoComplete="name"
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                type="text"
                value={name}
              />
            </label>
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
              <span className="text-sm font-medium text-zinc-700">
                Password
              </span>
              <input
                autoComplete="new-password"
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 characters"
                required
                type="password"
                value={password}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Confirm Password
              </span>
              <input
                autoComplete="new-password"
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm password"
                required
                type="password"
                value={confirmPassword}
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              className="font-medium text-zinc-950 hover:underline"
              href="/login"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
