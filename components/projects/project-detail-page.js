"use client";

import { useState } from "react";
import {
  Activity,
  BarChart3,
  Globe2,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getScoreStyles } from "@/components/projects/score-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/cn";

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "seo", label: "SEO", icon: Search },
  { id: "ai-insights", label: "AI Insights", icon: Sparkles },
];

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

function ProgressRow({ label, value }) {
  const scoreStyles = getScoreStyles(value);

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className={cn("font-semibold", scoreStyles.text)}>{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cn("h-full rounded-full", scoreStyles.bar)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function OverviewTab({ project }) {
  const healthStyles = getScoreStyles(project.healthScore);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{project.name}</CardTitle>
          <CardDescription>
            Core project details and health signals for {project.domain}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <MetricBlock
            helper="Primary project workspace name."
            icon={Target}
            label="Project Name"
            value={project.name}
          />
          <MetricBlock
            helper="Tracked website domain."
            icon={Globe2}
            label="Domain"
            value={project.domain}
          />
          <MetricBlock
            helper="Estimated monthly organic sessions."
            icon={TrendingUp}
            label="Traffic"
            value={project.traffic}
          />
          <MetricBlock
            helper="Tracked keywords across priority clusters."
            icon={Search}
            label="Keywords"
            value={project.keywords}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health Score</CardTitle>
          <CardDescription>
            Combined view of SEO quality, content coverage, and technical
            readiness.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn("rounded-2xl p-6 text-white", healthStyles.panel)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Overall health</p>
                <p className="mt-2 text-5xl font-semibold tracking-tight">
                  {project.healthScore}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-7 w-7" />
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-zinc-300">
              This project is currently marked as {project.status.toLowerCase()}.
            </p>
          </div>

          <div className="mt-5 space-y-5">
            <ProgressRow label="SEO Score" value={project.seoScore} />
            <ProgressRow label="Technical Health" value={project.healthScore} />
            <ProgressRow label="Content Coverage" value={86} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsTab({ project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          Dummy analytics snapshot for {project.name}.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <MetricBlock
          helper="Estimated monthly organic traffic."
          icon={TrendingUp}
          label="Traffic"
          value={project.traffic}
        />
        <MetricBlock
          helper="Projected leads from organic channels."
          icon={Target}
          label="Lead Estimate"
          value="1,284"
        />
        <MetricBlock
          helper="Month-over-month traffic movement."
          icon={BarChart3}
          label="Growth"
          value="+18.4%"
        />
      </CardContent>
    </Card>
  );
}

function SeoTab({ project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO</CardTitle>
        <CardDescription>
          Search performance and quality checks for {project.domain}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ProgressRow label="SEO Score" value={project.seoScore} />
        <ProgressRow label="Indexability" value={92} />
        <ProgressRow label="Schema Coverage" value={78} />
        <ProgressRow label="Internal Linking" value={84} />
      </CardContent>
    </Card>
  );
}

function AiInsightsTab({ project }) {
  const insights = [
    "Refresh comparison pages with declining impressions.",
    "Create new content for long-tail ecommerce discovery queries.",
    "Improve product schema coverage on priority templates.",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>
          Dummy AI recommendations generated for {project.name}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
            key={insight}
          >
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Sparkles className="h-4 w-4 text-zinc-950" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-950">
                  Recommended action
                </p>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {insight}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ProjectDetailPage({ project }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardLayout eyebrow="Project Detail">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Project</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              {project.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              A modern project workspace for analytics, SEO performance, and
              AI-led recommendations.
            </p>
          </div>
          <span className="w-fit rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm">
            {project.domain}
          </span>
        </div>

        <Card>
          <CardContent className="p-2">
            <div className="grid gap-1 sm:grid-cols-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                    )}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {activeTab === "overview" && <OverviewTab project={project} />}
        {activeTab === "analytics" && <AnalyticsTab project={project} />}
        {activeTab === "seo" && <SeoTab project={project} />}
        {activeTab === "ai-insights" && <AiInsightsTab project={project} />}
      </div>
    </DashboardLayout>
  );
}
