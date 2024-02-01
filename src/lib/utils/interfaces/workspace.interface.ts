import type { WorkspaceDocument } from "$lib/database/app.database";
import type { TeamRole, WorkspaceRole } from "../enums";
import type { MakeRequestResponse } from "./common.interface";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  role: WorkspaceRole | TeamRole;
  workspaceId?: string;
}
export interface workspaceDocumentWithPosition extends WorkspaceDocument {
  position: string;
}

export interface workspaceInviteMethods {
  activateWorkspace: (workspaceId: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<any>;
  handleWorkspaceDeletion: (
    teamId: string,
    workspaceId: string,
  ) => Promise<void>;
  updateRoleInWorkspace: (
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ) => Promise<MakeRequestResponse>;
  updateUsersInWorkspaceInRXDB: (
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ) => Promise<void>;
  checkIfUserIsPartOfMutipleWorkspaces: (userId: string) => Promise<boolean>;
  deleteUserFromWorkspace: (
    workspaceId: string,
    userId: string,
  ) => Promise<MakeRequestResponse>;
  deleteUserFromWorkspaceRxDB: (
    workspaceId: string,
    userId: string,
  ) => Promise<void>;
}
