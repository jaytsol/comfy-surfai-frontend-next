// contexts/AuthContext.tsx (Next.js 프론트엔드)
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/apiClient'; // 위에서 만든 apiClient
import { LoginDTO } from '@/dto/login.dto';
import { CreateUserDTO } from '@/dto/create-user.dto';

export interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  avatar?: string;
  createdAt?: string | Date;
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated, which is fine
          setUser(null);
          return;
        }
        // For other errors, throw to be caught by the catch block
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 앱 시작 시 사용자 프로필 조회 시도 (세션 유효성 검사)
  useEffect(() => {
    // Always try to fetch user profile on initial load
    // The server will handle authentication via the connect.sid cookie
    fetchUserProfile();
  }, []);

  const login = async (credentials: LoginDTO) => {
    setIsLoading(true);
    try {
      const response = await apiClient<{ message: string; user: User }>('/auth/login', {
        method: 'POST',
        body: credentials,
      });
      setUser(response.user);
      // No need to store token in localStorage as we're using httpOnly cookies
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Let the component handle the error
    } finally {
      setIsLoading(false);
    }
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
    setIsLoading(true);
    try {
      await apiClient('/auth/logout', { method: 'POST' });
      setUser(null);
      // Force a full page reload to clear any client-side state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
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