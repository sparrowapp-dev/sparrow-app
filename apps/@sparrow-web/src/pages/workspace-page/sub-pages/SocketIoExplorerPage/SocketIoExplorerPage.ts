// ---- Utils
import {
  ReduceRequestURL,
  ReduceQueryParams,
  DecodeSocketio,
} from "@sparrow/workspaces/features/socketio-explorer/utils";
import { createDeepCopy, moveNavigation } from "@sparrow/common/utils";
import {
  startLoading,
  stopLoading,
} from "../../../../../../../packages/@sparrow-common/src/store";
import { CompareArray, Debounce } from "@sparrow/common/utils";

// ---- DB
import type {
  CollectionDocument,
  TabDocument,
  WorkspaceDocument,
} from "../../../../database/database";

// ---- Repo
import { TabRepository } from "../../../../repositories/tab.repository";
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import { EnvironmentRepository } from "../../../../repositories/environment.repository";

import { BehaviorSubject, Observable } from "rxjs";
import { Events, ItemType } from "@sparrow/common/enums";
import type { CreateDirectoryPostBody } from "@sparrow/common/dto";

import {
  insertCollection,
  insertCollectionDirectory,
} from "../../../../services/collection";
import { EnvironmentService } from "../../../../services/environment.service";

// ---- Events
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import {
  type KeyValueChecked,
  type KeyValue,
  type StatePartial,
} from "@sparrow/common/types/workspace";
import {
  TabPersistenceTypeEnum,
  type Path,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import { notifications } from "@sparrow/library/ui";
import { CollectionService } from "../../../../services/collection.service";
import { GuestUserRepository } from "../../../../repositories/guest-user.repository";
import { isGuestUserActive } from "@app/store/auth.store";
import { v4 as uuidv4 } from "uuid";
import type { CollectionDocType } from "../../../../models/collection.model";
import { socketIoDataStore } from "@sparrow/workspaces/features/socketio-explorer/store";
import { InitTab } from "@sparrow/common/factory";
import { SocketIoTabAdapter } from "@app/adapter";
import {
  CollectionItemTypeBaseEnum,
  type CollectionItemBaseInterface,
} from "@sparrow/common/types/workspace/collection-base";
import type { EventsValues } from "@sparrow/common/types/workspace/socket-io-request-tab";
import type {
  SocketIORequestCreateUpdateInCollectionPayloadDtoInterface,
  SocketIORequestCreateUpdateInFolderPayloadDtoInterface,
} from "@sparrow/common/types/workspace/socket-io-request-dto";
import constants from "src/constants/constants";
import * as Sentry from "@sentry/svelte";
class SocketIoExplorerPageViewModel {
  /**
   * Repository
   */
  private collectionRepository = new CollectionRepository();
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private tabRepository = new TabRepository();
  private guestUserRepository = new GuestUserRepository();
  private compareArray = new CompareArray();

  /**
   * Service
   */
  private environmentService = new EnvironmentService();
  private collectionService = new CollectionService();

  /**
   * Utils
   */

  private _tab = new BehaviorSubject<Partial<Tab>>({});

  public constructor(doc: TabDocument) {
    if (doc?.isActive) {
      setTimeout(() => {
        const t = createDeepCopy(doc.toMutableJSON());
        delete t.isActive;
        delete t.index;
        t.persistence = TabPersistenceTypeEnum.PERMANENT;
        this.tab = t;
      }, 0);
    }
  }

  public get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

  public get tab(): Observable<Partial<Tab>> {
    return this._tab.asObservable();
  }

  private set tab(value: Partial<Tab>) {
    this._tab.next(value);
  }

  /**
   * Compares the current request tab with the server version and updates the saved status accordingly.
   * This method is debounced to reduce the number of server requests.
   * @return A promise that resolves when the comparison is complete.
   */

  private compareRequestWithServerDebounced = async () => {
    let result = true;
    const progressiveTab: Tab = createDeepCopy(this._tab.getValue());
    let clientCollectionItem: CollectionItemBaseInterface;
    if (progressiveTab.path.folderId) {
      clientCollectionItem =
        (await this.collectionRepository.readRequestInFolder(
          progressiveTab.path.collectionId,
          progressiveTab.path.folderId,
          progressiveTab.id,
        )) as CollectionItemBaseInterface;
    } else {
      clientCollectionItem =
        (await this.collectionRepository.readRequestOrFolderInCollection(
          progressiveTab.path.collectionId,
          progressiveTab.id,
        )) as CollectionItemBaseInterface;
    }

    let requestServer;
    if (clientCollectionItem) {
      requestServer = new SocketIoTabAdapter().adapt(
        progressiveTab.path.workspaceId,
        progressiveTab.path.collectionId,
        progressiveTab.path.folderId,
        clientCollectionItem,
      );
    }

    if (!requestServer) result = false;
    // description
    else if (requestServer.description !== progressiveTab.description) {
      result = false;
    }
    // name
    else if (requestServer.name !== progressiveTab.name) {
      result = false;
    }
    // url
    else if (requestServer.property?.socketio) {
      if (
        requestServer.property.socketio.url !==
        progressiveTab.property.socketio?.url
      ) {
        result = false;
      }
      // message
      else if (
        requestServer.property.socketio.message !==
        progressiveTab.property.socketio?.message
      ) {
        result = false;
      } else if (
        requestServer.property.socketio.eventName !==
        progressiveTab.property.socketio?.eventName
      ) {
        result = false;
      } else if (
        !this.compareArray.init(
          requestServer.property.socketio.events,
          progressiveTab.property.socketio?.events,
        )
      ) {
        result = false;
      }

      // headers
      else if (
        !this.compareArray.init(
          requestServer.property.socketio.headers,
          progressiveTab.property.socketio?.headers,
        )
      ) {
        result = false;
      } else if (
        !this.compareArray.init(
          requestServer.property.socketio.queryParams,
          progressiveTab.property.socketio?.queryParams,
        )
      ) {
        result = false;
      } else if (
        requestServer.property.socketio.state.messageLanguage !==
        progressiveTab.property.socketio?.state.messageLanguage
      ) {
        // debugger;
        result = false;
      }
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
   * Debounced method to compare the current request tab with the server version.
   */
  private compareRequestWithServer = new Debounce().debounce(
    this.compareRequestWithServerDebounced,
    0,
  );
  /**
   *
   * @returns guest user
   */
  public getGuestUser = async () => {
    const response = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    return response?.getLatest().toMutableJSON();
  };

  /**
   *
   * @param _url - request url
   * @param _effectQueryParams  - flag that effect request query parameter
   */
  public updateRequestUrl = async (
    _url: string,
    _effectQueryParams: boolean = true,
  ) => {
    const progressiveTab: Tab = createDeepCopy(this._tab.getValue());
    if (_url === progressiveTab.property.socketio?.url) {
      return;
    }
    if (progressiveTab?.property?.socketio) {
      progressiveTab.property.socketio.url = _url;
    }
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    if (_effectQueryParams) {
      const reducedURL = new ReduceRequestURL(_url);
      await this.updateParams(reducedURL.getQueryParameters(), false);
    }
    this.compareRequestWithServer();
  };

  /**
   *
   * @param  _eventName - request event  name
   */
  public updateRequestEventName = async (_eventName: string) => {
    const progressiveTab: Tab = createDeepCopy(this._tab.getValue());

    if (progressiveTab?.property?.socketio) {
      progressiveTab.property.socketio.eventName = _eventName;
    }
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);

    this.compareRequestWithServer();
  };

  /**
   *
   * @param _path - request path
   */
  private updateRequestPath = async (_path: Path) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.path = _path;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _id - request mongo id
   */
  private updateRequestId = async (_id: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.id = _id;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _description - request description
   */
  public updateRequestDescription = async (_description: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.description = _description;
    this.tab = progressiveTab;
    try {
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    } catch (error) { 
      notifications.error(
        "Failed to update the documentation. Please try again",
      );
    }
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _message - socket message
   */
  public updateMessage = async (_message: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (_message === progressiveTab.property.socketio.message) {
      return;
    }
    progressiveTab.property.socketio.message = _message;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   * @description - updates request tab name
   * @param _name - new request name
   */
  public updateNameWithCollectionList = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (_name !== progressiveTab.name) {
      progressiveTab.name = _name;
    }
    this.tab = progressiveTab;
  };

  /**
   *
   * @param _name - request name
   */
  public updateRequestName = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.name = _name;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _headers - request headers
   */
  public updateHeaders = async (_headers: KeyValueChecked[]) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.socketio.headers = _headers;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _events - request events
   */
  public upadateEvents = async (_events: EventsValues[]) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.socketio.events = _events;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _params - request query parameters
   * @param _effectURL - lag that effect request url
   */
  public updateParams = async (
    _params: KeyValueChecked[],
    _effectURL: boolean = true,
  ) => {
    const progressiveTab: Tab = createDeepCopy(this._tab.getValue());
    if (
      JSON.stringify(_params) ===
      JSON.stringify(progressiveTab.property.socketio?.queryParams)
    ) {
      return;
    }
    if (progressiveTab.property?.socketio) {
      progressiveTab.property.socketio.queryParams = _params;
    }
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    if (_effectURL) {
      const reducedQueryParams = new ReduceQueryParams(_params);
      const reducedURL = new ReduceRequestURL(
        progressiveTab.property?.socketio?.url as string,
      );
      if (
        reducedQueryParams.getValue() === "" ||
        reducedQueryParams.getValue() === "="
      ) {
        await this.updateRequestUrl(reducedURL.getHost(), false);
      } else {
        await this.updateRequestUrl(
          reducedURL.getHost() + "?" + reducedQueryParams.getValue(),
          false,
        );
      }
    }
    this.compareRequestWithServer();
  };

  /**
   *
   * @param headers - request auto generated headers
   */
  public updateAutoGeneratedHeaders = async (headers: KeyValueChecked[]) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.socketio.autoGeneratedHeaders = headers;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param _state - request state
   */
  public updateRequestState = async (_state: StatePartial) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.socketio.state = {
      ...progressiveTab.property.socketio.state,
      ..._state,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param uuid  - collection id
   * @returns - collection Document
   */
  public readCollection = (uuid: string): Promise<CollectionDocument> => {
    return this.collectionRepository.readCollection(uuid);
  };

  /**
   *
   * @param collectionId - collection id
   * @param uuid - request or folder id
   * @returns - request document
   */
  public readRequestOrFolderInCollection = async (
    collectionId: string,
    uuid: string,
  ): Promise<CollectionItemBaseInterface | undefined> => {
    return await this.collectionRepository.readRequestOrFolderInCollection(
      collectionId,
      uuid,
    );
  };

  /**
   *
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param uuid - request id
   * @returns - request document
   */
  public readRequestInFolder = (
    collectionId: string,
    folderId: string,
    uuid: string,
  ) => {
    return this.collectionRepository.readRequestInFolder(
      collectionId,
      folderId,
      uuid,
    );
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param _collectionId - collection id
   * @param _folderName - folder name
   * @returns - folder status message
   */
  public createFolder = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    _collectionId: string,
    _folderName: string,
  ) => {
    let userSource = {};
    const _collection: CollectionDocument =
      await this.readCollection(_collectionId);
    if (_collection?.activeSync) {
      userSource = {
        currentBranch: _collection?.currentBranch,
        source: "USER",
      };
    }
    const directory: CreateDirectoryPostBody = {
      name: _folderName,
      description: "",
      ...userSource,
    };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser == true) {
      const data = {
        id: uuidv4(),
        name: _folderName,
        description: "",
        type: "FOLDER",
        source: "USER",
        isDeleted: false,
        items: [],
        createdBy: "Guest User",
        updatedBy: "Guest User",
        createdAt: "",
        updatedAt: "",
      };

      const latestRoute = {
        id: data.id,
      };
      return {
        status: "success",
        data: {
          latestRoute,
          collectionId: _collectionId,
          data: data,
          addRequestOrFolderInCollection: this.addRequestOrFolderInCollection,
        },
      };
    }

    const res = await insertCollectionDirectory(
      _workspaceMeta.id,
      _collectionId,
      directory,
    );
    if (res.isSuccessful) {
      const latestRoute = {
        id: res.data.data.id,
      };
      return {
        status: "success",
        data: {
          latestRoute,
          collectionId: _collectionId,
          data: res.data.data,
          addRequestOrFolderInCollection: this.addRequestOrFolderInCollection,
        },
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param _collectionName - collection name
   * @returns - collection status message
   */
  public createCollection = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    _collectionName: string,
  ) => {
    const newCollection = {
      name: _collectionName,
      workspaceId: _workspaceMeta.id,
    };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser == true) {
      const data: {
        id?: string;
        name: string;
        totalRequests: number;
        createdBy: string;
        items?: CollectionItemBaseInterface[];
        updatedBy: string;
        createdAt: string;
        updatedAt: string;
        workspaceId?: string;
      } = {
        id: uuidv4(),
        name: _collectionName,
        totalRequests: 0,
        createdBy: "Guest User",
        items: [],
        updatedBy: "Guest User",
        // createdAt: new Date().toISOString,
        // updatedAt: new Date().toISOString,
        createdAt: "",
        updatedAt: "",
      };
      const latestRoute = {
        id: data.id,
      };
      const storage = data;

      storage.workspaceId = _workspaceMeta.id;
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: "SaveRequest",
        collectionName: data.name,
        collectionId: data.id,
      });
      return {
        status: "success",
        data: {
          latestRoute,
          storage,
          addCollection: this.addCollection,
        },
      };
    }

    const res = await insertCollection(newCollection);
    if (res.isSuccessful) {
      const latestRoute = {
        id: res.data.data._id,
      };
      const storage = res.data.data;
      const _id = res.data.data._id;
      delete storage._id;
      storage.id = _id;
      storage.workspaceId = _workspaceMeta.id;
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: "SaveRequest",
        collectionName: res.data.data.name,
        collectionId: res.data.data._id,
      });
      return {
        status: "success",
        data: {
          latestRoute,
          storage,
          addCollection: this.addCollection,
        },
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   * Save Request
   * @param saveDescriptionOnly - refers save overall request data or only description as a documentation purpose.
   * @returns save status
   */
  public saveSocket = async () => {
    const componentData = this._tab.getValue();
    const { folderId, collectionId, workspaceId } = componentData.path as Path;
    const tabId = componentData?.tabId;
    startLoading(tabId);

    if (!workspaceId || !collectionId) {
      stopLoading(tabId);
      return {
        status: "error",
        message: "request is not a part of any workspace or collection",
      };
    }
    const _collection = await this.readCollection(collectionId);
    let userSource = {};
    if (_collection?.activeSync && componentData?.source === "USER") {
      userSource = {
        currentBranch: _collection?.currentBranch,
        source: "USER",
      };
    }
    const _id = componentData.id;

    const socketTabAdapter = new SocketIoTabAdapter();
    const unadaptedSocket = socketTabAdapter.unadapt(componentData);
    // Save overall api

    const socketMetaData = {
      id: _id,
      name: componentData?.name,
      description: componentData?.description,
      type: CollectionItemTypeBaseEnum.SOCKETIO,
    };

    let folderSource;
    let itemSource;
    if (folderId) {
      folderSource = {
        folderId: folderId,
      };
      itemSource = {
        id: folderId,
        type: CollectionItemTypeBaseEnum.FOLDER,
        items: {
          ...socketMetaData,
          socketio: unadaptedSocket,
        },
      };
    } else {
      itemSource = {
        ...socketMetaData,
        socketio: unadaptedSocket,
      };
    }

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      const progressiveTab = this._tab.getValue();
      const data = {
        id: progressiveTab.id,
        name: socketMetaData.name,
        description: socketMetaData.description,
        type: CollectionItemTypeBaseEnum.SOCKETIO,
        socketio: unadaptedSocket,
        updatedAt: "",
        updatedBy: "Guest User",
      };

      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      if (!folderId) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          _id,
          data,
        );
      } else {
        this.collectionRepository.updateRequestInFolder(
          collectionId,
          folderId,
          _id,
          data,
        );
      }
      stopLoading(tabId);
      return {
        status: "success",
        message: "",
      };
    }
    const baseUrl = await this.constructBaseUrl(workspaceId);
    const res = await this.collectionService.updateSocketIoInCollection(
      _id,
      {
        collectionId: collectionId,
        workspaceId: workspaceId,
        ...folderSource,
        ...userSource,
        items: itemSource,
      } as
        | SocketIORequestCreateUpdateInCollectionPayloadDtoInterface
        | SocketIORequestCreateUpdateInFolderPayloadDtoInterface,
      baseUrl,
    );

    if (res.isSuccessful) {
      const progressiveTab = this._tab.getValue();
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      if (!folderId) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          _id,
          res.data.data,
        );
      } else {
        this.collectionRepository.updateRequestInFolder(
          collectionId,
          folderId,
          _id,
          res.data.data,
        );
      }
      stopLoading(tabId);
      return {
        status: "success",
        message: res.message,
      };
    } else {
      stopLoading(tabId);
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   *
   * @param uuid - workspace id
   * @returns workspace document
   */
  public readWorkspace = (uuid: string): Promise<WorkspaceDocument> => {
    return this.workspaceRepository.readWorkspace(uuid);
  };

  get collection() {
    return this.collectionRepository.getCollection();
  }

  /**
   *
   * @param collectionId - collection id
   * @param items - request or folder item
   */
  public addRequestOrFolderInCollection = (
    collectionId: string,
    items: object,
  ) => {
    this.collectionRepository.addRequestOrFolderInCollection(
      collectionId,
      items,
    );
  };

  /**
   *
   * @param collection - collection document
   */
  public addCollection = (collection: object) => {
    this.collectionRepository.addCollection(collection);
  };

  /**
   *
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param request - request document
   */
  public addRequestInFolder = (
    collectionId: string,
    folderId: string,
    request: object,
  ): void => {
    this.collectionRepository.addRequestInFolder(
      collectionId,
      folderId,
      request,
    );
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param path - request stack path
   * @param tabName - request name
   * @param description - request description
   * @param type - save over all request or description only
   */
  public saveAsSocket = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    path: {
      name: string;
      id: string;
      type: string;
    }[],
    tabName: string,
    description: string,
  ) => {
    // return;
    const componentData = this._tab.getValue();
    let userSource = {};
    // const _id = componentData.id;
    if (path.length > 0) {
      const socketTabAdapter = new SocketIoTabAdapter();
      const unadaptedSocket = socketTabAdapter.unadapt(componentData);
      const req = {
        id: uuidv4(),
        name: tabName,
        description,
        type: ItemType.SOCKET_IO,
        socketio: unadaptedSocket,
        source: "USER",
        isDeleted: false,
        createdBy: "Guest User",
        updatedBy: "Guest User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (path[path.length - 1].type === ItemType.COLLECTION) {
        /**
         * handle request at collection level
         */
        const _collection = await this.readCollection(path[path.length - 1].id);
        if (_collection?.activeSync) {
          userSource = {
            currentBranch: _collection?.currentBranch,
            source: "USER",
          };
        }
        let isGuestUser;
        isGuestUserActive.subscribe((value) => {
          isGuestUser = value;
        });

        if (isGuestUser == true) {
          this.addRequestOrFolderInCollection(path[path.length - 1].id, req);
          const expectedPath = {
            folderId: "",
            folderName: "",
            collectionId: path[path.length - 1].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            /**
             * Update existing request
             */
            this.updateRequestName(req.name);
            this.updateRequestDescription(req.description);
            this.updateRequestPath(expectedPath);
            this.updateRequestId(req.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            await this.tabRepository.updateTab(
              progressiveTab.tabId,
              progressiveTab,
            );
          } else {
            /**
             * Create new copy of the existing request
             */
            const initWebSocketTab = new InitTab().socketIo(
              req.id,
              "UNTRACKED-",
            );
            initWebSocketTab.updateName(req.name);
            initWebSocketTab.updateDescription(req.description);
            initWebSocketTab.updatePath(expectedPath);
            initWebSocketTab.updateUrl(req.socketio.url);
            initWebSocketTab.updateQueryParams(req.socketio.queryParams);
            initWebSocketTab.updateHeaders(req.socketio.headers);

            this.tabRepository.createTab(initWebSocketTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const baseUrl = await this.constructBaseUrl(_workspaceMeta.id);
        const res = await this.collectionService.addSocketIoInCollection(
          {
            collectionId: path[path.length - 1].id,
            workspaceId: _workspaceMeta.id,
            ...userSource,
            items: {
              name: tabName,
              description,
              type: CollectionItemTypeBaseEnum.SOCKETIO,
              socketio: unadaptedSocket,
            },
          },
          baseUrl,
        );
        if (res.isSuccessful) {
          this.addRequestOrFolderInCollection(
            path[path.length - 1].id,
            res.data.data,
          );
          const expectedPath = {
            folderId: "",
            folderName: "",
            collectionId: path[path.length - 1].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            /**
             * Update existing request
             */
            await this.updateRequestName(res.data.data.name);
            await this.updateRequestDescription(res.data.data.description);
            await this.updateRequestPath(expectedPath);
            await this.updateRequestId(res.data.data.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            await this.tabRepository.updateTab(
              progressiveTab.tabId,
              progressiveTab,
            );
          } else {
            /**
             * Create new copy of the existing request
             */
            const initSocketTab = new InitTab().socketIo(
              res.data.data.id,
              "UNTRACKED-",
            );
            initSocketTab.updateName(res.data.data.name);
            initSocketTab.updateDescription(res.data.data.description);
            initSocketTab.updatePath(expectedPath);
            initSocketTab.updateUrl(res.data.data.socketio.url);
            initSocketTab.updateMessage(res.data.data.socketio.message);
            initSocketTab.updateQueryParams(res.data.data.socketio.queryParams);
            initSocketTab.updateHeaders(res.data.data.socketio.headers);

            this.tabRepository.createTab(initSocketTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: res.message,
            data: {
              id: res.data.data.id,
            },
          };
        } else {
          return {
            status: "error",
            message: res.message,
          };
        }
      } else if (path[path.length - 1].type === ItemType.FOLDER) {
        /**
         * handle request at folder level
         */
        const _collection = await this.readCollection(path[0].id);
        if (_collection?.activeSync) {
          userSource = {
            currentBranch: _collection?.currentBranch,
            source: "USER",
          };
        }
        let isGuestUser;
        isGuestUserActive.subscribe((value) => {
          isGuestUser = value;
        });

        if (isGuestUser == true) {
          this.addRequestInFolder(path[0].id, path[path.length - 1].id, req);
          const expectedPath = {
            folderId: path[path.length - 1].id,
            folderName: path[path.length - 1].name,
            collectionId: path[0].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            await this.updateRequestName(req.name);
            await this.updateRequestDescription(req.description);
            await this.updateRequestPath(expectedPath);
            await this.updateRequestId(req.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            await this.tabRepository.updateTab(
              progressiveTab.tabId,
              progressiveTab,
            );
          } else {
            const initSocketTab = new InitTab().socketIo(req.id, "UNTRACKED-");
            initSocketTab.updateName(req.name);
            initSocketTab.updateDescription(req.description);
            initSocketTab.updatePath(expectedPath);
            initSocketTab.updateUrl(req.socketio.url);
            initSocketTab.updateMessage(req.socketio.message);
            initSocketTab.updateQueryParams(req.socketio.queryParams);
            initSocketTab.updateHeaders(req.socketio.headers);
            this.tabRepository.createTab(initSocketTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const baseUrl = await this.constructBaseUrl(_workspaceMeta.id);
        const res = await this.collectionService.addSocketIoInCollection(
          {
            collectionId: path[0].id,
            workspaceId: _workspaceMeta.id,
            folderId: path[path.length - 1].id,
            ...userSource,
            items: {
              id: path[path.length - 1].id,
              name: path[path.length - 1].name,
              type: CollectionItemTypeBaseEnum.FOLDER,
              items: {
                name: tabName,
                description,
                type: CollectionItemTypeBaseEnum.SOCKETIO,
                socketio: unadaptedSocket,
              },
            },
          },
          baseUrl,
        );
        if (res.isSuccessful) {
          this.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            res.data.data,
          );
          const expectedPath = {
            folderId: path[path.length - 1].id,
            folderName: path[path.length - 1].name,
            collectionId: path[0].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            this.updateRequestName(res.data.data.name);
            this.updateRequestDescription(res.data.data.description);
            this.updateRequestPath(expectedPath);
            this.updateRequestId(res.data.data.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
          } else {
            const initSocketTab = new InitTab().socketIo(
              res.data.data.id,
              "UNTRACKED-",
            );
            initSocketTab.updateName(res.data.data.name);
            initSocketTab.updateDescription(res.data.data.description);
            initSocketTab.updatePath(expectedPath);
            initSocketTab.updateUrl(res.data.data.socketio.url);
            initSocketTab.updateMessage(res.data.data.socketio.message);
            initSocketTab.updateQueryParams(res.data.data.socketio.queryParams);
            initSocketTab.updateHeaders(res.data.data.socketio.headers);
            this.tabRepository.createTab(initSocketTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: res.message,
            data: {
              id: res.data.data.id,
            },
          };
        } else {
          return {
            status: "error",
            message: res.message,
          };
        }
      }
      MixpanelEvent(Events.SAVE_API_REQUEST);
    }
  };

  private constructBaseUrl = async (_id: string) => {
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
   * @param isGlobalVariable - defines to save local or global
   * @param environmentVariables - pre existing environment data
   * @param newVariableObj - new entry to be extended
   * @returns
   */
  public updateEnvironment = async (
    isGlobalVariable: boolean,
    environmentVariables,
    newVariableObj: KeyValue,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGlobalVariable) {
      // api payload
      let payload = {
        name: environmentVariables.global.name,
        variable: [
          ...environmentVariables.global.variable,
          {
            key: newVariableObj.key,
            value: newVariableObj.value,
            checked: true,
          },
        ],
      };
      // removes blank key value pairs
      payload.variable = [
        ...payload.variable.filter((variable) => {
          return variable.key.length > 0;
        }),
        {
          key: "",
          value: "",
          checked: false,
        },
      ];

      if (isGuestUser === true) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          environmentVariables.global.id,
          payload,
        );

        let currentTab = await this.tabRepository.getTabById(
          environmentVariables.global.id,
        );
        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = payload.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
        return {
          isSuccessful: true,
        };
      }
      const baseUrl = await this.constructBaseUrl(
        this._tab.getValue().path?.workspaceId as string,
      );
      const response = await this.environmentService.updateEnvironment(
        this._tab.getValue().path?.workspaceId as string,
        environmentVariables.global.id,
        payload,
        baseUrl,
      );
      if (response.isSuccessful) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          response.data.data._id,
          response.data.data,
        );

        let currentTab = await this.tabRepository.getTabById(
          response.data.data._id,
        );

        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = response.data.data.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
      } else {
        notifications.error(
          "Failed to add environment variable. Please try again.",
        );
      }
      return response;
    } else {
      // api payload
      const payload = {
        name: environmentVariables.local.name,
        variable: [
          ...environmentVariables.local.variable,
          {
            key: newVariableObj.key,
            value: newVariableObj.value,
            checked: true,
          },
        ],
      };
      // removes blank key value pairs
      payload.variable = [
        ...payload.variable.filter((variable) => {
          return variable.key.length > 0;
        }),
        {
          key: "",
          value: "",
          checked: false,
        },
      ];
      if (isGuestUser) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          environmentVariables.local.id,
          payload,
        );

        let currentTab = await this.tabRepository.getTabById(
          environmentVariables.local.id,
        );

        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = payload.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
        return {
          isSuccessful: true,
        };
      }
      const baseUrl = await this.constructBaseUrl(
        this._tab.getValue().path?.workspaceId as string,
      );
      // api response
      const response = await this.environmentService.updateEnvironment(
        this._tab.getValue().path?.workspaceId as string,
        environmentVariables.local.id,
        payload,
        baseUrl,
      );
      if (response.isSuccessful) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          response.data.data._id,
          response.data.data,
        );

        let currentTab = await this.tabRepository.getTabById(
          response.data.data._id,
        );
        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = response.data.data.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
      } else {
        notifications.error(
          "Failed to add environment variable. Please try again.",
        );
      }
      return response;
    }
  };

  /**
   * Handles collection rename
   * @param collection - collction to rename
   * @param newCollectionName :string - the new name of the collection
   */
  public handleRenameCollection = async (
    workspaceId: string,
    collectionId: string,
    newCollectionName: string,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (newCollectionName) {
      if (isGuestUser == true) {
        const colData = (await this.collectionRepository.readCollection(
          collectionId,
        )) as CollectionDocument;
        const col = colData.toMutableJSON() as CollectionDocType;
        col.name = newCollectionName;
        this.collectionRepository.updateCollection(collectionId, col);
        // notifications.success("Collection renamed successfully!");
        return {
          isSuccessful: true,
        };
      }
      const baseUrl = await this.constructBaseUrl(workspaceId);
      const response = await this.collectionService.updateCollectionData(
        collectionId,
        workspaceId,
        { name: newCollectionName },
        baseUrl,
      );
      if (response.isSuccessful) {
        this.collectionRepository.updateCollection(
          collectionId,
          response.data.data,
        );
        // notifications.success("Collection renamed successfully!");
      } else if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error("Failed to rename collection. Please try again.");
      }
      return response;
    }
  };

  /**
   * Handle folder rename
   * @param workspaceId - workspace id of the folder
   * @param collectionId - collection id of the folder
   * @param folderId  - folder id to be targetted
   * @param newFolderName - new folder name
   * @returns
   */
  public handleRenameFolder = async (
    workspaceId: string,
    collectionId: string,
    folderId: string,
    newFolderName: string,
  ) => {
    const collection =
      await this.collectionRepository.readCollection(collectionId);
    const explorer =
      await this.collectionRepository.readRequestOrFolderInCollection(
        collectionId,
        folderId,
      );
    if (newFolderName) {
      let userSource = {};
      if (collection.activeSync && explorer?.source === "USER") {
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
        const res =
          await this.collectionRepository.readRequestOrFolderInCollection(
            collectionId,
            folderId,
          );
        if (res) {
          res.name = newFolderName;
        }

        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          folderId,
          res,
        );
        // notifications.success("Folder renamed successfully!");
        return {
          isSuccessful: true,
        };
      }
      const baseUrl = await this.constructBaseUrl(workspaceId);
      const response = await this.collectionService.updateFolderInCollection(
        workspaceId,
        collectionId,
        folderId,
        {
          ...userSource,
          name: newFolderName,
        },
        baseUrl,
      );
      if (response.isSuccessful) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          folderId,
          response.data.data,
        );
        // notifications.success("Folder renamed successfully!");
      } else {
        notifications.error("Failed to rename folder. Please try again.");
      }
      return response;
    }
  };

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };

  public connectWebsocket = async (environmentVariables) => {
    const websocketData = this._tab.getValue();

    const decodeData = new DecodeSocketio().init(
      this._tab.getValue().property.socketio,
      environmentVariables?.filtered || [],
    );

    return await this.collectionService.connectSocketIo(
      decodeData[0] as string,
      websocketData.tabId,
      decodeData[1],
    );
  };
  public disconnectWebsocket = async () => {
    const websocketData = this._tab.getValue();
    return await this.collectionService.disconnectSocketIo(
      websocketData?.tabId,
    );
  };
  public sendMessageWebsocket = async () => {
    const websocketData = this._tab.getValue();

    return await this.collectionService.sendMessageSocketIo(
      websocketData.tabId,
      websocketData.property.socketio?.message as string,
      (websocketData.property.socketio?.eventName as string) || "message",
    );
  };

  public searchMessages = async (_search: string) => {
    const websocketData = this._tab.getValue();
    socketIoDataStore.update((webSocketDataMap) => {
      const wsData = webSocketDataMap.get(websocketData.tabId);
      if (wsData) {
        wsData.search = _search;
        webSocketDataMap.set(websocketData.tabId, wsData);
      }
      return webSocketDataMap;
    });
  };

  public deleteMessages = async () => {
    const websocketData = this._tab.getValue();
    socketIoDataStore.update((webSocketDataMap) => {
      const wsData = webSocketDataMap.get(websocketData.tabId);
      if (wsData) {
        wsData.search = "";
        wsData.messages = [];
        wsData.body = "";
        webSocketDataMap.set(websocketData.tabId, wsData);
      }
      return webSocketDataMap;
    });
    notifications.success("All responses cleared successfully.");
  };

  public updateContentType = async (_contentType: string) => {
    const websocketData = this._tab.getValue();
    socketIoDataStore.update((webSocketDataMap) => {
      const wsData = webSocketDataMap.get(websocketData.tabId);
      if (wsData) {
        wsData.contentType = _contentType;
        webSocketDataMap.set(websocketData.tabId, wsData);
      }
      return webSocketDataMap;
    });
  };

  public updateMessageBody = async (_body: string) => {
    const websocketData = this._tab.getValue();
    socketIoDataStore.update((webSocketDataMap) => {
      const wsData = webSocketDataMap.get(websocketData.tabId);
      if (wsData) {
        wsData.body = _body;
        webSocketDataMap.set(websocketData.tabId, wsData);
      }
      return webSocketDataMap;
    });
  };

  public updateFilterType = async (_filterType: string) => {
    const websocketData = this._tab.getValue();
    socketIoDataStore.update((webSocketDataMap) => {
      const wsData = webSocketDataMap.get(websocketData.tabId);
      if (wsData) {
        wsData.filter = _filterType;
        webSocketDataMap.set(websocketData.tabId, wsData);
      }
      return webSocketDataMap;
    });
  };

  public clearInput = async () => {
    const initWebSocketTab = new InitTab()
      .socketIo("_id", "_websocketId")
      .getValue();
    await this.updateMessage("");
    await this.updateHeaders(initWebSocketTab?.property?.socketio.headers);
    await this.updateParams(initWebSocketTab?.property?.socketio.queryParams);
    notifications.success("Cleared all inputs successfully.");
  };
}

export { SocketIoExplorerPageViewModel };
