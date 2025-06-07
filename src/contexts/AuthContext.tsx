// contexts/AuthContext.tsx (Next.js 프론트엔드)
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/apiClient'; // 위에서 만든 apiClient
import { LoginDTO } from '../../common/dto/login.dto';
import { CreateUserDTO } from '../../common/dto/create-user.dto';

interface User {
  id: number;
  username: string;
  role: string;
  // 필요한 다른 사용자 정보 필드들
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginDTO) => Promise<void>; // 실제 파라미터는 Login DTO에 맞게
  register: (userData: CreateUserDTO) => Promise<void>; // 실제 파라미터는 CreateUserDTO에 맞게
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient<{ message: string; user: User }>('/auth/profile');
      setUser(response.user);
    } catch (error) {
      // console.error('Failed to fetch profile, user might not be logged in:', error);
      setUser(null); // 프로필 조회 실패 시 사용자 null 처리
    } finally {
      setIsLoading(false);
    }
  };

  // 앱 시작 시 사용자 프로필 조회 시도 (세션 유효성 검사)
  useEffect(() => {
    // Assuming token is stored in localStorage. Adjust key as necessary.
    const token = typeof window !== 'undefined' ? localStorage.getItem('AUTH_TOKEN') : null;
    if (token) {
      fetchUserProfile();
    } else {
      // No token found, so user is likely not logged in.
      // Set loading to false as we are not attempting to fetch user profile.
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginDTO) => {
    // apiClient를 사용하여 /auth/login 호출
    const response = await apiClient<{ message: string; user: User }>('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    setUser(response.user); // 로그인 성공 시 사용자 정보 설정
    // 또는 fetchUserProfile()을 다시 호출하여 최신 정보로 갱신
  };

  const register = async (userData: CreateUserDTO) => {
    // apiClient를 사용하여 /auth/register 호출
    await apiClient('/auth/register', {
      method: 'POST',
      body: userData,
    });
    // 회원가입 후 자동 로그인 시키거나, 로그인 페이지로 유도할 수 있음
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
      setUser(null); // 사용자 정보 null 처리
    } catch (error) {
      console.error('Logout failed:', error);
      // 필요한 경우 에러 처리
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, fetchUserProfile }}>
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