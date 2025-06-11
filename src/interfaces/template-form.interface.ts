import type { WorkflowTemplate } from "@/interfaces/workflow.interface";

export interface TemplateFormProps {
  templates: WorkflowTemplate[];
  selectedTemplateId: string;
  onTemplateChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onParameterChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  parameterValues: Record<string, any>;
  isSubmitting: boolean;
  selectedTemplate: WorkflowTemplate | null;
  isLoadingTemplates: boolean;
}

export interface ParameterFieldProps {
  paramName: string;
  paramValue: any;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  inputType?: string;
  label?: string;
  options?: string[];
  className?: string;
}
