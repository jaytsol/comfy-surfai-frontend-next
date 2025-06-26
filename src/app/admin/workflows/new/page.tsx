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
import { ArrowLeft, Save } from 'lucide-react';
import { WorkflowParameterMappingItem } from '@/interfaces/workflow.interface';
import { CreateWorkflowTemplateDTO } from '@/dto/create-workflow-templates.dto';

export default function NewWorkflowPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // 폼 상태 관리
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [definition, setDefinition] = useState('');
  const [parameterMap, setParameterMap] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 접근 제어
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || user.role !== 'admin') {
        alert('관리자만 접근할 수 있는 페이지입니다.');
        router.replace('/');
      }
    }
  }, [user, isAuthLoading, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    let parsedDefinition: object;
    let parsedParameterMap: Record<string, WorkflowParameterMappingItem>;

    // JSON 텍스트 파싱 및 유효성 검사
    try {
      parsedDefinition = JSON.parse(definition);
      // parameterMap이 비어있지 않을 때만 파싱
      parsedParameterMap = parameterMap 
        ? JSON.parse(parameterMap) as Record<string, WorkflowParameterMappingItem> 
        : {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (jsonError) {
      setError('Definition 또는 Parameter Map의 JSON 형식이 올바르지 않습니다.');
      setIsSubmitting(false);
      return;
    }

    const payload: CreateWorkflowTemplateDTO = {
      name,
      description,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      definition: parsedDefinition,
      parameter_map: parsedParameterMap,
      isPublicTemplate: isPublic,
    };

    try {
      await apiClient('/workflow-templates', {
        method: 'POST',
        body: payload,
      });
      alert('새로운 워크플로우 템플릿이 성공적으로 생성되었습니다.');
      router.push('/admin/workflows');
    } catch (err: any) {
      setError(err.message || '템플릿 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !user) {
    return <p className="text-center py-10">권한을 확인 중입니다...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">새 워크플로우 템플릿</h1>
          <p className="text-muted-foreground">새로운 ComfyUI 워크플로우 템플릿을 등록합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? '저장 중...' : '템플릿 저장'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">템플릿 이름</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="portrait, realistic, ..." />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="definition">Definition (JSON)</Label>
        <Textarea id="definition" value={definition} onChange={(e) => setDefinition(e.target.value)} required rows={15} placeholder='ComfyUI에서 "Save (API Format)"한 JSON을 여기에 붙여넣으세요.' />
      </div>
       <div className="space-y-2">
        <Label htmlFor="parameterMap">Parameter Map (JSON)</Label>
        <Textarea id="parameterMap" value={parameterMap} onChange={(e) => setParameterMap(e.target.value)} rows={10} placeholder='동적으로 제어할 파라미터 매핑 정보를 JSON 형식으로 입력하세요.' />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="isPublic" checked={isPublic} onCheckedChange={(checked) => setIsPublic(!!checked)} />
        <Label htmlFor="isPublic">모든 사용자에게 공개</Label>
      </div>

      {error && <p className="text-red-500 font-medium p-4 bg-red-50 rounded-md">{error}</p>}
    </form>
  );
}
