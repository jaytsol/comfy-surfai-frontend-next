import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "../button";

interface SidebarMenuItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  isExpanded: boolean;
  isActive?: boolean;
  isLogout?: boolean;
  onClick?: () => void;
}

export function SidebarMenuItem({
  icon: Icon,
  label,
  href,
  isExpanded,
  isActive = false,
  isLogout = false,
  onClick,
}: SidebarMenuItemProps) {
  const itemClass = cn(
    "flex w-full items-center rounded-lg p-3 text-sm font-medium transition-colors",
    !isLogout && "hover:bg-accent",
    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
    isLogout && "mt-auto text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
  );

  if (isLogout) {
    return (
      <li className="mt-auto">
        <button onClick={onClick} className={itemClass}>
          <Icon className="h-5 w-5" />
          {isExpanded && <span className="ml-3">{label}</span>}
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link href={href || '#'} className={itemClass}>
        <Icon className="h-5 w-5" />
        {isExpanded && <span className="ml-3">{label}</span>}
      </Link>
    </li>
  );
}
