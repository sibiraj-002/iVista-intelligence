"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-950">
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-5 text-center shadow-sm">
          <p className="text-sm font-semibold">Checking authentication...</p>
          <p className="mt-1 text-xs text-zinc-500">
            Preparing your secure workspace.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
