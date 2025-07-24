"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from '@/components/ui/separator';
import { User, Shield, Mail, Calendar, Coins } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
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
              <Coins className="h-5 w-5 text-muted-foreground mr-3" />
              <span className="text-sm font-medium">코인 잔액:</span>
              <span className="text-sm text-muted-foreground ml-auto">{user.coinBalance}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
              <span className="text-sm font-medium">가입일:</span>
              <span className="text-sm text-muted-foreground ml-auto">{new Date(user.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}
