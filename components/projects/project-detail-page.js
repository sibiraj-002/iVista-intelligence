"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Trash2,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectForm } from "@/components/projects/project-form";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { deleteProject, getProject, updateProject } from "@/services/projects";

export function ProjectDetailPage({ projectId }) {
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
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
    if (deleteConfirmation !== projectId) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await deleteProject(projectId);
      router.replace("/projects");
    } catch (deleteError) {
      console.error("Firestore project delete error:", deleteError);
      setError(deleteError.message);
      setIsDeleting(false);
    }
  }

  function closeDeleteDialog() {
    setIsDeleteOpen(false);
    setDeleteConfirmation("");
  }

  return (
    <DashboardLayout eyebrow="Project Detail">
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-3xl border border-cyan-950/10 bg-linear-to-br from-cyan-950 via-slate-900 to-zinc-950 p-5 text-white shadow-2xl">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100 ring-1 ring-white/15">
              Project Settings
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {project?.name || "Project Details"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-50/75">
              Manage client details and connected Google integrations.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              className={buttonVariants({
                className:
                  "border-white/15 bg-white/10 text-white hover:bg-white/15 focus-visible:ring-white/30",
                variant: "outline",
              })}
              href="/projects"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
            {project ? (
              <Button
                className="border border-white/15 bg-white text-rose-700 shadow-lg shadow-black/10 hover:bg-rose-50 focus-visible:ring-rose-200"
                onClick={() => setIsDeleteOpen(true)}
                variant="outline"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
          </div>
        </div>
        </section>

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
          <ProjectForm
            description="Update Firestore project fields and integration IDs."
            initialValues={project}
            isSubmitting={isSubmitting}
            onSubmit={handleUpdate}
            submitLabel="Update Project"
            title="Edit Project"
          />
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

        {isDeleteOpen && project ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-2xl">
              <div className="bg-linear-to-r from-rose-50 via-white to-orange-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-rose-600 to-red-700 text-white shadow-lg shadow-rose-900/20">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                      Delete this project?
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">
                      This will permanently delete {project.name}. This action
                      cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-sm text-rose-950">
                  Type this project ID to confirm:
                  <code className="mt-2 block rounded-xl bg-white px-3 py-2 font-semibold text-rose-900 shadow-sm">
                    {projectId}
                  </code>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Project ID
                  </span>
                  <input
                    className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium outline-none transition-all placeholder:text-zinc-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                    onChange={(event) => setDeleteConfirmation(event.target.value)}
                    placeholder="Paste project ID here"
                    value={deleteConfirmation}
                  />
                </label>

                <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:justify-end">
                  <Button
                    disabled={isDeleting}
                    onClick={closeDeleteDialog}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-linear-to-r from-rose-600 to-red-700 shadow-lg shadow-rose-900/20 hover:from-rose-500 hover:to-red-600"
                    disabled={deleteConfirmation !== projectId || isDeleting}
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete Project"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
