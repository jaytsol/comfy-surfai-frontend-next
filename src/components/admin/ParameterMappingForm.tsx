"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Info, ChevronDown, ArrowLeft, Save, Loader2, ArrowDown, ArrowUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import apiClient from '@/lib/apiClient';
import { ParameterMapEntry, ParameterPreset, NodeInfo, ParameterMappingItem } from '@/interfaces/form-interfaces';

// --- 재사용 가능한 파라미터 추가 버튼 ---
const AddParameterButton = ({ onAdd, presets, category, position, existingKeys }: {
  onAdd: (preset: ParameterPreset | undefined, position: 'top' | 'bottom') => void;
  presets: ParameterPreset[];
  category?: string;
  position: 'top' | 'bottom';
  existingKeys: string[];
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="secondary" disabled={!category}>
        <PlusCircle className="h-4 w-4 mr-2" />
        파라미터 추가
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {presets.map(preset => (
        <DropdownMenuItem 
          key={preset.key} 
          onClick={() => onAdd(preset, position)}
          disabled={existingKeys.includes(preset.key)}
        >
          {preset.label}
        </DropdownMenuItem>
      ))}
      <DropdownMenuItem onClick={() => onAdd(undefined, position)}>
        커스텀 파라미터 추가
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// --- 메인 컴포넌트 ---
export const ParameterMappingForm = ({
  definition,
  category,
  parameterMap,
  setParameterMap,
  onSave,
  onBack,
  isSubmitting,
}: {
  definition: object;
  category?: string;
  parameterMap: ParameterMapEntry[];
  setParameterMap: React.Dispatch<React.SetStateAction<ParameterMapEntry[]>>;
  onSave?: (map: Record<string, ParameterMappingItem>) => Promise<void>;
  onBack?: () => Promise<void> | void;
  isSubmitting?: boolean;
}) => {
  const [definitionObject, setDefinitionObject] = useState<any>(null);
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [presets, setPresets] = useState<ParameterPreset[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const parsedDefinition = typeof definition === 'string' ? JSON.parse(definition) : definition;
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

    if (category) {
      apiClient<ParameterPreset[]>(`/workflow-templates/parameter-presets?category=${category}`).then(allPresets => {
        setPresets(allPresets);
        if (parameterMap.length === 0 && onBack) {
          const essentialPresets = allPresets.filter(p => p.essentialForCategories?.includes(category));
          const newEntries = essentialPresets.map(preset => ({
            id: `preset-${preset.key}-${Math.random()}`,
            key: preset.key,
            isCustom: false,
            isEssential: true,
            value: {
              node_id: '', input_name: '',
              label: preset.label, description: preset.description || '',
              type: preset.type, options: preset.options || [],
              default_value: preset.default_value,
              validation: {
                required: false, min: preset.validation?.min,
                max: preset.validation?.max, step: preset.validation?.step,
              }
            },
            selectedNodeInfo: null,
          }));
          setParameterMap(newEntries);
        }
      });
    }
  }, [definition, category, setParameterMap, parameterMap.length, onBack]);

  const handleAddParam = (preset?: ParameterPreset, position: 'top' | 'bottom' = 'bottom') => {
    const newEntry: ParameterMapEntry = {
      id: `new-${Date.now()}`,
      key: preset?.key || `custom_param_${parameterMap.length}`,
      isCustom: !preset,
      isEssential: false,
      value: {
        node_id: '', input_name: '',
        label: preset?.label || '', description: preset?.description || '',
        type: preset?.type || 'text', options: preset?.options || [],
        default_value: preset?.default_value,
        validation: { 
          required: false, min: preset?.validation?.min,
          max: preset?.validation?.max, step: preset?.validation?.step,
        }
      },
      selectedNodeInfo: null,
    };
    if (position === 'top') {
      setParameterMap(prev => [newEntry, ...prev]);
    } else {
      setParameterMap(prev => [...prev, newEntry]);
    }
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
    if (!onSave) return;

    setFormError(null);

    const keys = parameterMap.map(p => p.key);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      setFormError('중복된 파라미터 키가 존재합니다. 키 값은 고유해야 합니다.');
      return;
    }

    for (const entry of parameterMap) {
      if (!entry.value.input_name || entry.value.input_name.trim() === '') {
        setFormError(`'${entry.key}' 파라미터의 'Input Name' 필드가 비어있습니다.`);
        return;
      }
    }
    
    const finalMap = parameterMap.reduce((acc, entry) => {
      if (entry.key) {
        acc[entry.key] = { ...entry.value };
      }
      return acc;
    }, {} as Record<string, ParameterMappingItem>);
    
    await onSave(finalMap);
  };

  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const existingKeys = parameterMap.map(p => p.key);

  const formContent = (
    <div className="space-y-6">
      {onSave && onBack && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">2. 파라미터 매핑 설정</h2>
            <p className="text-muted-foreground">&apos;{category}&apos; 워크플로우의 동적 파라미터를 설정합니다.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> 이전</Button>
            <Button type="button" variant="outline" size="icon" onClick={scrollToBottom} title="아래로 스크롤"><ArrowDown className="h-4 w-4" /></Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} 저장
            </Button>
          </div>
        </div>
      )}

      {formError && <p className="text-red-500 font-medium p-4 bg-red-50 rounded-md">{formError}</p>}

      {onBack && (
        <div className="space-y-1 p-4 bg-slate-100 rounded-lg">
          <Label>워크플로우 카테고리</Label>
          <Badge variant="outline" className="p-2 text-lg">{category}</Badge>
        </div>
      )}
      
      <div className="flex justify-start">
        <AddParameterButton onAdd={handleAddParam} presets={presets} category={category} position="top" existingKeys={existingKeys} />
      </div>

      <div className="space-y-4">
        {parameterMap.map((entry) => (
          <div key={entry.id} className="p-4 border rounded-lg space-y-4 bg-slate-50">
            <div className="flex justify-between items-center">
              <Input value={entry.key} onChange={(e) => handleKeyChange(entry.id, e.target.value)} className="font-mono font-bold text-lg w-1/3" disabled={!entry.isCustom} />
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleRemoveParam(entry.id)}
                disabled={entry.isEssential}
                title={entry.isEssential ? "필수 파라미터는 삭제할 수 없습니다." : "파라미터 삭제"}
              >
                <Trash2 className="h-4 w-4 mr-2" />삭제
              </Button>
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
              <Textarea value={entry.value.description || ''} onChange={(e) => handleValueChange(entry.id, 'description', e.target.value)} />
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

      <div className="flex justify-between mt-6">
        <AddParameterButton onAdd={handleAddParam} presets={presets} category={category} position="bottom" existingKeys={existingKeys} />
        {onSave && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="icon" onClick={scrollToTop} title="위로 스크롤"><ArrowUp className="h-4 w-4" /></Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} 저장
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return onSave ? <form onSubmit={handleSubmit}>{formContent}</form> : <div>{formContent}</div>;
};
