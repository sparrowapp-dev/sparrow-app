/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type WorkspaceDocument } from "$lib/database/app.database";

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
   * get active workspace of the user.
   */
  public getActiveWorkspace = (): Observable<WorkspaceDocument> => {
    return RxDB.getInstance().rxdb.workspace.findOne({
      selector: {
        isActiveWorkspace: true,
      },
    }).$;
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

  public updateWorkspace = async (workspaceId: string, name: string) => {
    const workspace = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();

    workspace.incrementalModify((value) => {
      value.name = name;
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
