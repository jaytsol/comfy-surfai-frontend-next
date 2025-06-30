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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Settings, Loader2, PlusCircle, Trash2, Info, ChevronDown } from 'lucide-react';
import { WorkflowTemplate } from '@/interfaces/workflow.interface';
import { CreateWorkflowTemplateDTO } from '@/dto/create-workflow-templates.dto';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- 인터페이스 정의 ---
interface ParameterPreset {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'boolean';
  description: string;
  options?: string[];
  default_value?: any;
  validation?: {
    min?: number;
    max?: number;
    step?: number;
  }
}

interface ParameterMappingItem {
  node_id: string;
  input_name: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'boolean';
  default_value?: any;
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
  };
}

interface ParameterMapEntry {
  id: string;
  key: string;
  value: ParameterMappingItem;
  isCustom: boolean;
  selectedNodeInfo?: any;
}

interface NodeInfo {
  id: string;
  title: string;
}

// --- 2단계: 파라미터 매핑 컴포넌트 ---
const ParameterMappingForm = ({
  template,
  onSave,
  onBack,
}: {
  template: WorkflowTemplate;
  onSave: (updatedMap: Record<string, ParameterMappingItem>) => Promise<void>;
  onBack: () => void;
}) => {
  const [parameterMap, setParameterMap] = useState<ParameterMapEntry[]>(() => {
    const initialMap = (template.parameter_map as Record<string, ParameterMappingItem>) || {};
    return Object.entries(initialMap).map(([key, value]) => ({
      id: `initial-${key}-${Math.random()}`,
      key,
      value,
      isCustom: true,
      selectedNodeInfo: null,
    }));
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [definitionObject, setDefinitionObject] = useState<any>(null);
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [presets, setPresets] = useState<ParameterPreset[]>([]);

  useEffect(() => {
    apiClient<string[]>('/workflow-templates/categories').then(setCategories);
    
    try {
      const parsedDefinition = typeof template.definition === 'string' 
        ? JSON.parse(template.definition) 
        : template.definition;
      if (parsedDefinition && typeof parsedDefinition === 'object') {
        setDefinitionObject(parsedDefinition);
        const nodeInfoList: NodeInfo[] = Object.entries(parsedDefinition).map(([id, nodeData]: [string, any]) => ({
          id,
          title: nodeData._meta?.title ? `${nodeData._meta.title} (ID: ${id})` : `Node ID: ${id}`,
        }));
        setNodes(nodeInfoList);
      }
    } catch (e) {
      console.error("Failed to parse definition JSON", e);
    }
  }, [template.definition]);

  useEffect(() => {
    if (selectedCategory) {
      apiClient<ParameterPreset[]>(`/workflow-templates/parameter-presets?category=${selectedCategory}`).then(setPresets);
    } else {
      setPresets([]);
    }
  }, [selectedCategory]);

  const handleAddParam = (preset?: ParameterPreset) => {
    const newEntry: ParameterMapEntry = {
      id: `new-${Date.now()}`,
      key: preset?.key || `custom_param_${parameterMap.length}`,
      isCustom: !preset,
      value: {
        node_id: '',
        input_name: '',
        label: preset?.label || '',
        description: preset?.description || '',
        type: preset?.type || 'text',
        options: preset?.options || [],
        default_value: preset?.default_value,
        validation: { 
          required: false,
          min: preset?.validation?.min,
          max: preset?.validation?.max,
          step: preset?.validation?.step,
        }
      },
      selectedNodeInfo: null,
    };
    setParameterMap([...parameterMap, newEntry]);
  };

  const handleNodeIdChange = (id: string, selectedNodeId: string) => {
    const nodeInfo = definitionObject?.[selectedNodeId] || null;
    setParameterMap(prevMap => prevMap.map(entry => 
      entry.id === id 
        ? { ...entry, value: { ...entry.value, node_id: selectedNodeId, input_name: '' }, selectedNodeInfo: nodeInfo } 
        : entry
    ));
  };

  const handleKeyChange = (id: string, newKey: string) => {
    setParameterMap(prevMap => prevMap.map(entry => entry.id === id ? { ...entry, key: newKey } : entry));
  };

  const handleValueChange = (id: string, field: keyof ParameterMappingItem, value: any) => {
    setParameterMap(prevMap => prevMap.map(entry => entry.id === id ? { ...entry, value: { ...entry.value, [field]: value } } : entry));
  };

  const handleValidationChange = (id: string, field: keyof NonNullable<ParameterMappingItem['validation']>, value: any) => {
    setParameterMap(prevMap => prevMap.map(entry => {
      if (entry.id === id) {
        const newValidation = { ...(entry.value.validation || {}), [field]: value };
        return { ...entry, value: { ...entry.value, validation: newValidation } };
      }
      return entry;
    }));
  }

  const handleRemoveParam = (id: string) => {
    setParameterMap(prevMap => prevMap.filter(entry => entry.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalMap = parameterMap.reduce((acc, entry) => {
      if (entry.key) {
        acc[entry.key] = {
          ...entry.value,
          options: typeof entry.value.options === 'string' 
            ? (entry.value.options as string).split(',').map(s => s.trim()) 
            : entry.value.options,
        };
      }
      return acc;
    }, {} as Record<string, ParameterMappingItem>);
    await onSave(finalMap);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">2. 파라미터 매핑 설정</h2>
          <p className="text-muted-foreground">워크플로우 '{template.name}'의 동적 파라미터를 설정합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> 이전</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} 저장
          </Button>
        </div>
      </div>

      <div className="space-y-1 p-4 bg-slate-100 rounded-lg">
        <Label htmlFor="category">워크플로우 카테고리</Label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border rounded bg-white disabled:bg-gray-200 disabled:cursor-not-allowed"
          disabled={parameterMap.length > 0}
        >
          <option value="">카테고리 선택...</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        {parameterMap.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">카테고리는 첫 파라미터 추가 후 변경할 수 없습니다.</p>
        )}
      </div>

      <div className="space-y-4">
        {parameterMap.map((entry) => (
          <div key={entry.id} className="p-4 border rounded-lg space-y-4 bg-slate-50">
            <div className="flex justify-between items-center">
              <Input value={entry.key} onChange={(e) => handleKeyChange(entry.id, e.target.value)} className="font-mono font-bold text-lg w-1/3" disabled={!entry.isCustom} />
              <Button variant="destructive" size="sm" onClick={() => handleRemoveParam(entry.id)}><Trash2 className="h-4 w-4 mr-2" />삭제</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Node</Label>
                <select value={entry.value.node_id} onChange={(e) => handleNodeIdChange(entry.id, e.target.value)} className="w-full p-2 border rounded bg-white">
                  <option value="">노드 선택...</option>
                  {nodes.map(node => <option key={node.id} value={node.id}>{node.title}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Input Name</Label>
                <Input value={entry.value.input_name} onChange={(e) => handleValueChange(entry.id, 'input_name', e.target.value)} />
              </div>
            </div>
            {entry.selectedNodeInfo && (
              <div className="mt-2 p-3 border rounded-md bg-gray-100 text-xs">
                <p className="font-bold flex items-center gap-2"><Info size={14} /> Node Info: <span className="font-mono bg-gray-200 px-1 rounded">{entry.selectedNodeInfo.class_type}</span></p>
                <p className="mt-2 font-semibold">Available Inputs (click to use):</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.keys(entry.selectedNodeInfo.inputs).map(inputName => (
                    <button type="button" key={inputName} onClick={() => handleValueChange(entry.id, 'input_name', inputName)} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 font-mono text-xs">
                      {inputName}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-1">
              <Label>Label</Label>
              <Input value={entry.value.label} onChange={(e) => handleValueChange(entry.id, 'label', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={entry.value.description} onChange={(e) => handleValueChange(entry.id, 'description', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Type</Label>
                {entry.isCustom ? (
                  <select value={entry.value.type} onChange={(e) => handleValueChange(entry.id, 'type', e.target.value as any)} className="w-full p-2 border rounded bg-white">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                    <option value="boolean">Boolean</option>
                  </select>
                ) : (
                  <Badge variant="secondary" className="p-2 text-base">{entry.value.type}</Badge>
                )}
              </div>
              <div className="space-y-1">
                <Label>Default Value</Label>
                <Input 
                  value={entry.value.default_value ?? ''} 
                  onChange={(e) => handleValueChange(entry.id, 'default_value', e.target.value)}
                  placeholder={
                    (entry.value.validation?.min !== undefined && entry.value.validation?.max !== undefined)
                    ? `Range: ${entry.value.validation.min} ~ ${entry.value.validation.max}`
                    : '기본값 (선택 사항)'
                  }
                />
              </div>
            </div>
            {entry.value.type === 'select' && (
              <div className="space-y-1">
                <Label>Options (쉼표로 구분)</Label>
                <Input value={Array.isArray(entry.value.options) ? entry.value.options.join(', ') : ''} onChange={(e) => handleValueChange(entry.id, 'options', e.target.value)} />
              </div>
            )}
            <div className="p-3 border rounded-md bg-slate-100">
              <h4 className="font-medium mb-2">Validation Rules</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox id={`required-${entry.id}`} checked={entry.value.validation?.required} onCheckedChange={(checked) => handleValidationChange(entry.id, 'required', !!checked)} />
                  <Label htmlFor={`required-${entry.id}`}>Required</Label>
                </div>
                {entry.value.type === 'number' && (
                  <>
                    <div className="space-y-1"><Label>Min</Label><Input type="number" placeholder="e.g., 1" value={entry.value.validation?.min ?? ''} onChange={(e) => handleValidationChange(entry.id, 'min', e.target.valueAsNumber)} /></div>
                    <div className="space-y-1"><Label>Max</Label><Input type="number" placeholder="e.g., 100" value={entry.value.validation?.max ?? ''} onChange={(e) => handleValidationChange(entry.id, 'max', e.target.valueAsNumber)} /></div>
                    <div className="space-y-1"><Label>Step</Label><Input type="number" placeholder="e.g., 1" value={entry.value.validation?.step ?? ''} onChange={(e) => handleValidationChange(entry.id, 'step', e.target.valueAsNumber)} /></div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" disabled={!selectedCategory}>
              <PlusCircle className="h-4 w-4 mr-2" />
              파라미터 추가
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {presets.map(preset => (
              <DropdownMenuItem key={preset.key} onClick={() => handleAddParam(preset)}>
                {preset.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => handleAddParam()}>
              커스텀 파라미터 추가
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </form>
  );
};

// --- 1단계: 기본 정보 입력을 위한 메인 컴포넌트 ---
export default function NewWorkflowPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [definition, setDefinition] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'initial' | 'mapping'>('initial');
  const [createdTemplate, setCreatedTemplate] = useState<WorkflowTemplate | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || user.role !== 'admin') {
        alert('관리자만 접근할 수 있는 페이지입니다.');
        router.replace('/');
      }
    }
  }, [user, isAuthLoading, router]);
  
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    let parsedDefinition: object;
    try {
      parsedDefinition = JSON.parse(definition);
    } catch (jsonError) {
      setError('Definition의 JSON 형식이 올바르지 않습니다.');
      setIsSubmitting(false);
      return;
    }
    const payload: CreateWorkflowTemplateDTO = {
      name, description,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      definition: parsedDefinition,
      isPublicTemplate: isPublic,
    };
    try {
      const newTemplate = await apiClient<WorkflowTemplate>('/workflow-templates', {
        method: 'POST',
        body: payload,
      });
      setCreatedTemplate(newTemplate);
      setStep('mapping');
      alert('기본 정보가 저장되었습니다. 이제 파라미터 매핑을 설정해주세요.');
    } catch (err: any) {
      setError(err.message || '템플릿 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParameterMapSave = async (updatedMap: Record<string, ParameterMappingItem>) => {
    if (!createdTemplate) return;
    setError(null);
    try {
      await apiClient(`/workflow-templates/${createdTemplate.id}`, {
        method: 'PATCH',
        body: { parameter_map: updatedMap },
      });
      alert('파라미터 맵이 성공적으로 저장되었습니다. 전체 워크플로우 생성이 완료되었습니다.');
      router.push('/admin/workflows');
    } catch (err: any) {
      setError(err.message || '파라미터 맵 저장에 실패했습니다.');
    }
  };

  if (isAuthLoading || !user) {
    return <p className="text-center py-10">권한을 확인 중입니다...</p>;
  }

  if (step === 'mapping' && createdTemplate) {
    return (
      <div className="p-4 md:p-6">
        <ParameterMappingForm 
          template={createdTemplate}
          onSave={handleParameterMapSave}
          onBack={() => setStep('initial')}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2"><Label htmlFor="name">템플릿 이름</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="tags">태그 (쉼표로 구분)</Label><Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="portrait, realistic, ..." /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="description">설명</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="definition">Definition (JSON)</Label><Textarea id="definition" value={definition} onChange={(e) => setDefinition(e.target.value)} required rows={15} placeholder='ComfyUI에서 "Save (API Format)"한 JSON을 여기에 붙여넣으세요.' /></div>
      <div className="flex items-center space-x-2"><Checkbox id="isPublic" checked={isPublic} onCheckedChange={(checked) => setIsPublic(!!checked)} /><Label htmlFor="isPublic">모든 사용자에게 공개</Label></div>
      {error && <p className="text-red-500 font-medium p-4 bg-red-50 rounded-md">{error}</p>}
    </form>
  );
}