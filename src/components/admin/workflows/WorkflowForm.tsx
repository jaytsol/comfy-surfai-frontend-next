import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface WorkflowFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  tags: string;
  setTags: (tags: string) => void;
  cost: number;
  setCost: (cost: number) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
  definition: string;
  setDefinition: (definition: string) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export function WorkflowForm({ 
  name, setName, 
  description, setDescription, 
  tags, setTags, 
  cost, setCost, 
  isPublic, setIsPublic, 
  definition, setDefinition,
  categories,
  selectedCategory,
  setSelectedCategory
}: WorkflowFormProps) {
  return (
    <>
      <div className="p-4 border rounded-lg space-y-4 bg-slate-50">
        <h2 className="text-xl font-semibold">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">템플릿 이름</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
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
    </>
  );
}
