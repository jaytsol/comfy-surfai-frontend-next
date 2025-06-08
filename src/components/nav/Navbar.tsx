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
    <nav className="fixed left-0 top-0 h-full w-64 bg-white shadow-md z-50">
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <div className="py-4 px-2 border-b border-gray-100">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary-color rounded-md flex items-center justify-center">
              <HomeIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-color">
              SurfAI
            </span>
          </Link>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 flex flex-col space-y-2 py-4">
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-3"
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>프로필 ({user.username})</span>
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/generate"
                  className="text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-3"
                >
                  <PhotoIcon className="h-5 w-5" />
                  <span>이미지 생성</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-left text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 w-full flex items-center space-x-3"
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-3"
              >
                <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
                <span>로그인</span>
              </Link>
              <Link
                href="/register"
                className="bg-primary-color text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <UserPlusIcon className="h-5 w-5" />
                <span>회원가입</span>
              </Link>
            </>
          )}
        </div>
        
        {/* Bottom section for additional items */}
        <div className="border-t border-gray-100 pt-4 mt-auto">
          {/* Additional bottom-aligned items can be added here */}
        </div>
      </div>
    </nav>
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
