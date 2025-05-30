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
    <div>
      <h1>이미지 생성 (Admin)</h1>
      <form onSubmit={handleSubmit}>
        {/* 폼 요소들은 이전 Pages Router 예시와 동일하게 구성 */}
        <div>
          <label htmlFor="workflowJson">워크플로우 JSON:</label>
          <textarea id="workflowJson" value={workflowJson} onChange={(e) => setWorkflowJson(e.target.value)} rows={10} style={{ width: '100%' }} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isGenerating}>
          {isGenerating ? '생성 중...' : '생성하기'}
        </button>
      </form>
      {result && (
        <div>
          <h2>생성 결과:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}