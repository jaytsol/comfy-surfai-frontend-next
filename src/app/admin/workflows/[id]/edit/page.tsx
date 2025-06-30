"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { WorkflowTemplate } from '@/interfaces/workflow.interface';
import { ParameterMappingForm } from '@/components/admin/ParameterMappingForm';
import { ParameterMapEntry, ParameterMappingItem } from '@/interfaces/form-interfaces';

export default function EditWorkflowPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 상태
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [definition, setDefinition] = useState<string>('');
  const [isPublic, setIsPublic] = useState(false);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [parameterMap, setParameterMap] = useState<ParameterMapEntry[]>([]);

  const fetchTemplate = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await apiClient<WorkflowTemplate>(`/workflow-templates/${id}`);
      setName(data.name);
      setDescription(data.description || '');
      setTags(data.tags?.join(', ') || '');
      setDefinition(JSON.stringify(data.definition, null, 2));
      setIsPublic(data.isPublicTemplate);
      setCategory(data.category);
      
      const initialMap = data.parameter_map || {};
      const mapEntries = Object.entries(initialMap).map(([key, value]) => ({
        id: `initial-${key}-${Math.random()}`,
        key, value,
        isCustom: true,
        isEssential: false,
      }));
      setParameterMap(mapEntries as ParameterMapEntry[]);

    } catch (err: any) {
      setError(err.message || '템플릿 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchTemplate();
    } else if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [user, isAuthLoading, router, fetchTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    let parsedDefinition;
    try {
      parsedDefinition = JSON.parse(definition);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Definition의 JSON 형식이 올바르지 않습니다.');
      setIsSubmitting(false);
      return;
    }
    
    const finalParameterMap = parameterMap.reduce((acc, entry) => {
      if (entry.key) {
        // isCustom, isEssential 등 UI 전용 속성을 제외하고 순수 데이터만 추출
        acc[entry.key] = entry.value;
      }
      return acc;
    }, {} as Record<string, ParameterMappingItem>);

    const payload = {
      name, description, tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      definition: parsedDefinition, isPublicTemplate: isPublic,
      parameter_map: finalParameterMap,
      category,
    };

    try {
      await apiClient(`/workflow-templates/${id}`, {
        method: 'PATCH',
        body: payload,
      });
      alert('템���릿이 성공적으로 수정되었습니다.');
      router.push('/admin/workflows');
    } catch (err: any) {
      setError(err.message || '템플릿 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="text-center py-10">로딩 중...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">워크플로우 템플릿 수정</h1>
          <p className="text-muted-foreground">&apos;{name}&apos;의 내용을 수정합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/workflows')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            변경사항 저장
          </Button>
        </div>
      </div>

      <div className="p-4 border rounded-lg space-y-4 bg-slate-50">
        <h2 className="text-xl font-semibold">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">템플릿 이름</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Input id="category" value={category || ''} onChange={(e) => setCategory(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">설명</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="isPublic" checked={isPublic} onCheckedChange={(checked) => setIsPublic(!!checked)} />
          <Label htmlFor="isPublic">모든 사용자에게 공개</Label>
        </div>
      </div>

      <div className="p-4 border rounded-lg space-y-2 bg-slate-50">
        <h2 className="text-xl font-semibold">Definition (JSON)</h2>
        <Textarea value={definition} onChange={(e) => setDefinition(e.target.value)} required rows={20} />
      </div>

      <div className="p-4 border rounded-lg space-y-4 bg-slate-50">
        <h2 className="text-xl font-semibold">파라미터 매핑</h2>
        <ParameterMappingForm 
          definition={JSON.parse(definition || '{}')}
          category={category}
          parameterMap={parameterMap}
          setParameterMap={setParameterMap}
        />
      </div>
    </form>
  );
}