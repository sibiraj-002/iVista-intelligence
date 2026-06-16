import {
  ArrowRight,
  Gauge,
  MessageSquareText,
  SearchCheck,
  TrendingDown,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/cn";

const recommendations = [
  {
    title: "Website traffic dropped 15%",
    description:
      "Organic traffic declined across high-intent landing pages. Review recent content changes, campaign pauses, crawl errors, and competitor movement before the next reporting cycle.",
    priority: "High",
    action: "Diagnose traffic drop",
    icon: TrendingDown,
  },
  {
    title: "Keyword rankings improved",
    description:
      "Several tracked keywords moved into stronger positions. Double down on the winning clusters with internal links, refreshed snippets, and conversion-focused page updates.",
    priority: "Medium",
    action: "Review keyword gains",
    icon: SearchCheck,
  },
  {
    title: "Page speed decreased",
    description:
      "Core pages are loading slower than the previous benchmark. Audit image payloads, third-party scripts, and server response time to protect rankings and conversions.",
    priority: "High",
    action: "Audit page speed",
    icon: Gauge,
  },
];

const priorityStyles = {
  High: {
    badge: "bg-red-50 text-red-700 ring-red-100",
    icon: "bg-red-50 text-red-600",
    border: "border-l-red-500",
  },
  Medium: {
    badge: "bg-amber-50 text-amber-700 ring-amber-100",
    icon: "bg-amber-50 text-amber-600",
    border: "border-l-amber-500",
  },
  Low: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    icon: "bg-emerald-50 text-emerald-600",
    border: "border-l-emerald-500",
  },
};

function RecommendationCard({ recommendation }) {
  const styles = priorityStyles[recommendation.priority];
  const Icon = recommendation.icon;

  return (
    <Card
      className={cn(
        "border-l-4 transition-shadow hover:shadow-md",
        styles.border
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                styles.icon
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{recommendation.title}</CardTitle>
              <CardDescription>
                AI-generated recommendation from recent performance signals.
              </CardDescription>
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
              styles.badge
            )}
          >
            {recommendation.priority}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl bg-zinc-50 p-4">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-sm">
              <MessageSquareText className="h-4 w-4" />
            </div>
            <p className="text-sm leading-6 text-zinc-600">
              {recommendation.description}
            </p>
          </div>
        </div>
        <Button className="mt-5 w-full sm:w-auto">
          {recommendation.action}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function AIInsightsPage() {
  return (
    <DashboardLayout eyebrow="AI Insights">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Recommendations
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              AI Insights
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Prioritized recommendations for traffic, rankings, and technical
              performance, designed for fast decision-making.
            </p>
          </div>
          <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm">
            3 active recommendations
          </div>
        </div>

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="rounded-2xl bg-zinc-950 p-5 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">
                  AI summary
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Traffic needs attention, rankings show upside, speed is a
                  conversion risk.
                </h2>
              </div>
              <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-zinc-200">
                Updated just now
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.title}
              recommendation={recommendation}
            />
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}
