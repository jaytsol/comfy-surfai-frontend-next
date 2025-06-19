// app/auth/callback/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { fetchUserProfile } = useAuth();

  useEffect(() => {
    // 로그인 후 프로필 정보를 다시 가져와서 로그인 상태를 업데이트합니다.
    fetchUserProfile().then(() => {
      router.replace('/history'); // 프로필 로딩 후 페이지 이동
    });
  }, [router, fetchUserProfile]);

  return <p>로그인 완료! 이동 중입니다...</p>;
}
