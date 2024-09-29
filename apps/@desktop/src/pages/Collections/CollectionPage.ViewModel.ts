import type {
  CollectionDocument,
  EnvironmentDocument,
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
// import { setContentTypeHeader } from "@deprecate/utils/helpers";

//-----
//External Imports
import { invoke } from "@tauri-apps/api/core";
//-----

//Utils

import type {
  CreateApiRequestPostBody,
  CreateDirectoryPostBody,
  ImportBodyUrl,
} from "@deprecate/utils/dto";
//-----

//-----
//Interfaces
import type { Folder } from "@deprecate/utils/interfaces/request.interface";
//-----

//-----
//Emuns

import {
  ItemType,
  UntrackedItems,
} from "@deprecate/utils/enums/item-type.enum";
import { ContentTypeEnum, ResponseStatusCode } from "@deprecate/utils/enums";
//-----

import { moveNavigation } from "@deprecate/utils/helpers/navigation";
import { GuideRepository } from "../../repositories/guide.repository";
import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { type Observable } from "rxjs";
import { InitRequestTab, InitWebSocketTab } from "@sparrow/common/utils";
import { InitCollectionTab } from "@sparrow/common/utils";
import { InitFolderTab } from "@sparrow/common/utils";
import { requestSplitterDirection } from "@sparrow/workspaces/features/rest-explorer/store";
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
import type {
  CollectionArgsDto,
  CollectionDto,
  CollectionItemsDto,
  RequestDto,
  Tab,
} from "@sparrow/common/types/workspace";
import { SocketTabAdapter } from "../../adapter/socket-tab";
import type { CollectionDocType } from "../../models/collection.model";
import type { GuideQuery } from "../../types/user-guide";
import type { FeatureQuery } from "../../types/feature-switch";
import { ReduceQueryParams } from "@sparrow/workspaces/features/rest-explorer/utils";

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
  public fetchCollections = async (workspaceId: string) => {
    const isGuestUser = await this.getGuestUserState();
    if (workspaceId && !isGuestUser) {
      let isGuestUser;
      isGuestUserActive.subscribe((value) => {
        isGuestUser = value;
      });
      if (isGuestUser !== true) {
        const res = await this.collectionService.fetchCollection(workspaceId);
        if (res.isSuccessful) {
          this.collectionRepository.bulkInsertData(
            res.data.data.map((collection: CollectionDto) => {
              collection["workspaceId"] = workspaceId;
              return collection;
            }),
          );
        }
      }
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

  /**
   * Return current tabs list of top tab bar component
   */
  public tabs() {
    return this.tabRepository.getTabList();
  }
  public getTabListWithWorkspaceId(workspaceId: string) {
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
  public getActiveTab = (workspaceId: string) => {
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
   * Syncs the collections from active and update the repository
   * @param activeWorkspace: WorkspaceDocument
   */
  public syncCollectionsWithBackend = async (
    activeWorkspace: WorkspaceDocument,
  ) => {
    let currentEnvironment: object;
    if (activeWorkspace) {
      // await refreshEnv(activeWorkspaceRxDoc?._id);
      const env: EnvironmentDocument =
        await this.environmentRepository.readEnvironment(
          activeWorkspace.get("environmentId"),
        );
      if (env) {
        currentEnvironment = env.toMutableJSON();
      } else {
        currentEnvironment = {
          name: "None",
          id: "none",
        };
      }
      const workspaceId = activeWorkspace?._id;
      let isGuestUser;
      isGuestUserActive.subscribe((value) => {
        isGuestUser = value;
      });
      if (isGuestUser !== true) {
        const response =
          await this.collectionService.fetchCollection(workspaceId);
        if (response.isSuccessful && response.data.data) {
          const collections = response.data.data;
          collections.forEach((collection: CollectionDocument) => {
            collection.workspaceId = workspaceId;
          });
          this.collectionRepository.bulkInsertData(collections);
        } else {
          notifications.error(response.message);
        }
      }
      return currentEnvironment;
    }
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
        notifications.success("New Collection Created");
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
      notifications.success("New Collection Created");
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
        notifications.error("Failed to import cURL. Please try again");
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
            method: sampleRequest.getValue().property.request.method,
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
    explorer: Folder,
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
      notifications.error("Failed to create folder!");
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
          notifications.error("Failed to rename collection!");
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
        notifications.error("Failed to rename collection!");
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
        notifications.success("Folder renamed successfully!");

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
    this.tabRepository.createTab(adaptedSocket);
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
        if (item.type === ItemType.REQUEST) {
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
        response.message ?? "Failed to delete the Collection.",
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
    explorer: Folder,
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
      notifications.error("Failed to delete the Folder.");
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
      notifications.error("Failed to delete the Request.");
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
    folder: Folder,
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
      } else {
        await this.collectionRepository.deleteRequestOrFolderInCollection(
          collection.id,
          websocket.id,
        );
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
      notifications.error("Failed to delete the WebSocket.");
      return false;
    }
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
          notifications.success("Collection synced.");
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

  public handleOpenItem = async (
    entitytype: string,
    args: CollectionArgsDto,
  ) => {
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
      case "websocket":
        this.handleOpenWebSocket(
          args.workspaceId,
          args.collection as CollectionDto,
          args.folder as CollectionItemsDto,
          args.websocket as CollectionItemsDto,
        );
        break;
    }
  };

  public handleOnChangeViewInRequest = async (view: string) => {
    requestSplitterDirection.set(view);
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
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser !== true) {
      const response = await this.collectionService.importCollectionFromFile(
        currentWorkspaceId,
        file,
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
        notifications.success("Collection renamed successfully!");
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
        notifications.error("Failed to rename collection!");
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
        notifications.success("Folder renamed successfully!");
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
        notifications.error("Failed to rename folder!");
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
}
