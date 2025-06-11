"use client";

import { useState, useEffect, useRef } from 'react';
import type { CrystoolsMonitorData } from '@/interfaces/system-monitor.interface';
import type {
  ComfyUIProgressData,
  ComfyUIWebSocketEvent,
  ImageGenerationData,
  ComfyUIStatusData
} from '@/interfaces/websocket.interface';
import { User } from '@/interfaces/user.interface';

// 이 훅이 반환할 값들의 타입을 정의합니다.
export interface ComfyWebSocketHook {
  isWsConnected: boolean;
  executionStatus: string | null;
  progressValue: { value: number; max: number } | null;
  livePreviews: { url: string; promptId: string }[];
  systemMonitorData: CrystoolsMonitorData | null;
  queueRemaining: number;
  // 최종 결과물 상태도 이 훅에서 관리합니다.
  finalGenerationResult: (ImageGenerationData & { type: 'final' }) | null;
  activePromptId: string | null; // 현재 처리 중인 프롬프트 ID
}

export const useComfyWebSocket = (user: User | null, isAuthLoading: boolean): ComfyWebSocketHook => {
  const ws = useRef<WebSocket | null>(null);
  const activePromptIdRef = useRef<string | null>(null);
  
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<{ value: number; max: number } | null>(null);
  const [livePreviews, setLivePreviews] = useState<{ url: string; promptId: string }[]>([]);
  const [systemMonitorData, setSystemMonitorData] = useState<CrystoolsMonitorData | null>(null);
  const [queueRemaining, setQueueRemaining] = useState<number>(0);
  const [finalGenerationResult, setFinalGenerationResult] = useState<(ImageGenerationData & { type: 'final' }) | null>(null);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);

  useEffect(() => {
    // 인증 로딩 중이거나, 사용자가 없거나, 관리자가 아니면 연결을 시도하지 않거나 기존 연결을 닫습니다.
    if (isAuthLoading || !user || user.role !== 'admin') {
      if (ws.current) ws.current.close();
      return;
    }

    if (ws.current && ws.current.readyState < 2) return; // 연결 중이거나 이미 연결됨

    const clientId = `admin-ui-${user.id}-${Math.random().toString(36).substring(2, 9)}`;
    const WEBSOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://localhost:3000/generate';

    const socket = new WebSocket(`${WEBSOCKET_SERVER_URL}?clientId=${clientId}`);
    ws.current = socket;
    setExecutionStatus('WebSocket 연결 시도 중...');
    
    socket.onopen = () => {
      console.log('WebSocket: Connected');
      setIsWsConnected(true);
      setExecutionStatus("WebSocket에 연결되었습니다.");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as ComfyUIWebSocketEvent;
        const msgData = message.data;

        // 시스템 모니터링 메시지
        if (message.type === 'crystools.monitor') {
          setSystemMonitorData(msgData);
          return;
        }

        // 백엔드에서 보낸 최종 결과 메시지
        if (message.type === 'generation_result') {
          setFinalGenerationResult({ ...msgData, type: 'final' });
          setExecutionStatus('최종 결과 수신 완료!');
          if (msgData.prompt_id === activePromptId) { // 현재 작업에 대한 결과면 상태 초기화
            setActivePromptId(null);
            setProgressValue(null);
          }
          return;
        }

        const promptId = msgData?.prompt_id;
        if (!promptId) return;

        const currentActivePromptId = activePromptIdRef.current;

        switch (message.type) {
          case 'execution_start':
            activePromptIdRef.current = promptId;
            setActivePromptId(promptId);
            setLivePreviews([]); // 새 작업 시작 시 프리뷰 초기화
            setFinalGenerationResult(null);
            setProgressValue(null);
            setExecutionStatus(`작업 시작됨 (ID: ${promptId.substring(0, 8)})...`);
            break;
          case 'status':
            const statusData = msgData as ComfyUIStatusData;
            setQueueRemaining(statusData?.status?.exec_info?.queue_remaining ?? 0);
            break;
          case 'progress':
            if (promptId === currentActivePromptId) {
              const progressData = msgData as ComfyUIProgressData;
              setProgressValue({ value: progressData.value, max: progressData.max });
              setExecutionStatus(`생성 중... (${progressData.value}/${progressData.max})`);
            }
            break;
          case 'executed':
            if (msgData.output?.images) {
              const comfyUIBaseUrl = process.env.NEXT_PUBLIC_COMFYUI_URL || "https://comfy.surfai.org";
              const newPreviews = msgData.output.images
                .filter((img: any) => img.type === 'temp')
                .map((img: any) => ({
                  url: `${comfyUIBaseUrl}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder || '')}&type=${img.type}`,
                  promptId,
                }));
              if (newPreviews.length > 0) setLivePreviews(prev => [...prev, ...newPreviews]);
            }
            break;
          case 'executing':
             if (promptId === currentActivePromptId && msgData.node === null) {
                setExecutionStatus(`마무리 중...`);
             }
             break;
        }
      } catch (e) {
        console.error("WebSocket: Failed to parse message or handle event:", e, "Raw data:", event.data);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket: Disconnected');
      setIsWsConnected(false);
      if (ws.current) setExecutionStatus("WebSocket 연결이 끊어졌습니다.");
      ws.current = null;
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket: Error event:', error);
      setExecutionStatus('WebSocket 연결 오류 발생.');
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [user, isAuthLoading]);

  return { isWsConnected, executionStatus, progressValue, livePreviews, systemMonitorData, queueRemaining, finalGenerationResult, activePromptId };
};
