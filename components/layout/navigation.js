import {
  BarChart3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Megaphone,
  Search,
  SearchCheck,
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
    title: "Google Ads",
    href: "/marketing/google-ads",
    icon: Megaphone,
  },
  {
    title: "Google Analytics",
    href: "/seo",
    icon: Search,
  },
  {
    title: "Search Console",
    href: "/search-console",
    icon: SearchCheck,
  },
  {
    title: "AI Insights",
    href: "/ai-insights",
    icon: Sparkles,
  },
  {
    title: "Reports",
    href: "/analytics",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
