export interface EnvironmentKeyValueBaseInterface {
  key: string;
  value: string;
  checked: boolean;
}

export interface EnvironmentFilteredVariableBaseInterface {
  key: string;
  value: string;
  type: string;
  environment: string;
}

export interface EnvironmentDocumentBaseInterface {
  id: string;
  environmentId: string;
  workspaceId: string;
  name: string;
  variable: EnvironmentKeyValueBaseInterface[];
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface EnvironmentLocalGlobalJoinBaseInterface {
  local: EnvironmentDocumentBaseInterface;
  global: EnvironmentDocumentBaseInterface;
  filtered: EnvironmentFilteredVariableBaseInterface[];
}
