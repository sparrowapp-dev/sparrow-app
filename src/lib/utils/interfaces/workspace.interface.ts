import type { UserRoles } from "../enums";

export interface CurrentWorkspace {
  name: string;
  id: string;
}

export interface WorkspaceMethods {
  handleCreateTab: (data) => void;
}

export interface userDetails {
  email: string;
  id: string;
  name: string;
  role: UserRoles;
  workspaceId: string;
}
