'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/ui/Sidebar/Sidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
    
    // Check for saved preference in localStorage
    const savedPreference = localStorage.getItem('sidebar-expanded');
    if (savedPreference !== null) {
      setIsSidebarExpanded(JSON.parse(savedPreference));
    } else {
      // Default to expanded on larger screens
      const mediaQuery = window.matchMedia('(min-width: 1024px)');
      setIsSidebarExpanded(mediaQuery.matches);
    }
  }, []);

  // Save preference to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('sidebar-expanded', JSON.stringify(isSidebarExpanded));
    }
  }, [isSidebarExpanded, isMounted]);

  if (!isMounted) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="w-20 h-screen border-r bg-background" />
        <div className="flex-1 overflow-auto pl-20">
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isExpanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)} />
      <div 
        className="flex-1 overflow-auto transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isSidebarExpanded ? '16rem' : '5rem',
          width: isSidebarExpanded ? 'calc(100% - 16rem)' : 'calc(100% - 5rem)',
        }}
      >
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
