// app/(auth)/login/page.tsx
"use client"; // 폼 처리, 상태 변경, 훅 사용 등을 위해 클라이언트 컴포넌트로 명시

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // next/navigation 사용!
import { useAuth } from "../../../../contexts/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  console.log("isLoading", isLoading);

  useEffect(() => {
    // 로딩이 끝났고 사용자가 이미 있다면 프로필 페이지로 이동
    if (!isLoading && user) {
      router.replace("/profile");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ username, password });
      // AuthContext의 useEffect에서 이미 로그인된 사용자를 감지하여 리디렉션 하거나,
      // 여기서 명시적으로 router.push('/profile'); 등을 할 수 있습니다.
      // login 함수 성공 후 user 상태가 업데이트되면 위의 useEffect가 리디렉션을 처리할 것입니다.
    } catch (err: any) {
      setError(
        err.message ||
          "로그인에 실패했습니다. 아이디 또는 비밀번호를 확인하세요."
      );
    }
  };

  if (isLoading || (!isLoading && user)) {
    // 로딩 중이거나 이미 로그인된 사용자는 로그인 폼을 보여줄 필요 없음
    return <p>Loading or redirecting...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-color">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-text-color">
            로그인
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            SurfAI에 오신 것을 환영합니다
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-text-color"
            >
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
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-color"
            >
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
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-color bg-primary-color hover:bg-secondary-color focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <Link
              href="/register"
              className="font-medium text-primary-color hover:text-secondary-color"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
