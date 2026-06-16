import {
  BarChart3,
  FolderKanban,
  IndianRupee,
  MousePointerClick,
  Repeat2,
  Target,
} from "lucide-react";

import { dashboardData } from "@/components/dashboard/dashboard-data";
import { KpiCard } from "@/components/dashboard/kpi-card";

const kpiIcons = [
  FolderKanban,
  IndianRupee,
  MousePointerClick,
  Target,
  BarChart3,
  Repeat2,
];

export function DashboardAnalyticsKpis() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {dashboardData.kpis.map((kpi, index) => (
        <KpiCard
          change={kpi.change}
          icon={kpiIcons[index]}
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
        />
      ))}
    </section>
  );
}
