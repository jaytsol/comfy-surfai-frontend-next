"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Google 로고 SVG 컴포넌트
const GoogleIcon = () => (
  <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 55.4l-62.1 61.9C335.5 99.4 294.8 84 248 84c-84.3 0-152.3 68.1-152.3 152s68 152 152.3 152c99.9 0 130.1-81.5 133.7-118.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
  </svg>
);

export default function LoginPage() {
  const { user, isLoading, login } = useAuth(); // ✨ AuthContext에서 일반 로그인 함수 가져오기
  const router = useRouter();
  const searchParams = useSearchParams();

  // 일반 로그인 폼을 위한 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미 로그인된 사용자는 리디렉션
  useEffect(() => {
    if (!isLoading && user) {
      const redirectTo = searchParams.get('redirect_to') || '/dashboard';
      router.replace(redirectTo);
    }
  }, [user, isLoading, router, searchParams]);
  
  // 일반 로그인 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      // AuthContext의 login 함수 호출
      await login({ email, password });
      // 성공 시 위의 useEffect가 리디렉션을 처리
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google 로그인 버튼 클릭 핸들러
  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    window.location.href = `${backendUrl}/auth/google`;
  };

  if (isLoading || (!isLoading && user)) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading or redirecting...</p></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">로그인</h1>
          <p className="mt-2 text-sm text-gray-600">SurfAI에 오신 것을 환영합니다</p>
        </div>

        {/* --- 일반 로그인 폼 --- */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">이메일 주소</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '로그인 중...' : '로그인'}
            </Button>
          </div>
        </form>

        {/* --- 구분선 --- */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">OR CONTINUE WITH</span>
          </div>
        </div>

        {/* --- Google 로그인 버튼 --- */}
        <div>
          <Button onClick={handleGoogleLogin} className="w-full" variant="outline">
            <GoogleIcon />
            Google 계정으로 로그인
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
