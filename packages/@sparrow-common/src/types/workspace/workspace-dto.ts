import type { WorkspaceRoleDtoEnum } from "./workspace-base";

export enum WorkspaceTypeDtoEnum {
  PERSONAL = "PERSONAL",
  TEAM = "TEAM",
}

export enum WorkspaceEnvironmentTypeDtoEnum {
  GLOBAL = "GLOBAL",
  LOCAL = "LOCAL",
}

export interface WorkspaceEnvironmentDtoInterface {
  id: string;
  name?: string;
  type?: WorkspaceEnvironmentTypeDtoEnum;
}

export interface WorkspaceAdminDtoInterface {
  id: string;
  name: string;
}

export interface WorkspaceOwnerInformationDtoInterface {
  id: string;
  name?: string;
  type: WorkspaceTypeDtoEnum;
}

export interface WorkspaceTeamInfoDtoInterface {
  id: string;
  name: string;
}

export interface WorkspaceTestflowInfoDtoInterface {
  id: string;
  name?: string;
}

export interface WorkspaceCollectionDtoInterface {
    id: string;
    name: string;
    activeSync?: boolean;
  }

  export interface WorkspaceUserDtoInterface {
    role: WorkspaceRoleDtoEnum;
    id: string;
    name: string;
    email: string;
  }

export interface WorkspaceDtoInterface {
  name: string;
  team: WorkspaceTeamInfoDtoInterface;
  description?: string;
  collection?: WorkspaceCollectionDtoInterface[];
  environments?: WorkspaceEnvironmentDtoInterface[];
  testflows?: WorkspaceTestflowInfoDtoInterface[];
  admins?: WorkspaceAdminDtoInterface[];
  users?: WorkspaceUserDtoInterface[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  isNewInvite?: boolean;
}

export interface WorkspaceChunkDtoInterface {
  id: string;
  name: string;
}
