"use client";

import { useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const defaultValues = {
  name: "",
  website: "",
  googleAdsCustomerId: "",
  ga4PropertyId: "",
  searchConsoleSiteUrl: "",
  industry: "",
  status: "Active",
};

const statuses = ["Active", "Paused", "Draft"];

export function ProjectForm({
  initialValues = defaultValues,
  isSubmitting = false,
  onSubmit,
  submitLabel = "Save Project",
  title = "Project Details",
  description = "Enter project tracking and integration details.",
}) {
  const [formData, setFormData] = useState({
    ...defaultValues,
    ...initialValues,
  });

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(formData);
  }

  return (
    <Card className="overflow-hidden border-zinc-100 bg-white shadow-lg shadow-zinc-950/5">
      <CardHeader className="bg-linear-to-r from-cyan-50 via-white to-violet-50 p-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="mt-1 text-xs leading-5">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Name
              </span>
              <input
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-200 bg-linear-to-r from-white to-zinc-50 px-3 text-sm font-medium outline-none transition-all placeholder:text-zinc-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="iVistaz Digital"
                required
                value={formData.name}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Website
              </span>
              <input
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-200 bg-linear-to-r from-white to-zinc-50 px-3 text-sm font-medium outline-none transition-all placeholder:text-zinc-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                onChange={(event) => updateField("website", event.target.value)}
                placeholder="https://example.com"
                required
                type="url"
                value={formData.website}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Google Ads Customer ID
              </span>
              <input
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-200 bg-linear-to-r from-white to-zinc-50 px-3 text-sm font-medium outline-none transition-all placeholder:text-zinc-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                onChange={(event) =>
                  updateField("googleAdsCustomerId", event.target.value)
                }
                placeholder="123-456-7890"
                value={formData.googleAdsCustomerId}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                GA4 Property ID
              </span>
              <input
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-200 bg-linear-to-r from-white to-zinc-50 px-3 text-sm font-medium outline-none transition-all placeholder:text-zinc-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                onChange={(event) =>
                  updateField("ga4PropertyId", event.target.value)
                }
                placeholder="123456789"
                value={formData.ga4PropertyId}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Search Console Site URL
              </span>
              <input
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-200 bg-linear-to-r from-white to-zinc-50 px-3 text-sm font-medium outline-none transition-all placeholder:text-zinc-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                onChange={(event) =>
                  updateField("searchConsoleSiteUrl", event.target.value)
                }
                placeholder="https://example.com/"
                value={formData.searchConsoleSiteUrl}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Industry
              </span>
              <input
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-200 bg-linear-to-r from-white to-zinc-50 px-3 text-sm font-medium outline-none transition-all placeholder:text-zinc-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                onChange={(event) => updateField("industry", event.target.value)}
                placeholder="Performance Marketing"
                required
                value={formData.industry}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Status
              </span>
              <select
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-200 bg-linear-to-r from-white to-zinc-50 px-3 text-sm font-medium outline-none transition-all focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                onChange={(event) => updateField("status", event.target.value)}
                value={formData.status}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex justify-end border-t border-zinc-100 pt-3">
            <Button
              className="rounded-xl bg-linear-to-r from-cyan-950 to-zinc-950 px-5 shadow-lg shadow-cyan-950/10 hover:from-cyan-900 hover:to-zinc-900"
              disabled={isSubmitting}
              type="submit"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
