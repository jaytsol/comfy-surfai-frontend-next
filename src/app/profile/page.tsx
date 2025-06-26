"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from '@/components/ui/separator';
import { User, Shield, Mail, Calendar, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  // 인증 상태 확인 및 리디렉션
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>프로필 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 사용자의 이니셜을 계산 (대체 이미지용)
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
        {/* 프로필 아바타 */}
        <Avatar className="h-24 w-24 border-2 border-primary">
          <AvatarImage src={user.imageUrl} alt={user.displayName} />
          <AvatarFallback className="text-3xl">
            {getInitials(user.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">{user.displayName}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>
      
      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* 계정 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
            <CardDescription>기본적인 계정 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-muted-foreground mr-3" />
              <span className="text-sm font-medium">사용자 이름:</span>
              <span className="text-sm text-muted-foreground ml-auto">{user.displayName}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-muted-foreground mr-3" />
              <span className="text-sm font-medium">이메일:</span>
              <span className="text-sm text-muted-foreground ml-auto">{user.email}</span>
            </div>
             <div className="flex items-center">
              <Shield className="h-5 w-5 text-muted-foreground mr-3" />
              <span className="text-sm font-medium">역할:</span>
              <span className={`text-sm font-semibold ml-auto px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                {user.role}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
              <span className="text-sm font-medium">가입일:</span>
              <span className="text-sm text-muted-foreground ml-auto">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* 계정 관리 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>계정 관리</CardTitle>
            <CardDescription>계정 설정을 변경하거나 로그아웃합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user.googleId && (
              <Button variant="outline" className="w-full justify-start">비밀번호 변경</Button>
            )}
            <Button variant="outline" className="w-full justify-start" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4"/>
                로그아웃
            </Button>
            <Separator />
            <Button variant="destructive" className="w-full justify-start">
              계정 삭제
            </Button>
            <p className="text-xs text-muted-foreground">
              계정을 삭제하면 모든 데이터가 영구적으로 제거되며 복구할 수 없습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
