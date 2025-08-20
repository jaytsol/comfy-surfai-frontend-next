import { Role } from "@/interfaces/role.enum";
import { User } from "@/interfaces/user.interface";
import { User as UserIcon, Sparkles, LogOut, LogIn, History as HistoryIcon, ShieldCheck, Settings } from "lucide-react";

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
    label: "AI",
    href: "/surf",
    showWhenLoggedIn: true
  },
  {
    icon: HistoryIcon,
    label: "기록",
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
    label: "프로필",
    href: "/profile",
    showWhenLoggedIn: true
  },
  {
    icon: ShieldCheck,
    label: "관리자 메뉴",
    href: "/admin",
    showWhenLoggedIn: true,
    requiredRole: Role.Admin
    },
  {
    icon: Settings,
    label: "설정",
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
    label: "로그인",
    href: "/login",
    isLogin: true,
    showWhenLoggedIn: false,
    showWhenLoggedOut: true
  },
  {
    icon: LogOut,
    label: "로그아웃",
    href: "#",
    isLogout: true,
    showWhenLoggedIn: true
  },
];
