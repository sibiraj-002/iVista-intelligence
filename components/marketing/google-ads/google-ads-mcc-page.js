"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Eye,
  MousePointerClick,
  ReceiptText,
  Target,
  TrendingUp,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MccTrendChart } from "@/components/marketing/google-ads/mcc-trend-chart";
import { ProjectWorkspaceControls } from "@/components/project-workspace/project-workspace-controls";
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
import { getProjects } from "@/services/projects";
import { cn } from "@/utils/cn";

const emptyDashboard = {
  overview: {
    totalSpend: 0,
    totalClicks: 0,
    totalImpressions: 0,
    totalConversions: 0,
    averageCtr: 0,
    averageCpc: 0,
  },
  accounts: [],
  campaigns: [],
  trend: [],
  failures: 0,
};

const kpiIcons = [
  ReceiptText,
  MousePointerClick,
  Eye,
  Target,
  BarChart3,
  TrendingUp,
];

const statusStyles = {
  ENABLED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  PAUSED: "bg-amber-50 text-amber-700 ring-amber-100",
  SUSPENDED: "bg-red-50 text-red-700 ring-red-100",
  UNKNOWN: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatPercent(value) {
  return `${(value || 0).toFixed(2)}%`;
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "UNKNOWN").toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        statusStyles[normalizedStatus] || statusStyles.UNKNOWN
      )}
    >
      {normalizedStatus}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, helper }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Live API
          </span>
        </div>
        <p className="mt-5 text-sm font-medium text-zinc-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          {value}
        </p>
        <div className="mt-2">
          <p className="text-sm text-zinc-500">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountsTable({ accounts }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts Table</CardTitle>
        <CardDescription>
          Aggregated customer account performance under the MCC.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
              <TableHead>Customer ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Spend</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Conversions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.customerId}>
                <TableCell className="font-semibold text-zinc-950">
                  {account.accountName}
                </TableCell>
                <TableCell>{account.customerId}</TableCell>
                <TableCell>
                  <StatusBadge status={account.status} />
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(account.spend)}
                </TableCell>
                <TableCell>{formatNumber(account.clicks)}</TableCell>
                <TableCell>{formatNumber(account.conversions)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CampaignTable({ campaigns }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Table</CardTitle>
        <CardDescription>
          Campaign performance aggregated from all accessible MCC child
          accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Spend</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>CTR</TableHead>
              <TableHead>Conversions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow
                key={`${campaign.customerId}-${campaign.campaignId}`}
              >
                <TableCell className="font-semibold text-zinc-950">
                  {campaign.campaignName}
                </TableCell>
                <TableCell>{campaign.accountName}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(campaign.spend)}
                </TableCell>
                <TableCell>{formatNumber(campaign.clicks)}</TableCell>
                <TableCell>{formatPercent(campaign.ctr)}</TableCell>
                <TableCell>{formatNumber(campaign.conversions)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function GoogleAdsMccPage() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("projectId");
  const range = searchParams.get("range") || "this_month";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );
  const selectedCustomerId = selectedProject?.googleAdsCustomerId || "";

  useEffect(() => {
    let isActive = true;

    getProjects()
      .then((data) => {
        if (!isActive) {
          return;
        }

        const selectedProject =
          data.find((project) => project.id === projectIdParam) ||
          data.find((project) => project.googleAdsCustomerId) ||
          data[0];

        setProjects(data);
        setSelectedProjectId(selectedProject?.id || "");
      })
      .catch((loadError) => {
        console.error("Google Ads projects load error:", loadError);

        if (isActive) {
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingProjects(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [projectIdParam]);

  useEffect(() => {
    let isActive = true;
    const params = new URLSearchParams();

    if (selectedCustomerId) {
      params.set("customerId", selectedCustomerId);
    }

    if (range) {
      params.set("range", range);
    }

    if (startDate) {
      params.set("startDate", startDate);
    }

    if (endDate) {
      params.set("endDate", endDate);
    }

    Promise.resolve()
      .then(() => {
        setIsLoading(true);

        return fetch(
          `/api/google-ads/mcc${params.toString() ? `?${params}` : ""}`,
          {
            cache: "no-store",
          }
        );
      })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load Google Ads MCC data.");
        }

        return data;
      })
      .then((data) => {
        if (isActive) {
          setDashboard(data);
          setError("");
        }
      })
      .catch((loadError) => {
        console.error("Google Ads MCC dashboard error:", loadError);

        if (isActive) {
          setDashboard(emptyDashboard);
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
  }, [endDate, range, selectedCustomerId, startDate]);

  function handleProjectChange(projectId) {
    setSelectedProjectId(projectId);
  }

  const overview = dashboard.overview;
  const kpis = [
    {
      label: "Total Spend",
      value: formatCurrency(overview.totalSpend),
      helper: "Across all child accounts",
    },
    {
      label: "Total Clicks",
      value: formatNumber(overview.totalClicks),
      helper: "Aggregated click volume",
    },
    {
      label: "Total Impressions",
      value: formatNumber(overview.totalImpressions),
      helper: "Aggregated reach",
    },
    {
      label: "Total Conversions",
      value: formatNumber(overview.totalConversions),
      helper: "All customer accounts",
    },
    {
      label: "Average CTR",
      value: formatPercent(overview.averageCtr),
      helper: "Clicks divided by impressions",
    },
    {
      label: "Average CPC",
      value: formatCurrency(overview.averageCpc),
      helper: "Spend divided by clicks",
    },
  ];

  return (
    <DashboardLayout eyebrow="Google Ads MCC">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              Google Ads MCC Dashboard
            </h1>
          </div>
        </div>

        <ProjectWorkspaceControls
          isLoadingProjects={isLoadingProjects}
          metaLabel={selectedCustomerId ? "Customer ID" : "Google Ads"}
          metaValue={selectedCustomerId || "MCC aggregate"}
          onProjectChange={handleProjectChange}
          projects={projects}
          selectedProjectId={selectedProjectId}
        />

        {error ? (
          <Card>
            <CardContent className="p-4 text-sm font-medium text-red-700">
              {error}
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi, index) => (
            <KpiCard
              helper={kpi.helper}
              icon={kpiIcons[index]}
              key={kpi.label}
              label={kpi.label}
              value={isLoading ? "Loading..." : kpi.value}
            />
          ))}
        </section>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>
                  Spend and conversions aggregated across all MCC accounts.
                </CardDescription>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                Google Ads API
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <MccTrendChart data={dashboard.trend} />
          </CardContent>
        </Card>

        <AccountsTable accounts={dashboard.accounts} />

        <CampaignTable campaigns={dashboard.campaigns} />

        {dashboard.failures > 0 ? (
          <Card>
            <CardContent className="p-4 text-sm text-amber-700">
              {dashboard.failures} account-level requests failed. Check account
              access, customer status, or Google Ads API permissions.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
