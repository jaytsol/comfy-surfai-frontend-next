// app/generate/page.tsx
"use client";

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GenerationStatus from '@/components/generate/GenerationStatus';
import LivePreviews from '@/components/generate/LivePreviews';
import apiClient from '@/lib/apiClient';
import SystemMonitor from '@/components/system/SystemMonitor/SystemMonitor';
import type { CrystoolsMonitorData } from '@/components/system/SystemMonitor/types';
import { TemplateForm } from '@/components/template/TemplateForm/TemplateForm';
import type { WorkflowTemplate } from '@/types/workflow';
import type {
  ComfyUIStatusData,
  ComfyUIProgressData,
  ComfyUIExecutedData,
  ComfyUIExecutingData,
  ComfyUIExecutionStartData,
  ComfyUIExecutionCachedData,
  ComfyUIWebSocketEvent,
  WebSocketEventType
} from '@/types/websocket';
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

export default function GeneratePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const ws = useRef<WebSocket | null>(null); // WebSocket 인스턴스 ref

  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<ImageGenerationData | null>(null);

  const [isWsConnected, setIsWsConnected] = useState(false);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const currentPromptIdRef = useRef<string | null>(currentPromptId);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null); // 전반적인 진행 텍스트
  const [progressValue, setProgressValue] = useState<{ value: number; max: number } | null>(null);
  const [livePreviews, setLivePreviews] = useState<{url: string, promptId: string}[]>([]); // 프리뷰 이미지 URL 목록
  const [systemMonitorData, setSystemMonitorData] = useState<CrystoolsMonitorData | null>(null);
  const [queueRemaining, setQueueRemaining] = useState<number>(0);
  // Keep ref updated with the latest currentPromptId
  useEffect(() => {
    currentPromptIdRef.current = currentPromptId;
  }, [currentPromptId]);

  // 접근 제어 및 초기 템플릿 목록 로드
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

  // WebSocket Connection and Message Handling Effect
  useEffect(() => {
    if (isAuthLoading) {
      // setExecutionStatus("사용자 인증 정보 확인 중...");
      return; // Wait for auth loading to complete
    }

    if (!user || user.role !== 'admin') {
      if (ws.current) {
        console.log('WebSocket: Closing due to user not admin or not logged in.');
        ws.current.close();
        ws.current = null;
        setIsWsConnected(false);
        setExecutionStatus("관리자만 WebSocket을 사용할 수 있습니다.");
      }
      return;
    }

    // User is admin and auth loading is complete
    if (!ws.current) {
      console.log('WebSocket: Attempting to connect...');
      const clientId = `admin-ui-${user.id}-${Math.random().toString(36).substring(2, 9)}`;
      const WEBSOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL || 'wss://localhost:3000';
      const WEBSOCKET_PATH = '/generate';
      
      const socket = new WebSocket(`${WEBSOCKET_SERVER_URL}${WEBSOCKET_PATH}?clientId=${clientId}`);
      ws.current = socket;
      setExecutionStatus("WebSocket 연결 시도 중...");

      socket.onopen = () => {
        console.log(`WebSocket: Connected to ${WEBSOCKET_PATH}`);
        setIsWsConnected(true);
        setExecutionStatus("WebSocket에 연결되었습니다.");
      };

      socket.onclose = (event) => {
        console.log(`WebSocket: Disconnected from ${WEBSOCKET_PATH}`, event.reason, `Was clean: ${event.wasClean}`);
        setIsWsConnected(false);
        // Avoid setting status if it was an intentional close or component is unmounting
        if (ws.current) { // Check if ws.current was nulled by cleanup, meaning unmount
            setExecutionStatus("WebSocket 연결이 끊어졌습니다.");
        }
        ws.current = null;
      };

      socket.onerror = (errorEvent) => {
        console.error('WebSocket: Error event:', errorEvent);
        setExecutionStatus("WebSocket 연결 오류 발생.");
        if (ws.current) {
          // ws.current.close(); // onerror often followed by onclose, which handles this
        }
        ws.current = null; 
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string) as ComfyUIWebSocketEvent;
          const msgData = message.data;

          if (message.type === 'crystools.monitor') {
            const monitorData = msgData as CrystoolsMonitorData;
            setSystemMonitorData(monitorData);
            return;
          }

          const getPromptId = (data: any): string | undefined => {
            if (data && typeof data === 'object' && 'prompt_id' in data) {
              return data.prompt_id;
            }
            return undefined;
          };

          const messagePromptId = getPromptId(msgData);
          
          if (messagePromptId && currentPromptIdRef.current && currentPromptIdRef.current !== messagePromptId) {
            return;
          }

          switch (message.type) {
            case 'progress':
              const progressData = msgData as ComfyUIProgressData;
              setProgressValue({ value: progressData.value, max: progressData.max });
              setExecutionStatus(`노드 ${progressData.node} 진행: ${progressData.value}/${progressData.max}`);
              break;
            case 'status':
              const statusData = msgData as ComfyUIStatusData;
              if (statusData?.status?.exec_info?.queue_remaining !== undefined) {
                setQueueRemaining(statusData.status.exec_info.queue_remaining);
              } else if (statusData?.exec_info?.queue_remaining !== undefined) {
                setQueueRemaining(statusData.exec_info.queue_remaining);
              }
              break;
            case 'executing':
            const executingData = msgData as ComfyUIExecutingData;
            if (executingData.node === null && executingData.prompt_id) {
              setExecutionStatus(`프롬프트 [${executingData.prompt_id.substring(0,8)}...] 처리 완료.`);
            } else if (executingData.node) {
              setExecutionStatus(`노드 ${executingData.node} 실행 중...`);
            }
            break;
            case 'executed':
              const executedData = msgData as ComfyUIExecutedData;
              if (executedData.output?.images) {
                const comfyUIBaseUrl = process.env.NEXT_PUBLIC_COMFYUI_URL || 'https://comfy.surfai.org';
                const newPreviews = executedData.output.images
                  .filter(img => img.type === 'output') 
                  .map(img => ({
                    url: `${comfyUIBaseUrl}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder || '')}&type=${img.type}`,
                    promptId: executedData.prompt_id
                  }));
                setLivePreviews(prev => {
                  const existingUrls = new Set(prev.map(p => p.url));
                  const uniqueNewPreviews = newPreviews.filter(p => !existingUrls.has(p.url));
                  return [...prev, ...uniqueNewPreviews];
                });
              }
              break;
            case 'execution_start':
              const startData = msgData as ComfyUIExecutionStartData;
              setCurrentPromptId(startData.prompt_id);
              break;
            case 'execution_cached':
              const cachedData = msgData as ComfyUIExecutionCachedData;
              setExecutionStatus(`프롬프트 [${cachedData.prompt_id.substring(0,8)}...]의 노드 (${cachedData.nodes.join(', ')})는 캐시됨.`);
              break;
            default:
              // console.log('WebSocket: Received unhandled message type:', message.type, msgData);
              break;
          }
        } catch (e) {
          console.error('WebSocket: Failed to parse message or handle event:', e, 'Raw data:', event.data);
        }
      };
    }

    // Cleanup function for when the component unmounts or dependencies change
    return () => {
      if (ws.current) {
        console.log('WebSocket: Closing connection on component unmount or dependency change.');
        ws.current.onclose = null; // Prevent onclose handler from firing during manual close
        ws.current.onerror = null;
        ws.current.onmessage = null;
        ws.current.onopen = null;
        ws.current.close();
        ws.current = null;
        setIsWsConnected(false);
        // setExecutionStatus("WebSocket 연결 해제됨."); // Optional: set status on unmount
      }
    };
  }, [user, isAuthLoading]); // Dependencies: user and isAuthLoading

  // 선택된 템플릿 ID 변경 시
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
      setError(null); // 이전 오류는 지웁니다.
    } else {
      setSelectedTemplate(null);
      setParameterValues({});
    }
  }, [selectedTemplateId, templates]);



  const handleParameterChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  
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
    setIsGenerating(true);

    // 웹소켓 상태 초기화
    // setCurrentPromptId(null);
    // setQueueRemaining(0); // Reset queue count on new submission

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
        if (response.data.prompt_id) {
          setCurrentPromptId(response.data.prompt_id); // WebSocket 메시지 필터링을 위해 prompt_id 저장
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

  // 인증 로딩 중 렌더링
  if (isAuthLoading || (!isAuthLoading && (!user || user.role !== 'admin'))) {
    return <p className="text-center py-10">권한 확인 중 또는 리디렉션 중...</p>;
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">
          이미지 생성 (Admin)
        </h1>
        <p className="text-sm mb-4">WebSocket 연결 상태: <span className={isWsConnected ? "text-green-600" : "text-red-600"}>{isWsConnected ? '연결됨' : '연결 끊김'}</span></p>
        <SystemMonitor data={systemMonitorData} className="mb-6" />

        <GenerationStatus 
          executionStatus={executionStatus}
          queueRemaining={queueRemaining}
          progressValue={progressValue}
          error={error}
          isGenerating={isGenerating}
          className="mb-6"
        />
        
        <LivePreviews 
          previews={livePreviews}
          className="mt-6 mb-6"
        />
        
        {/* Template Form */}
        <TemplateForm
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          onTemplateChange={(e) => setSelectedTemplateId(e.target.value)}
          onParameterChange={handleParameterChange}
          onSubmit={handleSubmit}
          parameterValues={parameterValues}
          isGenerating={isGenerating}
          selectedTemplate={selectedTemplate}
          isLoadingTemplates={isLoadingTemplates}
        />
      </div>
    </div>
  );
}
