/* eslint-disable @typescript-eslint/no-explicit-any */
import { rxdb, type CollectionDocument } from "$lib/database/app.database";
import type { Observable } from "rxjs";
export class CollectionRepository {
  constructor() {}

  public addCollection = async (collection: any) => {
    await rxdb.collection.insert(collection);
    return;
  };
  public getCollection = (): Observable<CollectionDocument[]> => {
    return rxdb.collection.find().$;
  };

  public bulkInsertData = async (data: any): Promise<void> => {
    await rxdb.collection.bulkInsert(data);
  };

  /**
   * @description
   * Creates an API request or folder within a collection.
   */
  public addRequestOrFolderInCollection = async (
    collectionId: string,
    items: any,
  ) => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();
    collection.incrementalPatch({
      items: [...collection.items, items],
    });
  };

  /**
   * @description
   * Updates an API request or folder within a collection.
   */
  public updateRequestOrFolderInCollection = async (
    collectionId: string,
    uuid: string,
    items: any,
  ) => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();
    const updatedItems = collection.toJSON().items.map((element) => {
      if (element.id === uuid) {
        element = items;
      }
      return element;
    });
    collection.incrementalModify((value) => {
      value.items = [...updatedItems];
      return value;
    });
  };

  /**
   * @description
   * Creates an API request within a folder.
   */
  public addRequestInFolder = async (
    collectionId: string,
    folderId: string,
    request: any,
  ): Promise<void> => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();
    const updatedItems = collection.toJSON().items.map((element) => {
      if (element.id === folderId) {
        element.items.push(request);
      }
      return element;
    });
    collection.incrementalModify((value) => {
      value.items = [...updatedItems];
      return value;
    });
  };

  /**
   * @description
   * Updates an API request within a folder.
   */
  public updateRequestInFolder = async (
    collectionId: string,
    folderId: string,
    uuid: string,
    request,
  ) => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();
    const updatedItems = collection.toJSON().items.map((element) => {
      if (element.id === folderId) {
        for (let i = 0; i < element.items.length; i++) {
          if (element.items[i].id === uuid) {
            element.items[i] = request;
          }
        }
      }
      return element;
    });
    collection.incrementalModify((value) => {
      value.items = [...updatedItems];
      return value;
    });
  };

  public clearCollections = async (): Promise<any> => {
    return rxdb.collection.find().remove();
  };
}
