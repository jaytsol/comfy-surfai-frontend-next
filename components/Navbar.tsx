// 예시: components/Navbar.tsx
"use client";

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // 필요시 추가 리디렉션 로직
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl font-bold text-primary-color">SurfAI</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary-color px-3 py-2 rounded-md text-sm font-medium"
            >
              홈
            </Link>
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-primary-color px-3 py-2 rounded-md text-sm font-medium"
                >
                  프로필 ({user.username})
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/generate"
                    className="text-gray-600 hover:text-primary-color px-3 py-2 rounded-md text-sm font-medium"
                  >
                    이미지 생성
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-white text-gray-600 hover:text-primary-color px-3 py-2 rounded-md text-sm font-medium border border-transparent hover:border-gray-300 transition duration-150 ease-in-out"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-primary-color px-3 py-2 rounded-md text-sm font-medium"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-color text-gray-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary-color transition duration-150 ease-in-out"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
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