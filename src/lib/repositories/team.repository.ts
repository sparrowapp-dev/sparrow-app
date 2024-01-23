import { RxDB, type TeamDocument } from "$lib/database/app.database";
import type { Observable } from "rxjs";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TeamRepository {
  constructor() {}
  /**
   * extracts RxDocument of Team.
   */
  public getDocument = (elem: TeamDocument) => {
    return elem.toMutableJSON();
  };

  /**
   * get all teams observable of user
   */
  public getTeams = (): Observable<TeamDocument[]> => {
    return RxDB.getInstance().rxdb.team.find().$;
  };

  /**
   * get all teams
   */
  public checkActiveTeam = async (teamId: string): Promise<boolean> => {
    const team = await RxDB.getInstance()
      .rxdb.team.findOne({
        selector: {
          teamId: teamId,
          isActiveTeam: true,
        },
      })
      .exec();
    return team ? true : false;
  };
  /**
   * clear teams data
   */
  public clearTeams = async (): Promise<any> => {
    return RxDB.getInstance().rxdb.team.find().remove();
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
    await this.clearTeams();
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
      if (data.name) value.name = data.name;
      if (data.description) value.description = data.description;
      if (data.workspaces) value.workspaces = data.workspaces;
      if (data.logo) value.logo = data.logo;
      if (data.users) value.users = data.users;
      if (data.owner) value.owner = data.owner;
      if (data.admins) value.admins = data.admins;
      if (data.createdAt) value.createdAt = data.createdAt;
      if (data.updatedAt) value.updatedAt = data.updatedAt;
      if (data.updatedBy) value.updatedBy = data.updatedBy;
      if (data.createdBy) value.createdBy = data.createdBy;
      return value;
    });
    return;
  };
}
