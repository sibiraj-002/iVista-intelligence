import {
  BarChart3,
  FileText,
  Gauge,
  LayoutDashboard,
  Megaphone,
  SearchCheck,
  Sparkles,
} from "lucide-react";

export const sidebarNavigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Reports",
    href: "/analytics",
    icon: FileText,
  },
];

export const projectToolNavigation = [
  {
    title: "GA4",
    href: "/seo",
    icon: BarChart3,
  },
  {
    title: "Search Console",
    href: "/search-console",
    icon: SearchCheck,
  },
  {
    title: "Google Ads",
    href: "/marketing/google-ads",
    icon: Megaphone,
  },
  {
    title: "PageSpeed Insights",
    href: "/page-speed-insights",
    icon: Gauge,
  },
  {
    title: "AI Analysis",
    href: "/ai-insights",
    icon: Sparkles,
  },
];
