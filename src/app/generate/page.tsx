// app/generate/page.tsx
"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext'; // 실제 AuthContext 경로로 수정해주세요.
import apiClient from '../../../lib/apiClient'; // 실제 apiClient 경로로 수정해주세요.

// --- 백엔드 DTO와 유사한 프론트엔드용 타입 정의 ---
// 실제로는 공유 DTO 파일을 만들거나, 정확한 타입을 import 하는 것이 좋습니다.
interface WorkflowParameterMappingItem {
  node_id: string;
  input_name: string;
  // value_type?: 'string' | 'number' | 'boolean'; // 향후 입력 타입 결정에 사용 가능
}

interface WorkflowTemplate { // WorkflowTemplateResponseDTO에 해당
  id: number;
  name: string;
  description?: string;
  definition: object; // ComfyUI 워크플로우 원본 JSON
  parameter_map?: Record<string, WorkflowParameterMappingItem>;
  previewImageUrl?: string;
  tags?: string[];
  // isPublicTemplate: boolean; // 필요시 사용
  // ownerUserId?: number;
  // createdAt: Date;
  // updatedAt: Date;
}

interface GenerateImagePayload { // GenerateImageDTO에 해당
  templateId: number;
  parameters?: Record<string, any>;
}

interface ImageGenerationData { // ComfyUIResult.data 에 해당
  image_urls?: string[]; // 여러 이미지 URL을 받을 수 있도록 배열로
  prompt_id?: string;
  // 기타 ComfyUI 결과 데이터
}

interface ImageGenerationResponse { // ComfyUIResult에 해당
  success: boolean;
  message: string;
  data?: ImageGenerationData;
}
// --- 타입 정의 끝 ---

export default function GeneratePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // --- 새로운 상태 변수들 ---
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<ImageGenerationData | null>(null);
  // --- 상태 변수 끝 ---

  // 접근 제어 및 초기 템플릿 목록 로드
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'admin') {
        alert('관리자만 접근 가능합니다.');
        router.replace('/');
      } else {
        // 관리자일 경우 템플릿 목록 로드
        const fetchTemplates = async () => {
          setIsLoadingTemplates(true);
          try {
            // 백엔드의 /workflow-templates 엔드포인트에서 템플릿 목록 가져오기
            const fetchedTemplates = await apiClient<WorkflowTemplate[]>('/workflow-templates');
            setTemplates(fetchedTemplates || []); // null일 경우 빈 배열
          } catch (err: any) {
            setError('워크플로우 템플릿을 불러오는 데 실패했습니다: ' + err.message);
            setTemplates([]); // 에러 시 빈 배열
          } finally {
            setIsLoadingTemplates(false);
          }
        };
        fetchTemplates();
      }
    }
  }, [user, isAuthLoading, router]);

  // 선택된 템플릿 ID가 변경될 때 실행
  useEffect(() => {
    if (selectedTemplateId) {
      const foundTemplate = templates.find(t => t.id === parseInt(selectedTemplateId, 10));
      setSelectedTemplate(foundTemplate || null);

      // 선택된 템플릿의 parameter_map을 기반으로 parameterValues 상태 초기화
      const initialParams: Record<string, any> = {};
      if (foundTemplate?.parameter_map) {
        for (const key in foundTemplate.parameter_map) {
          const mappingInfo = foundTemplate.parameter_map[key];
          try {
            // 템플릿 definition에서 기본값을 가져와서 초기값으로 설정 (존재하는 경우)
            // Node ID와 input name이 숫자로 시작하거나 특수문자를 포함할 수 있으므로 안전하게 접근
            const node = (foundTemplate.definition as any)[mappingInfo.node_id];
            const defaultValue = node?.inputs?.[mappingInfo.input_name];
            initialParams[key] = defaultValue !== undefined ? defaultValue : ''; // 기본값 없으면 빈 문자열
          } catch (e) {
            console.warn(`Error accessing default value for ${key}:`, e);
            initialParams[key] = ''; // 에러 발생 시 빈 문자열
          }
        }
      }
      setParameterValues(initialParams);
      setError(null); // 템플릿 변경 시 기존 에러 초기화
      setGenerationResult(null); // 템플릿 변경 시 기존 결과 초기화
    } else {
      setSelectedTemplate(null);
      setParameterValues({});
    }
  }, [selectedTemplateId, templates]);

  const handleParameterChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;

    // TODO: parameter_map의 value_type 등을 참고하여 더 정확한 타입 변환 필요
    if (type === 'number') {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0; // 숫자로 변환 실패 시 기본값
    } else if (type === 'checkbox') {
      // HTMLInputElement 타입 단언
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    // 현재는 문자열로만 처리. 필요시 value_type에 따라 숫자 등으로 변환.
    setParameterValues(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId || !selectedTemplate) {
      setError('먼저 워크플로우 템플릿을 선택해주세요.');
      return;
    }
    setError(null);
    setGenerationResult(null);
    setIsGenerating(true);

    const payload: GenerateImagePayload = {
      templateId: parseInt(selectedTemplateId, 10),
      parameters: { ...parameterValues }, // 현재 입력된 파라미터 값들
    };

    try {
      // 백엔드의 /api/generate 엔드포인트 호출
      const response = await apiClient<ImageGenerationResponse>('/api/generate', {
        method: 'POST',
        body: payload,
      });
      if (response.success && response.data) {
        setGenerationResult(response.data);
      } else {
        setError(response.message || '이미지 생성에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '이미지 생성 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 인증 로딩 중이거나 권한이 없는 경우 렌더링 차단
  if (isAuthLoading || (!isAuthLoading && (!user || user.role !== 'admin'))) {
    return <p className="text-center py-10">권한 확인 중 또는 리디렉션 중...</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">
          이미지 생성 (Admin)
        </h1>
        
        {isLoadingTemplates && <p className="text-gray-600">템플릿 목록을 불러오는 중입니다...</p>}
        
        {!isLoadingTemplates && templates.length === 0 && (
          <p className="text-orange-600">사용 가능한 워크플로우 템플릿이 없습니다. 먼저 템플릿을 생성해주세요.</p>
        )}

        {!isLoadingTemplates && templates.length > 0 && (
          <div className="mb-6">
            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-1">
              워크플로우 템플릿 선택:
            </label>
            <select 
              id="template-select" 
              value={selectedTemplateId} 
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="">-- 템플릿을 선택하세요 --</option>
              {templates.map(template => (
                <option key={template.id} value={template.id.toString()}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedTemplate && selectedTemplate.parameter_map && Object.keys(selectedTemplate.parameter_map).length > 0 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">{selectedTemplate.name} - 파라미터 수정</h2>
            {selectedTemplate.description && <p className="text-sm text-gray-600 mb-4">{selectedTemplate.description}</p>}
            
            {Object.entries(selectedTemplate.parameter_map).map(([paramKey, mappingInfo]) => {
              // TODO: mappingInfo.value_type 또는 definition의 실제 값 타입을 보고 적절한 input type 결정
              // (예: number, text, boolean(checkbox), select 등)
              // 여기서는 모든 파라미터를 text input으로 가정합니다.
              // 기본값 추출 시도 (정교한 로직 필요)
              let defaultValue = '';
              try {
                  const node = (selectedTemplate.definition as any)[mappingInfo.node_id];
                  if (node && node.inputs && mappingInfo.input_name in node.inputs) {
                      defaultValue = node.inputs[mappingInfo.input_name];
                  }
              } catch (e) { /* 기본값 추출 실패 시 무시 */ }

              return (
                <div key={paramKey}>
                  <label htmlFor={paramKey} className="block text-sm font-medium text-gray-700 capitalize">
                    {paramKey.replace(/_/g, ' ')} {/* "positive_prompt" -> "positive prompt" */}
                  </label>
                  <input
                    type="text" // <<-- TODO: 파라미터 타입에 맞게 변경 (예: number, checkbox)
                    id={paramKey}
                    name={paramKey}
                    value={parameterValues[paramKey] ?? defaultValue ?? ''} // parameterValues에 없으면 기본값, 그것도 없으면 빈 문자열
                    onChange={handleParameterChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              );
            })}
            <button
              type="submit"
              disabled={isGenerating || !selectedTemplateId}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (isGenerating || !selectedTemplateId) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? '이미지 생성 중...' : '이미지 생성'}
            </button>
          </form>
        )}

        {error && <p className="mt-4 text-sm text-red-600">오류: {error}</p>}

        {generationResult && generationResult.image_urls && generationResult.image_urls.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              생성된 이미지
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {generationResult.image_urls.map((url, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={url} // 실제 이미지 URL로 변경 필요 (만약 로컬 경로라면 public 폴더 또는 별도 서빙 설정)
                    alt={`생성된 이미지 ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
            {generationResult.prompt_id && <p className="mt-2 text-xs text-gray-500">Prompt ID: {generationResult.prompt_id}</p>}
          </div>
        )}
      </div>
    </div>
  );
}