export enum WorkspaceUserAgentBaseEnum {
  BROWSER_AGENT= "Browser Agent",
  CLOUD_AGENT= "Cloud Agent"
}

export enum WorkspaceRoleDtoEnum {
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer",
}

export enum WorkspaceEnvironmentTypeBaseEnum {
  GLOBAL = "GLOBAL",
  LOCAL = "LOCAL",
}

export interface WorkspaceTeamBaseInterface {
  teamId: string;
  teamName: string;
}

export interface WorkspaceAdminBaseInterface {
  id: string;
  name: string;
}

export interface WorkspaceUserBaseInterface {
  role: WorkspaceRoleDtoEnum;
  id: string;
  name: string;
  email: string;
}

export interface WorkspaceCollectionBaseInterface {
  id: string;
  name: string;
}

export interface WorkspaceEnvironmentBaseInterface {
  _id: string;
  name: string;
}

export interface WorkspaceBaseInterface {
  _id: string;
  name: string;
  description: string;
  team: WorkspaceTeamBaseInterface;
  admins: WorkspaceAdminBaseInterface[];
  users: WorkspaceUserBaseInterface[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isActiveWorkspace: boolean;
  isNewInvite: boolean;
  environmentId: string;
  currentEnvironmentId: string;
  collections: WorkspaceCollectionBaseInterface[];
  environments: WorkspaceEnvironmentBaseInterface[];
}