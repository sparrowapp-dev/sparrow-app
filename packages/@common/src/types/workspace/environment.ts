export interface ENVVariableType {
  key: string;
  value: string;
  checked: boolean;
}

export interface ENVDocumentType {
  id: string;
  environmentId: string;
  workspaceId: string;
  name: string;
  variable: ENVVariableType[];
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ENVExtractVariableType {
  key: string;
  value: string;
  type: string;
  environment: string;
}
