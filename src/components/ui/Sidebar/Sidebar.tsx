'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SidebarToggleButton } from './SidebarToggleButton';
import { SidebarMenuItem } from './SidebarMenuItem';
import { sidebarNavItems } from '@/constants/sidebarNavItems';
import { Separator } from '../Separator';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
      router.refresh(); // Ensure the page refreshes to reflect auth state changes
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show an error message to the user
    }
  };

  // Filter sidebar items based on authentication status
  const getFilteredSidebarItems = () => {
    if (isLoading) {
      return []; // Or return a loading state
    }

    // When user is logged out, show only Home and Documents
    if (!user) {
      return sidebarNavItems.filter(
        (item) => item.href === '/' || item.href === '/documents'
      );
    }

    // When user is logged in, show all items
    return sidebarNavItems.map(item => {
      if (item.isLogout) {
        return { ...item, onClick: handleLogout };
      }
      return item;
    });
  };

  const filteredSidebarItems = getFilteredSidebarItems();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out',
        isExpanded ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex flex-1 flex-col overflow-hidden">
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
        <nav className="flex flex-1 flex-col overflow-hidden">
          <ul className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2">
            {filteredSidebarItems.map((item, index: number) => {
              if (item.isDivider) {
                return (
                  <li key={`divider-${index}`} className="my-2">
                    <Separator className="bg-gray-200 dark:bg-gray-700" />
                  </li>
                );
              }
              
              return (
                <SidebarMenuItem
                  key={item.href || `item-${index}`}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isExpanded={isExpanded}
                  isActive={item.href ? pathname === item.href : false}
                  onClick={item.onClick}
                  isLogout={item.isLogout}
                />
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
