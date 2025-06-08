import { Home, LayoutDashboard, Settings, FileText, Users, User, Sparkles, LogOut } from "lucide-react";

export interface NavItem {
  icon: any; // Using any for LucideIcon type
  label: string;
  href?: string;
  onClick?: () => void;
  isLogout?: boolean;
  isDivider?: boolean;
}

export const sidebarNavItems: NavItem[] = [
  {
    icon: Home,
    label: "Home",
    href: "/",
  },
  {
    icon: Sparkles,
    label: "Generate",
    href: "/generate",
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
    icon: User,
    label: "Profile",
    href: "/profile",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
  },
  // Divider before logout button
  {
    icon: null,
    label: "divider",
    isDivider: true,
  },
  {
    icon: LogOut,
    label: "Logout",
    onClick: () => {
      // Handle logout logic here
      console.log('Logging out...');
      // Example: router.push('/login');
    },
    isLogout: true,
  },
];
