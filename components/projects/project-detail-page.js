"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Globe2,
  IdCard,
  SearchCheck,
  Target,
  Trash2,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectForm } from "@/components/projects/project-form";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteProject, getProject, updateProject } from "@/services/projects";

function MetricBlock({ icon: Icon, label, value, helper }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
              {value}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

export function ProjectDetailPage({ projectId }) {
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    getProject(projectId)
      .then((data) => {
        if (isActive) {
          setProject(data);
          setError("");
        }
      })
      .catch((loadError) => {
        console.error("Firestore project detail load error:", loadError);

        if (isActive) {
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [projectId]);

  async function handleUpdate(values) {
    setIsSubmitting(true);
    setError("");

    try {
      await updateProject(projectId, values);
      setProject((current) => ({
        ...current,
        ...values,
      }));
    } catch (updateError) {
      console.error("Firestore project update error:", updateError);
      setError(updateError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    const shouldDelete = window.confirm(
      `Delete ${project.name}? This cannot be undone.`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteProject(projectId);
      router.replace("/projects");
    } catch (deleteError) {
      console.error("Firestore project delete error:", deleteError);
      setError(deleteError.message);
    }
  }

  return (
    <DashboardLayout eyebrow="Project Detail">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Project</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              {project?.name || "Project Details"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              View, edit, and manage Firestore project records.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/projects"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
            {project ? (
              <Button onClick={handleDelete} variant="ghost">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
          </div>
        </div>

        {error ? (
          <Card>
            <CardContent className="p-4 text-sm font-medium text-red-700">
              {error}
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <Card>
            <CardContent className="p-10 text-center text-sm font-medium text-zinc-500">
              Loading project...
            </CardContent>
          </Card>
        ) : project ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricBlock
                helper="Primary website for this project."
                icon={Globe2}
                label="Website"
                value={project.website}
              />
              <MetricBlock
                helper="Linked Google Ads account identifier."
                icon={IdCard}
                label="Google Ads Customer ID"
                value={project.googleAdsCustomerId || "Not set"}
              />
              <MetricBlock
                helper="Linked GA4 property identifier."
                icon={Target}
                label="GA4 Property ID"
                value={project.ga4PropertyId || "Not set"}
              />
              <MetricBlock
                helper="Linked Google Search Console property URL."
                icon={SearchCheck}
                label="Search Console"
                value={project.searchConsoleSiteUrl || "Not set"}
              />
            </section>

            <ProjectForm
              description="Update Firestore project fields and integration IDs."
              initialValues={project}
              isSubmitting={isSubmitting}
              onSubmit={handleUpdate}
              submitLabel="Update Project"
              title="Edit Project"
            />
          </>
        ) : (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-base font-semibold text-zinc-950">
                Project not found
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                This project may have been deleted or the ID is invalid.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
