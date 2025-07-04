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
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  inputImage: string | null;
}

export interface ParameterFieldProps {
  paramName: string;
  label: string;
  paramValue: any;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  inputType?: 'text' | 'number' | 'textarea' | 'checkbox' | 'select' | 'image';
  description?: string;
  options?: string[];
  className?: string;
}
