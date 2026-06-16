import {
  ArrowRight,
  BarChart3,
  Eye,
  MousePointerClick,
  ReceiptText,
  Repeat2,
  ShoppingCart,
  Sparkles,
  Target,
} from "lucide-react";

import { googleAdsData } from "@/components/google-ads/google-ads-data";
import { PerformanceTrendChart } from "@/components/google-ads/performance-trend-chart";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
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

const kpiIcons = [
  ReceiptText,
  MousePointerClick,
  Eye,
  BarChart3,
  ShoppingCart,
  Repeat2,
];

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Learning: "bg-blue-50 text-blue-700 ring-blue-100",
  Limited: "bg-amber-50 text-amber-700 ring-amber-100",
};

const priorityStyles = {
  High: "bg-red-50 text-red-700 ring-red-100",
  Medium: "bg-amber-50 text-amber-700 ring-amber-100",
};

function GoogleAdsKpiCard({ icon: Icon, item }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Live
          </span>
        </div>
        <p className="mt-5 text-sm font-medium text-zinc-500">{item.label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          {item.value}
        </p>
        <p className="mt-2 text-sm text-zinc-500">{item.change}</p>
      </CardContent>
    </Card>
  );
}

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

function CampaignPerformanceTable() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>
              Spend, clicks, CTR, and conversion performance by campaign.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            Export report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Spend</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>CTR</TableHead>
              <TableHead>Conversions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {googleAdsData.campaigns.map((campaign) => (
              <TableRow key={campaign.name}>
                <TableCell className="font-semibold text-zinc-950">
                  {campaign.name}
                </TableCell>
                <TableCell>
                  <StatusBadge status={campaign.status} />
                </TableCell>
                <TableCell className="font-medium">{campaign.spend}</TableCell>
                <TableCell>{campaign.clicks}</TableCell>
                <TableCell>{campaign.ctr}</TableCell>
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

function RecommendationsPanel() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Optimization opportunities based on mock campaign signals.
            </CardDescription>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {googleAdsData.recommendations.map((recommendation) => (
          <div
            className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
            key={recommendation.title}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-950">
                  {recommendation.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {recommendation.description}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                  priorityStyles[recommendation.priority]
                )}
              >
                {recommendation.priority}
              </span>
            </div>
            <Button className="mt-4" size="sm" variant="outline">
              Apply recommendation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function GoogleAdsPage() {
  return (
    <DashboardLayout eyebrow="Google Ads">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Paid Search</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              Google Ads
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Monitor media spend, campaign efficiency, and conversion
              performance with a clean Google Ads Manager style dashboard.
            </p>
          </div>
          <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm">
            Last 7 days
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {googleAdsData.kpis.map((item, index) => (
            <GoogleAdsKpiCard
              icon={kpiIcons[index]}
              item={item}
              key={item.label}
            />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Spend Trend</CardTitle>
                  <CardDescription>
                    Daily media spend over the last seven days.
                  </CardDescription>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                  Budget pacing
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <PerformanceTrendChart data={googleAdsData.trend} metric="spend" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Conversion Trend</CardTitle>
                  <CardDescription>
                    Daily conversion volume over the last seven days.
                  </CardDescription>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  Conversion growth
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <PerformanceTrendChart
                data={googleAdsData.trend}
                metric="conversions"
              />
            </CardContent>
          </Card>
        </section>

        <CampaignPerformanceTable />

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="bg-zinc-950 text-white">
            <CardHeader>
              <CardTitle>Account Health</CardTitle>
              <CardDescription className="text-zinc-400">
                High-level paid media operating summary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Optimization Score</p>
                  <p className="mt-2 text-5xl font-semibold tracking-tight">
                    87
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <Target className="h-7 w-7" />
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-zinc-300">
                Budget pacing is healthy, but competitor search and awareness
                campaigns need efficiency improvements.
              </p>
            </CardContent>
          </Card>

          <RecommendationsPanel />
        </section>
      </div>
    </DashboardLayout>
  );
}
