import type { CollectionDocument } from "$lib/database/app.database";

import type {
  CreateApiRequestPostBody,
  CreateCollectionPostBody,
  CreateDirectoryPostBody,
} from "../dto";
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CollectionsMethods {
  handleActiveTab: (id: string) => void;
  handleRemoveTab: (id: string) => void;
  handleCreateTab: (data) => void;
  updateTab: (data, route: string) => void;
  updateRequestProperty: (data, route: string) => void;
  updateRequestState: (data, route: string) => void;
  updateRequestAuth: (data, route: string) => void;
  updateRequestBody: (data, route: string) => void;
  updateRequestBodyFormData: (data, route: string) => void;
  getCollectionDocument: (data: CollectionDocument) => any;
  createCollection: (data: any) => void;
  bulkInsert: (data: any) => any;
  getAllCollections: (workspaceId: string) => any;
  addRequestaddFolder: (requestData: CreateApiRequestPostBody) => any;
  addFolder: (
    workspaceId: string,
    collectionId: string,
    folder: CreateDirectoryPostBody,
  ) => any;
  addCollection: (collection: CreateCollectionPostBody) => any;
  deleteCollectionData: (collectionId: string) => void;
  updateCollectionName: (collectionId: string, name: string) => void;
  updateFolderName: (
    collectionId: string,
    folderId: string,
    name: string,
  ) => void;
  deleteFolder: (collectionId: string, folderId: string) => void;
  updateRequestName: (
    requestId: string,
    collectionId: string,
    folderId: string,
    name: string,
  ) => void;
}
