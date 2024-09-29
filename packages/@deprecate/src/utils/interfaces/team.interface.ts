/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TeamDocument } from "@app/database/database";
import type { Observable } from "rxjs";
import type { InviteBody, TeamPostBody } from "../dto/team-dto";
import type { TeamRole, WorkspaceRole } from "../enums";

export interface CurrentTeam {
  name: string;
  id: string;
  base64String: object;
}

export interface TeamRepositoryMethods {
  getDocument?: (elem: TeamDocument) => any;
  getTeam?: (teamId: string) => Promise<Observable<TeamDocument>>;
  getTeams?: () => Observable<TeamDocument[]>;
  checkActiveTeam?: (teamId: string) => Promise<boolean>;
  clearTeams?: () => Promise<any>;
  setActiveTeam?: (teamId: string) => Promise<void>;
  activateInitialTeamWithWorkspace?: () => Promise<string>;
  bulkInsertData?: (data: any) => Promise<void>;
  getActiveTeam?: () => Observable<TeamDocument>;
  createTeam?: (team: any) => Promise<void>;
  modifyTeam?: (teamId: string, data) => any;
  setOpenTeam?: (teamId: string) => any;
  updateUserRoleInTeam: (
    teamId: string,
    userId: string,
    role: TeamRole,
  ) => Promise<void>;
  removeUserFromTeam: (teamId: string, userId: string) => Promise<void>;
}

export interface TeamServiceMethods {
  fetchTeams?: (userId: string) => any;
  createTeam?: (team: TeamPostBody) => any;
  inviteMembersAtTeam?: (teamId: string, inviteBody: InviteBody) => unknown;
  removeMembersAtTeam?: (teamId: string, userId: string) => any;
  promoteToAdminAtTeam?: (teamId: string, userId: string) => any;
  demoteToMemberAtTeam?: (teamId: string, userId: string) => any;
  promoteToOwnerAtTeam?: (teamId: string, userId: string) => unknown;
  refreshWorkspace?: (userId: string) => void;
  changeUserRoleAtWorkspace?: (
    workspaceId: string,
    userId: string,
    body: WorkspaceRole,
  ) => unknown;
  removeUserFromWorkspace?: (workspaceId: string, userId: string) => unknown;
  disableNewInviteTag?: (userId: string, teamId: string) => Promise<Team>;
  updateTeam: (teamId: string, team) => Promise<Team>;
}

export interface Team {
  name: string;
  description?: string;
  logo?: logoDto;
  workspaces?: WorkspaceDto[];
  users: UserDto[];
  owner: string;
  admins?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  isNewInvite?: boolean;
}

export interface WorkspaceDto {
  id: string;
  name: string;
}

export interface UserDto {
  id: string;
  role: string;
  name: string;
  email: string;
}
export class logoDto {
  bufferString?: string;
  encoding?: string;
  mimetype?: string;
  size?: number;
}
