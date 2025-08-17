import type { ChangeEvent, FormEvent } from 'react';
import type { WorkflowTemplate } from './workflow.interface';
import { User } from './user.interface';

type ComfyUIStatus = "ONLINE" | "OFFLINE" | "CONNECTING" | "CLOSING" | "CHECKING...";

export interface TemplateFormProps {
  selectedTemplateId: string;
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
  user: User | null; // User 객체 추가
  comfyUIStatus: ComfyUIStatus;
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
