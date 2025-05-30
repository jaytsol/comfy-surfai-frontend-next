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
    <nav>
      <Link href="/">홈</Link> |{' '}
      {user ? (
        <>
          <Link href="/profile">프로필 ({user.username})</Link> |{' '}
          {user.role === 'admin' && <Link href="/generate">이미지 생성 (Admin)</Link>} |{' '}
          <button onClick={handleLogout}>로그아웃</button>
        </>
      ) : (
        <>
          <Link href="/login">로그인</Link> |{' '}
          <Link href="/register">회원가입</Link>
        </>
      )}
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