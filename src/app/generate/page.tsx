// app/generate/page.tsx
"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react'; // useRef 추가
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../lib/apiClient';
import SystemMonitor from '@/components/system/SystemMonitor';
import type { CrystoolsMonitorData } from '@/components/system/SystemMonitor/types';

interface WorkflowParameterMappingItem {
  node_id: string;
  input_name: string;
}
interface WorkflowTemplate {
  id: number;
  name: string;
  description?: string;
  definition: object;
  parameter_map?: Record<string, WorkflowParameterMappingItem>;
  previewImageUrl?: string;
  tags?: string[];
}
interface GenerateImagePayload {
  templateId: number;
  parameters?: Record<string, any>;
}
interface ImageGenerationData {
  image_urls?: string[];
  prompt_id?: string;
}
interface ImageGenerationResponse {
  success: boolean;
  message: string;
  data?: ImageGenerationData;
}

// --- WebSocket 메시지 타입 (예시) ---
// 실제 ComfyUI 메시지 구조에 맞게 더 상세하게 정의하는 것이 좋습니다.
interface ComfyUIExecutionInfo {
  queue_remaining?: number;
}
interface ComfyUIStatusData {
  status?: { exec_info: ComfyUIExecutionInfo };
  sid?: string; // 세션 ID (필요시)
}
interface ComfyUIProgressData {
  value: number;
  max: number;
  prompt_id: string;
  node: string; // 현재 진행 중인 노드 ID
}
interface ComfyUIExecutingData {
  node: string | null; // null이면 해당 프롬프트의 노드 실행 완료 의미 가능성
  prompt_id: string;
}
interface ComfyUIImageOutput {
  filename: string;
  subfolder?: string;
  type: 'output' | 'temp' | 'input'; // ComfyUI의 이미지 타입
}
interface ComfyUIExecutedData {
  node: string;
  output: {
    images?: ComfyUIImageOutput[];
    // 다른 아웃풋 타입 (text 등)
  };
  prompt_id: string;
}
interface ComfyUIExecutionStartData {
  prompt_id: string;
}
interface ComfyUIExecutionCachedData {
  nodes: string[]; // 캐시된 노드 ID 목록
  prompt_id: string;
}

interface ComfyUIWebSocketEvent {
  type: string; // 'status', 'progress', 'executing', 'executed', 'execution_start', 'execution_cached', 'preview' 등
  data: any; // 실제 데이터는 type에 따라 다름 (위의 Data 인터페이스들 참고)
}

// Moved to @/components/system/SystemMonitor/types.ts
// --- 타입 정의 끝 ---


export default function GeneratePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const ws = useRef<WebSocket | null>(null); // WebSocket 인스턴스 ref

  // --- 기존 상태 변수들 ---
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<ImageGenerationData | null>(null);

  // --- WebSocket 및 진행 상태 관련 새 상태 변수들 ---
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null); // 전반적인 진행 텍스트
  const [progressValue, setProgressValue] = useState<{ value: number; max: number } | null>(null);
  const [livePreviews, setLivePreviews] = useState<string[]>([]); // 프리뷰 이미지 URL 목록
  const [systemMonitorData, setSystemMonitorData] = useState<CrystoolsMonitorData | null>(null);
  // --- 상태 변수 끝 ---

  // 접근 제어 및 초기 템플릿 목록 로드 (기존 로직 유지)
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'admin') {
        alert('관리자만 접근 가능합니다.');
        router.replace('/');
      } else {
        const fetchTemplates = async () => {
          setIsLoadingTemplates(true);
          try {
            const fetchedTemplates = await apiClient<WorkflowTemplate[]>('/workflow-templates');
            setTemplates(fetchedTemplates || []);
          } catch (err: any) {
            setError('워크플로우 템플릿을 불러오는 데 실패했습니다: ' + err.message);
            setTemplates([]);
          } finally {
            setIsLoadingTemplates(false);
          }
        };
        fetchTemplates();
      }
    }
  }, [user, isAuthLoading, router]);

  // 선택된 템플릿 ID 변경 시 (기존 로직 유지, 상태 초기화 추가)
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
            const defaultValue = node?.inputs?.[mappingInfo.input_name];
            initialParams[key] = defaultValue !== undefined ? defaultValue : '';
          } catch (e) {
            initialParams[key] = '';
          }
        }
      }
      setParameterValues(initialParams);
      setError(null);
      setGenerationResult(null);
      // 웹소켓 관련 상태도 초기화
      setCurrentPromptId(null);
      setExecutionStatus(null);
      setProgressValue(null);
      setLivePreviews([]);
    } else {
      setSelectedTemplate(null);
      setParameterValues({});
    }
  }, [selectedTemplateId, templates]);


  // --- WebSocket 연결 관리 useEffect ---
  useEffect(() => {
    if (isAuthLoading || !user || user.role !== 'admin') {
      if (ws.current) {
        console.log('WebSocket: Closing due to auth change or unmount.');
        ws.current.close();
        ws.current = null;
        setIsWsConnected(false);
      }
      return;
    }

    // 관리자일 경우 WebSocket 연결 설정
    const clientId = `admin-ui-${user.id}-${Math.random().toString(36).substring(2, 9)}`;
    const WEBSOCKET_SERVER_URL = 'wss://localhost:3000'; // NestJS WebSocket 서버 주소
    const WEBSOCKET_PATH = '/generate'; // EventsGateway에 설정한 path
    
    if (!ws.current) { // 중복 연결 방지
        const socket = new WebSocket(`${WEBSOCKET_SERVER_URL}${WEBSOCKET_PATH}?clientId=${clientId}`);
        ws.current = socket;

        socket.onopen = () => {
            console.log(`WebSocket: Connected to ${WEBSOCKET_PATH}`);
            setIsWsConnected(true);
            setExecutionStatus("WebSocket에 연결되었습니다.");
        };

        socket.onclose = (event) => {
            console.log(`WebSocket: Disconnected from ${WEBSOCKET_PATH}`, event.reason);
            setIsWsConnected(false);
            setExecutionStatus("WebSocket 연결이 끊어졌습니다.");
            ws.current = null; // 참조 정리
            // 필요시 재연결 로직 추가
        };

        socket.onerror = (error) => {
            console.error('WebSocket: Error:', error);
            setExecutionStatus("WebSocket 연결 오류 발생.");
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data as string) as ComfyUIWebSocketEvent;
                const msgData = message.data;

                // Handle crystools.monitor message
                if (message.type === 'crystools.monitor') {
                    const monitorData = msgData as CrystoolsMonitorData;
                    setSystemMonitorData(monitorData);
                    return; // Skip further processing for monitor messages
                }

                // 현재 작업 중인 prompt_id와 관련된 메시지만 주로 처리
                if (currentPromptId && msgData && msgData.prompt_id === currentPromptId) {
                    switch (message.type) {
                        case 'progress':
                            const progressData = msgData as ComfyUIProgressData;
                            setProgressValue({ value: progressData.value, max: progressData.max });
                            setExecutionStatus(`노드 ${progressData.node} 진행: ${progressData.value}/${progressData.max}`);
                            break;
                        case 'executing':
                            const executingData = msgData as ComfyUIExecutingData;
                            if (executingData.node === null) {
                                setExecutionStatus(`프롬프트 [${currentPromptId}]의 모든 노드 처리 완료.`);
                            } else {
                                setExecutionStatus(`노드 ${executingData.node} 실행 중...`);
                            }
                            break;
                        case 'executed':
                            const executedData = msgData as ComfyUIExecutedData;
                            setExecutionStatus(`노드 ${executedData.node} 실행 완료.`);
                            if (executedData.output?.images) {
                                const comfyUIBaseUrl = 'http://localhost:8188'; // <<--- 중요: 실제 ComfyUI 서버 주소로 변경!!
                                const previews = executedData.output.images
                                    .filter(img => img.type === 'temp') // 임시 이미지만 (preview 타입은 제외)
                                    .map(img => `${comfyUIBaseUrl}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder || '')}&type=${img.type}`);
                                setLivePreviews(prev => [...new Set([...prev, ...previews])]); // 중복 제거하며 추가

                                // 만약 최종 이미지가 'executed' 메시지를 통해 온다면 여기서 generationResult 업데이트 가능
                                // const finalImages = executedData.output.images
                                //    .filter(img => img.type === 'output') // 최종 결과물 타입
                                //    .map(img => `${comfyUIBaseUrl}/view?filename=${encodeURIComponent(img.filename)}...`);
                                // if (finalImages.length > 0) {
                                //    setGenerationResult(prev => ({
                                //        ...prev,
                                //        prompt_id: currentPromptId,
                                //        image_urls: [...(prev?.image_urls || []), ...finalImages]
                                //    }));
                                // }
                            }
                            break;
                        case 'execution_start':
                             setExecutionStatus(`프롬프트 [${(msgData as ComfyUIExecutionStartData).prompt_id}] 실행 시작됨.`);
                             break;
                        case 'execution_cached':
                             setExecutionStatus(`프롬프트 [${(msgData as ComfyUIExecutionCachedData).prompt_id}]의 노드 ${ (msgData as ComfyUIExecutionCachedData).nodes.join(',')} 결과가 캐시에서 로드됨.`);
                 }
                }
            } catch (e) {
                console.error('WebSocket: Failed to parse message or handle event:', e, 'Raw data:', event.data);
            }
        };
    }

    // 컴포넌트 언마운트 또는 의존성 변경 전 정리 함수
    return () => {
        if (ws.current) {
            console.log('WebSocket: Closing connection from useEffect cleanup.');
            ws.current.onclose = null; // 이미 닫히고 있을 때 onclose 핸들러가 다시 실행되지 않도록
            ws.current.close();
            ws.current = null;
        }
        setIsWsConnected(false);
    };
  }, [isAuthLoading, user]); // user나 isAuthLoading 변경 시 재실행 (연결 관리)
  // currentPromptId는 의존성 배열에서 제외 (onmessage 핸들러는 항상 최신 currentPromptId 참조)


  const handleParameterChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // (기존 로직 유지)
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;
    if (type === 'number') parsedValue = parseFloat(value) || 0;
    else if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;
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

    // 웹소켓 상태 초기화
    setCurrentPromptId(null);
    setExecutionStatus("이미지 생성 요청 중...");
    setProgressValue(null);
    setLivePreviews([]);

    const payload: GenerateImagePayload = {
      templateId: parseInt(selectedTemplateId, 10),
      parameters: { ...parameterValues },
    };

    try {
      const response = await apiClient<ImageGenerationResponse>('/api/generate', {
        method: 'POST',
        body: payload,
      });
      if (response.success && response.data) {
        setGenerationResult(response.data); // HTTP 응답으로 최종 결과 우선 설정
        if (response.data.prompt_id) {
          setCurrentPromptId(response.data.prompt_id); // WebSocket 메시지 필터링을 위해 prompt_id 저장
          setExecutionStatus(`생성 작업 시작됨 (ID: ${response.data.prompt_id}). WebSocket으로 진행 상태 업데이트됩니다.`);
        } else {
          setExecutionStatus("생성 작업은 시작되었으나 Prompt ID를 받지 못했습니다.");
        }
      } else {
        setError(response.message || '이미지 생성에 실패했습니다.');
        setExecutionStatus("이미지 생성 요청 실패.");
      }
    } catch (err: any) {
      setError(err.message || '이미지 생성 중 알 수 없는 오류가 발생했습니다.');
      setExecutionStatus("이미지 생성 요청 중 오류 발생.");
    } finally {
      setIsGenerating(false); // HTTP 요청 완료
    }
  };

  // 인증 로딩 중 렌더링 (기존 유지)
  if (isAuthLoading || (!isAuthLoading && (!user || user.role !== 'admin'))) {
    return <p className="text-center py-10">권한 확인 중 또는 리디렉션 중...</p>;
  }

  // --- UI 렌더링 ---
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">
          이미지 생성 (Admin)
        </h1>
        <p className="text-sm mb-4">WebSocket 연결 상태: <span className={isWsConnected ? "text-green-600" : "text-red-600"}>{isWsConnected ? '연결됨' : '연결 끊김'}</span></p>

        {/* --- 시스템 모니터링 컴포넌트 --- */}
        <SystemMonitor data={systemMonitorData} className="mb-6" />
        {/* --- 시스템 모니터링 컴포넌트 끝 --- */}
        
        {/* 템플릿 선택 및 파라미터 폼 (기존과 유사) ... */}
        {isLoadingTemplates && <p className="text-gray-600">템플릿 목록을 불러오는 중입니다...</p>}
        {!isLoadingTemplates && templates.length === 0 && (
          <p className="text-orange-600">사용 가능한 워크플로우 템플릿이 없습니다. 먼저 템플릿을 생성해주세요.</p>
        )}
        {!isLoadingTemplates && templates.length > 0 && (
          <div className="mb-6">
            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-1">워크플로우 템플릿 선택:</label>
            <select id="template-select" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm">
              <option value="">-- 템플릿을 선택하세요 --</option>
              {templates.map(template => (<option key={template.id} value={template.id.toString()}>{template.name}</option>))}
            </select>
          </div>
        )}
        {selectedTemplate && selectedTemplate.parameter_map && Object.keys(selectedTemplate.parameter_map).length > 0 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">{selectedTemplate.name} - 파라미터 수정</h2>
            {selectedTemplate.description && <p className="text-sm text-gray-600 mb-4">{selectedTemplate.description}</p>}
            {Object.entries(selectedTemplate.parameter_map).map(([paramKey, mappingInfo]) => (
              <div key={paramKey}>
                <label htmlFor={paramKey} className="block text-sm font-medium text-gray-700 capitalize">{paramKey.replace(/_/g, ' ')}</label>
                <input type="text" id={paramKey} name={paramKey}
                  value={parameterValues[paramKey] ?? ((selectedTemplate.definition as any)[mappingInfo.node_id]?.inputs?.[mappingInfo.input_name] ?? '')}
                  onChange={handleParameterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            ))}
            <button type="submit" disabled={isGenerating || !selectedTemplateId}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${ (isGenerating || !selectedTemplateId) ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isGenerating ? '이미지 생성 요청 중...' : '이미지 생성'}
            </button>
          </form>
        )}
        {/* ... 파라미터 폼 끝 ... */}


        {/* --- WebSocket 진행 상태 표시 --- */}
        {currentPromptId && ( // 프롬프트 ID가 있을 때만 (생성 시작 후) 표시
          <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">실시간 진행 상태 (ID: {currentPromptId})</h3>
            {executionStatus && <p className="text-sm text-gray-600 mb-2">상태: {executionStatus}</p>}
            {progressValue && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(progressValue.value / progressValue.max) * 100}%` }}>
                </div>
              </div>
            )}
            {livePreviews.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">실시간 프리뷰:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {livePreviews.map((url, index) => (
                    <div key={index} className="rounded overflow-hidden border">
                      <img src={url} alt={`Live preview ${index + 1}`} className="w-full h-auto object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* --- 진행 상태 표시 끝 --- */}

        {error && <p className="mt-4 text-sm text-red-600">오류: {error}</p>}

        {/* 최종 생성 결과 (기존 로직 유지) */}
        {generationResult && generationResult.image_urls && generationResult.image_urls.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">생성된 이미지 (최종)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {generationResult.image_urls.map((url, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-lg">
                  <img src={url} alt={`생성된 이미지 ${index + 1}`} className="w-full h-auto object-cover" />
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
