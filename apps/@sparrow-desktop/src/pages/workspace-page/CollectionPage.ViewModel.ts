import type {
  CollectionDocument,
  TabDocument,
  WorkspaceDocument,
} from "../../database/database";

// Repositories
import { CollectionRepository } from "../../repositories/collection.repository";
import { EnvironmentRepository } from "../../repositories/environment.repository";
import { TabRepository } from "../../repositories/tab.repository";
import { WorkspaceRepository } from "../../repositories/workspace.repository";
//-----
import { v4 as uuidv4 } from "uuid";

//-----
// Services
import {
  insertCollection,
  insertCollectionDirectory,
} from "../../services/collection";
import { CollectionService } from "../../services/collection.service";
import { notifications } from "@sparrow/library/ui";
// import { setContentTypeHeader } from "@sparrow/common/utils";

//-----
//External Imports
import { invoke } from "@tauri-apps/api/core";
//-----

//Utils

import type {
  CreateApiRequestPostBody,
  CreateDirectoryPostBody,
  ImportBodyUrl,
} from "@sparrow/common/dto";

//Emuns

import { ItemType, UntrackedItems } from "@sparrow/common/enums/item-type.enum";
import { ContentTypeEnum, ResponseStatusCode } from "@sparrow/common/enums";
//-----

import { moveNavigation } from "@sparrow/common/utils/navigation";
import { GuideRepository } from "../../repositories/guide.repository";
import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { type Observable } from "rxjs";
import { InitRequestTab, InitWebSocketTab } from "@sparrow/common/utils";
import { InitCollectionTab } from "@sparrow/common/utils";
import { InitFolderTab } from "@sparrow/common/utils";
import { tabsSplitterDirection } from "@sparrow/workspaces/stores";
import {
  insertCollectionRequest,
  updateCollectionRequest,
} from "../../services/collection";
import { GithubService } from "../../services/github.service";
import { GithubRepoReposistory } from "../../repositories/github-repo.repository";
import { RequestTabAdapter } from "../../adapter/request-tab";
import { FeatureSwitchRepository } from "../../repositories/feature-switch.repository";
import { GuestUserRepository } from "../../repositories/guest-user.repository";
import { isGuestUserActive } from "@app/store/auth.store";
import { InitTab } from "@sparrow/common/factory";
import {
  type CollectionBaseInterface as CollectionDto,
  type CollectionArgsBaseInterface as CollectionArgsDto,
  type CollectionItemBaseInterface as CollectionItemsDto,
  CollectionItemTypeBaseEnum,
} from "@sparrow/common/types/workspace/collection-base";
import type { HttpRequestBaseInterface as RequestDto } from "@sparrow/common/types/workspace/http-request-base";
import {
  TabPersistenceTypeEnum,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import { SocketTabAdapter } from "../../adapter/socket-tab";
import type { CollectionDocType } from "../../models/collection.model";
import type { GuideQuery } from "../../types/user-guide";
import type { FeatureQuery } from "../../types/feature-switch";
import { ReduceQueryParams } from "@sparrow/workspaces/features/rest-explorer/utils";

import { createDeepCopy } from "@sparrow/common/utils";
import {
  GraphqlTabAdapter,
  RequestSavedTabAdapter,
  SocketIoTabAdapter,
} from "../../adapter";
import type {
  SocketIORequestDeletePayloadDtoInterface,
  SocketIORequestCreateUpdateInFolderPayloadDtoInterface,
  SocketIORequestCreateUpdateInCollectionPayloadDtoInterface,
} from "@sparrow/common/types/workspace/socket-io-request-dto";
import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
import type {
  GraphqlRequestAuthDtoInterface,
  GraphqlRequestCreateUpdateInCollectionPayloadDtoInterface,
  GraphqlRequestCreateUpdateInFolderPayloadDtoInterface,
  GraphqlRequestDeletePayloadDtoInterface,
  GraphqlRequestKeyValueDtoInterface,
} from "@sparrow/common/types/workspace/graphql-request-dto";
import {
  GraphqlRequestDefaultAliasBaseEnum,
  GraphqlRequestAuthModeBaseEnum,
} from "@sparrow/common/types/workspace/graphql-request-base";
import type { Path } from "@sparrow/common/interfaces/request.interface";

export default class CollectionsViewModel {
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();
  private collectionRepository = new CollectionRepository();
  private environmentRepository = new EnvironmentRepository();
  private githhubRepoRepository = new GithubRepoReposistory();
  private collectionService = new CollectionService();
  private githubService = new GithubService();
  private guideRepository = new GuideRepository();
  private initTab = new InitTab();

  private featureSwitchRepository = new FeatureSwitchRepository();
  private guestUserRepository = new GuestUserRepository();
  private movedTabStartIndex = 0;
  private movedTabEndIndex = 0;

  constructor() {}

  /**
   * Get the guest user state
   */
  private getGuestUserState = async () => {
    const response = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    return response?.getLatest().toMutableJSON().isGuestUser;
  };

  /**
   * Fetch collections from services and insert to repository
   * @param workspaceId - id of current workspace
   */
  public fetchCollections = async (
    workspaceId: string,
  ): Promise<{ collectionItemTabsToBeDeleted?: string[] }> => {
    const isGuestUser = await this.getGuestUserState();
    if (!workspaceId || isGuestUser) {
      return {};
    }
    /**
     * Iterates throught the Collection and return all the Collection item Ids - COllection, Folder, Http Request, WebSocket Request.
     * @param _collectionItem - Collection or Collection item (Folder, Http Request, WebSocket Request).
     * @param _collectionItemIds - Blank list that should be manipulated by this function as a result.
     * @returns List of COllection item Ids.
     */
    const getCollectionItemIds = (
      _collectionItem: any,
      _collectionItemIds: string[],
    ): void => {
      if (!_collectionItem?.type) {
        // Collection - object do not have type and holds _id.
        _collectionItemIds.push(_collectionItem._id);
      } else {
        // Folder, Http Request, WebSocket Request - object that holds id.
        _collectionItemIds.push(_collectionItem.id);
      }

      // Recursively search through the Collection item structure
      for (let j = 0; j < _collectionItem?.items?.length; j++) {
        getCollectionItemIds(_collectionItem.items[j], _collectionItemIds);
      }
      return;
    };

    const res = await this.collectionService.fetchCollection(workspaceId);
    if (res?.isSuccessful && res?.data?.data) {
      const collections = res.data.data;
      await this.collectionRepository.bulkInsertData(
        workspaceId,
        collections?.map((_collection: any) => {
          const collection = createDeepCopy(_collection);
          collection["workspaceId"] = workspaceId;
          collection["id"] = _collection._id;
          delete collection._id;
          return collection;
        }),
      );
      await this.collectionRepository.deleteOrphanCollections(
        workspaceId,
        collections?.map((_collection: any) => {
          return _collection._id;
        }),
      );
      const collectionItemIds: string[] = [];
      for (let i = 0; i < collections.length; i++) {
        getCollectionItemIds(collections[i], collectionItemIds);
      }

      const collectionItemTabsToBeDeleted =
        await this.tabRepository.getIdOfTabsThatDoesntExistAtCollectionLevel(
          workspaceId,
          collectionItemIds as string[],
        );

      return {
        collectionItemTabsToBeDeleted,
      };
    }

    return {};
  };

  public deleteTabsWithTabIdInAWorkspace = (
    _workspaceId: string,
    _tabIds: string[],
  ) => {
    this.tabRepository.deleteTabsWithTabIdInAWorkspace(_workspaceId, _tabIds);
  };

  /**
   *
   * @param uuid - workspace id
   * @returns workspace document
   */
  public readWorkspace = (uuid: string): Promise<WorkspaceDocument> => {
    return this.workspaceRepository.readWorkspace(uuid);
  };

  /**
   * Return current tabs list of top tab bar component
   */
  public tabs() {
    return this.tabRepository.getTabList();
  }
  public getTabListWithWorkspaceId(
    workspaceId: string,
  ): Observable<TabDocument[]> | undefined {
    return this.tabRepository.getTabListWithWorkspaceId(workspaceId);
  }

  /**
   * @description - Fetches github repository data
   */
  public getGithubRepo = async () => {
    const githubRepoId = "sparrow-github";
    const document = await this.githhubRepoRepository.findOne({
      id: githubRepoId,
    });
    return document;
  };

  /**
   * Get list of all environments
   * @return Observable<Environments[]> - list of all environments
   */
  public getEnvironmentList = () => {
    return this.environmentRepository.getEnvironment();
  };

  /**
   * Get active tab(if any)
   * @returns :Observable<any> | undefined - active tab
   */
  public getActiveTab = (
    workspaceId: string,
  ): Observable<TabDocument | null> | undefined => {
    return this.tabRepository.getTabWithWorkspaceId(workspaceId);
  };

  /**
   * Handles creating a new tab
   * @param data :any - data of the tab i.e. collection, folder or request
   */
  public handleCreateTab = (data: Tab) => {
    this.tabRepository.createTab(data);
  };

  /**
   * Remove the tab from tab list in store
   * @param id - tab id
   */
  public handleRemoveTab = (id: string) => {
    this.tabRepository.removeTab(id);
  };

  /**
   * Create new tab with untracked id
   */
  public createNewTab = async (_limit = 5) => {
    if (_limit === 0) return;
    const ws = await this.workspaceRepository.getActiveWorkspaceDoc();
    if (ws) {
      this.tabRepository.createTab(
        new InitRequestTab("UNTRACKED-" + uuidv4(), ws._id).getValue(),
      );
      moveNavigation("right");
      MixpanelEvent(Events.ADD_NEW_API_REQUEST, { source: "TabBar" });
    } else {
      setTimeout(() => {
        this.createNewTab(_limit - 1);
      }, 2000);
    }
  };

  /**
   * Create new tab with untracked id with updated Details
   */
  public createNewTabWithData = async (_limit = 5) => {
    if (_limit === 0) return;
    const ws = await this.workspaceRepository.getActiveWorkspaceDoc();
    // isApiCreatedFirstTime.set(true);
    if (ws) {
      const initRequestTab = new InitRequestTab(
        "UNTRACKED-" + uuidv4(),
        ws._id,
      );
      initRequestTab.updateChatbotState(true);
      this.tabRepository.createTab(initRequestTab.getValue());
      moveNavigation("right");
    } else {
      setTimeout(() => {
        this.createNewTabWithData(_limit - 1);
      }, 2000);
    }
  };

  /**
   * Create web socket new tab with untracked id
   */
  private createWebSocketNewTab = async () => {
    const ws = await this.workspaceRepository.getActiveWorkspaceDoc();
    if (ws) {
      this.tabRepository.createTab(
        this.initTab.webSocket("UNTRACKED-" + uuidv4(), ws._id).getValue(),
      );
      moveNavigation("right");
      MixpanelEvent(Events.ADD_NEW_API_REQUEST, { source: "TabBar" });
    } else {
      console.error("No active workspace found!");
    }
  };

  /**
   * Create socket io new tab with untracked id
   */
  private createSocketIoNewTab = async () => {
    const ws = await this.workspaceRepository.getActiveWorkspaceDoc();
    if (ws) {
      this.tabRepository.createTab(
        this.initTab.socketIo("UNTRACKED-" + uuidv4(), ws._id).getValue(),
      );
      moveNavigation("right");
    } else {
      console.error("No active workspace found!");
    }
  };

  /**
   * Create graphql new tab with untracked id
   */
  private createGraphqlNewTab = async () => {
    const ws = await this.workspaceRepository.getActiveWorkspaceDoc();
    if (ws) {
      this.tabRepository.createTab(
        this.initTab.graphQl("UNTRACKED-" + uuidv4(), ws._id).getValue(),
      );
      moveNavigation("right");
    } else {
      console.error("No active workspace found!");
    }
  };

  /**
   * Set active tab in store
   * @param id - tab id
   */
  public handleActiveTab = async (id: string) => {
    await this.tabRepository.activeTab(id);
  };

  /**
   * Handle tab drop on tab list
   * @param event
   */
  public onDropEvent = (event: Event) => {
    event.preventDefault();
    this.tabRepository.rearrangeTab(
      this.movedTabStartIndex,
      this.movedTabEndIndex,
    );
  };

  /**
   * Set starting index of tab from tab list
   * @param index - tab index
   */
  public handleDropOnStart = (index: number) => {
    this.movedTabStartIndex = index;
  };

  /**
   * Set ending index of tab in tab list
   * @param index - tab index
   */
  public handleDropOnEnd = (index: number) => {
    this.movedTabEndIndex = index;
  };

  /**
   * Retrieve request inside folder from repository
   * @param collectionId
   * @param folderId
   * @param uuid
   * @returns
   */
  private readRequestInFolder = (
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
   * Retrieve request or folder from repository
   * @param collectionId
   * @param uuid
   * @returns
   */
  private readRequestOrFolderInCollection = async (
    collectionId: string,
    uuid: string,
  ): Promise<CollectionItemsDto | undefined> => {
    return await this.collectionRepository.readRequestOrFolderInCollection(
      collectionId,
      uuid,
    );
  };

  /**
   * Retrieve collection from repository
   * @param uuid
   * @returns
   */
  public readCollection = async (uuid: string): Promise<CollectionDocument> => {
    return await this.collectionRepository.readCollection(uuid);
  };

  /**
   * Save API Request from unsaved Tab
   * @param componentData - New Tab
   * @param saveDescriptionOnly
   * @returns
   */
  public saveAPIRequest = async (componentData: Tab) => {
    const { folderId, collectionId, workspaceId } = componentData.path;
    if (!workspaceId || !collectionId) {
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

    const requestTabAdapter = new RequestTabAdapter();
    const unadaptedRequest = requestTabAdapter.unadapt(componentData);
    // Save overall api

    const requestMetaData = {
      id: _id,
      name: componentData?.name,
      description: componentData?.description,
      type: ItemType.REQUEST,
    };

    let folderSource;
    let itemSource;
    if (folderId) {
      folderSource = {
        folderId: folderId,
      };
      itemSource = {
        id: folderId,
        type: ItemType.FOLDER,
        items: {
          ...requestMetaData,
          request: unadaptedRequest,
        },
      };
    } else {
      itemSource = {
        ...requestMetaData,
        request: unadaptedRequest,
      };
    }

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      const data = {
        id: requestMetaData.id,
        name: requestMetaData.name,
        description: requestMetaData.description,
        type: "REQUEST",
        request: unadaptedRequest,
        updatedAt: "",
        updatedBy: "Guest User",
      };
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
      return true;
    }

    const dt = {
      collectionId: collectionId,
      workspaceId: workspaceId,
      ...folderSource,
      ...userSource,
      items: itemSource as unknown as CollectionItemsDto,
    };
    const res = await updateCollectionRequest(_id, folderId, collectionId, dt);
    if (res.isSuccessful) {
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
      return true;
    } else {
      return false;
    }
  };

  /**
   * Handle updating tab
   * @param data :any - tab data i.e. collection, folder or request
   * @param route :string - path to collection, folder or request
   * @param _id :string - if of the tab
   */
  public updateTab = async (_id: string, data: Partial<Tab>) => {
    this.tabRepository.updateTabByMongoId(_id, data);
  };

  /**
   * Handle deleting collection from repository
   * @param workspaceId :string - workspace id in which the collection is saved
   * @param collectionId :string - collection id to be deleted
   * @returns :void
   */
  private deleteCollectioninWorkspace = (
    workspaceId: string,
    collectionId: string,
  ) => {
    return this.workspaceRepository.deleteCollectionInWorkspace(
      workspaceId,
      collectionId,
    );
  };

  /**
   * Handles removing multiple tabs from tab
   * @param ids :string[] - the ids of tab to be removed
   */
  private removeMultipleTabs = async (ids: string[]) => {
    ids.forEach((id) => {
      this.tabRepository.removeTab(id);
    });
  };

  /**
   * Get list of collections from current active workspace
   * @returns :Observable<CollectionDocument[]> - the list of collection from current active workspace
   */
  public getCollectionList = () => {
    return this.collectionRepository.getCollection();
  };

  /**
   * Get the active workspace
   * @returns :Observable<WorkspaceDocument> - the active workspace
   */
  public getActiveWorkspace = (): Observable<WorkspaceDocument> => {
    return this.workspaceRepository.getActiveWorkspace();
  };

  /**
   * Adds collection to the repository
   * @param collection :CollectionDocument - the collection to be added
   */
  private addCollection = (collection: CollectionDto) => {
    this.collectionRepository.addCollection(collection);
  };

  /**
   * @description - refreshes github respository data
   */
  public fetchGithubRepo = async () => {
    const githubRepoId = "sparrow-github";
    const response = await this.githubService.getRepoMetaData(
      "sparrowapp-dev/sparrow-app",
    );
    if (response.isSuccessful) {
      const githubDocument = await this.githhubRepoRepository.findOne({
        id: githubRepoId,
      });
      if (!githubDocument) {
        await this.githhubRepoRepository.insert({
          id: githubRepoId,
          stargazers_count: response.data.stargazers_count,
        });
      } else {
        await this.githhubRepoRepository.update(
          {
            id: githubRepoId,
          },
          {
            stargazers_count: response.data.stargazers_count,
          },
        );
      }
      return response.data;
    }
  };
  /**
   * Generate available name of new collection like New collection 2 if New collection is already taken
   * @param list :any[] - list of collections
   * @param name :string - name to be chacked
   * @returns :string - new unique name
   */
  private getNextCollection = (list: CollectionDto[], name: string) => {
    const isNameAvailable: (proposedName: string) => boolean = (
      proposedName,
    ) => {
      return list.some((element) => {
        return element.name === proposedName;
      });
    };

    if (!isNameAvailable(name)) {
      return name;
    }

    for (let i = 2; i < list.length + 10; i++) {
      const proposedName: string = `${name} ${i}`;
      if (!isNameAvailable(proposedName)) {
        return proposedName;
      }
    }

    return null;
  };

  /**
   * Handle create empty collection
   * @param workspaceId :string
   */
  public handleCreateCollection = async (workspaceId: string) => {
    let collectionList: CollectionDto[] = [];

    await this.collectionRepository
      .getCollection()
      .subscribe(
        (collections) =>
          (collectionList = collections as unknown as CollectionDto[]),
      )
      .unsubscribe();
    const updatedCollectionList = collectionList.filter(
      (collection) => collection.workspaceId === workspaceId,
    );
    const newCollection = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: this.getNextCollection(
        updatedCollectionList,
        "New Collection",
      ) as string,
      items: [],
      createdAt: new Date().toISOString(),
    };
    let response;
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser !== true) {
      response = await this.collectionService.addCollection({
        name: newCollection.name,
        workspaceId: workspaceId,
      });

      if (response.isSuccessful && response.data.data) {
        const res = response.data.data;
        await this.addCollection({
          ...res,
          id: res._id,
          workspaceId: workspaceId,
        });
        const path = {
          workspaceId: workspaceId,
          collectionId: response.data.data._id,
          folderId: "",
        };

        const initCollectionTab = new InitCollectionTab(
          response.data.data._id,
          workspaceId,
        );

        initCollectionTab.updateId(response.data.data._id);
        initCollectionTab.updatePath(path);
        initCollectionTab.updateName(response.data.data.name);

        this.tabRepository.createTab(initCollectionTab.getValue());
        moveNavigation("right");

        await this.workspaceRepository.updateCollectionInWorkspace(
          workspaceId,
          {
            id: initCollectionTab.getValue().id,
            name: newCollection.name,
          },
        );
        notifications.success("New Collection created successfully.");
        MixpanelEvent(Events.CREATE_COLLECTION, {
          source: "USER",
          collectionName: response.data.data.name,
          collectionId: response.data.data._id,
        });
      } else {
        notifications.error(response.message ?? "Failed to create collection!");
      }
    } else {
      const collectionId = uuidv4();
      const dt: CollectionDto = {
        id: collectionId,
        name: newCollection.name,
        workspaceId: workspaceId,
        items: [],
        description: "",
        createdAt: newCollection.createdAt,
        createdBy: "guestUser",
        totalRequests: 0,
        updatedAt: newCollection.createdAt,
        updatedBy: "guestUser",
      };
      await this.addCollection(dt);
      const path = {
        workspaceId: workspaceId,
        collectionId: "",
        folderId: "",
      };
      const initCollectionTab = new InitCollectionTab(
        collectionId,
        workspaceId,
      );
      initCollectionTab.updateId(collectionId);
      initCollectionTab.updatePath(path);
      initCollectionTab.updateName(newCollection.name);
      this.tabRepository.createTab(initCollectionTab.getValue());
      moveNavigation("right");

      await this.workspaceRepository.updateCollectionInWorkspace(workspaceId, {
        id: initCollectionTab.getValue().id,
        name: newCollection.name,
      });
      notifications.success("New Collection created successfully.");
    }
    return response;
  };

  /**
   * Handle Import Api using Curl
   * @param importCurl: string - Curl string
   */
  private handleImportCurl = async (
    workspaceId: string,
    importCurl: string,
  ) => {
    const response =
      await this.collectionService.importCollectionFromCurl(importCurl);

    if (response.isSuccessful) {
      const req = response.data.data.request;
      const reducedQueryParams = new ReduceQueryParams(req.queryParams);
      const paramString = reducedQueryParams.getValue();
      if (paramString) {
        response.data.data.request.url = req.url + "?" + paramString;
      }
      const requestTabAdapter = new RequestTabAdapter();
      const tabId = UntrackedItems.UNTRACKED + uuidv4();
      const adaptedRequest = requestTabAdapter.adapt(
        workspaceId || "",
        "",
        "",
        {
          ...response.data.data,
          id: tabId,
        },
      );
      adaptedRequest.isSaved = false;
      await this.tabRepository.createTab(adaptedRequest);
      moveNavigation("right");

      notifications.success("cURL imported successfully.");
    } else {
      if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error("Failed to import cURL. Please try again.");
      }
    }
    MixpanelEvent(Events.IMPORT_API_VIA_CURL, {
      source: "curl import popup",
    });
    return response;
  };

  /**
   * Validates Curl
   * @param importCurl: string - Curl string
   */
  public handleValidateCurl = async (importCurl: string) => {
    const response =
      await this.collectionService.importCollectionFromCurl(importCurl);
    if (response.isSuccessful) {
      const method = await response?.data?.data?.request?.method;
      const isSuccessful = response.isSuccessful;
      return {
        isSuccessful: isSuccessful,
        method: method,
      };
    } else {
      return {
        isSuccessful: false,
      };
    }
  };

  /**
   * Handles creating unique name for new collection, folder or request
   * @param list :any[] - list of collection, folder or request
   * @param type :string - type of element of list, i.e. collection, folder, request
   * @param name :string - name of new element
   * @returns :string - new proposed name of new collection, folder or request
   */
  private getNextName = (
    list: { type: string; name: string }[],
    type: string,
    name: string,
  ) => {
    const isNameAvailable: (proposedName: string) => boolean = (
      proposedName,
    ) => {
      return list.some((element) => {
        return element.type === type && element.name === proposedName;
      });
    };

    if (!isNameAvailable(name)) {
      return name;
    }

    for (let i = 2; i < list.length + 10; i++) {
      const proposedName: string = `${name} ${i}`;
      if (!isNameAvailable(proposedName)) {
        return proposedName;
      }
    }
  };

  /**
   * Handle creating a new request in a collection
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which new request is going to be created
   * @returns :void
   */
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
        } as RequestDto,
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
      MixpanelEvent(Events.CREATE_REQUEST, {
        source: "Collection list",
      });
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

      // request.id = res.id;
      // request.path.workspaceId = workspaceId;
      // request.path.collectionId = collection.id;
      // request.property.request.save.api = true;
      // request.property.request.save.description = true;
      request.updateId(res.id);
      request.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: "",
      });
      request.updateIsSave(true);
      // this.handleOpenRequest(
      //   workspaceId,
      //   collection,
      //   {
      //     id: "",
      //     name: "",
      //   },
      //   request,
      // );
      this.tabRepository.createTab(request.getValue());
      moveNavigation("right");
      MixpanelEvent(Events.CREATE_REQUEST, {
        source: "Collection list",
      });
      return;
    } else {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        collection.id,
        request.getValue().id,
      );
      notifications.error(response.message);
    }
  };

  /**
   * Handle creating a new web socket in a collection
   * @param workspaceId
   * @param collection - the collection in which new web socket is going to be created
   */
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
      MixpanelEvent(Events.CREATE_REQUEST, {
        source: "Collection list",
      });
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
      MixpanelEvent(Events.CREATE_REQUEST, {
        source: "Collection list",
      });
      return;
    } else {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        collection.id,
        websocket.getValue().id,
      );
      notifications.error(response.message);
    }
  };

  /**
   * Handle creating a new socket io in a collection
   * @param _workspaceId - workspace id
   * @param _collection - the collection in which new socket io is going to be created
   */
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
      MixpanelEvent(Events.CREATE_REQUEST, {
        source: "Collection list",
      });
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
      MixpanelEvent(Events.CREATE_REQUEST, {
        source: "Collection list",
      });
      return;
    } else {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        _collection.id,
        socketIoTab.getValue().id,
      );
      notifications.error(response.message);
    }
  };

  /**
   * Handle creating a new graphql in a collection
   * @param _workspaceId - workspace id
   * @param _collection - the collection in which new graphql is going to be created
   */
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

  /**
   * Handles creating a new request in a folder
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which new request is going to be created
   * @param explorer : - the folder in which new request is going to be created
   * @returns :void
   */
  private handleCreateRequestInFolder = async (
    workspaceId: string,
    collection: CollectionDto,
    explorer: CollectionItemsDto,
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
          } as RequestDto,
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
      )) as CollectionItemsDto;
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
    const response =
      await this.collectionService.addRequestInCollection(requestObj);
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
    collection: CollectionDto,
    explorer: CollectionItemsDto,
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
      )) as CollectionItemsDto;
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
    const response =
      await this.collectionService.addSocketInCollection(requestObj);
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
    _collection: CollectionDto,
    _folder: CollectionItemsDto,
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
    const response = await this.collectionService.addSocketIoInCollection(
      socketIoInFolderPayload,
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
    _collection: CollectionDto,
    _folder: CollectionItemsDto,
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
    const response = await this.collectionService.addGraphqlInCollection(
      graphqlInFolderPayload,
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
   * Handles creating a new folder in a collection
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which new folder is going to be created
   * @returns :void
   */
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

      this.handleCreateTab(sampleFolder.getValue());
      moveNavigation("right");

      // Update the locally added folder with server response
      const folderObj = data;
      await this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        folder.id,
        folderObj,
      );

      MixpanelEvent(Events.CREATE_FOLDER, {
        source: "Collection list",
      });
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

      this.handleCreateTab(sampleFolder.getValue());
      moveNavigation("right");

      // Update the locally added folder with server response
      const folderObj = response.data.data;
      await this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        folder.id,
        folderObj,
      );

      MixpanelEvent(Events.CREATE_FOLDER, {
        source: "Collection list",
      });
    } else {
      // Show error notification and clean up by deleting the folder locally on failure.
      notifications.error("Failed to create folder. Please try again.");
      this.collectionRepository.deleteRequestOrFolderInCollection(
        collection.id,
        folder.id,
      );
    }
  };

  /**
   * Handles renaming a collection
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection going to be renamed
   * @param newCollectionName :string - the new name of the collection
   */
  private handleRenameCollection = async (
    workspaceId: string,
    collection: CollectionDto,
    newCollectionName: string,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser !== true) {
      if (newCollectionName) {
        const response = await this.collectionService.updateCollectionData(
          collection.id,
          workspaceId,
          { name: newCollectionName },
        );
        if (response.isSuccessful) {
          this.collectionRepository.updateCollection(
            collection.id,
            response.data.data,
          );
          this.updateTab(collection.id, {
            name: newCollectionName,
          });
          MixpanelEvent(Events.RENAME_COLLECTION, {
            source: "Collection list",
          });
        } else if (response.message === "Network Error") {
          notifications.error(response.message);
        } else {
          notifications.error("Failed to rename collection. Please try again.");
        }
      }
    } else {
      if (newCollectionName) {
        const response = {
          data: {
            name: newCollectionName,
          },
        };
        await this.collectionRepository.updateCollection(
          collection.id,
          response.data,
        );
        this.updateTab(collection.id, { name: newCollectionName });
        notifications.success("Collection renamed successfully!");
      } else {
        notifications.error("Failed to rename collection. Please try again.");
      }
    }
  };

  /**
   * Handles renaming a folder
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which the folder is saved
   * @param explorer : - the folder going to be renamed
   * @param newFolderName :string - the new name of the folder
   */
  private handleRenameFolder = async (
    workspaceId: string,
    collection: CollectionDto,
    explorer: CollectionItemsDto,
    newFolderName: string,
  ) => {
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

      if (isGuestUser !== true) {
        const response = await this.collectionService.updateFolderInCollection(
          workspaceId,
          collection.id,
          explorer.id,
          {
            ...userSource,
            name: newFolderName,
          },
        );
        if (response.isSuccessful) {
          this.collectionRepository.updateRequestOrFolderInCollection(
            collection.id,
            explorer.id,
            response.data.data,
          );

          this.updateTab(explorer.id, {
            name: newFolderName,
          });
          MixpanelEvent(Events.RENAME_FOLDER, {
            source: "Collection list",
          });
        }
      } else {
        this.updateTab(collection.id, { name: newFolderName });
        const res =
          await this.collectionRepository.readRequestOrFolderInCollection(
            collection.id,
            explorer.id,
          );
        if (res) {
          res.name = newFolderName;
        }
        this.collectionRepository.updateRequestOrFolderInCollection(
          collection.id,
          explorer.id,
          res,
        );
        // notifications.success("Folder renamed successfully!");

        this.updateTab(explorer.id, {
          name: newFolderName,
        });
        MixpanelEvent(Events.RENAME_FOLDER, {
          source: "Collection list",
        });
      }
    }
  };

  /**
   * Handles opening a request on a tab
   * @param request : - The request going to be opened on tab
   * @param path : - The path to the request
   */
  public handleOpenRequest = (
    workspaceId: string,
    collection: CollectionDto,
    folder: CollectionItemsDto,
    request: CollectionItemsDto,
  ) => {
    const requestTabAdapter = new RequestTabAdapter();
    const adaptedRequest = requestTabAdapter.adapt(
      workspaceId || "",
      collection?.id || "",
      folder?.id || "",
      request,
    );
    adaptedRequest.persistence = TabPersistenceTypeEnum.TEMPORARY;
    this.tabRepository.createTab(adaptedRequest);
    moveNavigation("right");
  };

  /**
   * Handles opening a request on a tab
   * @param request : - The request going to be opened on tab
   * @param path : - The path to the request
   */
  private handleOpenSavedRequest = (
    workspaceId: string,
    collection: CollectionDto,
    folder: CollectionItemsDto,
    _request: CollectionItemsDto,
    _savedRequest: CollectionItemsDto,
  ) => {
    const requestSavedTabAdapter = new RequestSavedTabAdapter();
    const adaptedRequest = requestSavedTabAdapter.adapt(
      workspaceId || "",
      collection?.id || "",
      folder?.id || "",
      _request?.id,
      _savedRequest,
    );
    adaptedRequest.persistence = TabPersistenceTypeEnum.TEMPORARY;
    this.tabRepository.createTab(adaptedRequest);
    moveNavigation("right");
  };

  /**
   * Handles opening a request on a tab
   * @param request : - The request going to be opened on tab
   * @param path : - The path to the request
   */
  public handleOpenGraphqlTab = (
    workspaceId: string,
    collection: CollectionDto,
    folder: CollectionItemsDto,
    _graphql: CollectionItemsDto,
  ) => {
    const requestTabAdapter = new GraphqlTabAdapter();
    const adaptedRequest = requestTabAdapter.adapt(
      workspaceId || "",
      collection?.id || "",
      folder?.id || "",
      _graphql,
    );
    adaptedRequest.persistence = TabPersistenceTypeEnum.TEMPORARY;
    this.tabRepository.createTab(adaptedRequest);
    moveNavigation("right");
  };

  /**
   * Handles opening a request on a tab
   * @param request : - The request going to be opened on tab
   * @param path : - The path to the request
   */
  public handleOpenWebSocket = (
    workspaceId: string,
    collection: CollectionDto,
    folder: CollectionItemsDto,
    websocket: CollectionItemsDto,
  ) => {
    const socketTabAdapter = new SocketTabAdapter();
    const adaptedSocket = socketTabAdapter.adapt(
      workspaceId || "",
      collection?.id || "",
      folder?.id || "",
      websocket,
    );
    adaptedSocket.persistence = TabPersistenceTypeEnum.TEMPORARY;
    this.tabRepository.createTab(adaptedSocket);
    moveNavigation("right");
  };

  /**
   * Handles opening a socket io on a tab
   * @param _workspaceId  Workspace id of which tab belongs to.
   * @param _collection  Collection of which tab belongs to.
   * @param _folder Folder of which tab belongs to.
   * @param _socketIo Socket Io meta data
   */
  public handleOpenSocketIoTab = (
    _workspaceId: string,
    _collection: CollectionDto,
    _folder: CollectionItemsDto,
    _socketIo: CollectionItemsDto,
  ) => {
    const socketIoTabAdapter = new SocketIoTabAdapter();
    const adaptedSocketIo = socketIoTabAdapter.adapt(
      _workspaceId || "",
      _collection?.id || "",
      _folder?.id || "",
      _socketIo,
    );
    adaptedSocketIo.persistence = TabPersistenceTypeEnum.TEMPORARY;
    this.tabRepository.createTab(adaptedSocketIo);
    moveNavigation("right");
  };

  public handleOpenFolder = (
    workspaceId: string,
    collection: CollectionDto,
    folder: CollectionItemsDto,
  ) => {
    const path = {
      workspaceId: workspaceId,
      collectionId: collection.id ?? "",
      folderId: folder?.id,
      folderName: folder.name,
    };

    const sampleFolder = new InitFolderTab(
      folder.id,
      collection.workspaceId as string,
    );
    sampleFolder.updateName(folder.name);
    sampleFolder.updatePath(path);
    sampleFolder.updateIsSave(true);
    sampleFolder.updateTabType(TabPersistenceTypeEnum.TEMPORARY);

    this.handleCreateTab(sampleFolder.getValue());
    moveNavigation("right");
  };

  public handleOpenCollection = (
    workspaceId: string,
    collection: CollectionDto,
  ) => {
    let totalFolder: number = 0;
    let totalRequest: number = 0;
    if (collection.items) {
      collection.items.map((item: CollectionItemsDto) => {
        if (item.type === CollectionItemTypeBaseEnum.REQUEST) {
          totalRequest++;
        } else {
          totalFolder++;
          totalRequest += (item?.items as unknown as CollectionItemsDto[])
            ?.length;
        }
      });
    }
    const path = {
      workspaceId: workspaceId,
      collectionId: collection.id ?? "",
      folderId: "",
    };

    const _collection = new InitCollectionTab(collection.id, workspaceId);
    _collection.updateName(collection.name);
    _collection.updateDescription(collection.description);
    _collection.updatePath(path);
    // _collection.updateActiveSync(collection.activeSync);
    _collection.updateTotalRequests(totalRequest);
    _collection.updateTotalFolder(totalFolder);
    _collection.updateIsSave(true);
    _collection.updateTabType(TabPersistenceTypeEnum.TEMPORARY);

    this.tabRepository.createTab(_collection.getValue());
    moveNavigation("right");
  };
  /**
   * Handles renaming a request
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which the request is saved
   * @param folder : - the folder in which the request is saved(if request if saved inside a folder)
   * @param request : - the request which is going to be renamed
   * @param newRequestName : - the new name of the request
   */
  private handleRenameRequest = async (
    workspaceId: string,
    collection: CollectionDto,
    folder: CollectionItemsDto,
    request: CollectionItemsDto,
    newRequestName: string,
  ) => {
    let userSource = {};
    if (request.source === "USER") {
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
      if (collection.id && workspaceId && !folder.id) {
        const response =
          await this.collectionRepository.readRequestOrFolderInCollection(
            collection.id,
            request.id,
          );
        const storage = request;
        storage.name = newRequestName;
        await this.collectionRepository.updateRequestOrFolderInCollection(
          collection.id,
          request.id,
          response,
        );
        this.updateTab(request.id, {
          name: newRequestName,
        });
        MixpanelEvent(Events.RENAME_REQUEST, {
          source: "Collection list",
        });
      } else if (collection.id && workspaceId && folder.id) {
        const response = await this.collectionRepository.readRequestInFolder(
          collection.id,
          folder.id,
          request.id,
        );
        const storage = request;
        storage.name = newRequestName;
        await this.collectionRepository.updateRequestInFolder(
          collection.id,
          folder.id,
          request.id,
          response,
        );
        this.updateTab(request.id, {
          name: newRequestName,
        });
        MixpanelEvent(Events.RENAME_REQUEST, {
          source: "Collection list",
        });
      }
      return;
    }

    if (newRequestName) {
      if (collection.id && workspaceId && !folder.id) {
        const storage = request;
        storage.name = newRequestName;
        const response = await this.collectionService.updateRequestInCollection(
          request.id,
          {
            collectionId: collection.id,
            workspaceId: workspaceId,
            ...userSource,
            items: storage,
          },
        );
        if (response.isSuccessful) {
          this.collectionRepository.updateRequestOrFolderInCollection(
            collection.id,
            request.id,
            response.data.data,
          );
          this.updateTab(request.id, {
            name: newRequestName,
          });
          MixpanelEvent(Events.RENAME_REQUEST, {
            source: "Collection list",
          });
        }
      } else if (collection.id && workspaceId && folder.id) {
        const storage = request;
        storage.name = newRequestName;
        const response = await this.collectionService.updateRequestInCollection(
          request.id,
          {
            collectionId: collection.id,
            workspaceId: workspaceId,
            ...userSource,
            folderId: folder.id,
            items: {
              name: folder.name,
              id: folder.id,
              type: ItemType.FOLDER,
              items: storage,
            },
          } as CreateApiRequestPostBody,
        );
        if (response.isSuccessful) {
          this.collectionRepository.updateRequestInFolder(
            collection.id,
            folder.id,
            request.id,
            response.data.data,
          );
          this.updateTab(request.id, {
            name: newRequestName,
          });
          MixpanelEvent(Events.RENAME_REQUEST, {
            source: "Collection list",
          });
        }
      }
    }
  };

  /**
   * Handles renaming a saved request
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which the request is saved
   * @param folder : - the folder in which the request is saved(if request if saved inside a folder)
   * @param request : - the request in which the response is saved
   * @param requestResponse : - the requestResponse which is going to be renamed.
   * @param newRequestName : - the new name of the saved request
   */
  private handleRenameSavedRequest = async (
    workspaceId: string,
    collection: CollectionDto,
    folder: CollectionItemsDto,
    request: CollectionItemsDto,
    requestResponse: CollectionItemsDto,
    newRequestName: string,
  ) => {
    let userSource = {};
    if (request.source === "USER") {
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
      if (collection.id && workspaceId && !folder.id) {
        const response =
          await this.collectionRepository.readRequestOrFolderInCollection(
            collection.id,
            request.id,
          );
        const storage = request;
        storage.name = newRequestName;
        await this.collectionRepository.updateRequestOrFolderInCollection(
          collection.id,
          request.id,
          response,
        );
        this.updateTab(requestResponse.id, {
          name: newRequestName,
        });
        MixpanelEvent(Events.RENAME_REQUEST, {
          source: "Collection list",
        });
      } else if (collection.id && workspaceId && folder.id) {
        const response = await this.collectionRepository.readRequestInFolder(
          collection.id,
          folder.id,
          request.id,
        );
        const storage = request;
        storage.name = newRequestName;
        await this.collectionRepository.updateRequestInFolder(
          collection.id,
          folder.id,
          request.id,
          response,
        );
        this.updateTab(requestResponse.id, {
          name: newRequestName,
        });
        MixpanelEvent(Events.RENAME_REQUEST, {
          source: "Collection list",
        });
      }
      return;
    }

    if (newRequestName) {
      if (collection.id && workspaceId && !folder.id) {
        // const storage = request;
        // storage.name = newRequestName;
        const response =
          await this.collectionService.updateSavedRequestInCollection(
            requestResponse.id,
            {
              collectionId: collection.id,
              workspaceId: workspaceId,
              requestId: request.id,
              name: newRequestName,
            },
          );
        if (response.isSuccessful) {
          this.collectionRepository.updateSavedRequestInCollection(
            collection.id,
            request.id,
            requestResponse.id,
            { name: newRequestName },
          );
          this.updateTab(requestResponse.id, {
            name: newRequestName,
          });
          MixpanelEvent(Events.RENAME_RESPONSE, {
            source: "Collection list",
          });
        }
      } else if (collection.id && workspaceId && folder.id) {
        const response =
          await this.collectionService.updateSavedRequestInCollection(
            requestResponse.id,
            {
              collectionId: collection.id,
              workspaceId: workspaceId,
              folderId: folder.id,
              requestId: request.id,
              name: newRequestName,
            } as CreateApiRequestPostBody,
          );
        if (response.isSuccessful) {
          this.collectionRepository.updateSavedRequestInFolder(
            collection.id,
            folder.id,
            request.id,
            requestResponse.id,
            { name: newRequestName },
          );
          this.updateTab(requestResponse.id, {
            name: newRequestName,
          });
          MixpanelEvent(Events.RENAME_RESPONSE, {
            source: "Collection list",
          });
        }
      }
    }
  };

  /**
   * Handles renaming a web socket
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which the request is saved
   * @param folder : - the folder in which the request is saved(if request if saved inside a folder)
   * @param request : - the request which is going to be renamed
   * @param newRequestName : - the new name of the request
   */
  private handleRenameWebSocket = async (
    workspaceId: string,
    collection: CollectionDto,
    folder: CollectionItemsDto,
    websocket: CollectionItemsDto,
    newWebSocketName: string,
  ) => {
    let userSource = {};
    if (websocket.source === "USER") {
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
      if (collection.id && workspaceId && !folder.id) {
        const response =
          await this.collectionRepository.readRequestOrFolderInCollection(
            collection.id,
            websocket.id,
          );
        const storage = websocket;
        storage.name = newWebSocketName;
        await this.collectionRepository.updateRequestOrFolderInCollection(
          collection.id,
          websocket.id,
          response,
        );
        this.updateTab(websocket.id, {
          name: newWebSocketName,
        });
        MixpanelEvent(Events.RENAME_REQUEST, {
          source: "Collection list",
        });
      } else if (collection.id && workspaceId && folder.id) {
        const response = await this.collectionRepository.readRequestInFolder(
          collection.id,
          folder.id,
          websocket.id,
        );
        const storage = websocket;
        storage.name = newWebSocketName;
        await this.collectionRepository.updateRequestInFolder(
          collection.id,
          folder.id,
          websocket.id,
          response,
        );
        this.updateTab(websocket.id, {
          name: newWebSocketName,
        });
        MixpanelEvent(Events.RENAME_REQUEST, {
          source: "Collection list",
        });
      }
      return;
    }

    if (newWebSocketName) {
      if (collection.id && workspaceId && !folder.id) {
        const storage = websocket;
        storage.name = newWebSocketName;
        const response = await this.collectionService.updateSocketInCollection(
          websocket.id,
          {
            collectionId: collection.id,
            workspaceId: workspaceId,
            ...userSource,
            items: storage,
          },
        );
        if (response.isSuccessful) {
          this.collectionRepository.updateRequestOrFolderInCollection(
            collection.id,
            websocket.id,
            response.data.data,
          );
          this.updateTab(websocket.id, {
            name: newWebSocketName,
          });
          MixpanelEvent(Events.RENAME_REQUEST, {
            source: "Collection list",
          });
        }
      } else if (collection.id && workspaceId && folder.id) {
        const storage = websocket;
        storage.name = newWebSocketName;
        const response = await this.collectionService.updateSocketInCollection(
          websocket.id,
          {
            collectionId: collection.id,
            workspaceId: workspaceId,
            ...userSource,
            folderId: folder.id,
            items: {
              name: folder.name,
              id: folder.id,
              type: ItemType.FOLDER,
              items: storage,
            },
          },
        );
        if (response.isSuccessful) {
          this.collectionRepository.updateRequestInFolder(
            collection.id,
            folder.id,
            websocket.id,
            response.data.data,
          );
          this.updateTab(websocket.id, {
            name: newWebSocketName,
          });
          MixpanelEvent(Events.RENAME_REQUEST, {
            source: "Collection list",
          });
        }
      }
    }
  };

  /**
   * Handles renaming a socket io
   * @param _workspaceId
   * @param _collection The collection in which the request is saved
   * @param _folder The folder in which the request is saved(if request if saved inside a folder)
   * @param _socketIo The request which is going to be renamed
   * @param _newSocketIoName The new name of the request
   */
  private handleRenameSocketIO = async (
    _workspaceId: string,
    _collection: CollectionDto,
    _folder: CollectionItemsDto,
    _socketIo: CollectionItemsDto,
    _newSocketIoName: string,
  ) => {
    let isGuestUser = true;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      if (_collection.id && _workspaceId && !_folder.id) {
        const response =
          await this.collectionRepository.readRequestOrFolderInCollection(
            _collection.id,
            _socketIo.id,
          );
        if (response) {
          response.name = _newSocketIoName;
        }
        await this.collectionRepository.updateRequestOrFolderInCollection(
          _collection.id,
          _socketIo.id,
          response,
        );
        this.updateTab(_socketIo.id, {
          name: _newSocketIoName,
        });
        MixpanelEvent(Events.RENAME_REQUEST, {
          source: "Collection list",
        });
        return;
      }
      if (_collection.id && _workspaceId && _folder.id) {
        const response = await this.collectionRepository.readRequestInFolder(
          _collection.id,
          _folder.id,
          _socketIo.id,
        );
        if (response) {
          response.name = _newSocketIoName;
        }
        await this.collectionRepository.updateRequestInFolder(
          _collection.id,
          _folder.id,
          _socketIo.id,
          response,
        );
        this.updateTab(_socketIo.id, {
          name: _newSocketIoName,
        });
        MixpanelEvent(Events.RENAME_REQUEST, {
          source: "Collection list",
        });
        return;
      }
      return;
    }
    if (!_newSocketIoName) {
      return;
    }
    if (_collection.id && _workspaceId && !_folder.id) {
      const response = await this.collectionService.updateSocketIoInCollection(
        _socketIo.id,
        {
          collectionId: _collection.id,
          workspaceId: _workspaceId,
          currentBranch:
            _collection.activeSync && _socketIo.source === "USER"
              ? _collection.currentBranch
              : undefined,
          source:
            _collection.activeSync && _socketIo.source === "USER"
              ? _socketIo.source
              : undefined,
          items: {
            createdAt: _socketIo.createdAt,
            createdBy: _socketIo.createdBy,
            description: _socketIo.description,
            id: _socketIo.id,
            isDeleted: _socketIo.isDeleted,
            name: _newSocketIoName,
            socketio: _socketIo.socketio,
            source: _socketIo.source,
            type: _socketIo.type,
            updatedAt: _socketIo.updatedAt,
            updatedBy: _socketIo.updatedBy,
          },
        } as SocketIORequestCreateUpdateInCollectionPayloadDtoInterface,
      );
      if (!response?.isSuccessful) {
        return;
      }
      this.collectionRepository.updateRequestOrFolderInCollection(
        _collection.id,
        _socketIo.id,
        response.data.data,
      );
      this.updateTab(_socketIo.id, {
        name: _newSocketIoName,
      });
      MixpanelEvent(Events.RENAME_REQUEST, {
        source: "Collection list",
      });
      return;
    }
    if (_collection.id && _workspaceId && _folder.id) {
      const response = await this.collectionService.updateSocketIoInCollection(
        _socketIo.id,
        {
          collectionId: _collection.id,
          workspaceId: _workspaceId,
          currentBranch:
            _collection?.activeSync && _socketIo?.source === "USER"
              ? _collection?.currentBranch
              : undefined,
          source:
            _collection?.activeSync && _socketIo?.source === "USER"
              ? _socketIo?.source
              : undefined,
          folderId: _folder.id,
          items: {
            name: _folder.name,
            id: _folder.id,
            type: CollectionItemTypeBaseEnum.FOLDER,
            items: {
              createdAt: _socketIo.createdAt,
              createdBy: _socketIo.createdBy,
              description: _socketIo.description,
              id: _socketIo.id,
              isDeleted: _socketIo.isDeleted,
              name: _newSocketIoName,
              socketio: _socketIo.socketio,
              source: _socketIo.source,
              type: _socketIo.type,
              updatedAt: _socketIo.updatedAt,
              updatedBy: _socketIo.updatedBy,
            },
          },
        } as SocketIORequestCreateUpdateInFolderPayloadDtoInterface,
      );
      if (!response?.isSuccessful) {
        return;
      }
      this.collectionRepository.updateRequestInFolder(
        _collection.id,
        _folder.id,
        _socketIo.id,
        response.data.data,
      );
      this.updateTab(_socketIo.id, {
        name: _newSocketIoName,
      });
      MixpanelEvent(Events.RENAME_REQUEST, {
        source: "Collection list",
      });
    }
  };

  /**
   * Handles renaming a GraphQL
   * @param _workspaceId
   * @param _collection The collection in which the GraphQL request is saved
   * @param _folder The folder in which the GraphQL request is saved (if request if saved inside a folder)
   * @param _graphql The GraphQL request which is going to be renamed
   * @param _newSocketIoName The new name of the GraphQL request
   */
  private handleRenameGraphql = async (
    _workspaceId: string,
    _collection: CollectionDto,
    _folder: CollectionItemsDto,
    _graphql: CollectionItemsDto,
    _newGraphqlName: string,
  ) => {
    let isGuestUser = true;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      if (_collection.id && _workspaceId && !_folder.id) {
        const response =
          await this.collectionRepository.readRequestOrFolderInCollection(
            _collection.id,
            _graphql.id,
          );
        if (response) {
          response.name = _newGraphqlName;
        }
        await this.collectionRepository.updateRequestOrFolderInCollection(
          _collection.id,
          _graphql.id,
          response,
        );
        this.updateTab(_graphql.id, {
          name: _newGraphqlName,
        });
        MixpanelEvent(Events.RENAME_REQUEST, {
          source: "Collection list",
        });
        return;
      }
      if (_collection.id && _workspaceId && _folder.id) {
        const response = await this.collectionRepository.readRequestInFolder(
          _collection.id,
          _folder.id,
          _graphql.id,
        );
        if (response) {
          response.name = _newGraphqlName;
        }
        await this.collectionRepository.updateRequestInFolder(
          _collection.id,
          _folder.id,
          _graphql.id,
          response,
        );
        this.updateTab(_graphql.id, {
          name: _newGraphqlName,
        });
        MixpanelEvent(Events.RENAME_REQUEST, {
          source: "Collection list",
        });
        return;
      }
      return;
    }
    if (!_newGraphqlName) {
      return;
    }

    const graphqlPayload = {
      name: _newGraphqlName as string,
      description: _graphql?.description as string,
      url: _graphql.graphql?.url as string,
      query: _graphql.graphql?.query,
      schema: _graphql.graphql?.schema,
      headers: _graphql.graphql
        ?.headers as GraphqlRequestKeyValueDtoInterface[],
      auth: _graphql.graphql?.auth as GraphqlRequestAuthDtoInterface,
      variables: _graphql.graphql?.variables,
      selectedGraphqlAuthType: _graphql?.graphql
        ?.selectedGraphqlAuthType as GraphqlRequestAuthModeBaseEnum,
    };

    if (_collection.id && _workspaceId && !_folder.id) {
      const response = await this.collectionService.updateGraphqlInCollection(
        _graphql.id,
        _collection.id,
        _workspaceId,
        graphqlPayload,
      );
      if (!response?.isSuccessful) {
        return;
      }
      this.collectionRepository.updateRequestOrFolderInCollection(
        _collection.id,
        _graphql.id,
        response.data.data,
      );
      this.updateTab(_graphql.id, {
        name: _newGraphqlName,
      });
      MixpanelEvent(Events.RENAME_REQUEST, {
        source: "Collection list",
      });
      return;
    }
    if (_collection.id && _workspaceId && _folder.id) {
      const response = await this.collectionService.updateGraphqlInCollection(
        _graphql.id,
        _collection.id,
        _workspaceId,
        graphqlPayload,
        _folder.id,
      );
      if (!response?.isSuccessful) {
        return;
      }
      this.collectionRepository.updateRequestInFolder(
        _collection.id,
        _folder.id,
        _graphql.id,
        response.data.data,
      );
      this.updateTab(_graphql.id, {
        name: _newGraphqlName,
      });
      MixpanelEvent(Events.RENAME_REQUEST, {
        source: "Collection list",
      });
    }
  };

  /**
   * Handles loading the collection from local repository from active branch
   * @param collection :CollectionDocument
   * @returns :{ activeSyncLoad: boolean; isBranchSynced: boolean }
   */
  public handleBranchSwitch = async (collection: CollectionDto) => {
    const result: { activeSyncLoad: boolean; isBranchSynced: boolean } = {
      activeSyncLoad: true,
      isBranchSynced: true,
    };
    const detectBranch = collection?.currentBranch
      ? collection?.currentBranch
      : collection?.primaryBranch;
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser !== true) {
      const response = await this.collectionService.switchCollectionBranch(
        collection.id,
        detectBranch as string,
      );
      await setTimeout(async () => {
        if (response.isSuccessful) {
          await this.collectionRepository.updateCollection(collection.id, {
            currentBranch: detectBranch,
            items: response.data.data.items,
          });
          result.activeSyncLoad = true;
          result.isBranchSynced = true;
        } else {
          await this.collectionRepository.updateCollection(collection.id, {
            currentBranch: detectBranch,
            items: [],
          });
          result.activeSyncLoad = true;
          result.isBranchSynced = false;
        }
      }, 500);
      return result;
    }
  };

  /**
   * Handles deleting a collection
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection going to be deleted
   * @param deletedIds :[string] | [] - the IDs of the collection to be deleted
   */
  private handleDeleteCollection = async (
    workspaceId: string,
    collection: CollectionDto,
    deletedIds: string[] | [],
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      this.collectionRepository.deleteCollection(collection.id);
      this.deleteCollectioninWorkspace(workspaceId, collection.id);
      notifications.success(`"${collection.name}" Collection deleted.`);
      this.removeMultipleTabs(deletedIds);
      MixpanelEvent(Events.DELETE_COLLECTION, {
        source: "Collection list",
      });
      return;
    }
    const response = await this.collectionService.deleteCollection(
      workspaceId,
      collection.id,
    );

    if (response.isSuccessful) {
      this.collectionRepository.deleteCollection(collection.id);
      this.deleteCollectioninWorkspace(workspaceId, collection.id);
      notifications.success(`"${collection.name}" Collection deleted.`);
      this.removeMultipleTabs(deletedIds);
      MixpanelEvent(Events.DELETE_COLLECTION, {
        source: "Collection list",
      });
    } else {
      notifications.error(
        response.message ?? "Failed to delete collection. Please try again.",
      );
    }
  };

  /**
   * Handle deleting folder in a collection
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which the folder is saved
   * @param explorer : - the folder to be deleted
   * @param requestIds : - the request IDs saved inside the folder
   */
  private handleDeleteFolder = async (
    workspaceId: string,
    collection: CollectionDto,
    explorer: CollectionItemsDto,
    requestIds: string[],
  ) => {
    let userSource = {};
    if (collection.activeSync && explorer?.source === "USER") {
      userSource = {
        branchName: collection.currentBranch
          ? collection.currentBranch
          : collection.primaryBranch,
      };
    }
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        collection.id,
        explorer.id,
      );

      notifications.success(`"${explorer.name}" Folder deleted.`);
      this.removeMultipleTabs(requestIds);
      MixpanelEvent(Events.DELETE_FOLDER, {
        source: "Collection list",
      });
      return;
    }
    const response = await this.collectionService.deleteFolderInCollection(
      workspaceId,
      collection.id,
      explorer.id,
      {
        ...userSource,
      },
    );

    if (response.isSuccessful) {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        collection.id,
        explorer.id,
      );

      notifications.success(`"${explorer.name}" Folder deleted.`);
      this.removeMultipleTabs(requestIds);
      MixpanelEvent(Events.DELETE_FOLDER, {
        source: "Collection list",
      });
    } else {
      notifications.error("Failed to delete folder. Please try again.");
    }
  };

  /**
   * Handle deleting request from repository as well as backend
   * @param workspaceId :string
   * @param collection :CollectionDocument - The collection in which the request is saved
   * @param request : - The request to be deleted
   * @param folder : - The folder in which the request is saved(if is saved in a folder)
   * @returns :void
   */
  private handleDeleteRequest = async (
    workspaceId: string,
    collection: CollectionDto,
    request: CollectionItemsDto,
    folder: CollectionItemsDto,
  ): Promise<boolean> => {
    let userSource = {};
    if (collection.activeSync) {
      userSource = {
        currentBranch: collection.currentBranch,
      };
    }

    let requestObject = {
      collectionId: collection.id,
      workspaceId: workspaceId,
      folderId: "",
      ...userSource,
    };

    if (folder && collection.id && workspaceId) {
      requestObject = {
        ...requestObject,
        folderId: folder.id,
      };
    }
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      if (folder) {
        await this.collectionRepository.deleteRequestInFolder(
          collection.id,
          folder.id,
          request.id,
        );
        this.tabRepository.removeTab(request.id);
      } else {
        await this.collectionRepository.deleteRequestOrFolderInCollection(
          collection.id,
          request.id,
        );
        this.tabRepository.removeTab(request.id);
      }

      return true;
    }
    const response = await this.collectionService.deleteRequestInCollection(
      request.id,
      requestObject,
    );

    if (response.isSuccessful) {
      if (
        requestObject.folderId &&
        requestObject.collectionId &&
        requestObject.workspaceId
      ) {
        await this.collectionRepository.deleteRequestInFolder(
          requestObject.collectionId,
          requestObject.folderId,
          request.id,
        );
      } else if (requestObject.workspaceId && requestObject.collectionId) {
        await this.collectionRepository.deleteRequestOrFolderInCollection(
          requestObject.collectionId,
          request.id,
        );
      }

      notifications.success(`"${request.name}" Request deleted.`);
      this.removeMultipleTabs([request.id]);
      MixpanelEvent(Events.DELETE_REQUEST, {
        source: "Collection list",
      });
      return true;
    } else {
      notifications.error("Failed to delete API request. Please try again.");
      return false;
    }
  };

  /**
   * Handle deleting request from repository as well as backend
   * @param workspaceId :string
   * @param collection :CollectionDocument - The collection in which the request is saved
   * @param request : - The request to be deleted
   * @param folder : - The folder in which the request is saved(if is saved in a folder)
   * @returns :void
   */
  private handleDeleteSavedRequest = async (
    workspaceId: string,
    collection: CollectionDto,
    request: CollectionItemsDto,
    folder: CollectionItemsDto,
    requestResponse: CollectionItemsDto,
  ): Promise<boolean> => {
    let userSource = {};
    if (collection.activeSync) {
      userSource = {
        currentBranch: collection.currentBranch,
      };
    }

    let requestObject = {
      collectionId: collection.id,
      workspaceId: workspaceId,
      requestId: request.id,
      folderId: "",
      ...userSource,
    };

    if (folder && collection.id && workspaceId) {
      requestObject = {
        ...requestObject,
        folderId: folder.id,
      };
    }
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      if (folder) {
        await this.collectionRepository.deleteRequestInFolder(
          collection.id,
          folder.id,
          request.id,
        );
        this.tabRepository.removeTab(request.id);
      } else {
        await this.collectionRepository.deleteRequestOrFolderInCollection(
          collection.id,
          request.id,
        );
        this.tabRepository.removeTab(request.id);
      }

      return true;
    }
    const response =
      await this.collectionService.deleteSavedRequestInCollection(
        requestResponse.id,
        requestObject,
      );

    if (response.isSuccessful) {
      if (
        requestObject.folderId &&
        requestObject.collectionId &&
        requestObject.workspaceId
      ) {
        await this.collectionRepository.deleteSavedRequestInFolder(
          requestObject.collectionId,
          requestObject.folderId,
          request.id,
          requestResponse.id,
        );
      } else if (requestObject.workspaceId && requestObject.collectionId) {
        await this.collectionRepository.deleteSavedRequestInCollection(
          requestObject.collectionId,
          request.id,
          requestResponse.id,
        );
      }

      notifications.success(`"${requestResponse.name}" Response deleted.`);
      this.removeMultipleTabs([requestResponse.id]);
      MixpanelEvent(Events.DELETE_RESPONSE, {
        source: "Collection list",
      });
      return true;
    } else {
      notifications.error("Failed to delete saved response. Please try again.");
      return false;
    }
  };

  /**
   * Handle deleting request from repository as well as backend
   * @param workspaceId :string
   * @param collection :CollectionDocument - The collection in which the request is saved
   * @param request : - The request to be deleted
   * @param folder : - The folder in which the request is saved(if is saved in a folder)
   * @returns :void
   */
  private handleDeleteWebSocket = async (
    workspaceId: string,
    collection: CollectionDto,
    websocket: CollectionItemsDto,
    folder: CollectionItemsDto,
  ): Promise<boolean> => {
    let userSource = {};
    if (collection.activeSync) {
      userSource = {
        currentBranch: collection.currentBranch,
      };
    }

    let requestObject = {
      collectionId: collection.id,
      workspaceId: workspaceId,
      folderId: "",
      ...userSource,
    };

    if (folder && collection.id && workspaceId) {
      requestObject = {
        ...requestObject,
        folderId: folder.id,
      };
    }
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      if (folder) {
        await this.collectionRepository.deleteRequestInFolder(
          collection.id,
          folder.id,
          websocket.id,
        );
        this.removeMultipleTabs([websocket.id]);
      } else {
        await this.collectionRepository.deleteRequestOrFolderInCollection(
          collection.id,
          websocket.id,
        );
        this.removeMultipleTabs([websocket.id]);
      }

      return true;
    }
    const response = await this.collectionService.deleteSocketInCollection(
      websocket.id,
      requestObject,
    );

    if (response.isSuccessful) {
      if (
        requestObject.folderId &&
        requestObject.collectionId &&
        requestObject.workspaceId
      ) {
        await this.collectionRepository.deleteRequestInFolder(
          requestObject.collectionId,
          requestObject.folderId,
          websocket.id,
        );
      } else if (requestObject.workspaceId && requestObject.collectionId) {
        await this.collectionRepository.deleteRequestOrFolderInCollection(
          requestObject.collectionId,
          websocket.id,
        );
      }

      notifications.success(`"${websocket.name}" WebSocket deleted.`);
      this.removeMultipleTabs([websocket.id]);
      MixpanelEvent(Events.DELETE_REQUEST, {
        source: "Collection list",
      });
      return true;
    } else {
      notifications.error("Failed to delete WebSocket. Please try again.");
      return false;
    }
  };

  /**
   * Handle deleting request from repository as well as backend
   * @param _workspaceId :string
   * @param _collection :CollectionDocument - The collection in which the request is saved
   * @param _socketIo : - The request to be deleted
   * @param _folder : - The folder in which the request is saved(if is saved in a folder)
   * @returns :void
   */
  private handleDeleteSocketIO = async (
    _workspaceId: string,
    _collection: CollectionDto,
    _socketIo: CollectionItemsDto,
    _folder: CollectionItemsDto,
  ): Promise<boolean> => {
    let userSource = {};
    if (_collection.activeSync) {
      userSource = {
        currentBranch: _collection.currentBranch,
      };
    }

    let isGuestUser = true;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      if (_folder) {
        await this.collectionRepository.deleteRequestInFolder(
          _collection.id,
          _folder.id,
          _socketIo.id,
        );
        this.removeMultipleTabs([_socketIo.id]);
      } else {
        await this.collectionRepository.deleteRequestOrFolderInCollection(
          _collection.id,
          _socketIo.id,
        );
        this.removeMultipleTabs([_socketIo.id]);
      }

      return true;
    }
    const response = await this.collectionService.deleteSocketIoInCollection(
      _socketIo.id,
      {
        collectionId: _collection.id,
        workspaceId: _workspaceId,
        folderId: _folder?.id ? _folder?.id : undefined,
        source: _collection.activeSync ? _socketIo?.source : undefined,
        currentBranch: _collection.activeSync
          ? _collection.currentBranch
          : undefined,
      } as SocketIORequestDeletePayloadDtoInterface,
    );

    if (!response?.isSuccessful) {
      notifications.error(
        `Failed to delete ${SocketIORequestDefaultAliasBaseEnum.NAME}. Please try again.`,
      );
      return false;
    }
    if (_folder?.id && _collection.id && _workspaceId) {
      await this.collectionRepository.deleteRequestInFolder(
        _collection.id,
        _folder.id,
        _socketIo.id,
      );
    } else if (_workspaceId && _collection.id) {
      await this.collectionRepository.deleteRequestOrFolderInCollection(
        _collection.id,
        _socketIo.id,
      );
    }

    notifications.success(
      `"${_socketIo.name}" ${SocketIORequestDefaultAliasBaseEnum.NAME} deleted.`,
    );
    this.removeMultipleTabs([_socketIo.id]);
    MixpanelEvent(Events.DELETE_REQUEST, {
      source: "Collection list",
    });
    return true;
  };

  /**
   * Handle deleting GraphQL request from repository as well as backend
   * @param _workspaceId
   * @param _collection The collection in which the GraphQL request is saved
   * @param _graphql  The GraphQL request to be deleted
   * @param _folder The folder in which the GraphQL request is saved (if is saved in a folder)
   * @returns
   */
  private handleDeleteGraphql = async (
    _workspaceId: string,
    _collection: CollectionDto,
    _graphql: CollectionItemsDto,
    _folder: CollectionItemsDto,
  ): Promise<boolean> => {
    let userSource = {};
    if (_collection.activeSync) {
      userSource = {
        currentBranch: _collection.currentBranch,
      };
    }

    let isGuestUser = true;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      if (_folder) {
        await this.collectionRepository.deleteRequestInFolder(
          _collection.id,
          _folder.id,
          _graphql.id,
        );
        this.removeMultipleTabs([_graphql.id]);
      } else {
        await this.collectionRepository.deleteRequestOrFolderInCollection(
          _collection.id,
          _graphql.id,
        );
        this.removeMultipleTabs([_graphql.id]);
      }

      return true;
    }
    const response = await this.collectionService.deleteGraphqlInCollection(
      _graphql.id,
      {
        collectionId: _collection.id,
        workspaceId: _workspaceId,
        folderId: _folder?.id ? _folder?.id : undefined,
        source: _collection.activeSync ? _graphql?.source : undefined,
        currentBranch: _collection.activeSync
          ? _collection.currentBranch
          : undefined,
      } as GraphqlRequestDeletePayloadDtoInterface,
    );

    if (!response?.isSuccessful) {
      notifications.error(
        `Failed to delete ${GraphqlRequestDefaultAliasBaseEnum.NAME}. Please try again.`,
      );
      return false;
    }
    if (_folder?.id && _collection.id && _workspaceId) {
      await this.collectionRepository.deleteRequestInFolder(
        _collection.id,
        _folder.id,
        _graphql.id,
      );
    } else if (_workspaceId && _collection.id) {
      await this.collectionRepository.deleteRequestOrFolderInCollection(
        _collection.id,
        _graphql.id,
      );
    }

    notifications.success(
      `"${_graphql.name}" ${GraphqlRequestDefaultAliasBaseEnum.NAME} deleted.`,
    );
    this.removeMultipleTabs([_graphql.id]);
    MixpanelEvent(Events.DELETE_REQUEST, {
      source: "Collection list",
    });
    return true;
  };

  /**
   * Handle refetching collection from local repository in active sync enabled collections
   * @param workspaceId :string - the workspace ID
   * @param collection :CollectionDocument - The collection going to be refetched
   */
  public handleRefetchCollection = async (
    workspaceId: string,
    collection: CollectionDto,
  ) => {
    const errMessage = `Failed to sync the collection. Local reposisitory branch is not set to ${collection?.currentBranch}.`;

    try {
      const activeResponse = await invoke("get_git_active_branch", {
        path: collection?.localRepositoryPath,
      });
      if (activeResponse) {
        const currentBranch = activeResponse;
        if (collection?.currentBranch) {
          if (currentBranch !== collection?.currentBranch) {
            notifications.error(errMessage);
            return;
          }
        } else {
          if (currentBranch !== collection?.primaryBranch) {
            notifications.error(errMessage);
            return;
          }
        }
      } else {
        notifications.error(errMessage);
        return;
      }
    } catch (e) {
      notifications.error(errMessage);
      return;
    }
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser !== true) {
      const responseJSON =
        (await this.collectionService.validateImportCollectionURL(
          collection.activeSyncUrl,
        )) as {
          data: {
            headers: string;
            response: string;
            status: string;
          };
        };
      const dt = {
        url: collection.activeSyncUrl as string,
        urlData: {
          data: JSON.parse(responseJSON.data.response) as string,
          headers: responseJSON.data.headers as string,
        },
        primaryBranch: collection?.primaryBranch as string,
        currentBranch: collection?.currentBranch
          ? (collection?.currentBranch as string)
          : (collection?.primaryBranch as string),
      };
      if (responseJSON?.data?.status === ResponseStatusCode.OK) {
        const response = await this.collectionService.importCollection(
          workspaceId,
          dt,
          collection.activeSync,
        );

        if (response.isSuccessful) {
          this.collectionRepository.updateCollection(
            collection.id,
            response.data.data.collection,
          );
          notifications.success("Collection synced successfully.");
        } else {
          notifications.error(
            "Failed to sync the collection. Please try again.",
          );
        }
      } else {
        notifications.error(
          `Unable to detect ${collection?.activeSyncUrl?.replace(
            "-json",
            "",
          )}.`,
        );
      }
    }
  };

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
   * @param _workspaceMeta - workspace meta data
   * @param _collectionId - collection id
   * @param _folderName - folder name
   * @returns - folder status message
   */
  public createFolderFromSaveAs = async (
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

    if (isGuestUser === true) {
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
  public createCollectionFromSaveAs = async (
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

    if (isGuestUser === true) {
      const data: {
        id?: string;
        name: string;
        totalRequests: number;
        createdBy: string;
        items?: CollectionItemsDto[];
        updatedBy: string;
        createdAt: string;
        updatedAt: string;
        workspaceId?: string;
      } = {
        id: uuidv4(),
        name: _collectionName,
        totalRequests: 0,
        items: [],
        // createdAt: new Date().toISOString,
        createdAt: "",
        createdBy: "Guest User",
        // updatedAt: new Date().toISOString,
        updatedAt: "",
        updatedBy: "Guest User",
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
   *
   * @param _workspaceMeta - workspace meta data
   * @param path - request stack path
   * @param tabName - request name
   * @param description - request description
   * @param type - save over all request or description only
   * @param componentData - tab data
   */
  public saveAsRequest = async (
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
    componentData: Tab,
  ) => {
    let userSource = {};
    if (path.length > 0) {
      const requestTabAdapter = new RequestTabAdapter();
      const unadaptedRequest = requestTabAdapter.unadapt(componentData);
      const req = {
        id: uuidv4(),
        name: tabName,
        description,
        type: ItemType.REQUEST,
        request: unadaptedRequest,
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

        if (isGuestUser === true) {
          this.addRequestOrFolderInCollection(path[path.length - 1].id, req);
          return {
            status: "success",
            message: "",
            data: {
              id: req.id,
            },
          };
        }
        const res = await insertCollectionRequest({
          collectionId: path[path.length - 1].id,
          workspaceId: _workspaceMeta.id,
          ...userSource,
          items: {
            name: tabName,
            description,
            type: ItemType.REQUEST,
            request: unadaptedRequest,
          },
        });
        if (res.isSuccessful) {
          this.addRequestOrFolderInCollection(
            path[path.length - 1].id,
            res.data.data,
          );
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

        if (isGuestUser === true) {
          this.collectionRepository.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            req,
          );
          return {
            status: "success",
            message: "",
            data: {
              id: req.id,
            },
          };
        }
        const res = await insertCollectionRequest({
          collectionId: path[0].id,
          workspaceId: _workspaceMeta.id,
          folderId: path[path.length - 1].id,
          ...userSource,
          items: {
            name: path[path.length - 1].name,
            type: ItemType.FOLDER,
            items: {
              name: tabName,
              description,
              type: ItemType.REQUEST,
              request: unadaptedRequest,
            },
          },
        });
        if (res.isSuccessful) {
          this.collectionRepository.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            res.data.data,
          );
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

  /**
   * Handle control of creating items
   * @param entityType :string - type of entity, collection, folder or request
   * @param args :object - arguments depending on entity type
   */
  public handleCreateItem = async (
    entityType: string,
    args: CollectionArgsDto,
  ) => {
    let response;
    switch (entityType) {
      case "collection":
        response = await this.handleCreateCollection(args.workspaceId);
        break;
      case "folder":
        await this.handleCreateFolderInCollection(
          args.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "request":
        await this.createNewTab();
        break;
      case "requestCollection":
        await this.handleCreateRequestInCollection(
          args.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "requestFolder":
        await this.handleCreateRequestInFolder(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
        );
        break;
      case "web-socket":
        await this.createWebSocketNewTab();
        break;
      case "websocketCollection":
        await this.handleCreateWebSocketInCollection(
          args.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "websocketFolder":
        await this.handleCreateWebSocketInFolder(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
        );
        break;
      case "socket-io":
        await this.createSocketIoNewTab();
        break;
      case "socketioCollection":
        await this.handleCreateSocketIoInCollection(
          args.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "socketioFolder":
        await this.handleCreateSocketIoInFolder(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
        );
        break;
      case "graphql":
        await this.createGraphqlNewTab();
        break;
      case "graphqlCollection":
        await this.handleCreateGraphqlInCollection(
          args.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "graphqlFolder":
        await this.handleCreateGraphqlInFolder(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
        );
        break;
    }
    return response;
  };

  /**
   * Handle control of deleting item
   * @param entityType :srting - type of entity, collection, folder or request
   * @param args :object - arguments depending on entity type
   */
  public handleDeleteItem = async (
    entityType: string,
    args: CollectionArgsDto,
  ) => {
    switch (entityType) {
      case "collection":
        this.handleDeleteCollection(
          args.workspaceId,
          args.collection as CollectionDto,
          args.deletedIds as string[],
        );
        break;
      case "folder":
        this.handleDeleteFolder(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.requestIds as string[],
        );
        break;
      case "request":
        this.handleDeleteRequest(
          args.workspaceId,
          args.collection as CollectionDto,
          args.request as CollectionItemsDto,
          args.folder as CollectionItemsDto,
        );
        break;
      case "websocket":
        this.handleDeleteWebSocket(
          args.workspaceId,
          args.collection as CollectionDto,
          args.websocket as CollectionItemsDto,
          args.folder as CollectionItemsDto,
        );
        break;
      case "socket-io":
        this.handleDeleteSocketIO(
          args.workspaceId,
          args.collection as CollectionDto,
          args.socketio as CollectionItemsDto,
          args.folder as CollectionItemsDto,
        );
        break;
      case "graphql":
        this.handleDeleteGraphql(
          args.workspaceId,
          args.collection as CollectionDto,
          args.graphql as CollectionItemsDto,
          args.folder as CollectionItemsDto,
        );
        break;
      case "saved_request":
        this.handleDeleteSavedRequest(
          args.workspaceId,
          args.collection as CollectionDto,
          args.request as CollectionItemsDto,
          args.folder as CollectionItemsDto,
          args.requestResponse as CollectionItemsDto,
        );
        break;
    }
  };

  /**
   * Handle control of Renaming items
   * @param entityType :string - type of entity, collection, folder or request
   * @param args :object - arguments depending on entity type
   */
  public handleRenameItem = async (
    entityType: string,
    args: CollectionArgsDto,
  ) => {
    switch (entityType) {
      case "collection":
        this.handleRenameCollection(
          args.workspaceId,
          args.collection as CollectionDto,
          args.newName as string,
        );
        break;
      case "folder":
        this.handleRenameFolder(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.newName as string,
        );
        break;
      case "request":
        this.handleRenameRequest(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.request as CollectionItemsDto,
          args.newName as string,
        );
        break;
      case "web-socket":
        this.handleRenameWebSocket(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.websocket as CollectionItemsDto,
          args.newName as string,
        );
        break;
      case "socket-io":
        this.handleRenameSocketIO(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.socketio as CollectionItemsDto,
          args.newName as string,
        );
        break;
      case "graphql":
        this.handleRenameGraphql(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.graphql as CollectionItemsDto,
          args.newName as string,
        );
        break;
      case "saved_request":
        this.handleRenameSavedRequest(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.request as CollectionItemsDto,
          args.requestResponse as CollectionItemsDto,
          args.newName as string,
        );
        break;
    }
  };

  /**
   * Handle control of Import items
   * @param entityType :string - type of entity, collection, folder or request
   * @param args :object - arguments depending on entity type
   */
  public handleImportItem = async (
    entityType: string,
    args: CollectionArgsDto,
  ) => {
    let response;
    switch (entityType) {
      case "curl":
        response = await this.handleImportCurl(
          args.workspaceId,
          args.importCurl as string,
        );
        break;
    }
    return response;
  };

  public handleOpenItem = async (entitytype: string, args: any) => {
    switch (entitytype) {
      case "collection":
        this.handleOpenCollection(
          args.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "folder":
        this.handleOpenFolder(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
        );
        break;
      case "request":
        this.handleOpenRequest(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.request as CollectionItemsDto,
        );
        break;
      case "saved_request":
        this.handleOpenSavedRequest(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.request as CollectionItemsDto,
          args.savedRequest as CollectionItemsDto,
        );
        break;
      case "websocket":
        this.handleOpenWebSocket(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.websocket as CollectionItemsDto,
        );
        break;
      case "socket-io":
        this.handleOpenSocketIoTab(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.socketio as CollectionItemsDto,
        );
        break;
      case "graphql":
        this.handleOpenGraphqlTab(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.graphql as CollectionItemsDto,
        );
        break;
    }
  };

  public handleOnChangeViewInRequest = async (view: string) => {
    tabsSplitterDirection.set(view);
  };

  public importJSONObject = async (
    currentWorkspaceId: string,
    importJSON: string,
    contentType: ContentTypeEnum,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser !== true) {
      const response =
        await this.collectionService.importCollectionFromJsonObject(
          currentWorkspaceId,
          importJSON,
          contentType,
        );

      if (response.isSuccessful) {
        const path = {
          workspaceId: currentWorkspaceId,
          collectionId: response.data.data._id,
          folderId: "",
        };
        this.collectionRepository.addCollection({
          ...response.data.data,
          id: response.data.data._id,
          workspaceId: currentWorkspaceId,
        });
        const initCollectionTab = new InitCollectionTab(
          response.data.data._id,
          currentWorkspaceId,
        );
        initCollectionTab.updatePath(path);
        initCollectionTab.updateName(response.data.data.name);
        initCollectionTab.updateDescription(response.data.data.description);
        initCollectionTab.updateIsSave(true);

        this.tabRepository.createTab(initCollectionTab.getValue());
        moveNavigation("right");

        this.workspaceRepository.updateCollectionInWorkspace(
          currentWorkspaceId,
          {
            id: initCollectionTab.getValue().id,
            name: initCollectionTab.getValue().name,
          },
        );
        MixpanelEvent(Events.IMPORT_COLLECTION, {
          collectionName: response.data.data.name,
          collectionId: response.data.data._id,
          importThrough: "ByObject",
        });
        notifications.success("Collection imported successfully.");
      } else {
        notifications.error("Failed to import collection. Please try again.");
      }
      return response;
    }
  };

  public collectionFileUpload = async (
    currentWorkspaceId: string,
    file: File,
    type: string,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser !== true) {
      let response;
      if (type === "POSTMAN") {
        response = await this.collectionService.importCollectionFromPostmanFile(
          currentWorkspaceId,
          file,
        );
      } else {
        response = await this.collectionService.importCollectionFromFile(
          currentWorkspaceId,
          file,
        );
      }
      if (response.isSuccessful) {
        const path = {
          workspaceId: currentWorkspaceId,
          collectionId: response.data.data._id,
          folderId: "",
        };

        this.collectionRepository.addCollection({
          ...response.data.data,
          id: response.data.data._id,
          workspaceId: currentWorkspaceId,
        });

        const initCollectionTab = new InitCollectionTab(
          response.data.data._id,
          currentWorkspaceId,
        );

        initCollectionTab.updatePath(path);
        initCollectionTab.updateName(response.data.data.name);
        initCollectionTab.updateDescription(response.data.data.description);
        initCollectionTab.updateIsSave(true);

        this.tabRepository.createTab(initCollectionTab.getValue());
        moveNavigation("right");

        this.workspaceRepository.updateCollectionInWorkspace(
          currentWorkspaceId,
          {
            id: initCollectionTab.getValue().id,
            name: initCollectionTab.getValue().name,
          },
        );
        notifications.success("Collection imported successfully.");
        MixpanelEvent(Events.IMPORT_COLLECTION, {
          collectionName: response.data.data.name,
          collectionId: response.data.data._id,
          importThrough: "ByFile",
        });
      } else {
        notifications.error("Failed to import collection. Please try again.");
      }
      return response;
    }
  };

  public importCollectionURL = async (
    currentWorkspaceId: string,
    requestBody: ImportBodyUrl,
    activeSync: boolean,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser !== true) {
      const response = await this.collectionService.importCollection(
        currentWorkspaceId,
        requestBody,
        activeSync,
      );

      if (response.isSuccessful) {
        const path = {
          workspaceId: currentWorkspaceId,
          collectionId: response.data.data.collection._id,
          folderId: "",
        };

        const initCollectionTab = new InitCollectionTab(
          response.data.data.collection._id,
          currentWorkspaceId,
        );
        initCollectionTab.updatePath(path);

        initCollectionTab.updateName(response.data.data.collection.name);
        initCollectionTab.updateDescription(
          response.data.data.collection.description,
        );

        initCollectionTab.updateIsSave(true);
        if (response.data.data.existingCollection) {
          this.collectionRepository.updateCollection(
            response.data.data.collection._id,
            {
              ...response.data.data.collection,
              id: response.data.data.collection._id,
              currentBranch: requestBody.currentBranch,
            },
          );
          notifications.error("Collection already exists.");
        } else {
          this.collectionRepository.addCollection({
            ...response.data.data.collection,
            id: response.data.data.collection._id,
            currentBranch: requestBody.currentBranch,
            workspaceId: currentWorkspaceId,
          });
          this.workspaceRepository.updateCollectionInWorkspace(
            currentWorkspaceId,
            {
              id: initCollectionTab.getValue().id,
              name: initCollectionTab.getValue().name,
            },
          );
          notifications.success("Collection imported successfully.");
        }

        this.tabRepository.createTab(initCollectionTab.getValue());
        moveNavigation("right");

        MixpanelEvent(Events.IMPORT_COLLECTION, {
          collectionName: response.data.data.collection.name,
          collectionId: response.data.data.collection._id,
          importThrough: "ByObject",
        });
      } else {
        notifications.error("Failed to import collection. Please try again.");
      }
      return response;
    }
  };

  /**
   * Fetches the collection guide document.
   *
   * @returns - A promise that resolves to the collection guide document.
   */
  public fetchCollectionGuide = async (query: GuideQuery) => {
    const data = await this.guideRepository.findOne(query);
    return data;
  };

  /**
   * Updates the collection guide document's active status.
   *
   * @param isActive - The new active status to set for the collection guide.
   * @returns - A promise that resolves when the update is complete.
   */
  public updateCollectionGuide = async (
    query: GuideQuery,
    isActive: boolean,
  ) => {
    await this.guideRepository.update(query, {
      isActive: isActive,
    });
  };

  /**
   * Handles collection rename
   * @param collection - collction to rename
   * @param newCollectionName :string - the new name of the collection
   */
  public handleSaveAsRenameCollection = async (
    workspaceId: string,
    collectionId: string,
    newCollectionName: string,
  ) => {
    if (newCollectionName) {
      let isGuestUser;
      isGuestUserActive.subscribe((value) => {
        isGuestUser = value;
      });
      if (isGuestUser === true) {
        const colData =
          await this.collectionRepository.readCollection(collectionId);
        const col: CollectionDocType = colData.toMutableJSON();
        col.name = newCollectionName;
        this.collectionRepository.updateCollection(collectionId, col);
        // notifications.success("Collection renamed successfully!");
        return {
          isSuccessful: true,
        };
      }
      const response = await this.collectionService.updateCollectionData(
        collectionId,
        workspaceId,
        { name: newCollectionName },
      );
      if (response.isSuccessful) {
        this.collectionRepository.updateCollection(
          collectionId,
          response.data.data,
        );
        notifications.success("Collection renamed successfully!");
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
  public handleSaveAsRenameFolder = async (
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
      const response = await this.collectionService.updateFolderInCollection(
        workspaceId,
        collectionId,
        folderId,
        {
          ...userSource,
          name: newFolderName,
        },
      );
      if (response.isSuccessful) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          folderId,
          response.data.data,
        );
        notifications.success("Folder renamed successfully!");
      } else {
        notifications.error("Failed to rename folder. Please try again.");
      }
      return response;
    }
  };

  /**
   * Fetch a specific feature data
   */
  public getFeatureStatus = async (query: FeatureQuery) => {
    return await this.featureSwitchRepository.findOne(query);
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
    componentData: Tab,
  ) => {
    let userSource = {};
    // const _id = componentData.id;
    if (path.length > 0) {
      const socketTabAdapter = new SocketTabAdapter();
      const unadaptedSocket = socketTabAdapter.unadapt(componentData);
      const req = {
        id: uuidv4(),
        name: tabName,
        description,
        type: ItemType.WEB_SOCKET,
        websocket: unadaptedSocket,
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
          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const res = await this.collectionService.addSocketInCollection({
          collectionId: path[path.length - 1].id,
          workspaceId: _workspaceMeta.id,
          ...userSource,
          items: {
            name: tabName,
            description,
            type: ItemType.WEB_SOCKET,
            websocket: unadaptedSocket,
          },
        });
        if (res.isSuccessful) {
          this.addRequestOrFolderInCollection(
            path[path.length - 1].id,
            res.data.data,
          );
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
          this.collectionRepository.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            req,
          );

          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const res = await this.collectionService.addSocketInCollection({
          collectionId: path[0].id,
          workspaceId: _workspaceMeta.id,
          folderId: path[path.length - 1].id,
          ...userSource,
          items: {
            id: path[path.length - 1].id,
            name: path[path.length - 1].name,
            type: ItemType.FOLDER,
            items: {
              name: tabName,
              description,
              type: ItemType.WEB_SOCKET,
              websocket: unadaptedSocket,
            },
          },
        });
        if (res.isSuccessful) {
          this.collectionRepository.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            res.data.data,
          );

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

  /**
   * Save Request
   * @param saveDescriptionOnly - refers save overall request data or only description as a documentation purpose.
   * @returns save status
   */
  public saveSocket = async (_componentData: Tab) => {
    const componentData: Tab = _componentData;
    const { folderId, collectionId, workspaceId } = componentData.path;

    if (!workspaceId || !collectionId) {
      return {
        status: "error",
        message: "web socket is not a part of any workspace or collection",
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

    const socketTabAdapter = new SocketTabAdapter();
    const unadaptedSocket = socketTabAdapter.unadapt(componentData);
    // Save overall api

    const socketMetaData = {
      id: _id,
      name: componentData?.name,
      description: componentData?.description,
      type: ItemType.WEB_SOCKET,
    };

    let folderSource;
    let itemSource;
    if (folderId) {
      folderSource = {
        folderId: folderId,
      };
      itemSource = {
        id: folderId,
        type: ItemType.FOLDER,
        items: {
          ...socketMetaData,
          websocket: unadaptedSocket,
        },
      };
    } else {
      itemSource = {
        ...socketMetaData,
        websocket: unadaptedSocket,
      };
    }

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      const progressiveTab = _componentData;
      const data = {
        id: progressiveTab.id,
        name: socketMetaData.name,
        description: socketMetaData.description,
        type: ItemType.WEB_SOCKET,
        websocket: unadaptedSocket,
        updatedAt: "",
        updatedBy: "Guest User",
      };

      // progressiveTab.isSaved = true;
      // this.tab = progressiveTab;
      // await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
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
      return {
        status: "success",
        message: "",
      };
    }
    const res = await this.collectionService.updateSocketInCollection(_id, {
      collectionId: collectionId,
      workspaceId: workspaceId,
      ...folderSource,
      ...userSource,
      items: itemSource,
    });

    if (res.isSuccessful) {
      // const progressiveTab = _componentData;
      // progressiveTab.isSaved = true;
      // this.tab = progressiveTab;
      // await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
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
      return {
        status: "success",
        message: res.message,
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
  public saveSocketIo = async (componentData: Tab) => {
    const { folderId, collectionId, workspaceId } = componentData.path;

    if (!workspaceId || !collectionId) {
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
      const data = {
        id: _id,
        name: socketMetaData.name,
        description: socketMetaData.description,
        type: ItemType.SOCKET_IO,
        socketio: unadaptedSocket,
        updatedAt: "",
        updatedBy: "Guest User",
      };

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
      return {
        status: "success",
        message: "",
      };
    }
    const res = await this.collectionService.updateSocketIoInCollection(_id, {
      collectionId: collectionId,
      workspaceId: workspaceId,
      ...folderSource,
      ...userSource,
      items: itemSource,
    } as
      | SocketIORequestCreateUpdateInCollectionPayloadDtoInterface
      | SocketIORequestCreateUpdateInFolderPayloadDtoInterface);

    if (res.isSuccessful) {
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
      return {
        status: "success",
        message: res.message,
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
   * @param path - request stack path
   * @param tabName - request name
   * @param description - request description
   * @param type - save over all request or description only
   */
  public saveAsSocketIo = async (
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
    componentData: Tab,
  ) => {
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

          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const res = await this.collectionService.addSocketIoInCollection({
          collectionId: path[path.length - 1].id,
          workspaceId: _workspaceMeta.id,
          ...userSource,
          items: {
            name: tabName,
            description,
            type: CollectionItemTypeBaseEnum.SOCKETIO,
            socketio: {
              url: unadaptedSocket.url,
              message: unadaptedSocket.message,
              eventName: unadaptedSocket.eventName,
              events: unadaptedSocket.events,
              queryParams: unadaptedSocket.queryParams,
              headers: unadaptedSocket.headers,
              selectedSocketIOBodyType:
                unadaptedSocket.selectedSocketIOBodyType,
            },
          },
        });
        if (res.isSuccessful) {
          this.addRequestOrFolderInCollection(
            path[path.length - 1].id,
            res.data.data,
          );

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
          this.collectionRepository.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            req,
          );
          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const res = await this.collectionService.addSocketIoInCollection({
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
              socketio: {
                url: unadaptedSocket.url,
                message: unadaptedSocket.message,
                eventName: unadaptedSocket.eventName,
                events: unadaptedSocket.events,
                queryParams: unadaptedSocket.queryParams,
                headers: unadaptedSocket.headers,
                selectedSocketIOBodyType:
                  unadaptedSocket.selectedSocketIOBodyType,
              },
            },
          },
        });
        if (res.isSuccessful) {
          this.collectionRepository.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            res.data.data,
          );
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

  /**
   *
   * @param _workspaceMeta - workspace meta data.
   * @param path - request stack path.
   * @param tabName - request name.
   * @param description - request description.
   * @param componentData - GraphQL request tab data.
   */
  public saveAsGraphql = async (
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
    componentData: Tab,
  ) => {
    let userSource = {};
    if (path.length > 0) {
      const graphqlTabAdapter = new GraphqlTabAdapter();
      const unadaptedRequest = graphqlTabAdapter.unadapt(componentData as Tab);
      let req = {
        id: uuidv4(),
        name: tabName,
        description,
        type: ItemType.GRAPHQL,
        graphql: unadaptedRequest,
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
        const isGuestUser = await this.getGuestUserState();

        if (isGuestUser == true) {
          this.addRequestOrFolderInCollection(path[path.length - 1].id, req);
          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const res = await this.collectionService.addGraphqlInCollection({
          collectionId: path[path.length - 1].id,
          workspaceId: _workspaceMeta.id,
          ...userSource,
          items: {
            name: tabName,
            description,
            type: CollectionItemTypeBaseEnum.GRAPHQL,
            graphql: unadaptedRequest,
          },
        });
        if (res.isSuccessful) {
          this.addRequestOrFolderInCollection(
            path[path.length - 1].id,
            res.data.data,
          );
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
        const isGuestUser = await this.getGuestUserState();

        if (isGuestUser == true) {
          this.collectionRepository.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            req,
          );
          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const res = await this.collectionService.addGraphqlInCollection({
          collectionId: path[0].id,
          workspaceId: _workspaceMeta.id,
          folderId: path[path.length - 1].id,
          ...userSource,
          items: {
            id: path[path.length - 1].id,
            type: CollectionItemTypeBaseEnum.FOLDER,
            name: path[path.length - 1].name,
            items: {
              name: tabName,
              description,
              type: CollectionItemTypeBaseEnum.GRAPHQL,
              graphql: unadaptedRequest,
            },
          },
        });
        if (res.isSuccessful) {
          this.collectionRepository.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            res.data.data,
          );

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
      MixpanelEvent(Events.Save_GraphQL_Request);
    }
  };

  /**
   * Save saveGraphql Request
   * @param graphqlTabData - refers save overall graphql tab data
   * @returns save status
   */
  public saveGraphql = async (graphqlTabData: Tab) => {
    MixpanelEvent(Events.Save_GraphQL_Request);
    const { folderId, collectionId, workspaceId } = graphqlTabData.path as Path;

    if (!workspaceId || !collectionId) {
      return {
        status: "error",
        message: "request is not a part of any workspace or collection",
      };
    }

    const graphqlTabAdapter = new GraphqlTabAdapter();
    const unadaptedRequest = graphqlTabAdapter.unadapt(graphqlTabData as Tab);

    const isGuestUser = await this.getGuestUserState();
    /**
     * Handle save GraphQL Request for guest user
     */
    if (isGuestUser) {
      const guestGraphqlRequest = {
        id: graphqlTabData.id,
        name: graphqlTabData.name,
        description: graphqlTabData.description,
        type: CollectionItemTypeBaseEnum.GRAPHQL,
        graphql: {
          url: unadaptedRequest.url as string,
          query: unadaptedRequest.query,
          schema: unadaptedRequest.schema,
          headers: unadaptedRequest.headers,
          auth: unadaptedRequest.auth,
          selectedGraphqlAuthType: unadaptedRequest.selectedGraphqlAuthType,
        },
        updatedAt: "",
        updatedBy: "Guest User",
      };
      if (!folderId) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          graphqlTabData.id as string,
          guestGraphqlRequest,
        );
      } else {
        this.collectionRepository.updateRequestInFolder(
          collectionId,
          folderId,
          graphqlTabData.id as string,
          guestGraphqlRequest,
        );
      }
      return {
        status: "success",
        message: "",
      };
    }

    /**
     * Handle save GraphQL Request for registered user
     */

    const graphqlPayload = {
      name: graphqlTabData?.name as string,
      description: graphqlTabData?.description as string,
      url: unadaptedRequest.url as string,
      query: unadaptedRequest.query,
      schema: unadaptedRequest.schema,
      headers: unadaptedRequest.headers,
      auth: unadaptedRequest.auth,
      variables: unadaptedRequest.variables,
      selectedGraphqlAuthType: unadaptedRequest.selectedGraphqlAuthType,
    };

    const res = await this.collectionService.updateGraphqlInCollection(
      graphqlTabData.id as string,
      collectionId,
      workspaceId,
      graphqlPayload,
      folderId,
    );

    if (res.isSuccessful) {
      if (!folderId) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          graphqlTabData.id as string,
          res.data.data,
        );
      } else {
        this.collectionRepository.updateRequestInFolder(
          collectionId,
          folderId,
          graphqlTabData.id as string,
          res.data.data,
        );
      }
      return {
        status: "success",
        message: res.message,
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   * Validates a localhost URL by making a GET request.
   *
   * @param url - The localhost URL to validate.
   * @returns A promise that resolves with the response of the validation request.
   */
  public validateLocalHostURL = async (url: string) => {
    const response = await this.collectionService.validateImportCollectionURL(
      url.replace("localhost", "127.0.0.1"),
    );
    return response;
  };

  /**
   * Validates a deployed URL by making a GET request.
   *
   * @param url - The deployed URL to validate.
   * @returns  A promise that resolves with the response of the validation request.
   */
  public validateDeployedURL = async (url: string) => {
    const response =
      await this.collectionService.validateImportCollectionURL(url);
    return response;
  };

  /**
   * Validate the data if it follows Open API Specification or not.
   * @param data - Open API Text Data
   * @returns A promise that resolves with the response of the validation request.
   */
  public validateURLInput = async (data: any) => {
    const response = await this.collectionService.validateImportCollectionInput(
      "",
      JSON.parse(data?.data?.response),
    );
    return response;
  };

  /**
   * Saves saved http request
   * @param componentData - refers overall saved request tab data.
   * @returns status of the operation performed.
   */
  public saveSavedRequest = async (componentData: Tab): Promise<boolean> => {
    const { folderId, collectionId, workspaceId, requestId } =
      componentData.path;
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) return false;
    const res = await this.collectionService.updateSavedRequestInCollection(
      componentData.id,
      {
        collectionId: collectionId,
        workspaceId: workspaceId,
        requestId: requestId,
        folderId: folderId,
        description: componentData.description,
      },
    );

    if (res.isSuccessful) {
      if (folderId) {
        this.collectionRepository.updateSavedRequestInFolder(
          collectionId,
          folderId,
          requestId,
          componentData.id,
          {
            description: componentData.description,
          },
        );
      } else {
        this.collectionRepository.updateSavedRequestInCollection(
          collectionId,
          requestId,
          componentData.id,
          {
            description: componentData.description,
          },
        );
      }
      notifications.success("Response saved successfully.");
      return true;
    } else {
      notifications.error("Failed to save response. Please try again.");
      return false;
    }
  };

  /**
   * Update the tab type to permanent on double click
   * @param tab tab data to make it permanent
   */
  public handleTabTypeChange = async (tab: Tab) => {
    if (tab.persistence === TabPersistenceTypeEnum.TEMPORARY) {
      await this.tabRepository.updateTab(tab.tabId, {
        persistence: TabPersistenceTypeEnum.PERMANENT,
      });
    }
  };
}
