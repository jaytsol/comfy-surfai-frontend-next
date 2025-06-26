"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { ShieldCheck, Workflow, Users, BarChart3 } from "lucide-react";

interface AdminMenuItem {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const adminMenuItems: AdminMenuItem[] = [
  {
    href: "/admin/workflows",
    icon: Workflow,
    title: "워크플로우 관리",
    description:
      "새로운 워크플로우 템플릿을 생성하거나 기존 템플릿을 수정, 삭제합니다.",
  },
  {
    href: "/admin/users",
    icon: Users,
    title: "사용자 관리",
    description:
      "전체 사용자 목록을 조회하고 역할을 변경하거나 계정을 관리합니다.",
  },
  {
    href: "/admin/analytics",
    icon: BarChart3,
    title: "서비스 통계",
    description:
      "API 사용량, 인기 워크플로우 등 서비스 관련 통계를 확인합니다.",
  },
];

export default function AdminDashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role !== "admin") {
        alert("관리자만 접근할 수 있는 페이지입니다.");
        router.replace("/");
      }
    } else if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || !user || user.role !== "admin") {
    return <p className="text-center py-10">권한을 확인 중입니다...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-8 w-8" />
          관리자 대시보드
        </h1>
        <p className="text-muted-foreground">
          서비스의 주요 기능들을 관리하고 설정합니다.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {adminMenuItems.map((item) => (
          <Link href={item.href} key={item.title} className="block">
            <Card className="hover:border-primary hover:shadow-lg transition-all duration-200 h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <item.icon className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="mt-1">{item.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
