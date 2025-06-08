// 예시: components/Navbar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  HomeIcon,
  UserCircleIcon,
  PhotoIcon,
  ArrowRightStartOnRectangleIcon,
  UserPlusIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // 필요시 추가 리디렉션 로직
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-white to-gray-50 shadow-lg z-50 transform transition-all duration-300 ease-in-out hover:shadow-xl">
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <div className="py-4 px-2 border-b border-gray-100 mb-4">
          <Link 
            href="/" 
            className="flex items-center space-x-3 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center transform transition-transform duration-300 group-hover:rotate-12 shadow-md">
              <HomeIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
              SurfAI
            </span>
          </Link>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 flex flex-col space-y-1.5 py-2 overflow-y-auto custom-scrollbar">
          {user ? (
            <>
              <NavItem 
                href="/profile" 
                icon={<UserCircleIcon className="h-5 w-5" />}
                label={`프로필 (${user.username})`}
              />
              
              {user.role === "admin" && (
                <NavItem 
                  href="/generate" 
                  icon={<PhotoIcon className="h-5 w-5" />}
                  label="이미지 생성"
                />
              )}
              
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-600"
              >
                <span className="p-1.5 mr-3 rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors">
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                </span>
                <span>로그아웃</span>
                <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                  로그아웃
                </span>
              </button>
            </>
          ) : (
            <>
              <NavItem 
                href="/login" 
                icon={<ArrowLeftStartOnRectangleIcon className="h-5 w-5" />}
                label="로그인"
              />
              
              <Link
                href="/register"
                className="group relative mt-4 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 group-hover:w-full"></span>
                <UserPlusIcon className="h-5 w-5 mr-2" />
                <span className="relative">회원가입</span>
              </Link>
            </>
          )}
        </div>
        
        {/* Bottom section for additional items */}
        <div className="border-t border-gray-200 pt-4 mt-auto">
          <div className="text-center text-xs text-gray-400">
            <p>SurfAI v1.0.0</p>
            <p className="mt-1">© {new Date().getFullYear()} All rights reserved</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Reusable NavItem component
function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
    >
      <span className="p-1.5 mr-3 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
        {icon}
      </span>
      <span>{label}</span>
      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

// _app.tsx에 Navbar 추가
// import Navbar from '../components/Navbar';
// ...
// return (
//   <AuthProvider>
//     <Navbar />
//     <Component {...pageProps} />
//   </AuthProvider>
// );
