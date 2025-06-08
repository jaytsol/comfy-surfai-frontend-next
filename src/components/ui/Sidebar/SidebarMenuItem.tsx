import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarMenuItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isExpanded: boolean;
  isActive?: boolean;
}

export function SidebarMenuItem({
  icon: Icon,
  label,
  href,
  isExpanded,
  isActive = false,
}: SidebarMenuItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center rounded-lg p-3 text-sm font-medium transition-colors hover:bg-accent",
          isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        {isExpanded && <span className="ml-3">{label}</span>}
      </Link>
    </li>
  );
}
