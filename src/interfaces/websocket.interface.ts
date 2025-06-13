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

/**
 * 백엔드가 R2 업로드 완료 후 WebSocket으로 보내주는
 * 개별 생성 결과물 하나의 데이터 타입을 정의합니다.
 */
export interface GenerationResultOutput {
  /**
   * 데이터베이스에 저장된 생성물의 고유 ID입니다.
   * 이 ID는 다운로드 URL 요청 등 특정 결과물을 식별하는 데 사용됩니다.
   */
  id: number;

  /**
   * Cloudflare R2에 최종 저장된 파일의 URL입니다.
   * 프론트엔드 갤러리에서 이미지를 표시하는 데 사용됩니다.
   */
  r2Url: string;

  // 필요하다면, 갤러리 카드에 추가 정보를 표시하기 위해 다른 필드를 포함할 수 있습니다.
  // originalFilename?: string;
  // createdAt?: string;
}

/**
 * 이미지 생성이 최종적으로 완료되고 결과물이 R2와 같은 영구 스토리지에
 * 업로드된 후, 백엔드가 WebSocket을 통해 프론트엔드로 보내는 최종 결과 데이터의
 * 타입을 정의합니다.
 */
export interface ImageGenerationData {
  /**
   * 이 결과물에 해당하는 ComfyUI의 고유한 프롬프트 ID입니다.
   * 어떤 생성 요청에 대한 결과인지 식별하는 데 사용됩니다.
   * @example "c8e1e7f9-3e4b-4a5f-9e8a-0a6a3b6c7d8e"
   */
  prompt_id: string;

  /**
   * Cloudflare R2에 최종 저장된 이미지 또는 비디오 파일들의 URL 배열입니다.
   * 프론트엔드는 이 URL들을 사용하여 최종 결과물을 사용자에게 보여줍니다.
   * 한 번의 요청으로 여러 파일이 생성될 수 있으므로 배열 타입입니다.
   * @example ["https://your-r2-bucket.pub/outputs/101/prompt-id-123/image_01.png"]
   */
  outputs: GenerationResultOutput[];

  // --- 필요에 따라 추가할 수 있는 선택적 필드들 ---

  /**
   * 이 결과물을 생성하는 데 사용된 동적 파라미터들의 기록입니다.
   * 히스토리에서 "이 이미지는 어떤 설정으로 만들었지?"를 보여줄 때 유용합니다.
   * @example { "positive_prompt": "a cat astronaut", "seed": 12345 }
   */
  used_parameters?: Record<string, any>;

  /**
   * 생성에 사용된 워크플로우 템플릿의 ID입니다.
   */
  source_template_id?: number;
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
