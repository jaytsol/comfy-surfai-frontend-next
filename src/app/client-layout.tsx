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
    
    const savedPreference = localStorage.getItem('sidebar-expanded');
    if (savedPreference !== null) {
      setIsSidebarExpanded(JSON.parse(savedPreference));
    } else {
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

  // Hydration-safe rendering
  const mainContentStyle = {
    marginLeft: isMounted ? (isSidebarExpanded ? '16rem' : '5rem') : '16rem', // 기본값을 확장된 사이드바 너비로
    width: isMounted ? (isSidebarExpanded ? 'calc(100% - 16rem)' : 'calc(100% - 5rem)') : 'calc(100% - 16rem)',
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isMounted={isMounted} isExpanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)} />
      <main 
        className="flex-1 transition-all duration-300 ease-in-out"
        style={mainContentStyle}
      >
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
