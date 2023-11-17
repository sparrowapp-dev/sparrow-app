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
  unsetActiveWorkspace: (id: string) => Promise<void>;
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
    const response: WorkspaceDocument = await this.findOne({
      selector: {
        _id: workspaceId,
      },
    }).exec();
    if (response) {
      await response.update({ $set: { isActiveWorkspace: true } });
    }
  },

  /*
   *  Sets a workspace as inactive.
   */
  unsetActiveWorkspace: async function (
    this: WorkspaceCollection,
    workspaceId: string,
  ): Promise<void> {
    const response: WorkspaceDocument = await this.findOne({
      selector: {
        _id: workspaceId,
      },
    }).exec();
    if (response) {
      await response.update({ $set: { isActiveWorkspace: false } });
    }
  },
};

export { workspaceCollectionMethods, workspaceDocMethods };
