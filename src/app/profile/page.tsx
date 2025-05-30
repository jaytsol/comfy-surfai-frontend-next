// app/profile/page.tsx
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login'); // 로그인 안됐으면 로그인 페이지로
    }
  }, [user, isLoading, router]);

  if (isLoading || (!isLoading && !user)) {
    return <p>Loading or redirecting...</p>; // 또는 null
  }
  
  // user가 확실히 있는 경우에만 아래 JSX 렌더링
  // (위의 조건문에서 user가 null이면 리턴하므로, 여기서는 user가 null이 아님을 타입스크립트가 알 수 있도록 ! 사용 가능)

  const handleLogout = async () => {
    await logout();
    // AuthContext의 user 상태가 null로 변경되면,
    // 이 페이지의 useEffect가 다시 실행되어 /login으로 리디렉션할 것입니다.
    // 또는 명시적으로 router.push('/login');
  };

  return (
    <div>
      <h1>프로필</h1>
      <p>사용자 이름: {user!.username}</p>
      <p>역할: {user!.role}</p>
      <p>ID: {user!.id}</p>
      <button onClick={handleLogout}>로그아웃</button>
    </div>
  );
}