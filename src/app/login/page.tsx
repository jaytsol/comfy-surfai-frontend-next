"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button'; // shadcn/ui의 Button 컴포넌트 사용 예시
import Link from 'next/link';

// Google 로고 SVG 컴포넌트 (선택 사항)
const GoogleIcon = () => (
  <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 55.4l-62.1 61.9C335.5 99.4 294.8 84 248 84c-84.3 0-152.3 68.1-152.3 152s68 152 152.3 152c99.9 0 130.1-81.5 133.7-118.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
  </svg>
);

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [agreed, setAgreed] = useState(false);

  // 이미 로그인된 사용자는 대시보드로 리디렉션합니다.
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  // Google 로그인 버튼 클릭 시 실행될 핸들러
  const handleGoogleLogin = () => {
    if (!agreed) {
      alert('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }
    // 백엔드의 Google 로그인 시작 API 엔드포인트로 페이지를 이동시킵니다.
    // NEXT_PUBLIC_API_URL은 .env.local 파일에 정의되어 있어야 합니다.
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    window.location.href = `${backendUrl}/auth/google`;
  };

  // 인증 정보를 로딩 중이거나 이미 로그인된 상태에서는 로딩 메시지만 표시
  if (isLoading || (!isLoading && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading or redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            SurfAI
          </h1>
          <p className="mt-6 text-sm text-gray-600">
            {/* 시작하려면 Google 계정으로 로그인하세요 */}
            Surfai는 현재 운영 중인 서비스가 아닙니다.
          </p>
        </div>
        {/* 개인정보 처리방침 동의 체크박스 */}
        <div className="flex items-center space-x-2 my-4">
          <input 
            type="checkbox" 
            id="agreement" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
            className="h-4 w-4"
          />
          <label htmlFor="agreement" className="text-sm text-gray-600">
            (필수) <Link href="/privacy-policy" className="underline">개인정보 처리방침</Link>에 동의합니다.
          </label>
        </div>
        {/* 아이디/비밀번호 폼 대신 Google 로그인 버튼 하나만 표시합니다. */}
        <div>
          <Button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center items-center px-4"
            variant="outline"
          >
            <GoogleIcon />
            Google 계정으로 로그인
          </Button>
        </div>
      </div>
    </div>
  );
}
