// app/(auth)/register/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register({ username, password });
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      router.push('/login'); // 로그인 페이지로 리디렉션
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-color">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-text-color">
            회원가입
          </h1>
          <p className="mt-2 text-sm text-text-color/80">
            SurfAI의 멤버가 되어 창의적인 경험을 시작하세요
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-color">
              사용자 이름
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-color focus:border-primary-color sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-color">
              비밀번호
            </label>
            <div className="mt-1">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-color focus:border-primary-color sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="error text-center text-sm text-error-color">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-text-color bg-primary-color hover:bg-secondary-color focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color transition duration-200"
            >
              가입하기
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-text-color/80">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="font-medium text-primary-color hover:text-secondary-color">
                로그인
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}