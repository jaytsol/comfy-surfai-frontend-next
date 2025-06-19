"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { User } from '@/interfaces/user.interface';

// JWT 토큰을 저장할 때 사용할 키
const TOKEN_STORAGE_KEY = 'surfai_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'surfai_refresh_token';

// Context가 제공할 값들의 타입 정의
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithToken: (accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>; // ✨ 비동기 함수로 변경
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 프로필 조회 함수
  const fetchUserProfile = useCallback(async () => {
    // LocalStorage는 브라우저 환경에서만 접근 가능
    if (typeof window === 'undefined' || !localStorage.getItem(TOKEN_STORAGE_KEY)) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      const userData = await apiClient<User>('/auth/profile');
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch profile with token:', error);
      setUser(null);
      // 인증 실패 시 저장된 토큰 모두 삭제
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 앱/페이지가 처음 로드될 때 토큰 유효성을 검사하여 로그인 상태를 복원
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Google 로그인 콜백 후 호출될 함수
  const loginWithToken = useCallback(async (accessToken: string, refreshToken?: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }
    // 토큰 저장 후, 즉시 사용자 정보를 가져와 user 상태를 업데이트
    await fetchUserProfile();
  }, [fetchUserProfile]);

  // 로그아웃 함수
  const logout = useCallback(async () => {
    const userId = user?.id; // user 상태에서 ID를 가져옴
    
    // UI 상태를 먼저 업데이트
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    
    try {
      // 백엔드에 로그아웃 요청을 보내 DB의 Refresh Token을 무효화
      if (userId) {
        await apiClient('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('Failed to invalidate refresh token on server:', error);
    } finally {
      // 로그인 페이지로 이동
      window.location.href = '/login';
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
