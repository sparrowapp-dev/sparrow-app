/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TeamDocument } from "$lib/database/app.database";
import type { Observable } from "rxjs";
import type { TeamPostBody } from "../dto/team-dto";

export interface CurrentTeam {
  name: string;
  id: string;
  base64String: object;
}

export interface TeamRepositoryMethods {
  getDocument: (elem: TeamDocument) => any;
  getTeams: () => Observable<TeamDocument[]>;
  checkActiveTeam: (teamId: string) => Promise<boolean>;
  clearTeams: () => Promise<any>;
  setActiveTeam: (teamId: string) => Promise<void>;
  activateInitialTeamWithWorkspace: () => Promise<string>;
  bulkInsertData: (data: any) => Promise<void>;
  getActiveTeam: () => Observable<TeamDocument>;
  createTeam: (team: any) => Promise<void>;
  modifyTeam: (teamId: string, data) => any;
}

export interface TeamServiceMethods {
  fetchTeams: (userId: string) => any;
  createTeam: (team: TeamPostBody) => any;
}
