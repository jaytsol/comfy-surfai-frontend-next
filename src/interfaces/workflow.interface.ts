export interface WorkflowParameterMappingItem {
  node_id: string;
  input_name: string;
}

export interface WorkflowTemplate {
  id: number;
  name: string;
  description?: string;
  definition: object;
  parameter_map?: Record<string, WorkflowParameterMappingItem>;
  previewImageUrl?: string;
  tags?: string[];
}
