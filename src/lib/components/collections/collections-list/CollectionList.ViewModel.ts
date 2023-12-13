/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionDocument } from "$lib/database/app.database";
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { CollectionService } from "$lib/services/collection.service";
import type {
  CreateApiRequestPostBody,
  CreateCollectionPostBody,
  CreateDirectoryPostBody,
} from "$lib/utils/dto";

export class CollectionListViewModel {
  private collectionRepository = new CollectionRepository();
  private collectionService = new CollectionService();
  constructor() {}

  public getCollectionDocument = (elem: CollectionDocument) => {
    return {
      _id: elem.get("_id"),
      name: elem.get("name"),
      totalRequests: elem.get("totalRequests"),
      items: elem.get("items"),
      createdBy: elem.get("createdBy"),
      createdAt: elem.get("createdAt"),
      updatedBy: elem.get("updatedBy"),
      updatedAt: elem.get("updatedAt"),
    };
  };
  public get collection() {
    return this.collectionRepository.getCollection();
  }

  //** Add Collection In Local DB */
  public createCollection = (collection: any) => {
    this.collectionRepository.addCollection(collection);
  };

  //** Add collection in Backend */
  public addCollection = async (collection: CreateCollectionPostBody) => {
    return await this.collectionService.addCollection(collection);
  };

  public addFolder = async (
    workspaceId: string,
    collectionId: string,
    folder: CreateDirectoryPostBody,
  ) => {
    return await this.collectionService.addFolderInCollection(
      workspaceId,
      collectionId,
      folder,
    );
  };

  public addRequest = async (requestData: CreateApiRequestPostBody) => {
    return await this.collectionService.addRequestInCollection(requestData);
  };
  public addRequestInFolderInCollection = async (
    requestData: CreateApiRequestPostBody,
  ) => {
    return await this.collectionService.addRequestInCollection(requestData);
  };

  //** Fetch All Collections From Backend */
  public getAllCollections = async (workspaceId: string) => {
    return await this.collectionService.fetchCollection(workspaceId);
  };

  public bulkInsert = (data: any) => {
    this.collectionRepository.bulkInsertData(data);
  };
}
