// app/generate/page.tsx
"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// 컴포넌트 및 훅, 타입 임포트 (경로는 실제 프로젝트 구조에 맞게 수정)
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import { useComfyWebSocket } from '@/hooks/useComfyWebSocket';
import SystemMonitor from '@/components/generate/SystemMonitor';
import TemplateForm from '@/components/template/TemplateForm';
import type { WorkflowTemplate } from '@/interfaces/workflow.interface';
import GenerationDisplay from '@/components/generate/GenerationDisplay';
import { GenerateImagePayload, ImageGenerationResponse } from '@/interfaces/api.interface';
import FinalResult from '@/components/generate/FinalResult';
import SessionGallery from '@/components/generate/SessionGallery';
import ImageLightbox from '@/components/common/ImageLightbox';

export default function GeneratePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // --- UI 및 폼 관련 상태 ---
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [viewingOutputId, setViewingOutputId] = useState<number | null>(null);

  // ✨ --- WebSocket 관련 상태는 모두 커스텀 훅에서 가져옵니다 --- ✨
  const {
    isWsConnected,
    executionStatus,
    progressValue,
    systemMonitorData,
    queueRemaining,
    activePromptId,
    sessionOutputs
  } = useComfyWebSocket(user, isAuthLoading);

  // 접근 제어 및 템플릿 목록 로드
  useEffect(() => {
    if (!isAuthLoading && user?.role === 'admin') {
      const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
          const fetchedTemplates = await apiClient<WorkflowTemplate[]>('/workflow-templates');
          setTemplates(fetchedTemplates || []);
        } catch (err: any) {
          setApiError('워크플로우 템플릿을 불러오는 데 실패했습니다: ' + err.message);
        } finally {
          setIsLoadingTemplates(false);
        }
      };
      fetchTemplates();
    }
  }, [user, isAuthLoading]);

  // 접근 제어 리디렉션
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) router.replace('/login');
      else if (user.role !== 'admin') {
        alert('관리자만 접근 가능합니다.');
        router.replace('/');
      }
    }
  }, [user, isAuthLoading, router]);

  // 선택된 템플릿 변경 시 파라미터 초기화
  useEffect(() => {
    if (selectedTemplateId) {
      const foundTemplate = templates.find(t => t.id === parseInt(selectedTemplateId, 10));
      setSelectedTemplate(foundTemplate || null);
      const initialParams: Record<string, any> = {};
      if (foundTemplate?.parameter_map) {
        for (const key in foundTemplate.parameter_map) {
          const mappingInfo = foundTemplate.parameter_map[key];
          try {
            const node = (foundTemplate.definition as any)[mappingInfo.node_id];
            initialParams[key] = node?.inputs?.[mappingInfo.input_name] ?? '';
          } catch {
            initialParams[key] = '';
          }
        }
      }
      setParameterValues(initialParams);
    } else {
      setSelectedTemplate(null);
      setParameterValues({});
    }
    setApiError(null); // 템플릿 변경 시 에러 초기화
  }, [selectedTemplateId, templates]);

  const handleImageClick = (outputId: number) => {
    setViewingOutputId(outputId);
  };

  const handleCloseLightbox = () => {
    setViewingOutputId(null);
  };

  const handleParameterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;
  
    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      // HTMLInputElement 타입 단언
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    
    setParameterValues((prev) => ({ ...prev, [name]: parsedValue }));
  };

  // 이미지 생성 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) {
      setApiError('먼저 워크플로우 템플릿을 선택해주세요.');
      return;
    }
    setApiError(null);
    setIsSubmitting(true);

    const payload: GenerateImagePayload = {
      templateId: parseInt(selectedTemplateId, 10),
      parameters: { ...parameterValues },
    };

    try {
      // API 호출만 하고, 결과 처리는 WebSocket 훅이 알아서 합니다.
      await apiClient<ImageGenerationResponse>('/api/generate', {
        method: 'POST',
        body: payload,
      });
      // 성공 응답 후, execution_start WebSocket 메시지가 오면 훅이 상태를 업데이트합니다.
    } catch (err: any) {
      setApiError(err.message || '이미지 생성 요청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 렌더링 차단
  if (isAuthLoading || !user) {
    return <p className="text-center py-10">권한 확인 중...</p>;
  }
  if (user.role !== 'admin') {
    return <p className="text-center py-10">접근 권한이 없습니다.</p>;
  }

  // isGenerating 상태는 isSubmitting(HTTP 요청 중) 또는 activePromptId(WS 처리 중)로 결정
  const isGenerating = isSubmitting || !!activePromptId;

  // --- UI 렌더링 ---
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">이미지 생성</h1>
          <p className="text-sm mt-2">WebSocket: 
            <span className={`font-semibold ${isWsConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isWsConnected ? '연결됨' : '연결 끊김'}
            </span>
          </p>
        </div>

        <SystemMonitor data={systemMonitorData} />
        
        <TemplateForm
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          onTemplateChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedTemplateId(e.target.value)}
          onParameterChange={handleParameterChange}
          onSubmit={handleSubmit}
          parameterValues={parameterValues}
          isSubmitting={isSubmitting}
          selectedTemplate={selectedTemplate}
          isLoadingTemplates={isLoadingTemplates}
        />
        
        <GenerationDisplay
          isSubmitting={isSubmitting}
          executionStatus={executionStatus}
          queueRemaining={queueRemaining}
          progressValue={progressValue}
          error={apiError}
          className="mt-6"
        />

        <SessionGallery outputs={sessionOutputs} onImageClick={handleImageClick} />
      </div>
      <ImageLightbox outputId={viewingOutputId} onClose={handleCloseLightbox} />
    </div>
  );
}
