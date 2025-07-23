'use client';

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
  updateCoinBalance: (amount: number) => void; // 코인 잔액을 직접 업데이트하는 함수
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser: User | null;
}

export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(initialUser === null); // 초기 유저 정보가 없으면 로딩 상태

  // 서버에 현재 로그인 상태(쿠키 유효성)를 물어보고, 사용자 정보를 가져오는 함수
  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await apiClient<User>('/auth/profile');
      setUser(userData);
      console.log("User profile fetched:", userData);
    } catch (error) {
      console.error('Failed to fetch user profile (not logged in):', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트가 처음 마운트될 때, 서버에서 가져온 유저 정보가 없다면 클라이언트에서 다시 확인
  useEffect(() => {
    if (!initialUser) {
      fetchUserProfile();
    }
  }, [initialUser, fetchUserProfile]);

  // 이메일/비밀번호를 사용하는 일반 로그인 함수
  const login = async (credentials: LoginDTO) => {
    try {
      await apiClient('/auth/login', {
        method: 'POST',
        body: credentials,
      });
      await fetchUserProfile();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  }, []);
  
  const updateCoinBalance = useCallback((amount: number) => {
    setUser(prevUser => {
      if (prevUser) {
        return { ...prevUser, coinBalance: prevUser.coinBalance + amount };
      }
      return null;
    });
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, fetchUserProfile, updateCoinBalance }}>
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