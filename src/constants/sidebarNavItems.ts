import { Home, LayoutDashboard, Settings, FileText, Users, User, Sparkles, LogOut, LogIn, History as HistoryIcon } from "lucide-react";

export interface NavItem {
  icon: any; // Using any for LucideIcon type
  label: string;
  href?: string;
  onClick?: () => void;
  isLogout?: boolean;
  isDivider?: boolean;
  isLogin?: boolean;
  showWhenLoggedIn?: boolean;
  showWhenLoggedOut?: boolean;
}

export const sidebarNavItems: NavItem[] = [
  {
    icon: Home,
    label: "Home",
    href: "/",
    showWhenLoggedIn: true,
    showWhenLoggedOut: true
  },
  {
    icon: User,
    label: "Profile",
    href: "/profile",
    showWhenLoggedIn: true
  },
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    showWhenLoggedIn: true
  },
  {
    icon: Sparkles,
    label: "Generate",
    href: "/generate",
    showWhenLoggedIn: true
  },
  {
    icon: HistoryIcon,
    label: "History",
    href: "/history",
    showWhenLoggedIn: true
  },
  {
    icon: Users,
    label: "Team",
    href: "/team",
    showWhenLoggedIn: true
  },
  {
    icon: FileText,
    label: "Documents",
    href: "/documents",
    showWhenLoggedIn: true,
    showWhenLoggedOut: true
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
    showWhenLoggedIn: true
  },
  {
    icon: null,
    label: "divider",
    isDivider: true,
    showWhenLoggedIn: true,
    showWhenLoggedOut: true,
  },
  {
    icon: LogIn,
    label: "Login",
    href: "/login",
    isLogin: true,
    showWhenLoggedIn: false,
    showWhenLoggedOut: true
  },
  {
    icon: LogOut,
    label: "Logout",
    href: "#",
    isLogout: true,
    showWhenLoggedIn: true
  },
];
