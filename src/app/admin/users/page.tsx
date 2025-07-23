"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/apiClient";
import { User } from "@/interfaces/user.interface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // sonner 토스트 알림 라이브러리 사용 가정

export default function AdminUsersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coinAmount, setCoinAmount] = useState<Record<number, number>>({}); // userId: amount

  useEffect(() => {
    if (!isAuthLoading && user?.role !== "admin") {
      alert("관리자만 접근할 수 있는 페이지입니다.");
      router.replace("/");
    } else if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient<User[]>("/admin/users");
      setUsers(response);
    } catch (err: any) {
      setError(err.message || "사용자 목록을 불러오는 데 실패했습니다.");
      toast.error("사용자 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCoinAmountChange = (userId: number, amount: string) => {
    setCoinAmount((prev) => ({
      ...prev,
      [userId]: parseInt(amount, 10) || 0,
    }));
  };

  const handleAdjustCoin = async (userId: number, type: "add" | "deduct") => {
    const amount = coinAmount[userId];
    if (!amount || amount <= 0) {
      toast.error("유효한 코인 양을 입력해주세요.");
      return;
    }

    try {
      await apiClient(`/admin/users/${userId}/coin`, {
        method: "POST",
        body: { amount, type },
      });
      toast.success("코인 잔액이 성공적으로 조정되었습니다.");
      fetchUsers(); // 조정 후 사용자 목록 새로고침
    } catch (err: any) {
      toast.error(`코인 조정 실패: ${err.message || "알 수 없는 오류"}`);
    }
  };

  if (isAuthLoading || !user || user.role !== "admin") {
    return <p className="text-center py-10">권한을 확인 중입니다...</p>;
  }

  if (loading) {
    return <p className="text-center py-10">사용자 목록을 불러오는 중...</p>;
  }

  if (error) {
    return <p className="text-center py-10 text-red-500">오류: {error}</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        사용자 관리
      </h1>

      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>코인 잔액</TableHead>
              <TableHead className="text-right">코인 조정</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.coinBalance}</TableCell>
                <TableCell className="flex items-center justify-end space-x-2">
                  <Input
                    type="number"
                    value={coinAmount[u.id] || ""}
                    onChange={(e) =>
                      handleCoinAmountChange(u.id, e.target.value)
                    }
                    placeholder="양"n                    className="w-24"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdjustCoin(u.id, "add")}
                  >
                    추가
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdjustCoin(u.id, "deduct")}
                  >
                    차감
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
