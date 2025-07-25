/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type CollectionDocument } from "../database/database";
import { ItemType } from "@sparrow/common/enums/item-type.enum";
import { createDeepCopy } from "@sparrow/common/utils/conversion.helper";
import type { Observable } from "rxjs";
import type { CollectionItemsDto } from "@sparrow/common/types/workspace";
import type { RxDocument } from "rxdb";
import * as Sentry from "@sentry/svelte";
import type { CollectionAuthProifleBaseInterface as AuthProfileDto} from "@sparrow/common/types/workspace/collection-base";
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
      if (data?.syncedAt) value.syncedAt = data.syncedAt;
      if (data.description !== undefined && data.description !== null)
        value.description = data.description;
      if (data.updatedBy) value.updatedBy = data.updatedBy;
      if (data.totalRequests) value.totalRequests = data.totalRequests;
      if (data.activeSyncUrl) value.activeSyncUrl = data.activeSyncUrl;
      if (data.activeSync) value.activeSync = data.activeSync;
      if (data.createdBy) value.createdBy = data.createdBy;
      if (data.items) value.items = data.items;
      if (data.selectedAuthType) value.selectedAuthType = data.selectedAuthType;
      if (data.auth) value.auth = data.auth;
      if (data.branches) value.branches = data.branches;
      if (data.primaryBranch) value.primaryBranch = data.primaryBranch;
      if (data.currentBranch) value.currentBranch = data.currentBranch;
      if (
        data?.isMockCollectionRunning === true ||
        data?.isMockCollectionRunning === false
      )
        value.isMockCollectionRunning = data.isMockCollectionRunning;
      if (data.localRepositoryPath)
        value.localRepositoryPath = data.localRepositoryPath;
      if (data.mockRequestHistory)
        value.mockRequestHistory = data.mockRequestHistory;
      if (data.authProfiles) value.authProfiles = data.authProfiles;
      if (data.defaultSelectedAuthProfile)
        value.defaultSelectedAuthProfile = data.defaultSelectedAuthProfile;
      return value;
    });

    return;
  };

  public readCollection = async (
    uuid: string,
  ): Promise<CollectionDocument | null | undefined> => {
    return await RxDB.getInstance()
      .rxdb?.collection?.findOne({
        selector: {
          id: uuid,
        },
      })
      .exec();
  };

  public subscribeCollection = (
    uuid: string,
  ): Observable<RxDocument<CollectionDocument>> => {
    return RxDB.getInstance().rxdb?.collection?.findOne({
      selector: {
        id: uuid,
      },
    }).$;
  };

  public getCollection = (): Observable<CollectionDocument[]> => {
    return RxDB.getInstance().rxdb.collection.find().sort({ createdAt: "asc" })
      .$;
  };

  public getCollectionDocs = (): CollectionDocument[] => {
    return RxDB.getInstance().rxdb?.collection.find().exec();
  };

  public getCollectionsByWorkspaceId = async (
    _workspaceId: string,
  ): Promise<CollectionDocument[]> => {
    return (
      (await RxDB.getInstance()
        .rxdb?.collection.find({
          selector: {
            workspaceId: _workspaceId,
          },
        })
        .exec()) || []
    );
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
        element = {
          ...element,
          ...items,
        };
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
   * Read an API request within a folder.
   */
  public readSavedRequestInCollection = async (
    collectionId: string,
    requestId: string,
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
      if (element.id === requestId) {
        for (let i = 0; i < element?.items?.length; i++) {
          if (element.items[i].id === uuid) {
            response = element.items[i];
            break;
          }
        }
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
        if (!element?.items) {
          element.items = [];
        }
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
   * Creates an API request within a folder.
   */
  public addSavedRequestInFolder = async (
    collectionId: string,
    folderId: string,
    requestId: string,
    savedRequest: any,
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
        element.items.map((request) => {
          if (request.id === requestId) {
            if (!request?.items) {
              request.items = [];
            }
            request.items.push(savedRequest);
          }
        });
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
   * Creates an API request within a folder.
   */
  public updateSavedRequestInFolder = async (
    collectionId: string,
    folderId: string,
    requestId: string,
    savedRequestId: string,
    savedRequest: any,
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
        element.items.map((request) => {
          if (request.id === requestId) {
            for (let i = 0; i < request.items.length; i++) {
              if (request.items[i].id === savedRequestId) {
                request.items[i] = {
                  ...request.items[i],
                  ...savedRequest,
                  requestResponse: {
                    ...(request.items[i].requestResponse || {}), // Preserve existing fields
                    ...(savedRequest?.requestResponse || {}), // Merge new data
                  },
                };
                break;
              }
            }
          }
        });
      }
      return element;
    });
    await collection.incrementalModify((value) => {
      value.items = [...updatedItems];
      return value;
    });
  };

  public updateMockResponseRatiosInCollection = async (
    collectionId: string,
    requestId: string,
    mockResponseRatios: Array<{
      mockResponseId: string;
      responseWeightRatio: number;
    }>,
  ): Promise<void> => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({ selector: { id: collectionId } })
      .exec();

    if (!collection) {
      console.error(`Collection not found: ${collectionId}`);
      return;
    }

    const items = createDeepCopy(collection.items);

    const updatedItems = items.map((request) => {
      if (request.id === requestId) {
        if (request.items && Array.isArray(request.items)) {
          // Update each response that matches an ID in the mockResponseRatios array
          request.items = request.items.map((item) => {
            const ratioUpdate = mockResponseRatios.find(
              (ratio) => ratio.mockResponseId === item.id,
            );
            if (ratioUpdate) {
              return {
                ...item,
                mockRequestResponse: {
                  ...(item.mockRequestResponse || {}),
                  responseWeightRatio: ratioUpdate.responseWeightRatio,
                },
              };
            }
            return item;
          });
        }
      }
      return request;
    });
    await collection.incrementalModify((value) => {
      value.items = [...updatedItems];
      return value;
    });
  };

  /**
   * Updates mock response ratios in a folder
   * @param collectionId - ID of the collection
   * @param folderId - ID of the folder
   * @param requestId - ID of the request
   * @param mockResponseRatios - Array of mockResponseId and responseWeightRatio pairs
   */
  public updateMockResponseRatiosInFolder = async (
    collectionId: string,
    folderId: string,
    requestId: string,
    mockResponseRatios: Array<{
      mockResponseId: string;
      responseWeightRatio: number;
    }>,
  ): Promise<void> => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({ selector: { id: collectionId } })
      .exec();

    if (!collection) {
      console.error(`Collection not found: ${collectionId}`);
      return;
    }

    const items = createDeepCopy(collection.items);
    const updatedItems = items.map((folder) => {
      if (folder.id === folderId) {
        if (folder.items && Array.isArray(folder.items)) {
          folder.items = folder.items.map((request) => {
            if (request.id === requestId) {
              if (request.items && Array.isArray(request.items)) {
                request.items = request.items.map((item) => {
                  const ratioUpdate = mockResponseRatios.find(
                    (ratio) => ratio.mockResponseId === item.id,
                  );

                  if (ratioUpdate) {
                    return {
                      ...item,
                      mockRequestResponse: {
                        ...(item.mockRequestResponse || {}),
                        responseWeightRatio: ratioUpdate.responseWeightRatio,
                      },
                    };
                  }

                  return item;
                });
              }
            }
            return request;
          });
        }
      }
      return folder;
    });

    await collection.incrementalModify((value) => {
      value.items = [...updatedItems];
      return value;
    });
  };

  // Updates a mock response inside a request at the collection root
  public updateMockResponseInCollection = async (
    collectionId: string,
    requestId: string,
    mockResponseId: string,
    updatedMockResponse: any,
  ): Promise<void> => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({ selector: { id: collectionId } })
      .exec();
    const items = createDeepCopy(collection.items);

    const updatedItems = items.map((request) => {
      if (request.id === requestId) {
        for (let i = 0; i < request.items.length; i++) {
          if (request.items[i].id === mockResponseId) {
            request.items[i] = {
              ...request.items[i],
              ...updatedMockResponse,
              mockRequestResponse: {
                ...(request.items[i].mockRequestResponse || {}),
                ...(updatedMockResponse?.mockRequestResponse || {}),
              },
            };
            break;
          }
        }
      }
      return request;
    });

    await collection.incrementalModify((value) => {
      value.items = [...updatedItems];
      return value;
    });
  };

  // Updates a mock response inside a request within a folder
  public updateMockResponseInFolder = async (
    collectionId: string,
    folderId: string,
    requestId: string,
    mockResponseId: string,
    updatedMockResponse: any,
  ): Promise<void> => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({ selector: { id: collectionId } })
      .exec();
    const items = createDeepCopy(collection.items);

    const updatedItems = items.map((folder) => {
      if (folder.id === folderId) {
        folder.items?.forEach((request) => {
          if (request.id === requestId) {
            for (let i = 0; i < request.items.length; i++) {
              if (request.items[i].id === mockResponseId) {
                request.items[i] = {
                  ...request.items[i],
                  ...updatedMockResponse,
                  mockRequestResponse: {
                    ...(request.items[i].mockRequestResponse || {}),
                    ...(updatedMockResponse?.mockRequestResponse || {}),
                  },
                };
                break;
              }
            }
          }
        });
      }
      return folder;
    });

    await collection.incrementalModify((value) => {
      value.items = [...updatedItems];
      return value;
    });
  };

  public deleteSavedRequestInFolder = async (
    collectionId: string,
    folderId: string,
    requestId: string,
    savedRequestId: string,
  ) => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
        },
      })
      .exec();

    const items = createDeepCopy(collection.items);
    const updatedItems = items.map((folder) => {
      if (folder.id === folderId) {
        folder.items = folder.items.map((request) => {
          if (request.id === requestId) {
            request.items = request.items.filter(
              (savedRequest) => savedRequest.id !== savedRequestId,
            );
          }
          return request;
        });
      }
      return folder;
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
  public updateSavedRequestInCollection = async (
    collectionId: string,
    requestId: string,
    savedRequestId: string,
    savedRequest: any,
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
      if (element.id === requestId) {
        for (let i = 0; i < element.items.length; i++) {
          if (element.items[i].id === savedRequestId) {
            element.items[i] = {
              ...element.items[i],
              ...savedRequest,
              requestResponse: {
                ...(element.items[i].requestResponse || {}), // Preserve existing fields
                ...(savedRequest?.requestResponse || {}), // Merge new data
              },
            };
            break;
          }
        }
      }
      return element;
    });
    await collection.incrementalModify((value) => {
      value.items = [...updatedItems];
      return value;
    });
  };

  public deleteSavedRequestInCollection = async (
    collectionId: string,
    requestId: string,
    savedRequestId: string,
  ) => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
        },
      })
      .exec();

    const items = createDeepCopy(collection.items);
    const updatedItems = items.map((request) => {
      if (request.id === requestId) {
        const deletedElement = request.items.filter((e) => {
          if (e.id !== savedRequestId) {
            return true;
          } else {
            return false;
          }
        });
        request.items = deletedElement;
      }
      return request;
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
  public addSavedRequestInCollection = async (
    collectionId: string,
    requestId: string,
    savedRequest: any,
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
      if (element.id === requestId) {
        if (!element?.items) {
          element.items = [];
        }
        element.items.push(savedRequest);
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
            element.items[i] = {
              ...element.items[i],
              ...request,
            };
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

  /**
   * @description
   * Read an API request within a folder.
   */
  public readSavedRequestInFolder = async (
    collectionId: string,
    folderId: string,
    requestId: string,
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
        element.items.forEach((request) => {
          if (request.id === requestId) {
            for (let i = 0; i < request?.items?.length; i++) {
              if (request.items[i].id === uuid) {
                response = request.items[i];
                break;
              }
            }
          }
        });
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

  /**
   * @description
   * Read an API request within a tab.
   */
  public readRequestInTab = async (tabId: string, requestId: string) => {
    const tabData = await RxDB.getInstance()
      .rxdb.tab.findOne({ selector: { tabId: tabId } })
      .exec();

    if (!tabData) return undefined;

    return tabData
      .toJSON()
      ?.property?.testflow?.nodes?.find(
        (element) => element.data.requestId === requestId,
      );
  };

  /**
   * @description
   * Check if an API request exists within a node.
   */
  public readRequestExistInNode = async (
    tabId: string,
    nodeId: string,
  ): Promise<boolean> => {
    const tabData = await RxDB.getInstance()
      .rxdb.tab.findOne({ selector: { tabId: tabId } })
      .exec();

    if (!tabData) return false;

    const nodeExists = tabData
      .toJSON()
      ?.property?.testflow?.nodes?.some(
        (element) =>
          element.id === nodeId && element?.data?.requestData?.url !== "",
      );

    return nodeExists;
  };

  /**
   * @description
   * Updates a block data.
   */
  public updateBlockData = async (
    tabId: string,
    nodeId: string,
    requestData: object,
  ): Promise<void> => {
    console.log("inside repo", tabId, nodeId, requestData);
    try {
      const tabData = await RxDB.getInstance()
        .rxdb.tab.findOne({ selector: { tabId } })
        .exec();

      if (!tabData) return;

      const tabJson = tabData.toJSON();
      const nodes = tabJson?.property?.testflow?.nodes ?? [];

      // Find the node and update the entire node object
      const updatedNodes = nodes.map((node) =>
        node.id === nodeId ? { ...node, ...requestData } : node,
      );

      // Update the database
      await tabData.patch({
        property: {
          ...tabJson.property,
          testflow: {
            ...tabJson.property?.testflow,
            nodes: updatedNodes,
          },
        },
      });
    } catch (error) {
      console.error("Error updating block data:", error);
    }
  };

  /**
   * @description
   * Get the API request node data if it exists.
   */
  public readRequestDataInNode = async (tabId?: string, nodeId?: string) => {
    const tabData = await RxDB.getInstance()
      .rxdb.tab.findOne({ selector: { tabId: tabId } })
      .exec();

    if (!tabData) return false;

    const node = tabData
      .toJSON()
      ?.property?.testflow?.nodes?.find(
        (element) =>
          element.id === nodeId && element?.data?.requestData?.url !== "",
      );

    return node ?? null;
  };

  /* Remove collections by multiple workspaceIds
   * @param _workspaceIds - Single workspaceId or array of workspaceIds to filter collections
   * @returns Promise resolving to the result of the removal operation
   */
  public removeCollectionsByWorkspaceIds = async (
    _workspaceIds: string[],
  ): Promise<any> => {
    return await RxDB.getInstance()
      .rxdb?.collection.find({
        selector: {
          workspaceId: {
            $in: _workspaceIds,
          },
        },
      })
      .remove();
  };

  /**
   * @description
   * read auth profile within a collection.
   */
  public readAuthProfilesInCollection = async (
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
    let response;
    collection?.toJSON().authProfiles.forEach((element) => {
      if (element.authId === uuid) {
        response = element;
        return;
      }
    });
    return response;
  };

  /**
   * @description
   * Creates an API request or folder within a collection.
   */
  public addAuthProfile = async (
    collectionId: string,
    newAuthProfileItem: AuthProfileDto,
  ) => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
        },
      })
      .exec();
    await collection.incrementalPatch({
      authProfiles: [...collection?.authProfiles, newAuthProfileItem],
    });
  };

  public updateAuthProfile = async (
    collectionId: string,
    uuid: string,
    newAuthProfileItem: AuthProfileDto,
  ) => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
        },
      })
      .exec();

    const updatedAuths = collection.toJSON().authProfiles.map((element) => {
      // If the new auth profile is set as default, unset the previous default
      if (
        element.defaultKey &&
        newAuthProfileItem.defaultKey &&
        element.authId.toString() !== uuid
      ) {
        element.defaultKey = false; // Unset previous default
      }

      if (element.authId.toString() === uuid) {
        element = {
          ...element,
          ...newAuthProfileItem,
        };
      }
      return element;
    });
    await collection.incrementalModify((value) => {
      value.authProfiles = [...updatedAuths];
      if (newAuthProfileItem.defaultKey) {
        value.defaultSelectedAuthProfile = newAuthProfileItem.authId;
      }
      return value;
    });
  };

  public deleteAuthProfile = async (collectionId: string, deleteId: string) => {
    const collection = await RxDB.getInstance()
      .rxdb.collection.findOne({
        selector: {
          id: collectionId,
        },
      })
      .exec();
    const updatedAuths = collection.toJSON().authProfiles.filter((element) => {
      if (element.authId !== deleteId) {
        return true;
      }
      return false;
    });
    collection.incrementalModify((value) => {
      value.authProfiles = [...updatedAuths];
      return value;
    });
  };
}
