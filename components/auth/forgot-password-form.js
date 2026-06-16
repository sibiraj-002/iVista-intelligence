"use client";

import Link from "next/link";
import { useState } from "react";
import { Command } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

function getResetErrorMessage(error) {
  if (error?.code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }

  if (error?.code === "auth/user-not-found") {
    return "No account exists for this email.";
  }

  return "Unable to send reset email. Check your Firebase configuration.";
}

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setSuccess("Password reset email sent. Check your inbox.");
    } catch (resetError) {
      setError(getResetErrorMessage(resetError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl shadow-zinc-200/60 sm:p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-white">
          <Command className="h-5 w-5" />
        </div>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
          Reset password
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Enter your email and Firebase will send a password reset link.
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

          {error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {success}
            </div>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Sending..." : "Send reset email"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Remembered your password?{" "}
          <Link
            className="font-medium text-zinc-950 hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
