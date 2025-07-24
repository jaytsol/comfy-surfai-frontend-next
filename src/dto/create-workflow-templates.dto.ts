/**
 * 새로운 워크플로우 템플릿 생성을 위해
 * 백엔드 API(`POST /workflow-templates`)로 보낼 요청 본문의 타입을 정의합니다.
 * 1단계(뼈대 생성)에 해당합니다.
 */
export interface CreateWorkflowTemplateDTO {
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  cost: number;
  definition: object;
  isPublicTemplate?: boolean;
  previewImageUrl?: string;
}
