// src/interfaces/workflow.interface.ts

/**
 * parameter_map의 ui 객체에 대한 타입 정의입니다.
 * 프론트엔드에서 파라미터 입력 필드를 동적으로 렌더링하는 데 사용됩니다.
 */
export interface WorkflowParameterUIConfig {
  type: 'text' | 'number' | 'textarea' | 'checkbox' | 'select';
  label?: string; // 사용자 친화적인 레이블 텍스트
  description?: string; // 툴팁으로 보여줄 설명
  options?: string[]; // type이 'select'일 경우의 선택지 배열
  placeholder?: string; // 입력 필드의 플레이스홀더
}

/**
 * parameter_map의 각 항목(paramConfig)에 대한 타입 정의입니다.
 */
export interface WorkflowParameterMappingItem {
  node_id: string;
  input_name: string;
  // ✨ 새로 추가된 UI 메타데이터 객체. 선택적(optional)으로 설정합니다.
  ui?: WorkflowParameterUIConfig; 
}

/**
 * 백엔드에서 받아오는 워크플로우 템플릿의 타입입니다.
 */
export interface WorkflowTemplate {
  id: number;
  name: string;
  description?: string;
  definition: object;
  parameter_map?: Record<string, WorkflowParameterMappingItem>; // ✨ 이 부분이 위 인터페이스를 사용
  previewImageUrl?: string;
  tags?: string[];
  // ... 기타 필요한 필드들
}
