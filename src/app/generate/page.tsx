// app/generate/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../lib/apiClient';

export default function GeneratePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [workflowJson, setWorkflowJson] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login'); // 로그인 안됐으면 로그인 페이지로
      } else if (user.role !== 'admin') {
        alert('관리자만 접근 가능합니다.');
        router.replace('/'); // 관리자 아니면 홈으로
      }
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    // ... (이전 Pages Router 예시의 handleSubmit과 동일한 로직)
    e.preventDefault();
    setError('');
    setResult(null);
    setIsGenerating(true);
    try {
      let workflowData;
      try {
        workflowData = JSON.parse(workflowJson);
      } catch (jsonError) {
        throw new Error('유효하지 않은 JSON 형식의 워크플로우입니다.');
      }
      const response = await apiClient<any>('/api/generate', {
        method: 'POST',
        body: workflowData,
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.message || '이미지 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || (!isLoading && (!user || user.role !== 'admin'))) {
    return <p>권한 확인 중 또는 리디렉션 중...</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-text-color mb-6">
          이미지 생성
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="workflowJson" className="block text-sm font-medium text-text-color">
              워크플로우 JSON
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <textarea
                id="workflowJson"
                value={workflowJson}
                onChange={(e) => setWorkflowJson(e.target.value)}
                required
                rows={10}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-color focus:border-primary-color sm:text-sm"
                placeholder='{\n  \"prompt\": \"A beautiful sunset over mountains\",\n  \"style\": \"photorealistic\",\n  \"resolution\": \"1024x1024\"\n}'
              />
            </div>
          </div>

          {error && (
            <div className="error text-sm text-error-color">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-600 bg-primary-color hover:bg-secondary-color focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? '이미지 생성 중...' : '이미지 생성'}
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-text-color mb-4">
              생성된 이미지
            </h2>
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={result.imageUrl}
                alt="생성된 이미지"
                className="w-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-gray-600 p-4">
                <p className="text-sm">생성 시간: {new Date(result.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}