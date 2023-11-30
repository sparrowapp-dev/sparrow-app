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

  // public updateCollection = async (
  //   collectionId,
  // ): Observable<CollectionDocument[]> => {};

  public deleteCollection = async (collectionId: string) => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();
    collection.remove();
  };

  public updateCollection = async (collectionId: string, name: string) => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();
    collection.incrementalPatch({
      name,
    });
  };

  public bulkInsertData = async (data: any): Promise<void> => {
    await rxdb.collection.bulkInsert(data);
  };

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

  public clearCollections = async (): Promise<any> => {
    return rxdb.collection.find().remove();
  };
  public addRequestInFolder = async (
    collectionId: string,
    folderId: string,
    request: any,
  ) => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();

    collection._data.items.map((item) => {
      if (item.id === folderId) {
        item.items.push(request);
        return;
      }
    });
    collection.incrementalPatch({
      items: [...collection.items],
    });
  };
}
