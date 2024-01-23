import type { InviteBody } from "../dto/team-dto";

export interface CurrentWorkspace {
  name: string;
  id: string;
}

export interface WorkspaceMethods {
  handleCreateTab: (data) => void;
}

export interface TeamServiceMethods {
  inviteMembersAtTeam: (teamId: string, inviteBody: InviteBody) => unknown;
  removeMembersAtTeam: (teamId: string, userId: string) => unknown;
  promoteToAdminAtTeam: (teamId: string, userId: string) => unknown;
  demoteToMemberAtTeam: (teamId: string, userId: string) => unknown;
  refreshWorkspace: (userId: string) => void;
}
export interface TeamRepositoryMethods {
  modifyTeam: (teamId: string, team) => void;
}
