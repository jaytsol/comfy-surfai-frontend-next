// 웹소켓 메시지 타입 정의

export interface ComfyUIExecutionInfo {
  queue_remaining?: number;
}

export interface ComfyUIStatusData {
  status?: { exec_info: ComfyUIExecutionInfo };
  exec_info: ComfyUIExecutionInfo;
  sid?: string; // 세션 ID (필요시)
}

export interface ComfyUIProgressData {
  value: number;
  max: number;
  prompt_id: string;
  node: string; // 현재 진행 중인 노드 ID
}

export interface ComfyUIExecutingData {
  node: string | null; // null이면 해당 프롬프트의 노드 실행 완료 의미
  prompt_id: string;
}

export interface ComfyUIImageOutput {
  filename: string;
  subfolder?: string;
  type: 'output' | 'temp' | 'input'; // ComfyUI의 이미지 타입
}

export interface ComfyUIExecutedData {
  node: string;
  output: {
    images?: ComfyUIImageOutput[];
    // 다른 아웃풋 타입 (text 등)
  };
  prompt_id: string;
}

export interface ComfyUIExecutionStartData {
  prompt_id: string;
}

export interface ComfyUIExecutionCachedData {
  nodes: string[];
  prompt_id: string;
}

export interface ComfyUIWebSocketEvent {
  type: string;
  data: any;
}

// 웹소켓 이벤트 타입
// ComfyUI에서 발생할 수 있는 웹소켓 이벤트 타입들
export type WebSocketEventType =
  | 'status'
  | 'progress'
  | 'executing'
  | 'executed'
  | 'execution_start'
  | 'execution_cached'
  | 'execution_error'
  | 'execution_interrupted';

// 웹소켓 메시지 핸들러 타입
export type WebSocketMessageHandler = (data: any) => void;
