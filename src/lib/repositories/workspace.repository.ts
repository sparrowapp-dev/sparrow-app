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
    return {
      _id: elem.get("_id"),
      name: elem.get("name"),
      owner: elem.get("owner"),
      permissions: elem.get("permissions"),
      isActiveWorkspace: elem.get("isActiveWorkspace"),
      createdBy: elem.get("createdBy"),
      createdAt: elem.get("createdAt"),
      collections: elem.get("collections"),
    };
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

  public updateWorkspace = async (
    workspaceId: string,
    name: string,
    description?: string,
  ) => {
    const workspace = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();
    workspace.incrementalModify((value) => {
      value.name = name;
      value.description = description;
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
