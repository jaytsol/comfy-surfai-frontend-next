"use client";

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SidebarToggleButton } from './SidebarToggleButton';
import { SidebarMenuItem } from './SidebarMenuItem';
import { sidebarNavItems } from '@/components/ui/Sidebar/sidebarNavItems';
import { Separator } from '../separator';
import { useAuth } from '@/contexts/AuthContext';
import { Home } from 'lucide-react';

interface SidebarProps {
  isMounted: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Sidebar({ isMounted, isExpanded, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getFilteredSidebarItems = () => {
    if (isLoading) {
      return [];
    }

    return sidebarNavItems.filter(item => {
      if (!user) {
        return item.showWhenLoggedOut;
      }

      if (item.showWhenLoggedIn === false) {
        return false;
      }
      
      if (item.requiredRole) {
        return user.role === item.requiredRole;
      }

      return true;
    });
  };
  
  const processedSidebarItems = getFilteredSidebarItems().map(item => {
    if (item.isLogout) {
      return { ...item, onClick: handleLogout };
    }
    return item;
  });

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out',
        isExpanded ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md p-1 -ml-1"
          >
            {isExpanded ? (
              <h2 className="text-lg font-semibold hover:text-primary transition-colors">
                SurfAI
              </h2>
            ) : (
              <div className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent">
                <Home className="h-5 w-5" />
              </div>
            )}
          </button>
          <SidebarToggleButton
            isExpanded={isExpanded}
            onClick={onToggle}
            className="ml-auto"
          />
        </div>

        <nav className="flex flex-1 flex-col overflow-hidden">
          <ul className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2">
            {processedSidebarItems.map((item, index: number) => {
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
