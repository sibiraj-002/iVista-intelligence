import { InsightPanel } from "@/components/dashboard/insight-panel";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeading } from "@/components/dashboard/page-heading";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

const defaultMetrics = [
  {
    label: "Organic traffic",
    value: "128.4K",
    change: "12.8%",
    description: "Sessions attributed to non-paid search across active projects.",
  },
  {
    label: "Tracked keywords",
    value: "8,492",
    change: "6.4%",
    description: "Keywords monitored across priority campaigns and markets.",
  },
  {
    label: "Conversion value",
    value: "$74.2K",
    change: "9.1%",
    description: "Estimated assisted value from SEO and intelligence workflows.",
  },
];

const defaultInsights = [
  {
    title: "Competitor velocity increased",
    description:
      "Three competitors gained share on high-intent comparison pages this week.",
    status: "Watch",
  },
  {
    title: "Technical health is stable",
    description:
      "Core Web Vitals and indexability checks remain within target thresholds.",
    status: "Good",
  },
  {
    title: "AI content briefs ready",
    description:
      "New briefs are prepared for product-led pages with ranking upside.",
    status: "Ready",
  },
];

export function DashboardPage({
  title,
  description,
  eyebrow,
  metrics = defaultMetrics,
  insights = defaultInsights,
}) {
  return (
    <DashboardLayout eyebrow={eyebrow}>
      <div className="space-y-6">
        <PageHeading description={description} title={title} />

        <section className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-950">
                  Performance trend
                </h2>
                <p className="text-sm text-zinc-500">
                  A clean operating view for traffic, visibility, and revenue.
                </p>
              </div>
              <span className="text-sm font-medium text-zinc-500">
                Last 30 days
              </span>
            </div>
            <div className="mt-6 flex h-72 items-end gap-2 rounded-xl bg-zinc-50 p-4">
              {[42, 58, 48, 64, 70, 62, 76, 84, 78, 92, 88, 96].map(
                (height, index) => (
                  <div
                    className="flex flex-1 items-end rounded-full bg-zinc-200"
                    key={`${height}-${index}`}
                  >
                    <div
                      className="w-full rounded-full bg-zinc-950"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                )
              )}
            </div>
          </div>

          <InsightPanel items={insights} title="Priority intelligence" />
        </section>
      </div>
    </DashboardLayout>
  );
}
