/* eslint-disable @typescript-eslint/no-explicit-any */
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { CollectionService } from "$lib/services/collection.service";
import type { CreateApiRequestPostBody } from "$lib/utils/dto";

export class MyCollectionViewModel {
  private collectionRepository = new CollectionRepository();
  private collectionService = new CollectionService();
  constructor() {}

  public get collection() {
    return this.collectionRepository.getCollection();
  }

  public addRequest = async (requestData: CreateApiRequestPostBody) => {
    return await this.collectionService.addRequestInCollection(requestData);
  };

  public addRequestInFolderInCollection = async (
    requestData: CreateApiRequestPostBody,
  ) => {
    return await this.collectionService.addRequestInCollection(requestData);
  };

  public bulkInsert = (data: any) => {
    this.collectionRepository.bulkInsertData(data);
  };
}
