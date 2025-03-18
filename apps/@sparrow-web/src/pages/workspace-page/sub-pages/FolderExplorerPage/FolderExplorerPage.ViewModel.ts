// Repositories
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { TabRepository } from "../../../../repositories/tab.repository";

// Servises
import { CollectionService } from "../../../../services/collection.service";

// Types
import type {
  CollectionDocument,
  // CollectionDocument,
  TabDocument,
} from "../../../../database/database";

// Utils
import { moveNavigation  , InitWebSocketTab} from "@sparrow/common/utils";
import { Events, ItemType } from "@sparrow/common/enums";
import { InitTab } from "@sparrow/common/factory";

// import { invoke } from "@tauri-apps/api/core";
import { v4 as uuidv4 } from "uuid";
import {
  ResponseStatusCode,
  UntrackedItems,
} from "@sparrow/common/enums";
// Stores
import type {
  CollectionDto,
  CollectionItemsDto,
  Folder,
  Tab,
} from "@sparrow/common/types/workspace";
import type { CreateApiRequestPostBody } from "@sparrow/common/dto";
import { InitRequestTab } from "@sparrow/common/utils";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { notifications } from "@sparrow/library/ui";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import { isGuestUserActive } from "@app/store/auth.store";
import { TabPersistenceTypeEnum } from "@sparrow/common/types/workspace/tab";
import {
  CollectionItemTypeBaseEnum,
  type CollectionArgsBaseInterface,
  type CollectionBaseInterface as CollectionDto,
  type CollectionItemBaseInterface as CollectionItemsDto,
} from "@sparrow/common/types/workspace/collection-base";
// import { InitRequestTab } from "@sparrow/common/utils";

class FolderExplorerPage {
  // Private Repositories
  private collectionRepository = new CollectionRepository();
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();

  // Private Services
  private collectionService = new CollectionService();

  constructor() {}

  /**
   *
   * @param _id - Id of the tab going to be updated
   * @param data - Data to be updated on tab
   */
  private updateTab = async (_id: string, data: Tab) => {
    const tabListData = await this.tabRepository.getTabList();
    tabListData.subscribe((tabList) => {
      if (tabList) {
        tabList.forEach((tab) => {
          if (tab.id === _id) {
            this.tabRepository.updateTab(tab?.tabId as string, data);
          }
        });
      }
    });
  };

  /**
   *
   * @param collectionId - Id of the collection to be fetched
   * @returns - Requested collection
   */
  public getCollection = async (collectionId: string) => {
    return await this.collectionRepository.readCollection(collectionId);
  };

  /**
   *
   * @param collection - Collection in which folder exists
   * @param folderId - Id of folder going to be fetched
   * @returns - Requested Folder
   */
  public getFolder = async (
    collection: CollectionDocument,
    folderId: string,
  ) => {
    let folder: Folder | null = null;
    if (collection) {
      collection.items.forEach((_folder) => {
        if (_folder.id === folderId) {
          folder = _folder;
        }
      });
    }
    return folder;
  };

  /**
   *
   * @returns Observable collection list
   */
  public getCollectionList = async () => {
    return await this.collectionRepository.getCollection();
  };

  /**
   * Handles renaming a folder
   * @param collection :CollectionDocument - the collection in which the folder is saved
   * @param folder : - the folder going to be renamed
   * @param newFolderName :string - the new name of the folder
   */
  public handleRename = async (
    collection: CollectionDocument,
    folder: Folder,
    newFolderName: string,
    tab: TabDocument,
  ) => {
    if (newFolderName) {
      await this.tabRepository.updateTab(tab.tabId, {
        persistence: TabPersistenceTypeEnum.PERMANENT,
      });
      let userSource = {};
      if (collection.activeSync && folder?.source === "USER") {
        userSource = {
          currentBranch: collection.currentBranch
            ? collection.currentBranch
            : collection.primaryBranch,
          source: "USER",
        };
      }
      let isGuestUser;
      isGuestUserActive.subscribe((value) => {
        isGuestUser = value;
      });
      if (isGuestUser === true) {
        this.tabRepository.updateTab(tab.tabId, { name: newFolderName });
        const res =
          await this.collectionRepository.readRequestOrFolderInCollection(
            collection.id,
            folder.id,
          );
        res.name = newFolderName;
        this.collectionRepository.updateRequestOrFolderInCollection(
          collection.id,
          folder.id,
          res,
        );
        // notifications.success("Folder renamed successfully!");
        return;
      }
      const response = await this.collectionService.updateFolderInCollection(
        collection.workspaceId,
        collection.id,
        folder.id,
        {
          ...userSource,
          name: newFolderName,
        },
      );

      if (response.isSuccessful) {
        this.tabRepository.updateTab(tab.tabId, { name: newFolderName });
        this.collectionRepository.updateRequestOrFolderInCollection(
          collection.id,
          folder.id,
          response.data.data,
        );
        // notifications.success("Folder renamed successfully!");
      }
    }
  };

  /**
   *
   * @param collection - Collection in which request exists
   * @param folder - Folder in which request exists
   * @param request - Request going to be opened
   */
  public handleOpenRequest = (
    collection: CollectionDocument,
    folder: Folder,
    request: Request,
  ) => {
    const req = new InitRequestTab(request.id, collection.workspaceId);
    const path: Path = {
      workspaceId: collection.workspaceId,
      collectionId: collection.id ?? "",
      folderId: folder?.id,
      folderName: folder?.name,
    };
    req.updateName(request.name);
    req.updateDescription(request.description);
    req.updateBody(request.request?.body);
    req.updateMethod(request.request?.method);
    req.updateUrl(request.request?.url);
    req.updateQueryParams(request.request?.queryParams);
    req.updateAuth(request.request?.auth);
    req.updateHeaders(request.request?.headers);
    req.updatePath(path);

    this.tabRepository.createTab(req.getValue());
    moveNavigation("right");
  };

  /**
   *
   * @param collection - Collection in which request going to be created
   * @param folder - Folder in which request going to be created
   * @returns
   */
  public handleCreateAPIRequest = async (
    collection: CollectionDto,
    folder: CollectionItemsDto,
  ) => {
    const initRequestTab = new InitRequestTab(
      uuidv4(),
      collection?.workspaceId,
    );

    let userSource = {};
    if (collection.activeSync && folder?.source === "USER") {
      userSource = {
        currentBranch: collection.currentBranch
          ? collection.currentBranch
          : collection.primaryBranch,
        source: "USER",
      };
    }

    const requestObj: CreateApiRequestPostBody = {
      collectionId: collection.id,
      workspaceId: collection.workspaceId,
      ...userSource,
      folderId: folder.id,
      items: {
        name: folder.name,
        type: ItemType.FOLDER,
        items: {
          name: initRequestTab.getValue().name,
          type: initRequestTab.getValue().type,
          description: "",
          request: {
            method: initRequestTab?.getValue()?.property.request.method,
          },
        },
      },
    };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser) {
      // pushing http request to collection model
      await this.collectionRepository.addRequestInFolder(
        requestObj.collectionId as string,
        requestObj.folderId as string,
        {
          ...requestObj?.items?.items,
          id: initRequestTab.getValue().id,
        },
      );
      // pushing http request to tab model
      initRequestTab.updatePath({
        workspaceId: collection.workspaceId,
        collectionId: collection.id,
        folderId: folder.id,
      });
      initRequestTab.updateIsSave(true);
      await this.tabRepository.createTab(initRequestTab.getValue());
      moveNavigation("right");
      MixpanelEvent(Events.ADD_NEW_API_REQUEST, {
        source: "Side Panel Dropdown",
      });
      return;
    }

    const response =
      await this.collectionService.addRequestInCollection(requestObj);
    if (response.isSuccessful && response.data.data) {
      const request = response.data.data;
      // pushing http request to collection model
      await this.collectionRepository.addRequestInFolder(
        requestObj?.collectionId as string,
        requestObj?.folderId as string,
        {
          ...request,
        },
      );
      // pushing http request to tab model
      initRequestTab.updateId(request.id);
      initRequestTab.updatePath({
        workspaceId: collection.workspaceId,
        collectionId: collection.id,
        folderId: folder.id,
      });
      initRequestTab.updateIsSave(true);
      this.tabRepository.createTab(initRequestTab.getValue());
      moveNavigation("right");
      MixpanelEvent(Events.ADD_NEW_API_REQUEST, {
        source: "Side Panel Dropdown",
      });
      return;
    } else {
      notifications.error("Failed to create API request. Please try again.");
    }
  };
  public handleCreateFolderInCollection = async (
        workspaceId: string,
        collection: CollectionDto,
      ): Promise<void> => {
        // Generate a new folder object with a unique ID, name, description, type, and an empty items array
        const folder = {
          id: UntrackedItems.UNTRACKED + uuidv4(),
          name: this.getNextName(collection.items, ItemType.FOLDER, "New Folder"),
          description: "",
          type: ItemType.FOLDER,
          items: [],
        };
        let isGuestUser;
        isGuestUserActive.subscribe((value) => {
          isGuestUser = value;
        });
    
        // Determine the user source based on collection's active synchronization
        let userSource = {};
        if (collection?.activeSync) {
          userSource = {
            currentBranch: collection?.currentBranch
              ? collection?.currentBranch
              : collection?.primaryBranch,
            source: "USER",
          };
        }
        // Add the new folder to the collection locally
        await this.collectionRepository.addRequestOrFolderInCollection(
          collection.id,
          folder,
        );
    
        if (isGuestUser === true) {
          const data = {
            id: uuidv4(),
            name: this.getNextName(
              collection.items,
              ItemType.FOLDER,
              "New Folder",
            ) as string,
            description: "",
            type: ItemType.FOLDER,
            items: [],
          };
    
          const path = {
            workspaceId: workspaceId,
            collectionId: collection.id,
            folderId: data.id,
          };
    
          const sampleFolder = new InitFolderTab(data.id, collection.workspaceId);
    
          sampleFolder.updateName(data.name);
          sampleFolder.updatePath(path);
          sampleFolder.updateIsSave(true);
    
          this.tabRepository.createTab(sampleFolder.getValue());
          moveNavigation("right");
    
          // Update the locally added folder with server response
          const folderObj = data;
          await this.collectionRepository.updateRequestOrFolderInCollection(
            collection.id,
            folder.id,
            folderObj,
          );
          return;
        }
    
        // Add the folder in the collection on the Database
        const response = await this.collectionService.addFolderInCollection(
          workspaceId,
          collection.id,
          {
            ...userSource,
            name: folder.name,
            description: folder.description,
          },
        );
    
        // Update UI elements and handle navigation on success
        if (response.isSuccessful) {
          const path = {
            workspaceId: workspaceId,
            collectionId: collection.id,
            folderId: response.data.data.id,
            folderName: response.data.data.name,
          };
    
          const sampleFolder = new InitFolderTab(
            response.data.data.id,
            collection.workspaceId,
          );
    
          sampleFolder.updateName(response.data.data.name);
          sampleFolder.updatePath(path);
          sampleFolder.updateIsSave(true);
    
          this.tabRepository.createTab(sampleFolder.getValue());
          moveNavigation("right");
    
          // Update the locally added folder with server response
          const folderObj = response.data.data;
          await this.collectionRepository.updateRequestOrFolderInCollection(
            collection.id,
            folder.id,
            folderObj,
          );
        } else {
          // Show error notification and clean up by deleting the folder locally on failure.
          notifications.error("Failed to create folder. Please try again.");
          this.collectionRepository.deleteRequestOrFolderInCollection(
            collection.id,
            folder.id,
          );
        }
      };
      private handleCreateRequestInCollection = async (
          workspaceId: string,
          collection: CollectionDto,
        ) => {
          const request = new InitRequestTab(
            UntrackedItems.UNTRACKED + uuidv4(),
            workspaceId,
          );
      
          let userSource = {};
          if (collection?.activeSync) {
            userSource = {
              currentBranch: collection?.currentBranch
                ? collection?.currentBranch
                : collection?.primaryBranch,
              source: "USER",
            };
          }
          const requestObj = {
            collectionId: collection.id,
            workspaceId: workspaceId,
            ...userSource,
            items: {
              name: request.getValue().name,
              type: request.getValue().type,
              description: "",
              request: {
                method: request?.getValue().property?.request?.method,
              } as HttpRequestBaseInterface,
            },
          };
          await this.collectionRepository.addRequestOrFolderInCollection(
            collection.id,
            {
              ...requestObj.items,
              id: request.getValue().id,
            },
          );
          let isGuestUser;
          isGuestUserActive.subscribe((value) => {
            isGuestUser = value;
          });
      
          if (isGuestUser === true) {
            const res =
              await this.collectionRepository.readRequestOrFolderInCollection(
                requestObj.collectionId,
                request.getValue().id,
              );
            if (res) {
              res.id = uuidv4();
            }
            await this.collectionRepository.updateRequestOrFolderInCollection(
              collection.id,
              request.getValue().id,
              res,
            );
      
            request.updateId(res?.id as string);
            request.updatePath({
              workspaceId: workspaceId,
              collectionId: collection.id,
              folderId: "",
            });
            request.updateIsSave(true);
            await this.tabRepository.createTab(request.getValue());
            moveNavigation("right");
            return;
          }
          const response =
            await this.collectionService.addRequestInCollection(requestObj);
          if (response.isSuccessful && response.data.data) {
            const res = response.data.data;
      
            this.collectionRepository.updateRequestOrFolderInCollection(
              collection.id,
              request.getValue().id,
              res,
            );
            request.updateId(res.id);
            request.updatePath({
              workspaceId: workspaceId,
              collectionId: collection.id,
              folderId: "",
            });
            request.updateIsSave(true);
            this.tabRepository.createTab(request.getValue());
            moveNavigation("right");
            return;
          } else {
            this.collectionRepository.deleteRequestOrFolderInCollection(
              collection.id,
              request.getValue().id,
            );
            notifications.error(response.message);
          }
        };
        private handleCreateWebSocketInCollection = async (
            workspaceId: string,
            collection: CollectionDto,
          ) => {
            const websocket = new InitWebSocketTab(
              UntrackedItems.UNTRACKED + uuidv4(),
              workspaceId,
            );
        
            let userSource = {};
            if (collection?.activeSync) {
              userSource = {
                currentBranch: collection?.currentBranch
                  ? collection?.currentBranch
                  : collection?.primaryBranch,
                source: "USER",
              };
            }
            const websocketObj = {
              collectionId: collection.id,
              workspaceId: workspaceId,
              ...userSource,
              items: {
                name: websocket.getValue().name,
                type: websocket.getValue().type,
                description: "",
                websocket: {},
              },
            };
            await this.collectionRepository.addRequestOrFolderInCollection(
              collection.id as string,
              {
                ...websocketObj.items,
                id: websocket.getValue().id,
              },
            );
            let isGuestUser;
            isGuestUserActive.subscribe((value) => {
              isGuestUser = value;
            });
        
            if (isGuestUser === true) {
              const res =
                await this.collectionRepository.readRequestOrFolderInCollection(
                  websocketObj.collectionId as string,
                  websocket.getValue().id,
                );
              if (res) {
                res.id = uuidv4();
              }
              await this.collectionRepository.updateRequestOrFolderInCollection(
                collection.id as string,
                websocket.getValue().id,
                res,
              );
        
              websocket.updateId(res?.id as string);
              websocket.updatePath({
                workspaceId: workspaceId,
                collectionId: collection.id,
                folderId: "",
              });
              websocket.updateIsSave(true);
              await this.tabRepository.createTab(websocket.getValue());
              moveNavigation("right");
              return;
            }
            const response =
              await this.collectionService.addSocketInCollection(websocketObj);
            if (response.isSuccessful && response.data.data) {
              const res = response.data.data;
        
              this.collectionRepository.updateRequestOrFolderInCollection(
                collection.id as string,
                websocket.getValue().id,
                res,
              );
        
              websocket.updateId(res.id);
              websocket.updatePath({
                workspaceId: workspaceId,
                collectionId: collection.id,
                folderId: "",
              });
              websocket.updateIsSave(true);
        
              this.tabRepository.createTab(websocket.getValue());
              moveNavigation("right");
              return;
            } else {
              this.collectionRepository.deleteRequestOrFolderInCollection(
                collection.id,
                websocket.getValue().id,
              );
              notifications.error(response.message);
            }
          };
          private handleCreateSocketIoInCollection = async (
            _workspaceId: string,
            _collection: CollectionDto,
          ) => {
            const socketIoTab = new InitTab().socketIo(uuidv4(), _workspaceId);
            const socketIoOfCollectionPayload: SocketIORequestCreateUpdateInCollectionPayloadDtoInterface =
              {
                collectionId: _collection.id,
                workspaceId: _workspaceId,
                currentBranch: _collection.activeSync
                  ? _collection.currentBranch
                  : undefined,
                source: _collection.activeSync ? "USER" : undefined,
                items: {
                  name: socketIoTab.getValue().name,
                  type: CollectionItemTypeBaseEnum.SOCKETIO,
                  description: "",
                  socketio: {},
                },
              };
        
            let isGuestUser;
            isGuestUserActive.subscribe((value) => {
              isGuestUser = value;
            });
        
            if (isGuestUser === true) {
              await this.collectionRepository.addRequestOrFolderInCollection(
                _collection.id as string,
                {
                  ...socketIoOfCollectionPayload.items,
                  id: socketIoTab.getValue().id,
                },
              );
              socketIoTab.updatePath({
                workspaceId: _workspaceId,
                collectionId: _collection.id,
                folderId: "",
              });
              socketIoTab.updateIsSave(true);
              await this.tabRepository.createTab(socketIoTab.getValue());
              moveNavigation("right");
              return;
            }
        
            const response = await this.collectionService.addSocketIoInCollection(
              socketIoOfCollectionPayload,
            );
            if (response.isSuccessful && response.data.data) {
              const res = response.data.data;
        
              await this.collectionRepository.addRequestOrFolderInCollection(
                _collection.id as string,
                {
                  ...res,
                },
              );
        
              socketIoTab.updateId(res.id as string);
              socketIoTab.updatePath({
                workspaceId: _workspaceId,
                collectionId: _collection.id,
                folderId: "",
              });
              socketIoTab.updateIsSave(true);
        
              this.tabRepository.createTab(socketIoTab.getValue());
              moveNavigation("right");
              return;
            } else {
              this.collectionRepository.deleteRequestOrFolderInCollection(
                _collection.id,
                socketIoTab.getValue().id,
              );
              notifications.error(response.message);
            }
          };
            private handleCreateGraphqlInCollection = async (
                _workspaceId: string,
                _collection: CollectionDto,
              ) => {
                const graphqlTab = new InitTab().graphQl(uuidv4(), _workspaceId);
                const graphqlOfCollectionPayload: GraphqlRequestCreateUpdateInCollectionPayloadDtoInterface =
                  {
                    collectionId: _collection.id,
                    workspaceId: _workspaceId,
                    currentBranch: _collection.activeSync
                      ? _collection.currentBranch
                      : undefined,
                    source: _collection.activeSync ? "USER" : undefined,
                    items: {
                      name: graphqlTab.getValue().name,
                      type: CollectionItemTypeBaseEnum.GRAPHQL,
                      description: "",
                      graphql: {},
                    },
                  };
            
                let isGuestUser;
                isGuestUserActive.subscribe((value) => {
                  isGuestUser = value;
                });
            
                if (isGuestUser === true) {
                  await this.collectionRepository.addRequestOrFolderInCollection(
                    _collection.id as string,
                    {
                      ...graphqlOfCollectionPayload.items,
                      id: graphqlTab.getValue().id,
                    },
                  );
                  graphqlTab.updatePath({
                    workspaceId: _workspaceId,
                    collectionId: _collection.id,
                    folderId: "",
                  });
                  graphqlTab.updateIsSave(true);
                  await this.tabRepository.createTab(graphqlTab.getValue());
                  moveNavigation("right");
                  return;
                }
            
                const response = await this.collectionService.addGraphqlInCollection(
                  graphqlOfCollectionPayload,
                );
                if (response.isSuccessful && response.data.data) {
                  const res = response.data.data;
            
                  await this.collectionRepository.addRequestOrFolderInCollection(
                    _collection.id as string,
                    {
                      ...res,
                    },
                  );
            
                  graphqlTab.updateId(res.id as string);
                  graphqlTab.updatePath({
                    workspaceId: _workspaceId,
                    collectionId: _collection.id,
                    folderId: "",
                  });
                  graphqlTab.updateIsSave(true);
            
                  this.tabRepository.createTab(graphqlTab.getValue());
                  moveNavigation("right");
            
                  return;
                } else {
                  this.collectionRepository.deleteRequestOrFolderInCollection(
                    _collection.id,
                    graphqlTab.getValue().id,
                  );
                  notifications.error(response.message);
                }
              };
     public handleCreateItem = async (
        entityType: string,
        args: CollectionArgsBaseInterface,
      ) => {
        let response;
        switch (entityType) {
          case "folder":
            await this.handleCreateFolderInCollection(
              args.collection.workspaceId,
              args.collection as CollectionDto,
            );
            break;
          case "requestCollection":
            await this.handleCreateRequestInCollection(
              args.collection.workspaceId,
              args.collection as CollectionDto,
            );
            break;
          case "websocketCollection":
            await this.handleCreateWebSocketInCollection(
              args.collection.workspaceId,
              args.collection as CollectionDto,
            );
            break;
          case "socketioCollection":
            await this.handleCreateSocketIoInCollection(
              args.collection.workspaceId,
              args.collection as CollectionDto,
            );
            break;
          case "graphqlCollection":
            await this.handleCreateGraphqlInCollection(
              args.collection.workspaceId,
              args.collection as CollectionDto,
            );
            break;
        }
        return response;
      };
  /**
   *
   * @param tab - Tab in which description will be updated
   * @param newDescription - New description
   */
  public handleUpdateDescription = async (
    tab: TabDocument,
    newDescription: string,
  ) => {
    const updateObj = {};
    this.tabRepository.updateTab(tab.tabId, {
      persistence: TabPersistenceTypeEnum.PERMANENT,
    });
    updateObj["description"] = newDescription;
    let userSource = {};
    if (tab?.activeSync && tab?.source === "USER") {
      userSource = {
        currentBranch: tab?.currentBranch,
        source: "USER",
      };
    }
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      const res =
        await this.collectionRepository.readRequestOrFolderInCollection(
          tab.path.collectionId,
          tab.path.folderId,
        );
      res.description = newDescription;
      await this.collectionRepository.updateRequestOrFolderInCollection(
        tab.path.collectionId,
        tab.path.folderId,
        res,
      );
      notifications.success("Description updated successfully.");
      return;
    }

    const updateFolderElement =
      await this.collectionService.updateFolderInCollection(
        tab.path.workspaceId,
        tab.path.collectionId,
        tab.path.folderId,
        { ...updateObj, ...userSource },
      );
    if (updateFolderElement.isSuccessful) {
      await this.collectionRepository.updateRequestOrFolderInCollection(
        tab.path.collectionId,
        tab.path.folderId,
        updateFolderElement.data.data,
      );
      notifications.success("Description updated successfully.");
    } else {
      notifications.error("Failed to update description. Please try again.");
    }
  };

  /**
   *
   * @param collection - Collection in which folder exists
   * @param tab - Tab of the folder
   * @returns - Total number of requests in folder
   */
  public getTotalRequests = async (
    collection: CollectionDocument,
    tab: TabDocument,
  ) => {
    let totalRequests = 0;
    let totalWebSocket = 0;
    let totalGraphQl = 0;
    let totalSocketIo = 0;
    const folder = await this.getFolder(collection, tab.id);
    if (folder?.items) {
      folder.items.forEach((item: CollectionItemsDto) => {
        if (item.type === ItemType.REQUEST) {
          totalRequests++;
        } else if (item.type === ItemType.SOCKET_IO) {
          totalSocketIo++;
        } else if (item.type === ItemType.GRAPHQL) {
          totalGraphQl++;
        } else if (item.type === ItemType.WEB_SOCKET) {
          totalWebSocket++;
        }
      });
    }
    return {
      totalGraphQl,
      totalRequests,
      totalSocketIo,
      totalWebSocket,
    };
  };

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };
}

export default FolderExplorerPage;
