import { Home, LayoutDashboard, Settings, FileText, Users } from "lucide-react";

export interface NavItem {
  icon: any; // Using any for LucideIcon type
  label: string;
  href: string;
}

export const sidebarNavItems: NavItem[] = [
  {
    icon: Home,
    label: "Home",
    href: "/",
  },
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: FileText,
    label: "Documents",
    href: "/documents",
  },
  {
    icon: Users,
    label: "Team",
    href: "/team",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
  },
];
