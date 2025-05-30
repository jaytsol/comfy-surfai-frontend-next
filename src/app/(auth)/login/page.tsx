// app/(auth)/login/page.tsx
"use client"; // 폼 처리, 상태 변경, 훅 사용 등을 위해 클라이언트 컴포넌트로 명시

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // next/navigation 사용!
import { useAuth } from '../../../../contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로딩이 끝났고 사용자가 이미 있다면 프로필 페이지로 이동
    if (!isLoading && user) {
      router.replace('/profile');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ username, password });
      // AuthContext의 useEffect에서 이미 로그인된 사용자를 감지하여 리디렉션 하거나,
      // 여기서 명시적으로 router.push('/profile'); 등을 할 수 있습니다.
      // login 함수 성공 후 user 상태가 업데이트되면 위의 useEffect가 리디렉션을 처리할 것입니다.
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다. 아이디 또는 비밀번호를 확인하세요.');
    }
  };

  if (isLoading || (!isLoading && user)) {
    // 로딩 중이거나 이미 로그인된 사용자는 로그인 폼을 보여줄 필요 없음
    return <p>Loading or redirecting...</p>;
  }

  return (
    <div>
      <h1>로그인</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">사용자 이름:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}