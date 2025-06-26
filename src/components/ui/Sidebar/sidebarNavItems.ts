import { Role } from "@/interfaces/role.enum";
import { User } from "@/interfaces/user.interface";
import { LayoutDashboard, Settings, FileText, Users, User as UserIcon, Sparkles, LogOut, LogIn, History as HistoryIcon, ShieldCheck } from "lucide-react";

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
  requiredRole?: User['role'];
}

export const sidebarNavItems: NavItem[] = [
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
  // {
  //   icon: LayoutDashboard,
  //   label: "Dashboard",
  //   href: "/dashboard",
  //   showWhenLoggedIn: true
  // },
  // {
  //   icon: FileText,
  //   label: "Documents",
  //   href: "/documents",
  //   showWhenLoggedIn: true,
  //   showWhenLoggedOut: true
  // },
  // {
  //   icon: Users,
  //   label: "Team",
  //   href: "/team",
  //   showWhenLoggedIn: true
  // },
  {
    icon: UserIcon,
    label: "Profile",
    href: "/profile",
    showWhenLoggedIn: true
  },
  {
    icon: ShieldCheck,
    label: "Admin",
    href: "/admin",
    showWhenLoggedIn: true,
    requiredRole: Role.Admin
    },
  // {
  //   icon: Settings,
  //   label: "Settings",
  //   href: "/settings",
  //   showWhenLoggedIn: true
  // },
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
