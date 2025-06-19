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
  loginWithToken: (accessToken: string, refreshToken?: string) => Promise<void>; // ✨ 이름 및 기능 변경
  logout: () => void; // ✨ 로그아웃 로직 변경
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 앱 시작 시 인증 상태 확인 중

  // ✨ 프로필 조회 함수 (재사용을 위해 분리)
  const fetchUserProfile = useCallback(async () => {
    // LocalStorage에 토큰이 없으면 요청을 보내지 않음
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      // apiClient는 이제 자동으로 Authorization 헤더에 토큰을 포함하여 보냄
      const userData = await apiClient<User>('/auth/profile');
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch profile with token:', error);
      setUser(null);
      // 토큰이 유효하지 않거나 만료된 경우, 토큰 삭제
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트가 처음 마운트될 때, LocalStorage에 토큰이 있는지 확인하여 로그인 상태를 복원
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // ✨ Google 로그인 콜백 후 호출될 함수
  const loginWithToken = async (accessToken: string, refreshToken?: string) => {
    // 1. 받은 토큰들을 LocalStorage에 저장
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }
    
    // 2. 토큰을 사용하여 바로 사용자 프로필 정보를 가져와 상태를 업데이트
    await fetchUserProfile();
  };

  // ✨ 로그아웃 함수
  const logout = () => {
    // LocalStorage에서 토큰들을 제거
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    
    // user 상태를 null로 변경
    setUser(null);
    
    // TODO: 백엔드의 /auth/logout을 호출하여 DB에 저장된 Refresh Token을 무효화하는 로직 추가
    // apiClient('/auth/logout', { method: 'POST' });

    // 로그인 페이지로 이동
    window.location.href = '/login';
  };

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
