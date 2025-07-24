"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import type { WorkflowTemplate } from '@/interfaces/workflow.interface';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination'; // usePagination 훅 임포트
import { Pagination } from '@/components/common/Pagination'; // Pagination 컴포넌트 임포트
import { PaginatedResponse } from '@/interfaces/pagination.interface'; // PaginatedResponse 임포트

export default function WorkflowAdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentPage, totalPages, goToPage, setTotalItems, itemsPerPage } = usePagination({
    totalItems: 0,
    itemsPerPage: 10
  });

  useEffect(() => {
    // 인증 로딩이 끝나고, 유저 정보가 있을 때만 데이터 요청
    if (!isAuthLoading && user) {
      // 관리자가 아닐 경우 접근 차단
      if (user.role !== 'admin') {
        alert('접근 권한이 없습니다.');
        router.replace('/');
        return;
      }

      const fetchTemplates = async (page: number) => {
        setIsLoadingData(true);
        try {
          // 관리자용 API 호출
          const response = await apiClient<PaginatedResponse<WorkflowTemplate>>(`/workflow-templates?page=${page}&limit=${itemsPerPage}`);
          setTemplates(response.data);
          setTotalItems(response.total);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: any) {
          setError('워크플로우 템플릿을 불러오는 데 실패했습니다.');
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchTemplates(currentPage);
    } else if (!isAuthLoading && !user) {
        router.replace('/login');
    }
  }, [user, isAuthLoading, router, currentPage]); // currentPage 의존성 추가

  const handleDelete = async (templateId: number) => {
    if (confirm(`ID: ${templateId} 워크플로우 템플릿을 정말로 삭제하시겠습니까?`)) {
      try {
        await apiClient(`/workflow-templates/${templateId}`, { method: 'DELETE' });
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        alert('삭제되었습니다.');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  if (isAuthLoading || isLoadingData) {
    return <p className="text-center py-10">관리자 데이터를 불러오는 중입니다...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-8 w-8" />
          워크플로우 관리
        </h1>
        <Link href="/admin/workflows/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>새 워크플로우</span>
          </Button>
        </Link>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      
      <div className="border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <tr key={template.id}>
                <td className="px-6 py-4 text-sm text-gray-500">{template.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{template.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-md">{template.description}</td>
                <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                  <Link href={`/admin/workflows/${template.id}/edit`} passHref>
                    <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
}
