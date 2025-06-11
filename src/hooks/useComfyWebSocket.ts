"use client";

import { useState, useEffect, useRef } from 'react';
// 실제 프로젝트 구조에 맞게 타입 임포트 경로를 수정해주세요.
import type { User } from '@/interfaces/user.interface';
import type { CrystoolsMonitorData } from '@/interfaces/system-monitor.interface';
import type {
  ComfyUIProgressData,
  ComfyUIExecutedData,
  ComfyUIWebSocketEvent,
  ImageGenerationData,
  ComfyUIStatusData,
  ComfyUIExecutionStartData,
} from '@/interfaces/websocket.interface';

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

/**
 * ComfyUI와의 실시간 WebSocket 통신을 관리하는 커스텀 훅입니다.
 * @param user 현재 로그인된 사용자 정보. 권한 확인 및 clientId 생성에 사용됩니다.
 * @param isAuthLoading 사용자의 인증 상태를 로딩 중인지 여부.
 * @returns WebSocket 연결 상태 및 실시간 생성 데이터를 포함하는 객체.
 */
export const useComfyWebSocket = (user: User | null, isAuthLoading: boolean): ComfyWebSocketHook => {
  const ws = useRef<WebSocket | null>(null);
  // onmessage 핸들러의 클로저 문제를 피하기 위해 ref를 사용하여 최신 promptId를 추적합니다.
  const activePromptIdRef = useRef<string | null>(null);
  
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<{ value: number; max: number } | null>(null);
  const [livePreviews, setLivePreviews] = useState<{ url: string; promptId: string }[]>([]);
  const [systemMonitorData, setSystemMonitorData] = useState<CrystoolsMonitorData | null>(null);
  const [queueRemaining, setQueueRemaining] = useState<number>(0);
  const [finalGenerationResult, setFinalGenerationResult] = useState<(ImageGenerationData & { type: 'final' }) | null>(null);
  const [activePromptId, setActivePromptId] = useState<string | null>(null); // UI 렌더링용 상태

  useEffect(() => {
    // 인증 로딩 중이거나, 사용자가 없거나, 관리자가 아니면 연결을 시도하지 않거나 기존 연결을 닫습니다.
    if (isAuthLoading || !user || user.role !== 'admin') {
      if (ws.current) {
        console.log("WebSocket: Closing due to auth changes or unmount.");
        ws.current.close();
      }
      return;
    }

    // 이미 연결 중이거나 연결된 상태라면 중복 실행을 방지합니다.
    if (ws.current && ws.current.readyState < 2) { // CONNECTING or OPEN
      return;
    }

    const clientId = `admin-ui-${user.id}-${Math.random().toString(36).substring(2, 9)}`;
    const WEBSOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://localhost:3000/events'; // Gateway 경로

    console.log(`WebSocket: Attempting to connect to ${WEBSOCKET_SERVER_URL}`);
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

        // --- 1. prompt_id와 관련 없는 일반 메시지를 먼저 처리합니다. ---
        if (message.type === 'crystools.monitor') {
          setSystemMonitorData(msgData);
          return; // 이 메시지 처리는 여기서 끝냅니다.
        }

        if (message.type === 'status') {
          const statusData = msgData as ComfyUIStatusData;
          setQueueRemaining(statusData?.status?.exec_info?.queue_remaining ?? 0);
          return; // 이 메시지 처리는 여기서 끝냅니다.
        }

        // --- 2. 백엔드가 보낸 최종 결과 메시지를 처리합니다. ---
        if (message.type === 'generation_result') {
          const finalData = msgData as ImageGenerationData;
          setFinalGenerationResult({ ...finalData, type: 'final' });
          setExecutionStatus('최종 결과 수신 완료!');
          // 현재 활성화된 작업에 대한 결과라면 관련 상태 초기화
          if (finalData.prompt_id === activePromptIdRef.current) {
            activePromptIdRef.current = null;
            setActivePromptId(null);
            setProgressValue(null);
          }
          return;
        }

        // --- 3. 이제부터는 prompt_id가 반드시 필요한 작업 관련 메시지만 처리합니다. ---
        const promptId = msgData?.prompt_id;
        if (!promptId) return; // prompt_id가 없는 다른 메시지는 무시

        const currentActivePromptId = activePromptIdRef.current;

        switch (message.type) {
          case 'execution_start':
            // 새 작업이 시작되면, 이 작업을 "활성 작업"으로 설정합니다.
            activePromptIdRef.current = promptId;
            setActivePromptId(promptId);
            // 이전 작업의 상태들을 초기화합니다.
            setLivePreviews([]);
            setFinalGenerationResult(null);
            setProgressValue(null);
            setExecutionStatus(`작업 시작됨 (ID: ${promptId.substring(0, 8)})...`);
            break;

          case 'progress':
            // 현재 활성화된 작업에 대한 progress 메시지만 처리합니다.
            if (promptId === currentActivePromptId) {
              const progressData = msgData as ComfyUIProgressData;
              setProgressValue({ value: progressData.value, max: progressData.max });
              setExecutionStatus(`생성 중... (${progressData.value}/${progressData.max})`);
            }
            break;

          case 'executed':
            if (msgData.output?.images) {
              // TODO: ComfyUI 서버 URL을 환경 변수로 관리하는 것이 좋습니다.
              const comfyUIBaseUrl = process.env.NEXT_PUBLIC_COMFYUI_URL || "https://comfy.surfai.org";
              const newPreviews = msgData.output.images
                .filter((img: any) => img.type === 'temp') // 프리뷰용 임시 이미지만 필터링
                .map((img: any) => ({
                  url: `${comfyUIBaseUrl}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder || '')}&type=${img.type}`,
                  promptId,
                }));
              
              if (newPreviews.length > 0) {
                // 이전 프리뷰와 중복되지 않도록 추가
                setLivePreviews(prev => {
                  const existingUrls = new Set(prev.map((p: any) => p.url));
                  const uniqueNewPreviews = newPreviews.filter((p: any) => !existingUrls.has(p.url));
                  return [...prev, ...uniqueNewPreviews];
                });
              }
            }
            break;

          case 'executing':
            // 현재 활성화된 작업의 실행이 완전히 끝났음을 감지 (다음 작업으로 넘어가기 직전)
             if (promptId === currentActivePromptId && msgData.node === null) {
                setExecutionStatus(`마무리 중...`);
                setProgressValue(null); // 프로그레스 바 초기화
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
      // 컴포넌트 언마운트에 의한 의도된 close가 아닐 경우에만 상태 메시지 설정
      if (ws.current) setExecutionStatus("WebSocket 연결이 끊어졌습니다.");
      ws.current = null;
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket: Error event:', error);
      setExecutionStatus('WebSocket 연결 오류 발생.');
    };

    // 컴포넌트가 사라질 때 WebSocket 연결을 정리하는 cleanup 함수
    return () => {
      if (ws.current) {
        console.log("WebSocket: Closing connection on cleanup.");
        ws.current.close();
        ws.current = null;
      }
    };
  }, [user, isAuthLoading]); // user 또는 isAuthLoading 상태가 변경될 때만 이 effect를 재실행하여 연결을 관리

  // 컴포넌트가 사용할 상태와 함수들을 반환
  return { 
    isWsConnected, 
    executionStatus, 
    progressValue, 
    livePreviews, 
    systemMonitorData, 
    queueRemaining, 
    finalGenerationResult, 
    activePromptId 
  };
};
