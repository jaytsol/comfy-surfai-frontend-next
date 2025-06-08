'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SidebarToggleButton } from './SidebarToggleButton';
import { SidebarMenuItem } from './SidebarMenuItem';
import { sidebarNavItems } from '@/constants/sidebarNavItems';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300 ease-in-out',
        isExpanded ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header with toggle button */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {isExpanded && (
            <h2 className="text-lg font-semibold">SurfAI</h2>
          )}
          <SidebarToggleButton
            isExpanded={isExpanded}
            onClick={onToggle}
            className="ml-auto"
          />
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2">
          <ul className="space-y-1">
            {sidebarNavItems.map((item) => (
              <SidebarMenuItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isExpanded={isExpanded}
                isActive={pathname === item.href}
              />
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
