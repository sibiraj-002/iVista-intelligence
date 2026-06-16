import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";

export const sidebarNavigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "SEO",
    href: "/seo",
    icon: Search,
  },
  {
    title: "AI Insights",
    href: "/ai-insights",
    icon: Sparkles,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
