import { AiRecommendationsCard } from "@/components/dashboard/ai-recommendations-card";
import { DashboardAnalyticsKpis } from "@/components/dashboard/dashboard-analytics-kpis";
import { dashboardData } from "@/components/dashboard/dashboard-data";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { TopProjectsCard } from "@/components/dashboard/top-projects-card";
import { TrafficOverviewChart } from "@/components/dashboard/traffic-overview-chart";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export function DashboardOverview() {
  return (
    <DashboardLayout eyebrow="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Overview</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Track project health, traffic growth, keyword movement, leads, and
              AI recommendations from one responsive command center.
            </p>
          </div>
          <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm">
            Updated 3 minutes ago
          </div>
        </div>

        <DashboardAnalyticsKpis />

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                Traffic Overview Chart
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Monthly traffic trend from dummy project analytics data.
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
          <TopProjectsCard projects={dashboardData.topProjects} />
          <AiRecommendationsCard
            recommendations={dashboardData.recommendations}
          />
        </section>

        <RecentActivityCard activities={dashboardData.recentActivity} />
      </div>
    </DashboardLayout>
  );
}
