import type { WorkspaceRole } from "../enums/enums";

//------- workspace Interface ------------//
export interface WorkspacePostBody {
  name: string;
  id: string;
}

export interface WorkspacePutBody {
  name?: string;
  description?: string;
}

export interface InvalidWorkspacePostBody {
  name: boolean;
  id: boolean;
}

export interface addUsersInWorkspacePayload {
  users: string[];
  role: WorkspaceRole;
}
export interface addUsersInWorkspace {
  id: string;
  role: WorkspaceRole;
}
