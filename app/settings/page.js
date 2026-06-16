import { DashboardPage } from "@/components/dashboard/dashboard-page";

const metrics = [
  {
    label: "Team members",
    value: "18",
    change: "3.1%",
    description: "Users with access to workspaces, billing, and reporting tools.",
  },
  {
    label: "Integrations",
    value: "12",
    change: "9.8%",
    description: "Connected sources including Firebase, analytics, and SEO tools.",
  },
  {
    label: "Security score",
    value: "99%",
    change: "1.4%",
    description: "Workspace posture across access, authentication, and audit logs.",
  },
];

export default function Settings() {
  return (
    <DashboardPage
      description="Manage team access, integrations, billing, and workspace preferences."
      eyebrow="Settings"
      metrics={metrics}
      title="Settings"
    />
  );
}
