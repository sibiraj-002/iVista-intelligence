import { DashboardPage } from "@/components/dashboard/dashboard-page";

const metrics = [
  {
    label: "Visibility index",
    value: "72.8",
    change: "7.9%",
    description: "Weighted organic visibility across strategic keyword clusters.",
  },
  {
    label: "Issues resolved",
    value: "428",
    change: "18.3%",
    description: "Technical SEO fixes closed across crawl, schema, and content.",
  },
  {
    label: "Top 3 rankings",
    value: "316",
    change: "10.4%",
    description: "Keywords currently ranking in the top three organic positions.",
  },
];

export default function SEO() {
  return (
    <DashboardPage
      description="Prioritize technical health, rankings, and search opportunities with clarity."
      eyebrow="SEO"
      metrics={metrics}
      title="SEO"
    />
  );
}
