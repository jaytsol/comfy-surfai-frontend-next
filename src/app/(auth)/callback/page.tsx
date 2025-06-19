"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth(); // AuthContext에 새로 만들 함수

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token') ?? undefined;

    if (accessToken) {
      // AuthContext에 토큰을 전달하여 로그인 상태를 업데이트합니다.
      loginWithToken(accessToken, refreshToken);
      // 로그인 후 이동할 페이지 (예: 히스토리)
      router.replace('/history');
    } else {
      // 토큰이 없는 비정상적인 접근
      alert('인증에 실패했습니다.');
      router.replace('/login');
    }
  }, [searchParams, router, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>로그인 처리 중입니다...</p>
    </div>
  );
}
