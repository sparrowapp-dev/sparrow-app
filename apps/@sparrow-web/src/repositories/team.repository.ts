import { RxDB, type TeamDocument } from "../database/database";
import { TeamRole } from "@sparrow/common/enums";
import type { userDetails } from "@sparrow/common/interfaces";
import type { Observable } from "rxjs";
import { WorkspaceRepository } from "./workspace.repository";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TeamRepository {
  constructor() {}
  private workspaceRepository = new WorkspaceRepository();
  /**
   * extracts RxDocument of Team.
   */
  public getDocument = (elem: TeamDocument) => {
    return elem.toMutableJSON();
  };

  /**
   * Get teams RxDoc
   */
  public getTeam = async (
    teamId: string,
  ): Promise<Observable<TeamDocument>> => {
    return RxDB.getInstance().rxdb.team.findOne({
      selector: {
        teamId: teamId,
      },
    }).$;
  };

  /**
   * Get team document by id (not observable)
   */
  public getTeamDoc = async (teamId: string): Promise<TeamDocument> => {
    return RxDB.getInstance()
      .rxdb.team.findOne({
        selector: {
          teamId: teamId,
        },
      })
      .exec();
  };

  /**
   * Adds a new team.
   * @params - Team data to be inserted
   */
  public insert = async (team: any) => {
    await RxDB.getInstance().rxdb.team.insert(team);
    return;
  };

  /**
   * get all teams observable of user
   */
  public getTeams = (): Observable<TeamDocument[]> => {
    return RxDB.getInstance().rxdb.team.find().sort({ index: "asc" }).$;
  };

  /**
   * Check whether the team is active
   */
  public checkActiveTeam = async (): Promise<boolean> => {
    const team = await RxDB.getInstance()
      .rxdb.team.findOne({
        selector: {
          isActiveTeam: true,
        },
      })
      .exec();
    if (!team) return true;
    else return false;
  };
  /**
   * clear teams data
   */
  public clearTeams = async (): Promise<any> => {
    return await RxDB.getInstance().rxdb.team.find().remove();
  };

  /**
   * Sets a team as active
   */
  public setActiveTeam = async (teamId: string): Promise<void> => {
    const teams: TeamDocument[] = await RxDB.getInstance()
      .rxdb.team.find()
      .exec();
    const data = teams.map((elem: TeamDocument) => {
      const res = this.getDocument(elem);

      if (res.teamId == teamId) res.isActiveTeam = true;
      else res.isActiveTeam = false;
      return res;
    });
    await RxDB.getInstance().rxdb.team.bulkUpsert(data);
    return;
  };

  /**
   * Sets a team as opened
   */
  public setOpenTeam = async (teamId: string): Promise<void> => {
    const teams: TeamDocument[] = await RxDB.getInstance()
      .rxdb.team.find()
      .exec();
    const data = teams.map((elem: TeamDocument) => {
      const res = this.getDocument(elem);

      if (res.teamId === teamId) res.isOpen = true;
      else res.isOpen = false;
      return res;
    });
    await RxDB.getInstance().rxdb.team.bulkUpsert(data);
    return;
  };

  /***
   * Sets a team as Active which have Workspace
   */
  public activateInitialTeamWithWorkspace = async (): Promise<string> => {
    const teams: TeamDocument[] = await RxDB.getInstance()
      .rxdb.team.find()
      .exec();
    let workspaceToActivate: string | undefined = undefined;
    const data = teams.map((elem: TeamDocument) => {
      const res = this.getDocument(elem);
      if (res.workspaces.length > 0 && !workspaceToActivate) {
        res.isActiveTeam = true;
        workspaceToActivate = res.workspaces[0].workspaceId;
      } else {
        res.isActiveTeam = false;
      }
      return res;
    });
    await RxDB.getInstance().rxdb.team.bulkUpsert(data);
    return workspaceToActivate;
  };

  /**
   * sync / refresh teams data
   */
  public bulkInsertData = async (data: any): Promise<void> => {
    await RxDB.getInstance().rxdb.team.bulkUpsert(data);
    return;
  };

  /**
   * get active team
   */
  public getActiveTeam = (): Observable<TeamDocument> => {
    return RxDB.getInstance().rxdb.team.findOne({
      selector: {
        isActiveTeam: true,
      },
    }).$;
  };

  /**
   * get open team
   */
  public getOpenTeam = (): Observable<TeamDocument> => {
    return RxDB.getInstance().rxdb.team.findOne({
      selector: {
        isOpen: true,
      },
    }).$;
  };

  /**
   * get teams data
   */
  public getTeamData = async (): TeamDocument[] => {
    return await RxDB.getInstance().rxdb.team.find().exec();
  };

  /**
   * Create a new team
   */
  public createTeam = async (team: any): Promise<void> => {
    await RxDB.getInstance().rxdb.team.insert(team);
    return;
  };

  /**
   * Update a team
   */

  public modifyTeam = async (teamId: string, data): Promise<void> => {
    const team = await RxDB.getInstance()
      .rxdb.team.findOne({
        selector: {
          teamId,
        },
      })
      .exec();
    await team.incrementalModify((value) => {
      if (data.name || data.name === "") value.name = data.name;
      if (data.description || data.description === "")
        value.description = data.description;
      if (data.workspaces) value.workspaces = data.workspaces;
      if (data.logo) value.logo = data.logo;
      if (data.users) value.users = data.users;
      if (data.owner) value.owner = data.owner;
      if (data.admins) value.admins = data.admins;
      if (data.createdAt) value.createdAt = data.createdAt;
      if (data.updatedAt) value.updatedAt = data.updatedAt;
      if (data.updatedBy) value.updatedBy = data.updatedBy;
      if (data.createdBy) value.createdBy = data.createdBy;
      if (typeof data.isNewInvite === "boolean")
        value.isNewInvite = data.isNewInvite;
      return value;
    });
    return;
  };

  public updateUserRoleInTeam = async (
    teamId: string,
    userId: string,
    role: TeamRole,
  ): Promise<void> => {
    const team: TeamDocument = await RxDB.getInstance()
      .rxdb.team.findOne({
        selector: {
          teamId,
        },
      })
      .exec();

    team._data.users.forEach((user: userDetails) => {
      if (user.id === userId) {
        user.role = role;
        return;
      }
    });

    team.incrementalPatch({
      users: [...team.users],
    });
  };

  public removeUserFromTeam = async (
    teamId: string,
    userId: string,
  ): Promise<void> => {
    const team: TeamDocument = await RxDB.getInstance()
      .rxdb.team.findOne({
        selector: {
          teamId,
        },
      })
      .exec();
    const filteredUsers = team._data.users.filter((user: any) => {
      return user.id !== userId;
    });

    team.incrementalPatch({
      users: filteredUsers,
    });
  };

  public removeTeam = async (teamId: string) => {
    const team = await RxDB.getInstance()
      .rxdb.team.findOne({
        selector: {
          teamId: teamId,
        },
      })
      .exec();

    return await team.remove();
  };

  public removeWorkspaceFromTeam = async (
    teamId: string,
    workspaceId: string,
  ): Promise<void> => {
    const team: TeamDocument = await RxDB.getInstance()
      .rxdb.team.findOne({
        selector: {
          teamId,
        },
      })
      .exec();
    const filteredWorkspaces = team._data.workspaces.filter(
      (workspace: { workspaceId: string; name: string }) => {
        return workspace.workspaceId !== workspaceId;
      },
    );

    team.incrementalPatch({
      workspaces: filteredWorkspaces,
    });
    return;
  };

  public addWorkspaceInTeam = async (
    teamId: string,
    workspaceId: string,
    name: string,
  ): Promise<void> => {
    const team: TeamDocument = await RxDB.getInstance()
      .rxdb.team.findOne({
        selector: {
          teamId,
        },
      })
      .exec();
    if (team && team?.workspaces?.length > 0) {
      team.incrementalPatch({
        workspaces: [...team.workspaces, { workspaceId, name }],
      });
    } else if (team) {
      team.incrementalPatch({
        workspaces: [{ workspaceId, name }],
      });
    }
    return;
  };
}
