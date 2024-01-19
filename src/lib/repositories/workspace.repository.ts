/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type WorkspaceDocument } from "$lib/database/app.database";
import type { CollectionItem } from "$lib/utils/interfaces/collection.interface";

import type { Observable } from "rxjs";

export class WorkspaceRepository {
  constructor() {}
  /**
   * extracts RxDocument of workspace.
   */
  public getDocument = (elem: WorkspaceDocument) => {
    return elem.toMutableJSON();
  };

  /**
   * get all workspaces observable of user.
   */
  public getWorkspaces = (): Observable<WorkspaceDocument[]> => {
    return RxDB.getInstance().rxdb.workspace.find().$;
  };

  /**
   * get filtered workspaces
   */
  public getFilteredWorkspaces = (
    team: any,
  ): Observable<WorkspaceDocument[]> => {
    return RxDB.getInstance().rxdb.workspace.find({
      selector: {
        team: team,
      },
    }).$;
  };

  /**
   * get active workspace of the user.
   */
  public getActiveWorkspace = (): Observable<WorkspaceDocument> => {
    return RxDB.getInstance().rxdb.workspace.findOne({
      selector: {
        isActiveWorkspace: true,
      },
    }).$;
  };

  /**
   * Check active Workspace
   */
  public checkActiveWorkspace = async (
    workspaceId: string,
  ): Promise<boolean> => {
    const workspace = await RxDB.getInstance()
      .rxdb.team.findOne({
        selector: {
          _id: workspaceId,
          isActiveWorkspace: true,
        },
      })
      .exec();
    return workspace ? true : false;
  };

  public updateCollectionInWorkspace = async (
    workspaceId: string,
    collectionObj,
  ) => {
    const workspace = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();

    workspace.incrementalPatch({
      collections: [...workspace.collections, collectionObj],
    });
  };

  public updateEnvironmentInWorkspace = async (
    workspaceId: string,
    environmentObj,
  ) => {
    const workspace = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();
    workspace.incrementalPatch({
      environments: [...workspace.environments, environmentObj],
    });
  };

  public deleteCollectionInWorkspace = async (
    workspaceId: string,
    collectionId: string,
  ) => {
    const workspace = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();
    const updatedCollections = workspace._data.collections.filter(
      (element: CollectionItem) => {
        return element.id !== collectionId;
      },
    );
    workspace.incrementalPatch({
      collections: [...updatedCollections],
    });
  };

  public clearWorkspaces = async (): Promise<any> => {
    return RxDB.getInstance().rxdb.workspace.find().remove();
  };

  /**
   * Sets a workspace as active.
   */
  public setActiveWorkspace = async (workspaceId: string): Promise<void> => {
    const workspaces: WorkspaceDocument[] = await RxDB.getInstance()
      .rxdb.workspace.find()
      .exec();
    const data = workspaces.map((elem: WorkspaceDocument) => {
      const res = this.getDocument(elem);
      if (res._id === workspaceId) {
        res.isActiveWorkspace = true;
      } else {
        res.isActiveWorkspace = false;
      }
      return res;
    });
    await RxDB.getInstance().rxdb.workspace.bulkUpsert(data);
    return;
  };

  /**
   * Activate Initial Workspace
   */
  public activateInitialWorkspace = async (): Promise<string> => {
    const workspaces: WorkspaceDocument[] = await RxDB.getInstance()
      .rxdb.workspace.find()
      .exec();
    let teamId: string;
    const data = workspaces.map((elem: WorkspaceDocument, index) => {
      const res = this.getDocument(elem);
      if (index == 0) {
        res.isActiveWorkspace = true;
        teamId = res.team?.teamId;
      } else res.isActiveWorkspace = false;
      return res;
    });

    await RxDB.getInstance().rxdb.workspace.bulkUpsert(data);
    return teamId;
  };

  public setCurrentEnvironmentId = async (
    workspaceId: string,
    environmentId: string,
  ): Promise<void> => {
    const workspace: WorkspaceDocument = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();

    await workspace.patch({ currentEnvironmentId: environmentId });
  };

  public updateWorkspace = async (workspaceId: string, data) => {
    const workspace = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();
    workspace.incrementalModify((value) => {
      if (data.name) value.name = data.name;
      if (data.environmentId) value.environmentId = data.environmentId;
      if (data.updatedAt) value.updatedAt = data.updatedAt;
      if (data.updatedBy) value.updatedBy = data.updatedBy;
      if (data.createdBy) value.createdBy = data.createdBy;
      if (data.description) value.description = data.description;
      return value;
    });
  };

  public addWorkspace = async (workspace: any): Promise<void> => {
    await RxDB.getInstance().rxdb.workspace.insert(workspace);
    return;
  };

  /**
   * Sync | refresh data
   */
  public bulkInsertData = async (data: any): Promise<void> => {
    await this.clearWorkspaces();
    await RxDB.getInstance().rxdb.workspace.bulkInsert(data);
    return;
  };
}
