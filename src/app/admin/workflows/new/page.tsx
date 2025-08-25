"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Loader2 } from 'lucide-react';
import { WorkflowTemplate } from '@/interfaces/workflow.interface';
import { CreateWorkflowTemplateDTO } from '@/dto/create-workflow-templates.dto';
import { WorkflowForm } from '@/components/admin/workflows/WorkflowForm';
import { ParameterMappingForm } from '@/components/admin/ParameterMappingForm';
import { ParameterMapEntry, ParameterMappingItem } from '@/interfaces/form-interfaces';

export default function NewWorkflowPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // 1단계 폼 상태
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [definition, setDefinition] = useState<object | string>('');
  const [isPublic, setIsPublic] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cost, setCost] = useState<number>(1); // cost 상태 추가
  const [requiredImageCount, setRequiredImageCount] = useState<number>(0);
  
  // 2단계 폼 상태
  const [parameterMap, setParameterMap] = useState<ParameterMapEntry[]>([]);

  // 전체 워크플로우 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'initial' | 'mapping'>('initial');
  const [createdTemplateId, setCreatedTemplateId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      apiClient<string[]>('/workflow-templates/categories').then(setCategories);
    } else if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [user, isAuthLoading, router]);
  
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      setError('워크플로우 카테고리를 선택해야 합니다.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    let parsedDefinition: object;
    try {
      parsedDefinition = typeof definition === 'string' ? JSON.parse(definition) : definition;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_jsonError) {
      setError('Definition의 JSON 형식이 올바르지 않습니다.');
      setIsSubmitting(false);
      return;
    }
    const payload: CreateWorkflowTemplateDTO = {
      name, description,
      category: selectedCategory,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      definition: parsedDefinition,
      isPublicTemplate: isPublic,
      cost,
      requiredImageCount,
    };
    try {
      const newTemplate = await apiClient<WorkflowTemplate>('/workflow-templates', {
        method: 'POST',
        body: payload,
      });
      setCreatedTemplateId(newTemplate.id);
      setDefinition(newTemplate.definition);
      setStep('mapping');
    } catch (err: any) {
      setError(err.message || '템플릿 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToStep1 = async () => {
    if (!createdTemplateId) return;
    if (confirm("1단계로 돌아가면 현재까지의 파라미터 매핑 정보가 사라지고, 생성된 템플릿도 삭제됩니다. 계속하시겠습니까?")) {
      try {
        await apiClient(`/workflow-templates/${createdTemplateId}`, { method: 'DELETE' });
        setCreatedTemplateId(null);
        setParameterMap([]);
        setStep('initial');
      } catch (err: any) {
        setError(err.message || '템플릿 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleParameterMapSave = async (mapToSave: Record<string, ParameterMappingItem>) => {
    if (!createdTemplateId) return;
    
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient(`/workflow-templates/${createdTemplateId}/parameter-map`, {
        method: 'PUT',
        body: mapToSave,
      });
      alert('워크플로우 템플릿이 성공적으로 생성되었습니다.');
      router.push('/admin/workflows');
    } catch (err: any) {
      setError(err.message || '파라미터 맵 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !user) {
    return <p className="text-center py-10">권한을 확인 중입니다...</p>;
  }

  if (step === 'mapping') {
    return (
      <div className="p-4 md:p-6">
        <ParameterMappingForm 
          definition={definition as object}
          category={selectedCategory}
          parameterMap={parameterMap}
          setParameterMap={setParameterMap}
          onSave={handleParameterMapSave}
          onBack={handleBackToStep1}
          isSubmitting={isSubmitting}
        />
        {error && <p className="mt-4 text-red-500 font-medium p-4 bg-red-50 rounded-md">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleInitialSubmit} className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">1. 새 워크플로우 템플릿 생성</h1>
          <p className="text-muted-foreground">새로운 ComfyUI 워크플로우 템플릿을 등록합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-2" /> 뒤로가기</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
            {isSubmitting ? '저장 중...' : '저장 후 파라미터 설정'}
          </Button>
        </div>
      </div>
      
      {error && <p className="text-red-500 font-medium p-4 bg-red-50 rounded-md">{error}</p>}

      <WorkflowForm 
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        tags={tags}
        setTags={setTags}
        cost={cost}
        setCost={setCost}
        isPublic={isPublic}
        setIsPublic={setIsPublic}
        definition={definition as string}
        setDefinition={setDefinition}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        requiredImageCount={requiredImageCount}
        setRequiredImageCount={setRequiredImageCount}
      />
    </form>
  );
}
