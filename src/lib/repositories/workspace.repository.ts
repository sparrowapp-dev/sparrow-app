import type {
  WorkspaceCollection,
  WorkspaceDocument,
} from "$lib/database/app.database";

// static ORM-method for the RxDocument
/* eslint-disable @typescript-eslint/no-explicit-any */
export type WorkspaceDocMethods = {
  getDocument: () => any;
};

// static ORM-method for the RxCollection
export type WorkspaceCollectionMethods = {
  setActiveWorkspace: (id: string) => Promise<void>;
  bulkInsertData: (data: any) => Promise<void>;
};

const workspaceDocMethods: WorkspaceDocMethods = {
  /**
   * Prints this RxDocument.
   */
  getDocument: function (this: WorkspaceDocument) {
    return {
      _id: this._id,
      name: this.name,
      owner: this.owner,
      permissions: this.permissions,
      isActiveWorkspace: this.isActiveWorkspace,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
    };
  },
};

const workspaceCollectionMethods: WorkspaceCollectionMethods = {
  /**
   * Sets a workspace as active.
   */
  setActiveWorkspace: async function (
    this: WorkspaceCollection,
    workspaceId: string,
  ): Promise<void> {
    const workspaces: WorkspaceDocument[] = await this.find().exec();
    const data = workspaces.map((elem: WorkspaceDocument) => {
      const res = elem.getDocument();
      if (res._id === workspaceId) {
        res.isActiveWorkspace = true;
      } else {
        res.isActiveWorkspace = false;
      }
      return res;
    });
    await this.bulkUpsert(data);
    return;
  },

  /**
   * Sync | refresh data
   */
  bulkInsertData: async function (
    this: WorkspaceCollection,
    data: any,
  ): Promise<void> {
    await this.bulkInsert(data);
    return;
  },
};

export { workspaceCollectionMethods, workspaceDocMethods };
