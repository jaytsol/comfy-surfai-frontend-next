"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Settings, Loader2 } from 'lucide-react';
import { WorkflowTemplate } from '@/interfaces/workflow.interface';
import { CreateWorkflowTemplateDTO } from '@/dto/create-workflow-templates.dto';
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">템플릿 이름</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">워크플로우 카테고리</Label>
          <select id="category" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full p-2 border rounded bg-white">
            <option value="">카테고리 선택...</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">소모 코인</Label>
          <Input id="cost" type="number" value={cost} onChange={(e) => setCost(parseInt(e.target.value, 10) || 0)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
        <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="portrait, realistic, ..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="definition">Definition (JSON)</Label>
        <Textarea id="definition" value={definition as string} onChange={(e) => setDefinition(e.target.value)} required rows={15} placeholder='ComfyUI에서 "Save (API Format)"한 JSON을 여기에 붙여넣으세요.' />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="isPublic" checked={isPublic} onCheckedChange={(checked) => setIsPublic(!!checked)} />
        <Label htmlFor="isPublic">모든 사용자에게 공개</Label>
      </div>
    </form>
  );
}
