"use client";

import { useState } from "react";

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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Name</span>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="iVistaz Digital"
                required
                value={formData.name}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Website</span>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
                onChange={(event) => updateField("website", event.target.value)}
                placeholder="https://example.com"
                required
                type="url"
                value={formData.website}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Google Ads Customer ID
              </span>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
                onChange={(event) =>
                  updateField("googleAdsCustomerId", event.target.value)
                }
                placeholder="123-456-7890"
                value={formData.googleAdsCustomerId}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                GA4 Property ID
              </span>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
                onChange={(event) =>
                  updateField("ga4PropertyId", event.target.value)
                }
                placeholder="123456789"
                value={formData.ga4PropertyId}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Industry
              </span>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
                onChange={(event) => updateField("industry", event.target.value)}
                placeholder="Performance Marketing"
                required
                value={formData.industry}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Status</span>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors focus:border-zinc-400"
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

          <div className="flex justify-end">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
