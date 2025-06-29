// src/interfaces/workflow.interface.ts

/**
 * 워크플로우의 parameter_map에 포함될 각 항목의 표준화된 구조를 정의합니다.
 * 이 구조는 UI 렌더링, 데이터 유효성 검사, 노드 매핑에 필요한 모든 정보를 포함합니다.
 */
export interface WorkflowParameterMappingItem {
  // 1. ComfyUI 노드 매핑 정보 (필수)
  node_id: string;
  input_name: string;

  // 2. UI 렌더링을 위한 정보
  label: string;
  description: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'boolean';
  default_value?: any;
  options?: string[];

  // 3. 데이터 유효성 검사를 위한 정보 (선택적)
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
  };
}

/**
 * 백엔드에서 받아오는 워크플로우 템플릿의 타입입니다.
 */
export interface WorkflowTemplate {
  id: number;
  name: string;
  description?: string;
  definition: object;
  parameter_map?: Record<string, WorkflowParameterMappingItem>;
  previewImageUrl?: string;
  tags?: string[];
  isPublicTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}