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
import {
  createDeepCopy,
  Debounce,
  InitWebSocketTab,
  moveNavigation,
} from "@sparrow/common/utils";
import { Events, ItemType, UntrackedItems } from "@sparrow/common/enums";
// import { invoke } from "@tauri-apps/api/core";
import { v4 as uuidv4 } from "uuid";

import { InitRequestTab } from "@sparrow/common/utils";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { notifications } from "@sparrow/library/ui";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import { isGuestUserActive } from "@app/store/auth.store";
import {
  TabPersistenceTypeEnum,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import { BehaviorSubject, type Observable } from "rxjs";
import { FolderTabAdapter } from "@app/adapter";
import {
  CollectionItemTypeBaseEnum,
  type CollectionBaseInterface,
  type CollectionItemBaseInterface,
} from "@sparrow/common/types/workspace/collection-base";
import type { GraphqlRequestCreateUpdateInFolderPayloadDtoInterface } from "@sparrow/common/types/workspace/graphql-request-dto";
import { InitTab } from "@sparrow/common/factory";
import type { SocketIORequestCreateUpdateInFolderPayloadDtoInterface } from "@sparrow/common/types/workspace/socket-io-request-dto";
import constants from "@app/constants/constants";
// import { InitRequestTab } from "@sparrow/common/utils";

class FolderExplorerPage {
  // Private Repositories
  private collectionRepository = new CollectionRepository();
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();

  // Private Services
  private collectionService = new CollectionService();

  private _tab: BehaviorSubject<Tab> = new BehaviorSubject({});

  constructor(_tab: TabDocument) {
    const t = createDeepCopy(_tab.toMutableJSON());
    delete t.isActive;
    delete t.index;
    t.persistence = TabPersistenceTypeEnum.PERMANENT;
    this.tab = t;
  }

  public get tab(): Observable<Tab> {
    return this._tab.asObservable();
  }

  public set tab(value: Tab) {
    this._tab.next(value);
  }

  /**
   * Compares the current collection tab with the server collection and updates the saved status accordingly.
   * This method is debounced to reduce the number of server requests.
   * @return A promise that resolves when the comparison is complete.
   */
  private compareCollectionWithServerDebounced = async () => {
    let result = true;
    const progressiveTab = createDeepCopy(this._tab.getValue());

    const folder =
      await this.collectionRepository.readRequestOrFolderInCollection(
        progressiveTab.path.collectionId,
        progressiveTab.id,
      );

    const collectionTab = new FolderTabAdapter().adapt(
      progressiveTab.id,
      "",
      folder,
    );

    if (!folder) result = false;
    // description
    else if (collectionTab.description !== progressiveTab.description) {
      result = false;
    }
    // name
    else if (collectionTab.name !== progressiveTab.name) {
      result = false;
    }

    // result
    if (result) {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: true,
      });
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
    } else {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: false,
      });
      progressiveTab.isSaved = false;
      this.tab = progressiveTab;
    }
  };

  /**
   * Debounced method to compare the current collection tab with the server collection.
   */
  private compareCollectionWithServer = new Debounce().debounce(
    this.compareCollectionWithServerDebounced,
    1000,
  );

  /**
   *
   * @param collectionId - Id of the collection to be fetched
   * @returns - Requested collection
   */
  public getCollection = async (collectionId: string) => {
    return await this.collectionRepository.readCollection(collectionId);
  };

  /**
   * Handles renaming a folder
   * @param _folderName - the new name of the folder.
   * @param event - blur or input
   */
  public updateFolderName = async (_folderName: string, event = "") => {
    const progressiveTab = createDeepCopy(this._tab.getValue());

    // Trim the name to handle cases with only spaces
    const trimmedName = _folderName.trim();

    if (event === "blur" && trimmedName === "") {
      const folderDoc =
        await this.collectionRepository.readRequestOrFolderInCollection(
          progressiveTab.path.collectionId,
          progressiveTab.id,
        );
      progressiveTab.name = folderDoc?.name;
    } else if (event === "") {
      progressiveTab.name = _folderName;
    }
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareCollectionWithServer();
  };

  /**
   * Handles updating description of a folder.
   * @param _folderDescription - the updated description of the folder.
   */
  public updateFolderDescription = async (_folderDescription: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.description = _folderDescription;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareCollectionWithServer();
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
    let folder;
    if (collection) {
      collection?.items?.forEach((_folder) => {
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
   * Updates collection tab name
   * @param _name - updated collection name
   */
  public updateNameWithCollectionList = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (_name !== progressiveTab.name) {
      progressiveTab.name = _name;
    }
    this.tab = progressiveTab;
  };

  public constructBaseUrl = async (_id: string) => {
    const workspaceData = await this.workspaceRepository.readWorkspace(_id);
    const hubUrl = workspaceData?.team?.hubUrl;

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
  };

  /**
   *
   * Saves the folder
   */
  public saveFolder = async () => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser == true) {
      await this.collectionRepository.updateRequestOrFolderInCollection(
        progressiveTab.path.collectionId,
        progressiveTab.id,
        {
          description: progressiveTab.description,
          name: progressiveTab.name,
        },
      );
      notifications.success(
        `The ‘${progressiveTab.name}’ folder saved successfully.`,
      );
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      return;
    }
    const baseUrl = await this.constructBaseUrl(
      progressiveTab.path.workspaceId,
    );
    const response = await this.collectionService.updateFolderInCollection(
      progressiveTab.path.workspaceId as string,
      progressiveTab.path.collectionId as string,
      progressiveTab.id as string,
      {
        description: progressiveTab.description,
        name: progressiveTab.name,
      },
      baseUrl,
    );
    if (response.isSuccessful) {
      this.collectionRepository.updateRequestOrFolderInCollection(
        progressiveTab.path.collectionId as string,
        progressiveTab.id as string,
        response.data.data,
      );
      notifications.success(
        `The ‘${progressiveTab.name}’ folder saved successfully.`,
      );
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    } else {
      notifications.error("Failed to save folder. Please try again.");
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
    const folder = await this.getFolder(collection, this._tab.getValue().id);
    if (folder?.items) {
      folder.items.forEach((item: any) => {
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
      totalRequests,
      totalGraphQl,
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

  /**
   * Handles creating a new request in a folder
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which new request is going to be created
   * @param explorer : - the folder in which new request is going to be created
   * @returns :void
   */
  private handleCreateRequestInFolder = async (
    workspaceId: string,
    collection: CollectionBaseInterface,
    explorer: CollectionItemBaseInterface,
  ) => {
    const sampleRequest = new InitRequestTab(
      UntrackedItems.UNTRACKED + uuidv4(),
      workspaceId,
    );

    let userSource = {};
    if (collection.activeSync && explorer?.source === "USER") {
      userSource = {
        currentBranch: collection.currentBranch
          ? collection.currentBranch
          : collection.primaryBranch,
        source: "USER",
      };
    }
    const requestObj = {
      collectionId: collection.id,
      workspaceId: workspaceId,
      ...userSource,
      folderId: explorer.id,
      items: {
        name: explorer.name,
        type: ItemType.FOLDER,
        id: explorer.id,
        items: {
          name: sampleRequest.getValue().name,
          type: sampleRequest.getValue().type,
          description: "",
          request: {
            method: sampleRequest.getValue().property.request?.method,
          },
        },
      },
    };

    await this.collectionRepository.addRequestInFolder(
      requestObj.collectionId,
      requestObj.folderId,
      {
        ...requestObj.items.items,
        id: sampleRequest.getValue().id,
      },
    );
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      const res = (await this.collectionRepository.readRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        sampleRequest.getValue().id,
      )) as CollectionItemBaseInterface;
      res.id = uuidv4();
      this.collectionRepository.updateRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        sampleRequest.getValue().id,
        res,
      );

      sampleRequest.updateId(res.id);
      sampleRequest.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: explorer.id,
      });
      sampleRequest.updateIsSave(true);
      this.tabRepository.createTab(sampleRequest.getValue());

      moveNavigation("right");
      MixpanelEvent(Events.CREATE_REQUEST, {
        source: "Collection list",
      });
      return;
    }
    const baseUrl = await this.constructBaseUrl(workspaceId);
    const response = await this.collectionService.addRequestInCollection(
      requestObj,
      baseUrl,
    );
    if (response.isSuccessful && response.data.data) {
      const request = response.data.data;

      this.collectionRepository.updateRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        sampleRequest.getValue().id,
        request,
      );

      sampleRequest.updateId(request.id);
      sampleRequest.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: explorer.id,
      });
      sampleRequest.updateIsSave(true);
      this.tabRepository.createTab(sampleRequest.getValue());

      moveNavigation("right");
      MixpanelEvent(Events.CREATE_REQUEST, {
        source: "Collection list",
      });
      return;
    } else {
      this.collectionRepository.deleteRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        sampleRequest.getValue().id,
      );
    }
  };

  /**
   * Handles creating a new web socket in a folder
   * @param workspaceId - the workspace id in which new web socket is going to be created
   * @param collection - the collection in which new web socket is going to be created
   * @param explorer - the folder in which new web socket is going to be created
   */
  private handleCreateWebSocketInFolder = async (
    workspaceId: string,
    collection: CollectionBaseInterface,
    explorer: CollectionItemBaseInterface,
  ) => {
    const websocket = new InitWebSocketTab(
      UntrackedItems.UNTRACKED + uuidv4(),
      workspaceId,
    );

    let userSource = {};
    if (collection.activeSync && explorer?.source === "USER") {
      userSource = {
        currentBranch: collection.currentBranch
          ? collection.currentBranch
          : collection.primaryBranch,
        source: "USER",
      };
    }
    const requestObj = {
      collectionId: collection.id,
      workspaceId: workspaceId,
      ...userSource,
      folderId: explorer.id,
      items: {
        name: explorer.name,
        type: ItemType.FOLDER,
        id: explorer.id,
        items: {
          name: websocket.getValue().name,
          type: websocket.getValue().type,
          description: "",
          websocket: {},
        },
      },
    };

    await this.collectionRepository.addRequestInFolder(
      requestObj.collectionId,
      requestObj.folderId,
      {
        ...requestObj.items.items,
        id: websocket.getValue().id,
      },
    );
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      const res = (await this.collectionRepository.readRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        websocket.getValue().id,
      )) as CollectionItemBaseInterface;
      res.id = uuidv4();
      this.collectionRepository.updateRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        websocket.getValue().id,
        res,
      );

      websocket.updateId(res.id);
      websocket.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: explorer.id,
      });
      websocket.updateIsSave(true);
      this.tabRepository.createTab(websocket.getValue());

      moveNavigation("right");
      MixpanelEvent(Events.CREATE_REQUEST, {
        source: "Collection list",
      });
      return;
    }
    const baseUrl = await this.constructBaseUrl(workspaceId);
    const response = await this.collectionService.addSocketInCollection(
      requestObj,
      baseUrl,
    );
    if (response.isSuccessful && response.data.data) {
      const request = response.data.data;

      this.collectionRepository.updateRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        websocket.getValue().id,
        request,
      );

      websocket.updateId(request.id);
      websocket.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: explorer.id,
      });
      websocket.updateIsSave(true);
      this.tabRepository.createTab(websocket.getValue());

      moveNavigation("right");
      MixpanelEvent(Events.CREATE_REQUEST, {
        source: "Collection list",
      });
      return;
    } else {
      this.collectionRepository.deleteRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        websocket.getValue().id,
      );
    }
  };

  /**
   * Handles creating a new socket io in a folder
   * @param _workspaceId - the workspace id in which new socket io is going to be created
   * @param _collection - the collection in which new socket io is going to be created
   * @param _folder - the folder in which new socket io is going to be created
   */
  private handleCreateSocketIoInFolder = async (
    _workspaceId: string,
    _collection: CollectionBaseInterface,
    _folder: CollectionItemBaseInterface,
  ) => {
    const socketIoTab = new InitTab().socketIo(uuidv4(), _workspaceId);

    const socketIoInFolderPayload: SocketIORequestCreateUpdateInFolderPayloadDtoInterface =
      {
        collectionId: _collection.id,
        workspaceId: _workspaceId,
        currentBranch:
          _collection.activeSync && _folder.source === "USER"
            ? _collection.currentBranch
            : undefined,
        source:
          _collection.activeSync && _folder.source === "USER"
            ? _folder.source
            : undefined,
        folderId: _folder.id,
        items: {
          name: _folder.name,
          type: CollectionItemTypeBaseEnum.FOLDER,
          id: _folder.id,
          items: {
            name: socketIoTab.getValue().name,
            type: CollectionItemTypeBaseEnum.SOCKETIO,
            description: "",
            socketio: {},
          },
        },
      };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      await this.collectionRepository.addRequestInFolder(
        socketIoInFolderPayload.collectionId,
        socketIoInFolderPayload.folderId as string,
        {
          ...socketIoInFolderPayload?.items?.items,
          id: socketIoTab.getValue().id,
        },
      );

      socketIoTab
        .updatePath({
          workspaceId: _workspaceId,
          collectionId: _collection.id,
          folderId: _folder.id,
        })
        .updateIsSave(true);
      this.tabRepository.createTab(socketIoTab.getValue());

      moveNavigation("right");
      MixpanelEvent(Events.CREATE_REQUEST, {
        source: "Collection list",
      });
      return;
    }
    const baseUrl = await this.constructBaseUrl(_workspaceId);
    const response = await this.collectionService.addSocketIoInCollection(
      socketIoInFolderPayload,
      baseUrl,
    );
    if (response.isSuccessful && response.data.data) {
      const request = response.data.data;

      await this.collectionRepository.addRequestInFolder(
        socketIoInFolderPayload.collectionId,
        socketIoInFolderPayload.folderId as string,
        {
          ...request,
        },
      );

      socketIoTab
        .updateId(request?.id as string)
        .updatePath({
          workspaceId: _workspaceId,
          collectionId: _collection.id,
          folderId: _folder.id,
        })
        .updateIsSave(true);
      this.tabRepository.createTab(socketIoTab.getValue());

      moveNavigation("right");
      MixpanelEvent(Events.CREATE_REQUEST, {
        source: "Collection list",
      });
      return;
    } else {
      this.collectionRepository.deleteRequestInFolder(
        socketIoInFolderPayload.collectionId,
        socketIoInFolderPayload.folderId as string,
        socketIoTab.getValue().id,
      );
    }
  };

  /**
   * Handles creating a new GraphQL request in a folder
   * @param _workspaceId - the workspace id in which new GraphQL request is going to be created
   * @param _collection - the collection in which new GraphQL request is going to be created
   * @param _folder - the folder in which new GraphQL request is going to be created
   */
  private handleCreateGraphqlInFolder = async (
    _workspaceId: string,
    _collection: CollectionBaseInterface,
    _folder: CollectionItemBaseInterface,
  ) => {
    const graphqlTab = new InitTab().graphQl(uuidv4(), _workspaceId);

    const graphqlInFolderPayload: GraphqlRequestCreateUpdateInFolderPayloadDtoInterface =
      {
        collectionId: _collection.id,
        workspaceId: _workspaceId,
        currentBranch:
          _collection.activeSync && _folder.source === "USER"
            ? _collection.currentBranch
            : undefined,
        source:
          _collection.activeSync && _folder.source === "USER"
            ? _folder.source
            : undefined,
        folderId: _folder.id,
        items: {
          name: _folder.name,
          type: CollectionItemTypeBaseEnum.FOLDER,
          id: _folder.id,
          items: {
            name: graphqlTab.getValue().name,
            type: CollectionItemTypeBaseEnum.GRAPHQL,
            description: "",
            graphql: {},
          },
        },
      };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      await this.collectionRepository.addRequestInFolder(
        graphqlInFolderPayload.collectionId,
        graphqlInFolderPayload.folderId as string,
        {
          ...graphqlInFolderPayload?.items?.items,
          id: graphqlTab.getValue().id,
        },
      );

      graphqlTab
        .updatePath({
          workspaceId: _workspaceId,
          collectionId: _collection.id,
          folderId: _folder.id,
        })
        .updateIsSave(true);
      this.tabRepository.createTab(graphqlTab.getValue());

      moveNavigation("right");

      return;
    }
    const baseUrl = await this.constructBaseUrl(_workspaceId);
    const response = await this.collectionService.addGraphqlInCollection(
      graphqlInFolderPayload,
      baseUrl,
    );
    if (response.isSuccessful && response.data.data) {
      const request = response.data.data;

      await this.collectionRepository.addRequestInFolder(
        graphqlInFolderPayload.collectionId,
        graphqlInFolderPayload.folderId as string,
        {
          ...request,
        },
      );

      graphqlTab
        .updateId(request?.id as string)
        .updatePath({
          workspaceId: _workspaceId,
          collectionId: _collection.id,
          folderId: _folder.id,
        })
        .updateIsSave(true);
      this.tabRepository.createTab(graphqlTab.getValue());

      moveNavigation("right");
      return;
    } else {
      this.collectionRepository.deleteRequestInFolder(
        graphqlInFolderPayload.collectionId,
        graphqlInFolderPayload.folderId as string,
        graphqlTab.getValue().id,
      );
    }
  };

  /**
   * Handle control of creating items
   * @param entityType :string - type of entity, collection, folder or request
   * @param args :object - arguments depending on entity type
   */
  public handleCreateItem = async (entityType: string, args: any) => {
    let response;
    switch (entityType) {
      case "requestFolder":
        await this.handleCreateRequestInFolder(
          args.workspaceId,
          args.collection as CollectionBaseInterface,
          args.folder as CollectionItemBaseInterface,
        );
        break;
      case "websocketFolder":
        await this.handleCreateWebSocketInFolder(
          args.workspaceId,
          args.collection as CollectionBaseInterface,
          args.folder as CollectionItemBaseInterface,
        );
        break;
      case "socketioFolder":
        await this.handleCreateSocketIoInFolder(
          args.workspaceId,
          args.collection as CollectionBaseInterface,
          args.folder as CollectionItemBaseInterface,
        );
        break;
      case "graphqlFolder":
        await this.handleCreateGraphqlInFolder(
          args.workspaceId,
          args.collection as CollectionBaseInterface,
          args.folder as CollectionItemBaseInterface,
        );
        break;
    }
    return response;
  };
}

export default FolderExplorerPage;
