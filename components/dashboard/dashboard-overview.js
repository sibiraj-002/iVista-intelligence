"use client";

import { PageReveal } from "@/components/animations/page-reveal";

import { AiRecommendationsCard } from "@/components/dashboard/ai-recommendations-card";
import { DashboardAnalyticsKpis } from "@/components/dashboard/dashboard-analytics-kpis";
import { dashboardData } from "@/components/dashboard/dashboard-data";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { TrafficOverviewChart } from "@/components/dashboard/traffic-overview-chart";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils/cn";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Optimizing: "bg-amber-50 text-amber-700 ring-amber-100",
  Scaling: "bg-blue-50 text-blue-700 ring-blue-100",
};

function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}

function ProjectPerformanceTable() {
  return (
    <Card data-reveal>
      <CardHeader>
        <CardTitle>Top Performing Clients</CardTitle>
        <CardDescription>
          Priority client accounts ranked by growth, conversion volume, and
          return efficiency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Monthly Spend</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Conversions</TableHead>
              <TableHead>ROAS</TableHead>
              <TableHead>Growth %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboardData.projectPerformance.map((project) => (
              <TableRow key={project.name}>
                <TableCell className="font-semibold text-zinc-950">
                  <div>
                    <p>{project.name}</p>
                    <p className="mt-1 text-xs font-medium text-zinc-400">
                      {project.website}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={project.status} />
                </TableCell>
                <TableCell className="font-medium">
                  {project.monthlySpend}
                </TableCell>
                <TableCell>{project.clicks}</TableCell>
                <TableCell>{project.conversions}</TableCell>
                <TableCell className="font-semibold text-emerald-700">
                  {project.roas}
                </TableCell>
                <TableCell className="font-semibold text-emerald-700">
                  {project.growth}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CampaignPerformanceTable() {
  return (
    <Card data-reveal>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
        <CardDescription>
          Paid media performance across the portfolio’s core campaign types.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Spend</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Impressions</TableHead>
              <TableHead>CTR</TableHead>
              <TableHead>CPC</TableHead>
              <TableHead>Conversions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboardData.googleAdsCampaigns.map((campaign) => (
              <TableRow key={campaign.name}>
                <TableCell className="font-semibold text-zinc-950">
                  {campaign.name}
                </TableCell>
                <TableCell className="font-medium">{campaign.spend}</TableCell>
                <TableCell>{campaign.clicks}</TableCell>
                <TableCell>{campaign.impressions}</TableCell>
                <TableCell className="font-semibold text-zinc-950">
                  {campaign.ctr}
                </TableCell>
                <TableCell>{campaign.cpc}</TableCell>
                <TableCell className="font-medium">
                  {campaign.conversions}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview() {
  return (
    <DashboardLayout eyebrow="Dashboard">
      <PageReveal className="space-y-6" revealOptions={{ stagger: 0.08, y: 22 }}>
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          data-reveal
        >
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Executive Portfolio
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              iVistaz Intelligence
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Portfolio-level command center for 27 active client projects,
              combining paid media investment, conversion performance, growth
              trends, and executive recommendations.
            </p>
          </div>
          <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm">
            Updated 3 minutes ago
          </div>
        </div>

        <div data-reveal>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
            Portfolio Overview
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Consolidated performance across managed client programs.
          </p>
        </div>
        <DashboardAnalyticsKpis />

        <ProjectPerformanceTable />

        <CampaignPerformanceTable />

        <section
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          data-reveal
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                Growth Trends
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Twelve-month upward trend for portfolio clicks and conversions.
              </p>
            </div>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              Last 12 months
            </span>
          </div>
          <div className="mt-6">
            <TrafficOverviewChart data={dashboardData.trafficOverview} />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div data-reveal>
            <AiRecommendationsCard
              recommendations={dashboardData.recommendations}
            />
          </div>
          <div data-reveal>
            <RecentActivityCard
              activities={dashboardData.recentActivity}
              description="Executive signals that need attention in the current cycle."
              title="Recent Alerts"
            />
          </div>
        </section>
      </PageReveal>
    </DashboardLayout>
  );
}
