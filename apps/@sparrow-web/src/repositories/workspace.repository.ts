/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type WorkspaceDocument } from "../database/database";
import type { addUsersInWorkspace } from "@sparrow/common/dto/workspace-dto";
import type { WorkspaceRole } from "@sparrow/common/enums";
import type { CollectionItem } from "@sparrow/common/interfaces/collection.interface";
import type { Observable } from "rxjs";
import { CollectionRepository } from "./collection.repository";
import { EnvironmentRepository } from "./environment.repository";
import { TabRepository } from "./tab.repository";

export class WorkspaceRepository {
  constructor() {}
  private collectionRepository = new CollectionRepository();
  private environmentRepository = new EnvironmentRepository();
  private tabRepository = new TabRepository();
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

  public getWorkspacesDocs = (): WorkspaceDocument[] => {
    return RxDB.getInstance().rxdb.workspace.find().exec();
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
   * get active workspace of the user.
   */
  public getActiveWorkspaceDoc = (): WorkspaceDocument => {
    return RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          isActiveWorkspace: true,
        },
      })
      .exec();
  };

  /**
   * Check active Workspace
   */
  public checkActiveWorkspace = async (
    workspaceId: string,
  ): Promise<boolean> => {
    const workspace = await RxDB.getInstance()
      .rxdb.workspace.findOne({
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
    if (
      typeof workspace.collection !== "undefined" &&
      Symbol.iterator in Object(workspace.collection)
    ) {
      // If it's iterable, create a new array by spreading the existing elements and adding collectionObj
      workspace?.incrementalPatch({
        collections: [...workspace.collection, collectionObj],
      });
    } else {
      // If it's not iterable, create a new array with collectionObj
      workspace?.incrementalPatch({
        collections: [collectionObj],
      });
    }
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
    const workspaces: WorkspaceDocument = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          isActiveWorkspace: true,
        },
      })
      .exec();
    await workspaces?.incrementalModify((value) => {
      value.isActiveWorkspace = false;
      return value;
    });
    const inactiveWorkspace: WorkspaceDocument = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();
    await inactiveWorkspace.incrementalModify((value) => {
      value.isActiveWorkspace = true;
      return value;
    });
    return;
  };

  /**
   * remove workspaces by teamId
   */
  public findWorkspaceByTeamId = async (teamId: string): Promise<any> => {
    const workspaces = await RxDB.getInstance().rxdb.workspace.find({
      selector: {
        "team.teamId": teamId,
      },
    });
    return await workspaces.exec();
  };

  /**
   * Activate Initial Workspace
   */
  public activateInitialWorkspace = async (): Promise<string> => {
    const workspace: WorkspaceDocument = await RxDB.getInstance()
      .rxdb.workspace.findOne()
      .exec();
    if (workspace) {
      const rxDoc = workspace.toMutableJSON();
      rxDoc.isActiveWorkspace = true;
      const teamId = rxDoc.team.teamId;
      await RxDB.getInstance().rxdb.workspace.upsert(rxDoc);
      return teamId;
    } else {
      return "";
    }
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
      if (data?._id) value._id = data._id;
      if (data?.name) value.name = data.name;
      if (data?.description !== null && data?.description !== undefined)
        value.description = data.description;
      if (data?.team) value.team = data.team;
      if (data?.environmentId) value.environmentId = data.environmentId;
      if (data?.users) value.users = data.users;
      if (data?.updatedAt) value.updatedAt = data.updatedAt;
      if (data?.updatedBy) value.updatedBy = data.updatedBy;
      if (data?.createdBy) value.createdBy = data.createdBy;
      if (typeof data?.isNewInvite === "boolean")
        value.isNewInvite = data.isNewInvite;
      return value;
    });
  };

  public addWorkspace = async (workspace: any): Promise<void> => {
    await RxDB.getInstance().rxdb.workspace.insert(workspace);
    return;
  };

  public readWorkspace = async (uuid: string): Promise<WorkspaceDocument> => {
    return await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: uuid,
        },
      })
      .exec();
  };

  /**
   * Sync | refresh data
   */
  public bulkInsertData = async (data: any): Promise<void> => {
    const workspaces = await this.getWorkspacesDocs();
    const idToEnvironmentMap = {};
    workspaces.forEach((element) => {
      idToEnvironmentMap[element._id] = element?.environmentId ?? "";
    });

    const revisedWorkspaces = data.map((workspaceObj) => {
      const workspaceCopy = workspaceObj;
      workspaceCopy["environmentId"] =
        idToEnvironmentMap[workspaceCopy._id] ?? "";
      return workspaceCopy;
    });

    await RxDB.getInstance().rxdb.workspace.bulkUpsert(revisedWorkspaces);
    return;
  };

  public updateUserRoleInWorkspace = async (
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<void> => {
    const workspace = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();
    workspace._data.users.forEach((user) => {
      if (user.id === userId) {
        user.role = role;
        return;
      }
    });

    workspace.incrementalPatch({
      users: [...workspace.users],
    });
  };

  public deleteWorkspace = async (workspaceId: string): Promise<any> => {
    const workspace = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();
    return await workspace.remove();
  };
  public addUserInWorkspace = async (
    workspaceId: string,
    addUsersInWorkspaceDto: addUsersInWorkspace[],
  ): Promise<void> => {
    const workspace: WorkspaceDocument = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();

    workspace.incrementalPatch({
      users: addUsersInWorkspaceDto,
    });
  };

  public isUserInMultipleWorkspaces = async (
    userId: string,
  ): Promise<boolean> => {
    const workspaces: WorkspaceDocument[] = await RxDB.getInstance()
      .rxdb.workspace.find()
      .exec();
    let userExistinWorkspacesCount = 0;
    let isUserExistsinMutlpleWorkspaces = false;
    workspaces.forEach((workspace) => {
      workspace._data.users.forEach((user) => {
        if (user.id === userId) {
          userExistinWorkspacesCount += 1;
          return;
        }
      });
      if (userExistinWorkspacesCount === 2) {
        isUserExistsinMutlpleWorkspaces = true;
        return;
      }
    });
    return isUserExistsinMutlpleWorkspaces;
  };

  public removeUserFromWorkspace = async (
    workspaceId: string,
    userId: string,
  ): Promise<void> => {
    const workspace: WorkspaceDocument = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          _id: workspaceId,
        },
      })
      .exec();
    const filteredUsers = workspace._data.users.filter((user: any) => {
      return user.id !== userId;
    });

    workspace.incrementalPatch({
      users: filteredUsers,
    });
  };
}
