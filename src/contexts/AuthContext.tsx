"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { User } from '@/interfaces/user.interface';

// Context가 제공할 값들의 타입 정의
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  fetchUserProfile: () => Promise<void>;
  logout: () => Promise<void>; // ✨ 비동기 함수로 변경
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    // 이제 apiClient가 자동으로 쿠키를 보내므로, 바로 API를 호출합니다.
    setIsLoading(true);
    try {
      const userData = await apiClient<User>('/auth/profile');
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 앱/페이지가 처음 로드될 때 토큰 유효성을 검사하여 로그인 상태를 복원
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const logout = useCallback(async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      // 쿠키는 서버에서 지워주지만, 만약을 위해 클라이언트에서도 삭제 시도
      document.cookie = 'access_token=; path=/; max-age=0;';
      document.cookie = 'refresh_token=; path=/; max-age=0;';
      window.location.href = '/login';
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, fetchUserProfile, logout }}>
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
