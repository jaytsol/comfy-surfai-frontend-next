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
  systemMonitorData: CrystoolsMonitorData | null;
  queueRemaining: number;
  finalGenerationResult: (ImageGenerationData & { type: 'final' }) | null;
  activePromptId: string | null;
}

/**
 * ComfyUI와의 실시간 WebSocket 통신을 관리하고, 자동 재연결을 지원하는 커스텀 훅입니다.
 */
export const useComfyWebSocket = (user: User | null, isAuthLoading: boolean): ComfyWebSocketHook => {
  const ws = useRef<WebSocket | null>(null);
  const activePromptIdRef = useRef<string | null>(null);
  
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<{ value: number; max: number } | null>(null);
  const [systemMonitorData, setSystemMonitorData] = useState<CrystoolsMonitorData | null>(null);
  const [queueRemaining, setQueueRemaining] = useState<number>(0);
  const [finalGenerationResult, setFinalGenerationResult] = useState<(ImageGenerationData & { type: 'final' }) | null>(null);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);

  // activePromptId state가 변경될 때마다 ref 값도 동기화
  useEffect(() => {
    activePromptIdRef.current = activePromptId;
  }, [activePromptId]);


  useEffect(() => {
    // 재연결 시도를 위한 타임아웃 ID 저장용 변수
    let reconnectTimeoutId: NodeJS.Timeout | null = null;

    // 연결 로직을 별도의 함수로 분리하여 재사용
    const connect = () => {
      // 인증 정보가 없거나, 관리자가 아니면 연결 시도 안 함
      if (isAuthLoading || !user || user.role !== 'admin') {
        return;
      }
      
      // 이미 연결되어 있거나 시도 중이면 중복 실행 방지
      if (ws.current && ws.current.readyState < 2) {
        return;
      }

      const clientId = `admin-ui-${user.id}-${Math.random().toString(36).substring(2, 9)}`;
      // ✨ 프론트엔드 환경변수 파일(.env.local)에서 주소를 가져오는 것을 권장합니다.
      const WEBSOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://localhost:3000/events';

      console.log(`WebSocket: Attempting to connect to ${WEBSOCKET_SERVER_URL}`);
      const socket = new WebSocket(`${WEBSOCKET_SERVER_URL}?clientId=${clientId}`);
      ws.current = socket;
      setExecutionStatus('WebSocket 연결 시도 중...');

      socket.onopen = () => {
        console.log('WebSocket: Connected');
        setIsWsConnected(true);
        setExecutionStatus("WebSocket에 연결되었습니다.");
        // 성공적으로 연결되면, 이전에 예약된 재연결 시도를 취소합니다.
        if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string) as ComfyUIWebSocketEvent;
          const msgData = message.data;
  
          // 시스템 모니터링 메시지 처리
          if (message.type === 'crystools.monitor') {
            setSystemMonitorData(msgData);
            return;
          }
  
          // 백엔드에서 보낸 최종 결과 메시지 처리
          if (message.type === 'generation_result') {
            const finalData = msgData as ImageGenerationData;
            setFinalGenerationResult({ ...finalData, type: 'final' });
            setExecutionStatus('최종 결과 수신 완료!');
            if (finalData.prompt_id === activePromptIdRef.current) {
              activePromptIdRef.current = null;
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
            case 'executing':
               if (promptId === currentActivePromptId && msgData.node === null) {
                  setExecutionStatus(`마무리 중...`);
                  setProgressValue(null);
               }
               break;
          }
        } catch (e) {
          console.error("WebSocket: Failed to parse message or handle event:", e, "Raw data:", event.data);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket: Error event:', error);
        // onerror 다음에는 보통 onclose가 발생하므로, 재연결 로직은 onclose에서 처리합니다.
      };
      
      // ✨ --- 자동 재연결 로직이 포함된 onclose 핸들러 --- ✨
      socket.onclose = (event) => {
        console.log(`WebSocket: Disconnected. Code: ${event.code}, Reason: '${event.reason}'`);
        setIsWsConnected(false);
        ws.current = null;

        // 1000번 코드는 정상적인(의도된) 종료이므로 재연결하지 않습니다.
        // 예를 들어, 사용자가 로그아웃하거나 페이지를 떠날 때 cleanup 함수에서 1000번 코드로 닫습니다.
        if (event.code !== 1000) {
          setExecutionStatus("WebSocket 연결이 끊어졌습니다. 5초 후 재연결합니다...");
          if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId); // 중복 타이머 방지
          reconnectTimeoutId = setTimeout(() => {
            console.log("WebSocket: Attempting to reconnect...");
            connect(); // 5초 후 다시 연결 시도
          }, 5000);
        } else {
          setExecutionStatus("WebSocket 연결이 정상적으로 종료되었습니다.");
        }
      };
    };

    // 최초 연결 시도
    connect();

    // 컴포넌트가 사라질 때 실행되는 cleanup 함수
    return () => {
      console.log("WebSocket: Cleanup function called.");
      // 예약된 재연결 시도가 있다면 취소
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
      // WebSocket 연결이 있다면 깨끗하게 닫아줍니다.
      if (ws.current) {
        // cleanup 시에는 onclose 핸들러가 재연결 로직을 실행하지 않도록 먼저 핸들러를 제거합니다.
        ws.current.onclose = null;
        ws.current.close(1000, "Component unmounting"); // 정상 종료 코드(1000)와 함께 닫기
        ws.current = null;
      }
    };
  }, [user, isAuthLoading]); // user 또는 인증 상태가 변경될 때만 이 effect를 재실행하여 연결을 관리

  // 컴포넌트가 사용할 상태와 함수들을 반환
  return { 
    isWsConnected, 
    executionStatus, 
    progressValue, 
    systemMonitorData, 
    queueRemaining, 
    finalGenerationResult, 
    activePromptId 
  };
};
