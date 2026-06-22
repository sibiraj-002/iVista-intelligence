"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  "One workspace for SEO, analytics, and paid media",
  "Collaborate across client programs with role-based access",
  "Start with Firebase Authentication and Firestore profiles",
];

function getRegisterErrorMessage(error) {
  if (error?.code === "auth/email-already-in-use") {
    return "An account with this email already exists.";
  }

  if (error?.code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }

  if (error?.code === "auth/weak-password") {
    return "Password should be at least 6 characters.";
  }

  if (error?.code === "auth/missing-password") {
    return "Enter a password.";
  }

  return "Unable to create your account. Please try again.";
}

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const formRef = useRef(null);
  const submitRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      animateLoginError(formRef.current);
      return;
    }

    setIsSubmitting(true);
    animateLoginSubmit(submitRef.current);

    try {
      await register({ name, email, password });
      router.replace("/dashboard");
    } catch (registerError) {
      console.error("Firebase registration error:", registerError);
      setError(getRegisterErrorMessage(registerError));
      animateLoginError(formRef.current);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      description="Create a secure workspace for your growth intelligence team and unlock portfolio-level SEO, analytics, and AI recommendations."
      headlineAccent="for your growth team."
      headlinePrimary="Create your workspace"
      highlights={highlights}
    >
      <div data-auth-reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Get started
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
          Create your account
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Set up access to your intelligence dashboard in minutes.
        </p>
      </div>

      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <label className="block" data-auth-reveal>
          <span className="text-sm font-medium text-zinc-700">Name</span>
          <input
            autoComplete="name"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/90 px-4 text-sm text-zinc-950 outline-none"
            data-auth-input
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            required
            type="text"
            value={name}
          />
        </label>

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
          <span className="text-sm font-medium text-zinc-700">Password</span>
          <div className="relative mt-2">
            <input
              autoComplete="new-password"
              className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/90 px-4 pr-20 text-sm text-zinc-950 outline-none"
              data-auth-input
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
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

        <label className="block" data-auth-reveal>
          <span className="text-sm font-medium text-zinc-700">
            Confirm password
          </span>
          <input
            autoComplete="new-password"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/90 px-4 text-sm text-zinc-950 outline-none"
            data-auth-input
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm password"
            required
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
          />
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
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </div>
      </form>

      <p className="mt-7 text-center text-sm text-zinc-500" data-auth-reveal>
        Already have an account?{" "}
        <Link
          className="font-semibold text-[#ed2225]"
          data-auth-hover
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
