"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import type { WorkflowTemplate } from '@/interfaces/workflow.interface';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

// ✨ 임시로, 워크플로우 목록을 표시할 테이블 컴포넌트
// 나중에 별도의 파일로 분리하는 것이 좋습니다.
const WorkflowTable = ({ templates }: { templates: WorkflowTemplate[] }) => {
  return (
    <div className="border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {templates.map((template) => (
            <tr key={template.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-sm">{template.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link href={`/admin/workflows/${template.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default function AdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 워크플로우 템플릿 목록을 가져옵니다.
  useEffect(() => {
    // 관리자만 이 페이지에 접근 가능
    if (!isAuthLoading && (!user || user.role !== 'admin')) {
      alert('접근 권한이 없습니다.');
      router.replace('/');
      return;
    }

    if (user) {
      const fetchTemplates = async () => {
        setIsLoadingData(true);
        try {
          const response = await apiClient<WorkflowTemplate[]>('/workflow-templates');
          setTemplates(response);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: any) {
          setError('워크플로우 템플릿을 불러오는 데 실패했습니다.');
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchTemplates();
    }
  }, [user, isAuthLoading, router]);


  if (isAuthLoading || isLoadingData) {
    return <p className="text-center py-10">데이터를 불러오는 중입니다...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">워크플로우 관리</h1>
          <p className="text-muted-foreground">새로운 워크플로우를 생성하거나 기존 워크플로우를 관리합니다.</p>
        </div>
        <Link href="/admin/workflows/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>새 워크플로우</span>
          </Button>
        </Link>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      
      <WorkflowTable templates={templates} />

    </div>
  );
}
