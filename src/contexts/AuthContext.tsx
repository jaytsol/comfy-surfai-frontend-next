"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { User } from '@/interfaces/user.interface';
import { LoginDTO } from '@/dto/login.dto';

// Context가 제공할 값들의 타입 정의
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginDTO) => Promise<void>; // 일반 로그인 함수
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 앱 시작 시 인증 상태 확인 중

  // 서버에 현재 로그인 상태(쿠키 유효성)를 물어보고, 사용자 정보를 가져오는 함수
  const fetchUserProfile = useCallback(async () => {
    // isLoading을 true로 설정하여, fetch 중임을 알립니다.
    setIsLoading(true);
    try {
      // apiClient는 자동으로 쿠키를 포함하여 요청을 보냅니다.
      const userData = await apiClient<User>('/auth/profile');
      setUser(userData);
    } catch (error) {
      // 401 Unauthorized 등의 에러 발생 시, 로그인되지 않은 상태로 처리합니다.
      console.error('Failed to fetch user profile (not logged in):', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트가 처음 마운트될 때, 쿠키를 기반으로 로그인 상태를 복원 시도
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // 이메일/비밀번호를 사용하는 일반 로그인 함수
  const login = async (credentials: LoginDTO) => {
    try {
      // 1. 백엔드에 로그인 요청을 보냅니다.
      await apiClient('/auth/login', {
        method: 'POST',
        body: credentials,
      });
      // 2. 로그인 API가 성공하면, 백엔드는 응답 헤더에 HttpOnly 쿠키를 설정해줍니다.
      // 3. 이제 fetchUserProfile을 호출하여 새로운 쿠키로 사용자 정보를 가져와 상태를 업데이트합니다.
      await fetchUserProfile();
    } catch (error) {
      console.error('Login failed:', error);
      // 에러를 다시 throw하여 로그인 페이지에서 에러 메시지를 표시할 수 있도록 합니다.
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      // 백엔드에 로그아웃 요청을 보내 DB의 Refresh Token을 무효화하고 쿠키를 삭제합니다.
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // 프론트엔드의 사용자 상태를 null로 만들고, 로그인 페이지로 이동합니다.
      setUser(null);
      window.location.href = '/login';
    }
  }, []);
  
  // loginWithToken 함수는 이제 HttpOnly 쿠키 방식에서는 필요 없습니다.

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, fetchUserProfile }}>
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
