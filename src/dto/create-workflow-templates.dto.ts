import type { WorkflowParameterMappingItem } from '@/interfaces/workflow.interface';

/**
 * 새로운 워크플로우 템플릿 생성을 위해
 * 백엔드 API(/workflow-templates)로 보낼 요청 본문의 타입을 정의합니다.
 */
export interface CreateWorkflowTemplateDTO {
  name: string;
  description?: string;
  tags?: string[];
  definition: object;
  parameter_map?: Record<string, WorkflowParameterMappingItem>;
  isPublicTemplate?: boolean;
  previewImageUrl?: string;
}
