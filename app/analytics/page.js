import { DashboardPage } from "@/components/dashboard/dashboard-page";

const metrics = [
  {
    label: "Events tracked",
    value: "1.8M",
    change: "14.1%",
    description: "Product, campaign, and ecommerce events captured this month.",
  },
  {
    label: "Revenue attribution",
    value: "$312K",
    change: "11.6%",
    description: "Modeled contribution from organic and assisted journeys.",
  },
  {
    label: "Data quality",
    value: "98.7%",
    change: "2.3%",
    description: "Validation coverage across tracking plans and destinations.",
  },
];

export default function Analytics() {
  return (
    <DashboardPage
      description="Understand conversion paths, channel efficiency, and ecommerce performance."
      eyebrow="Analytics"
      metrics={metrics}
      title="Analytics"
    />
  );
}
