// src/interfaces/form-interfaces.ts

export interface ParameterPreset {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'boolean';
  description: string;
  options?: string[];
  default_value?: any;
  validation?: {
    min?: number;
    max?: number | string;
    step?: number;
  };
  essentialForCategories?: string[];
}

export interface ParameterMappingItem {
  node_id: string;
  input_name: string;
  label: string;
  description?: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'boolean';
  default_value?: any;
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number | string;
    step?: number;
  };
}

export interface ParameterMapEntry {
  id: string;
  key: string;
  value: ParameterMappingItem;
  isCustom: boolean;
  isEssential: boolean;
  selectedNodeInfo?: any;
}

export interface NodeInfo {
  id: string;
  title: string;
}
