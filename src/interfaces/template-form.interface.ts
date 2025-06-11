import type { ChangeEvent, FormEvent } from 'react';
import type { WorkflowTemplate } from './workflow.interface';

export interface TemplateFormProps {
  templates: WorkflowTemplate[];
  selectedTemplateId: string;
  onTemplateChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onParameterChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onSubmit: (e: FormEvent) => void;
  parameterValues: Record<string, any>;
  isSubmitting: boolean;
  selectedTemplate: WorkflowTemplate | null;
  isLoadingTemplates: boolean;
}

export interface ParameterFieldProps {
  paramName: string;
  label: string; // 레이블은 항상 표시되므로 필수로 변경하는 것이 좋습니다.
  paramValue: any;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  inputType?: 'text' | 'number' | 'textarea' | 'checkbox' | 'select'; // string 보다 구체적인 타입을 사용하는 것이 안전합니다.
  description?: string; // ✨ 툴팁을 위한 description prop 추가
  options?: string[];
  className?: string;
}
