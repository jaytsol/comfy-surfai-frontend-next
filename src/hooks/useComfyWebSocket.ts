"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { User } from "@/interfaces/user.interface";
import type { CrystoolsMonitorData } from "@/interfaces/system-monitor.interface";
import type {
  ComfyUIProgressData,
  ComfyUIWebSocketEvent,
  ImageGenerationData,
  ComfyUIStatusData,
} from "@/interfaces/websocket.interface";
import { HistoryItemData } from "@/interfaces/history.interface";

type ComfyUIStatus = "ONLINE" | "OFFLINE" | "CONNECTING" | "CLOSING" | "CHECKING...";

export interface ComfyWebSocketHook {
  comfyUIStatus: ComfyUIStatus;
  executionStatus: string | null;
  progressValue: { value: number; max: number } | null;
  systemMonitorData: CrystoolsMonitorData | null;
  queueRemaining: number;
  activePromptId: string | null;
  items: HistoryItemData[];
  removeItem: (id: number) => void;
  addItem: (item: HistoryItemData) => void;
}

export const useComfyWebSocket = (
  user: User | null,
  isAuthLoading: boolean,
  fetchUserProfile: () => Promise<void>
): ComfyWebSocketHook => {
  const ws = useRef<WebSocket | null>(null);
  const activePromptIdRef = useRef<string | null>(null);

  const MAX_GALLERY_ITEMS = 20;

  const [comfyUIStatus, setComfyUIStatus] = useState<ComfyUIStatus>("CHECKING...");
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<{
    value: number;
    max: number;
  } | null>(null);
  const [systemMonitorData, setSystemMonitorData] =
    useState<CrystoolsMonitorData | null>(null);
  const [queueRemaining, setQueueRemaining] = useState<number>(0);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [items, setItems] = useState<HistoryItemData[]>([]);

  const removeItem = useCallback((idToRemove: number) => {
    setItems((prev) => prev.filter((item) => item.id !== idToRemove));
  }, []);

  const addItem = useCallback((itemToAdd: HistoryItemData) => {
    setItems((prev) =>
      [...prev, itemToAdd].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  }, []);

  useEffect(() => {
    activePromptIdRef.current = activePromptId;
  }, [activePromptId]);

  useEffect(() => {
    let reconnectTimeoutId: NodeJS.Timeout | null = null;

    const connect = () => {
      if (isAuthLoading || !user) {
        return;
      }

      if (ws.current && ws.current.readyState < 2) {
        return;
      }

      const clientId = `admin-ui-${user.id}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      const WEBSOCKET_SERVER_URL =
        process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3000/generate";

      console.log(
        `WebSocket: Attempting to connect to ${WEBSOCKET_SERVER_URL}`
      );
      const socket = new WebSocket(
        `${WEBSOCKET_SERVER_URL}?clientId=${clientId}`
      );
      ws.current = socket;
      setExecutionStatus("프론트엔드 WebSocket 연결 시도 중...");

      socket.onopen = () => {
        console.log("WebSocket: Connected to Backend");
        setExecutionStatus("백엔드와 연결되었습니다.");
        if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(
            event.data as string
          ) as ComfyUIWebSocketEvent;
          const msgData = message.data;

          if (message.type === "comfyui_status_update") {
            setComfyUIStatus(msgData.status as ComfyUIStatus);
            return;
          }

          if (message.type === "crystools.monitor") {
            setSystemMonitorData(msgData);
            return;
          }

          if (message.type === "status") {
            const statusData = msgData as ComfyUIStatusData;
            setQueueRemaining(
              statusData?.status?.exec_info?.queue_remaining ?? 0
            );
            return;
          }

          if (message.type === "generation_result") {
            const finalData = msgData as ImageGenerationData;

            if (finalData.outputs && finalData.outputs.length > 0) {
              setItems((prevOutputs) => {
                const combinedOutputs = [...prevOutputs, ...finalData.outputs];
                if (combinedOutputs.length > MAX_GALLERY_ITEMS) {
                  return combinedOutputs.slice(
                    combinedOutputs.length - MAX_GALLERY_ITEMS
                  );
                }
                return combinedOutputs;
              });
            }

            setExecutionStatus("최종 결과 수신 완료!");
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
            case "execution_start":
              activePromptIdRef.current = promptId;
              setActivePromptId(promptId);
              setProgressValue(null);
              setExecutionStatus(
                `작업 시작됨 (ID: ${promptId.substring(0, 8)})...`
              );
              break;
            case "progress":
              if (promptId === currentActivePromptId) {
                const progressData = msgData as ComfyUIProgressData;
                setProgressValue({
                  value: progressData.value,
                  max: progressData.max,
                });
                setExecutionStatus(
                  `생성 중... (${progressData.value}/${progressData.max})`
                );
              }
              break;
            case "executing":
              if (promptId === currentActivePromptId && msgData.node === null) {
                setExecutionStatus(`마무리 중...`);
                setProgressValue(null);
              }
              break;
          }
        } catch (e) {
          console.error(
            "WebSocket: Failed to parse message or handle event:",
            e,
            "Raw data:",
            event.data
          );
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket: Error event:", error);
      };

      socket.onclose = (event) => {
        console.log(
          `WebSocket: Disconnected. Code: ${event.code}, Reason: '${event.reason}'`
        );
        ws.current = null;
        setComfyUIStatus("OFFLINE"); // Also update ComfyUI status on disconnect

        if (event.code !== 1000) {
          setExecutionStatus(
            "WebSocket 연결이 끊어졌습니다. 5초 후 재연결합니다..."
          );
          if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
          reconnectTimeoutId = setTimeout(() => {
            console.log("WebSocket: Attempting to reconnect...");
            connect();
          }, 5000);
        } else {
          setExecutionStatus("WebSocket 연결이 정상적으로 종료되었습니다.");
        }
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
      const socketToClose = ws.current;
      if (socketToClose) {
        ws.current = null;
        socketToClose.onopen = null;
        socketToClose.onmessage = null;
        socketToClose.onerror = null;
        socketToClose.onclose = null;
        if (socketToClose.readyState === WebSocket.OPEN) {
          socketToClose.close(1000, "Component unmounting");
        }
      }
    };
  }, [user, isAuthLoading, fetchUserProfile]);

  return {
    comfyUIStatus,
    executionStatus,
    progressValue,
    systemMonitorData,
    queueRemaining,
    activePromptId,
    items,
    removeItem,
    addItem,
  };
};
