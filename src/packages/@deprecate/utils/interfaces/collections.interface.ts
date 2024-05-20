import type { CollectionDocument } from "@app/database/database";

import type {
  CreateApiRequestPostBody,
  CreateDirectoryPostBody,
  EnvironmentResponseDto,
  UpdateEnvironmentPostBody,
} from "../dto";
import type { Observable } from "rxjs";
import type { Collection } from "./request.interface";
export interface CollectionsMethods {
  handleActiveTab: (id: string) => void;
  handleRemoveTab: (id: string) => void;
  handleCreateTab: (data) => void;
  updateTab: (data, route: string, _id: string) => void;
  updateRequestProperty: (data, route: string, id?: string) => void;
  updateRequestState: (data, route: string, id?: string) => void;
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
  deleteCollection: (collectionId: string) => void;
  updateCollectionName: (collectionId: string, name: string) => void;
  updateFolderName: (
    collectionId: string,
    folderId: string,
    name: string,
  ) => void;
  deleteRequestOrFolderInCollection: (
    collectionId: string,
    deleteId: string,
  ) => void;
  getCollectionList: () => any;
  getActiveWorkspace: () => Observable<any>;
  addRequestInFolder: (collectionId: string, folderId: string, request) => void;
  updateRequestInFolder: (
    collectionId: string,
    folderId: string,
    uuid: string,
    request,
  ) => void;
  readRequestInFolder: (
    collectionId: string,
    folderId: string,
    uuid: string,
  ) => unknown;
  addRequestOrFolderInCollection: (collectionId: string, items) => void;
  updateRequestOrFolderInCollection: (
    collectionId: string,
    uuid: string,
    items: any,
  ) => void;
  readRequestOrFolderInCollection: (
    collectionId: string,
    uuid: string,
  ) => unknown;

  readCollection: (uuid: string) => unknown;
  getNoOfApisandFolders: (
    collection: CollectionDocument,
    folderId?: string,
  ) => Promise<Collection>;
  deleteRequestInFolder: (
    collectionId: string,
    folderId: string,
    requestId: string,
  ) => void;
  addCollection: (collection) => void;
  updateCollection: (uuid: string, data) => void;

  updateRequestInFolderCollection: (
    collectionId: string,
    uuid: string,
    item: any,
    folderId?: string,
  ) => void;

  deleteRequestInFolderCollection: (
    collectionId: string,
    uuid: string,
    folderId: string,
  ) => void;
  removeMultipleTabs: (ids: string[]) => void;
  setRequestSave: (data: boolean, route: string, id: string) => void;
  deleteCollectioninWorkspace: (
    collectionId: string,
    workspaceId: string,
  ) => void;

  initActiveEnvironmentToWorkspace: (
    workspaceId: string,
    environmentId: string,
  ) => void;
  currentEnvironment: (environmentId: string) => any;
  updateEnvironment: (
    workspaceId: string,
    environmentId: string,
    environment: UpdateEnvironmentPostBody,
  ) => Promise<EnvironmentResponseDto>;
  getGlobalEnvironment: () => any;
}
