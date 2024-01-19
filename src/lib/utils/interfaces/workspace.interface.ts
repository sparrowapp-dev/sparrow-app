import type { InviteBody } from "../dto/team-dto";

export interface CurrentWorkspace {
  name: string;
  id: string;
}

export interface WorkspaceMethods {
  handleCreateTab: (data) => void;
}

export interface workspaceServiceMethods {
  inviteMembersAtTeam: (teamId: string, inviteBody: InviteBody) => unknown;
}
export interface TeamRepositoryMethods {
  modifyTeam: (teamId: string, team) => void;
}
