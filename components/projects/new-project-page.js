"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectForm } from "@/components/projects/project-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { addProject } from "@/services/projects";

export function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(project) {
    setError("");
    setIsSubmitting(true);

    try {
      const result = await addProject(project);
      router.replace(`/projects/${result.id}`);
    } catch (createError) {
      console.error("Firestore project create error:", createError);
      setError(createError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardLayout eyebrow="Projects">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Create</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              New Project
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Add a client website and connect Google Ads and GA4 identifiers.
            </p>
          </div>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/projects"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>

        {error ? (
          <Card>
            <CardContent className="p-4 text-sm font-medium text-red-700">
              {error}
            </CardContent>
          </Card>
        ) : null}

        <ProjectForm
          isSubmitting={isSubmitting}
          onSubmit={handleCreate}
          submitLabel="Create Project"
          title="Project Details"
        />
      </div>
    </DashboardLayout>
  );
}
