'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/ui/Sidebar/Sidebar';
import { useAuth } from '@/contexts/AuthContext'; // useAuth 임포트
import { usePathname } from 'next/navigation'; // usePathname 임포트

export default function ClientLayout({ 
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth(); // user와 isLoading 상태 가져오기
  const pathname = usePathname(); // 현재 경로 가져오기

  // 로그인 페이지인지 확인
  const isLoginPage = pathname === '/login' || pathname === '/register';

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
    marginLeft: isMounted && user && !isLoginPage ? (isSidebarExpanded ? '16rem' : '5rem') : '0', // 로그인 상태가 아니거나 로그인 페이지일 경우 0
    width: isMounted && user && !isLoginPage ? (isSidebarExpanded ? 'calc(100% - 16rem)' : 'calc(100% - 5rem)') : '100%', // 로그인 상태가 아니거나 로그인 페이지일 경우 100%
  };

  return (
    <div className="flex min-h-screen bg-background">
      {isMounted && user && !isLoginPage && (
        <Sidebar isMounted={isMounted} isExpanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)} />
      )}
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
