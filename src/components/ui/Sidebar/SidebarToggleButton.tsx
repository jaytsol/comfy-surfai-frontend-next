import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "../button";

interface SidebarToggleButtonProps {
  isExpanded: boolean;
  onClick: () => void;
  className?: string;
}

export function SidebarToggleButton({
  isExpanded,
  onClick,
  className,
}: SidebarToggleButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn("h-8 w-8 p-0", className)}
      aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isExpanded ? (
        <PanelLeftClose className="h-5 w-5" />
      ) : (
        <PanelLeftOpen className="h-5 w-5" />
      )}
    </Button>
  );
}
