import type { WorkspaceDocument } from "@app/database/database";
import type { TeamRole, WorkspaceRole } from "../enums";
export interface CurrentWorkspace {
  name: string;
  id: string;
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
