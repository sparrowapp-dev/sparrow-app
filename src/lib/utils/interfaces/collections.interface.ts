import type { CollectionDocument } from "$lib/database/app.database";
import type { Observable } from "rxjs";
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
  getCollectionList: () => any;
  getActiveWorkspace: () => Observable<any>;
  addRequestInFolder: (collectionId: string, folderId: string, request) => void;
  updateRequestInFolder: (
    collectionId: string,
    folderId: string,
    uuid: string,
    request,
  ) => void;
}
