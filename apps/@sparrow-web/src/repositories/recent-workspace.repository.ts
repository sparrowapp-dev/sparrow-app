/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type RecentWorkspaceDocument } from "../database/database";
import type { Observable } from "rxjs";

export class RecentWorkspaceRepository {
  constructor() {}
  /**
   * extracts RxDocument of workspace.
   */
  public getDocument = (elem: RecentWorkspaceDocument) => {
    return elem.toMutableJSON();
  };

  /**
   * get all workspaces observable of user.
   */
  public getRecentWorkspacesObservable = (): Observable<
    RecentWorkspaceDocument[]
  > => {
    return RxDB.getInstance().rxdb?.recentworkspace.find().$;
  };

  public getRecentWorkspacesDocs = (): RecentWorkspaceDocument[] => {
    return RxDB.getInstance().rxdb.recentworkspace.find().exec();
  };

  /**
   * Get only public workspaces (workspaceType === 'PUBLIC')
   */
  public getPublicWorkspacesDocs = (): Observable<
    RecentWorkspaceDocument[]
  > => {
    return RxDB.getInstance().rxdb.recentworkspace.find({
      selector: {
        workspaceType: "PUBLIC",
      },
    }).$;
  };

  /**
   * get filtered workspaces
   */
  public getFilteredWorkspaces = (
    team: any,
  ): Observable<RecentWorkspaceDocument[]> => {
    return RxDB.getInstance().rxdb.recentworkspace.find({
      selector: {
        team: team,
      },
    }).$;
  };

  /**
   * get active workspace of the user.
   */
  public getActiveWorkspace = (): Observable<RecentWorkspaceDocument> => {
    return RxDB.getInstance().rxdb?.recentworkspace.findOne({
      selector: {
        isActiveWorkspace: true,
      },
    }).$;
  };

  public clearWorkspaces = async (): Promise<any> => {
    return RxDB.getInstance().rxdb.recentworkspace.find().remove();
  };

  /**
   * remove workspaces by teamId
   */
  public findWorkspaceByTeamId = async (teamId: string): Promise<any> => {
    const workspaces = await RxDB.getInstance().rxdb.recentworkspace.find({
      selector: {
        "team.teamId": teamId,
      },
    });
    return await workspaces.exec();
  };

  public updateWorkspace = async (workspaceId: string, data) => {
    const workspace = await RxDB.getInstance()
      .rxdb.recentworkspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();
    workspace.incrementalModify((value) => {
      if (data?._id) value._id = data._id;
      if (data?.name) value.name = data.name;
      if (data?.description !== null && data?.description !== undefined)
        value.description = data.description;
      if (data?.workspaceType) value.workspaceType = data.workspaceType;
      if (data?.team) value.team = data.team;
      if (data?.lastVisited) value.lastVisited = data.lastVisited;
      if (data?.updatedAt) value.updatedAt = data.updatedAt;
      if (data?.updatedBy) value.updatedBy = data.updatedBy;
      if (data?.createdBy) value.createdBy = data.createdBy;
      return value;
    });
  };

  public addRecentWorkspace = async (workspace: any): Promise<void> => {
    await RxDB.getInstance().rxdb?.recentworkspace.insert(workspace);
    return;
  };

  public readWorkspace = async (
    uuid: string,
  ): Promise<RecentWorkspaceDocument> => {
    return await RxDB.getInstance()
      .rxdb.recentworkspace.findOne({
        selector: {
          _id: uuid,
        },
      })
      .exec();
  };

  public deleteWorkspace = async (workspaceId: string): Promise<any> => {
    const workspace = await RxDB.getInstance()
      .rxdb.recentworkspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();
    return await workspace.remove();
  };

  /**
   * Get the 10 most recently visited public workspaces
   * @param limit Maximum number of workspaces to return (defaults to 10)
   * @returns Promise containing array of RecentWorkspaceDocument sorted by lastVisited (most recent first)
   */
  public getRecentPublicWorkspaces = (
    limit: number = 10,
  ): Observable<RecentWorkspaceDocument[]> => {
    return RxDB.getInstance().rxdb?.recentworkspace.find({
      selector: {
        workspaceType: "PUBLIC",
      },
      sort: [{ lastVisited: "desc" }],
      limit: limit,
    }).$;
  };

  public getRecentVisitedWorkspaces = (): Observable<
    RecentWorkspaceDocument[]
  > => {
    return RxDB.getInstance().rxdb.recentworkspace.find({
      sort: [{ lastVisited: "desc" }],
    }).$;
  };
}
