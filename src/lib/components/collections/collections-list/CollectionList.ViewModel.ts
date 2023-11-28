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
    const response = await this.collectionService.addCollection(collection);
    if (response.isSuccessful && response.data.data) {
      const collections = response.data.data;
      this.createCollection(collections);
      return;
    }
  };

  public addFolder = async (
    workspaceId: string,
    collectionId: string,
    folder: CreateDirectoryPostBody,
  ) => {
    const response = await this.collectionService.addFolderInCollection(
      workspaceId,
      collectionId,
      folder,
    );
    if (response.isSuccessful && response.data.data) {
      const collections = response.data.data;
      this.collectionRepository.addRequestOrFolderInCollection(
        collectionId,
        collections,
      );
      return;
    }
  };

  public addRequest = async (requestData: CreateApiRequestPostBody) => {
    const response =
      await this.collectionService.addRequestInCollection(requestData);
    if (response.isSuccessful && response.data.data) {
      const collections = response.data.data;
      this.collectionRepository.addRequestOrFolderInCollection(
        requestData.collectionId,
        collections,
      );
      return;
    }
  };
  public addRequestInFolderInCollection = async (
    requestData: CreateApiRequestPostBody,
  ) => {
    const response =
      await this.collectionService.addRequestInCollection(requestData);
    if (response.isSuccessful && response.data.data) {
      const request = response.data.data;
      this.collectionRepository.addRequestInFolder(
        requestData.collectionId,
        requestData.folderId,
        request,
      );
      return;
    }
  };

  //** Fetch All Collections From Backend */
  public getAllCollections = async (workspaceId: string) => {
    return await this.collectionService.fetchCollection(workspaceId);
  };

  public bulkInsert = (data: any) => {
    this.collectionRepository.bulkInsertData(data);
  };
}
