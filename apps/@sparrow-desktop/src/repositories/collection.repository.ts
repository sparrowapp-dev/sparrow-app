/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type CollectionDocument } from "../database/database";
import { ItemType } from "@sparrow/common/enums/item-type.enum";
import { createDeepCopy } from "@sparrow/common/utils/conversion.helper";
import type { Observable } from "rxjs";
import type { CollectionItemsDto } from "@sparrow/common/types/workspace";
export class CollectionRepository {
  constructor() {}

  /**
   * @description
   * Adds a new collection to workspace.
   */
  public addCollection = async (collection: any) => {
    await RxDB.getInstance().rxdb.collection.insert(collection);
    return;
  };
  /**
   * @description
   * updates existing collection to workspace.
   */
  public updateCollection = async (uuid: string, data) => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: uuid,
        },
      })
      .exec();

    await collection?.incrementalModify((value) => {
      if (data.name) value.name = data.name;
      if (data._id) value.id = data._id;
      if (data.updatedAt) value.updatedAt = data.updatedAt;
      if (data.description !== undefined && data.description !== null)
        value.description = data.description;
      if (data.updatedBy) value.updatedBy = data.updatedBy;
      if (data.totalRequests) value.totalRequests = data.totalRequests;
      if (data.activeSyncUrl) value.activeSyncUrl = data.activeSyncUrl;
      if (data.activeSync) value.activeSync = data.activeSync;
      if (data.createdBy) value.createdBy = data.createdBy;
      if (data.items) value.items = data.items;
      if (data.branches) value.branches = data.branches;
      if (data.primaryBranch) value.primaryBranch = data.primaryBranch;
      if (data.currentBranch) value.currentBranch = data.currentBranch;
      if (data.localRepositoryPath)
        value.localRepositoryPath = data.localRepositoryPath;
      return value;
    });

    return;
  };

  public readCollection = async (uuid: string): Promise<CollectionDocument> => {
    return await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: uuid,
        },
      })
      .exec();
  };

  public getCollection = (): Observable<CollectionDocument[]> => {
    return RxDB.getInstance().rxdb.collection.find().sort({ createdAt: "asc" })
      .$;
  };

  // public updateCollection = async (
  //   collectionId,
  // ): Observable<CollectionDocument[]> => {};

  public deleteCollection = async (collectionId: string) => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
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
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
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
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
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

  public async bulkInsertData(
    _workspaceId: string,
    _collections: any[],
  ): Promise<void> {
    const existingCollections = await RxDB.getInstance()
      ?.rxdb?.collection.find({
        selector: {
          workspaceId: _workspaceId,
        },
      })
      .exec();

    // Extract relevant information from the existing collections
    const idToBranchMap = {};
    existingCollections?.forEach((_existingCollection) => {
      // Store either currentBranch or primaryBranch for each id
      idToBranchMap[_existingCollection.id] = _existingCollection?.currentBranch
        ? _existingCollection.currentBranch
        : _existingCollection?.primaryBranch;
    });

    if (_collections?.length > 0) {
      const rxDbCollections = _collections.map((_collection) => {
        // If activeSync is enabled, set currentBranch based on idToBranchMap
        if (_collection.activeSync) {
          _collection["currentBranch"] = idToBranchMap[_collection.id]
            ? idToBranchMap[_collection.id]
            : _collection.primaryBranch;
        }

        return _collection;
      });
      if ((rxDbCollections?.length || 0) > 0) {
        await RxDB.getInstance()?.rxdb?.collection.bulkUpsert(rxDbCollections);
      }
    }
  }

  /**
   * Deletes orphan collections that doesn't exists on sparrow backend
   * @param _workspaceId - workspace id
   * @param _collectionIds - backend collections Ids to find local orphan collections
   */
  public deleteOrphanCollections = async (
    _workspaceId: string,
    _collectionIds: string[],
  ): Promise<string[]> => {
    // delete left out collections
    const collections = await RxDB.getInstance()
      ?.rxdb?.collection.find({
        selector: {
          workspaceId: _workspaceId,
        },
      })
      .exec();
    const collectionsJSON = collections?.map((_collection) => {
      return _collection.toMutableJSON();
    });
    const selectedCollectionsToBeDeleted = collectionsJSON
      ?.filter((_collection) => {
        for (let i = 0; i < _collectionIds.length; i++) {
          if (_collectionIds[i] === _collection.id) {
            return false;
          }
        }
        return true;
      })
      .map((_collection) => {
        return _collection.id as string;
      }) as string[];
    if ((selectedCollectionsToBeDeleted?.length || 0) > 0) {
      await RxDB.getInstance()?.rxdb?.collection.bulkRemove(
        selectedCollectionsToBeDeleted as string[],
      );
    }
    return selectedCollectionsToBeDeleted;
  };

  /**
   * @description
   * Creates an API request or folder within a collection.
   */
  public addRequestOrFolderInCollection = async (
    collectionId: string,
    items: any,
  ) => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
        },
      })
      .exec();
    await collection.incrementalPatch({
      items: [...collection.items, items],
      totalRequests:
        items.type === ItemType.REQUEST
          ? collection.totalRequests + 1
          : collection.totalRequests,
    });
  };

  /**
   * remove collections by workspaceId
   */
  public removeCollections = async (_workspaceId: string): Promise<any> => {
    return await RxDB.getInstance()
      .rxdb.collection.find({
        selector: {
          workspaceId: _workspaceId,
        },
      })
      .remove();
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
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
        },
      })
      .exec();
    const updatedItems = collection.toJSON().items.map((element) => {
      if (element.id.toString() === uuid) {
        element = items;
      }
      return element;
    });
    await collection.incrementalModify((value) => {
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
  ): Promise<CollectionItemsDto | undefined> => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
        },
      })
      .exec();
    let response: CollectionItemsDto | undefined;
    collection?.toJSON().items.forEach((element: CollectionItemsDto) => {
      if (element.id === uuid) {
        response = element;
        return;
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
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
        },
      })
      .exec();
    const items = createDeepCopy(collection.items);
    const updatedItems = items.map((element) => {
      if (element.id === folderId) {
        element.items.push(request);
      }
      return element;
    });
    await collection.incrementalModify((value) => {
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
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
        },
      })
      .exec();
    const items = createDeepCopy(collection.items);
    const updatedItems = items.map((element) => {
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
  ): Promise<CollectionItemsDto | undefined> => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
        },
      })
      .exec();
    let response: CollectionItemsDto | undefined;
    collection.toJSON().items.forEach((element) => {
      if (element.id === folderId) {
        for (let i = 0; i < element.items.length; i++) {
          if (element.items[i].id === uuid) {
            response = element.items[i];
            break;
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
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
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
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
        },
      })
      .exec();

    // const updatedItems = collection.toJSON().items.filter((element) => {
    //   if (element.id !== requestId) {
    //     return element;
    //   }
    // });

    const items = createDeepCopy(collection.items);
    const updatedItems = items.map((element) => {
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
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
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
    return RxDB.getInstance().rxdb.collection.find().remove();
  };
}
