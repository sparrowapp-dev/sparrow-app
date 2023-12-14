/* eslint-disable @typescript-eslint/no-explicit-any */
import { rxdb, type CollectionDocument } from "$lib/database/app.database";
import { ItemType } from "$lib/utils/enums/item-type.enum";
import type { Observable } from "rxjs";
export class CollectionRepository {
  constructor() {}

  /**
   * @description
   * Adds a new collection to workspace.
   */
  public addCollection = async (collection: any) => {
    await rxdb.collection.insert(collection);
    return;
  };
  /**
   * @description
   * updates existing collection to workspace.
   */
  public updateCollection = async (uuid: string, data) => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: uuid,
        },
      })
      .exec();

    collection.incrementalModify((value) => {
      if (data.name) value.name = data.name;
      if (data._id) value._id = data._id;
      if (data.updatedAt) value.updatedAt = data.updatedAt;
      if (data.updatedBy) value.updatedBy = data.updatedBy;
      if (data.totalRequests) value.totalRequests = data.totalRequests;
      if (data.createdAt) value.createdAt = data.createdAt;
      if (data.createdBy) value.createdBy = data.createdBy;
      if (data.items) value.items = data.items;
      return value;
    });

    return;
  };

  public readCollection = async (uuid: string): Promise<unknown> => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: uuid,
        },
      })
      .exec();

    const response = collection;
    return response;
  };

  public getCollection = (): Observable<CollectionDocument[]> => {
    return rxdb.collection.find().sort({ createdAt: "asc" }).$;
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

  public updateFolderName = async (
    collectionId: string,
    folderId: string,
    name: string,
  ) => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();
    collection._data.items.map((item) => {
      if (item.id === folderId && item.type === ItemType.FOLDER) {
        item.name = name;
      }
    });

    collection.incrementalPatch({
      items: [...collection.items],
    });
  };

  public deleteRequestOrFolderInCollection = async (
    collectionId: string,
    deleteId: string,
  ) => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();
    const updatedItems = collection.toJSON().items.filter((element) => {
      if (element.id !== deleteId) {
        return true;
      }
      return false;
    });
    collection.incrementalModify((value) => {
      value.items = [...updatedItems];
      return value;
    });
  };

  public bulkInsertData = async (data: any): Promise<void> => {
    await rxdb.collection.find().remove();
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
   * Updates an API request or folder within a collection.
   */
  public readRequestOrFolderInCollection = async (
    collectionId: string,
    uuid: string,
  ): Promise<unknown> => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();
    let response;
    collection.toJSON().items.forEach((element) => {
      if (element.id === uuid) {
        response = element;
      }
    });
    return response;
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
            break;
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

  /**
   * @description
   * Read an API request within a folder.
   */
  public readRequestInFolder = async (
    collectionId: string,
    folderId: string,
    uuid: string,
  ): Promise<unknown> => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();
    let response;
    collection.toJSON().items.forEach((element) => {
      if (element.id === folderId) {
        for (let i = 0; i < element.items.length; i++) {
          if (element.items[i].id === uuid) {
            response = element.items[i];
          }
        }
      }
    });
    return response;
  };

  public updateRequestInFolderCollection = async (
    collectionId: string,
    uuid: string,
    item: any,
    folderId?: string,
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
          if (
            element.items[i].id === uuid &&
            element.items[i].type === ItemType.REQUEST
          ) {
            element.items[i] = item;
            break;
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

  public deleteRequestInFolder = async (
    collectionId: string,
    folderId: string,
    requestId: string,
  ) => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();

    // const updatedItems = collection.toJSON().items.filter((element) => {
    //   if (element.id !== requestId) {
    //     return element;
    //   }
    // });

    const updatedItems = collection.toJSON().items.map((element) => {
      if (element.id === folderId) {
        const deletedElement = element.items.filter((e) => {
          if (e.id !== requestId) {
            return true;
          } else {
            return false;
          }
        });
        element.items = deletedElement;
      }
      return element;
    });

    collection.incrementalModify((value) => {
      value.items = [...updatedItems];
      return value;
    });
  };

  public deleteRequestInFolderCollection = async (
    collectionId: string,
    uuid: string,
    folderId: string,
  ) => {
    const collection = await rxdb.collection
      .findOne({
        selector: {
          _id: collectionId,
        },
      })
      .exec();

    const updatedItems = collection._data.items.map((element) => {
      if (element.id === folderId) {
        const filteredItems = element.items.filter((item) => item.id !== uuid);

        return {
          ...element,
          items: filteredItems,
        };
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
