import type {
  CollectionDocument,
  EnvironmentDocument,
  TabDocument,
  WorkspaceDocument,
} from "@app/database/database";

//-----
// Stores
import { user, userWorkspaceLevelRole } from "$lib/store";
import {
  isApiCreatedFirstTime,
  tabs,
  progressiveTab,
} from "$lib/store/request-response-section";
//-----

//-----
// Repositories
import { CollectionRepository } from "@app/repositories/collection.repository";
import { EnvironmentRepository } from "@app/repositories/environment.repository";
import { TabRepository } from "@app/repositories/tab.repository";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
//-----
import { v4 as uuidv4 } from "uuid";

//-----
// Services
import { EnvironmentService } from "$lib/services-v2/environment.service";
import {
  insertCollection,
  insertCollectionDirectory,
} from "@app/services/collection";
import { CollectionService } from "@app/services/collection.service";
import { notifications } from "@library/ui/toast/Toast";
import { setContentTypeHeader } from "$lib/utils/helpers";

//-----
//External Imports
import yaml from "js-yaml";
import { invoke } from "@tauri-apps/api/core";
//-----

//-----
//Utils
import {
  validateClientJSON,
  validateClientURL,
  validateClientXML,
  useTree,
} from "@common/utils/importCollectionValidations";
import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
import {
  PERMISSION_NOT_FOUND_TEXT,
  workspaceLevelPermissions,
} from "$lib/utils/constants/permissions.constant";
import { type CreateApiRequestPostBody } from "$lib/utils/dto";
import type { CreateDirectoryPostBody } from "$lib/utils/dto";
//-----

//-----
//Interfaces
import type { CollectionItem } from "$lib/utils/interfaces/collection.interface";
import type {
  Collection,
  RequestBody,
  Path,
  Request,
  Folder,
  NewTab,
} from "$lib/utils/interfaces/request.interface";
//-----

//-----
//Emuns
import { RequestDataType, RequestDataset } from "$lib/utils/enums";
import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
import {
  WorkspaceRole,
  ContentTypeEnum,
  ResponseStatusCode,
} from "$lib/utils/enums";
//-----

//-----
//Samples
import { generateSampleCollection } from "$lib/utils/sample/collection.sample";
import { generateSampleRequest } from "$lib/utils/sample";
import { generateSampleFolder } from "$lib/utils/sample/folder.sample";
//-----

import { moveNavigation } from "$lib/utils/helpers/navigation";
import { Events } from "$lib/utils/enums/mixpanel-events.enum";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { sample, type Observable } from "rxjs";
import { InitRequestTab } from "@common/utils";
import { InitCollectionTab } from "@common/utils";
import { InitFolderTab } from "@common/utils/init-folder-tab";
import { requestSplitterDirection } from "@workspaces/features/rest-explorer/store";
import {
  insertCollectionRequest,
  updateCollectionRequest,
} from "@app/services/collection";
import { GithubService } from "@app/services/github.service";
import { GithubRepoReposistory } from "@app/repositories/github-repo.repository";

export default class CollectionsViewModel {
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();
  private collectionRepository = new CollectionRepository();
  private environmentRepository = new EnvironmentRepository();
  private githhubRepoRepository = new GithubRepoReposistory();
  private collectionService = new CollectionService();
  private githubService = new GithubService();
  movedTabStartIndex = 0;
  movedTabEndIndex = 0;

  constructor() {}

  public fetchCollections = async (workspaceId: string) => {
    const res = await this.collectionService.fetchCollection(workspaceId);
    if (res.status) {
      this.collectionRepository.bulkInsertData(res.data.data);
    } else {
      notifications.error("Failed to fetch collections!")
    }
  }

  /**
   * Get role of the user in workspace
   * @returns :UserRole - role of the user in workspace
   */
  public getUserRoleInWorspace = () => {
    let role: WorkspaceRole;
    const userWorkspaceLevelRoleSubscribe = userWorkspaceLevelRole.subscribe(
      (value) => {
        role = WorkspaceRole.WORKSPACE_ADMIN;
      },
    );
    userWorkspaceLevelRoleSubscribe();
    return role;
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
   * Syncs tabs with repository
   */
  // public syncTabWithStore = () => {
  //   this.tabRepository.syncTabsWithStore(tabs);
  // };

  /**
   * Prevent syncTabWithStore() to be called multiple times in 2 seconds
   */
  // debouncedTab = new Debounce().debounce(this.syncTabWithStore, 2000);

  /**
   * Return current tabs list of top tab bar component
   */
  get tabs() {
    return this.tabRepository.getTabList();
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
  public getActiveTab = () => {
    return this.tabRepository.getTab();
  };

  /**
   * Handles creating a new tab
   * @param data :any - data of the tab i.e. collection, folder or request
   */
  public handleCreateTab = (data: NewTab) => {
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
    isApiCreatedFirstTime.set(true);
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
    // TODO - Parse this.tabs observable to RxDoc (Remove these code)
    const tabList = this.tabs;
    /////////////////////////////////////////////////////////////////////
    let updatedTabList: TabDocument[] = [];
    tabList
      .subscribe((value) => {
        updatedTabList = value;
      })
      .unsubscribe();
    const element = updatedTabList.splice(this.movedTabStartIndex, 1);
    updatedTabList.splice(this.movedTabEndIndex, 0, element[0]);
    updatedTabList = updatedTabList.map((tab, index) => {
      tab.patch({
        index: index,
      });
      return tab;
    });
    updatedTabList.sort((a, b) => {
      return b.index - a.index;
    });
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
  private readRequestOrFolderInCollection = (
    collectionId: string,
    uuid: string,
  ): Promise<CollectionItem> => {
    return this.collectionRepository.readRequestOrFolderInCollection(
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
  public saveAPIRequest = async (
    componentData: NewTab,
    saveDescriptionOnly = false,
  ) => {
    const { folderId, folderName, collectionId, workspaceId } =
      componentData.path;
    // Retrieve collection data
    const _collection = await this.readCollection(collectionId);
    let userSource = {};
    if (_collection?.activeSync && componentData?.source === "USER") {
      userSource = {
        currentBranch: _collection?.currentBranch,
        source: "USER",
      };
    }
    const _id = componentData.id;
    let existingRequest;
    // Get already existing request details
    if (!folderId) {
      existingRequest = await this.readRequestOrFolderInCollection(
        collectionId,
        _id,
      );
    } else {
      existingRequest = await this.readRequestInFolder(
        collectionId,
        folderId,
        _id,
      );
    }
    // Get Bodytype in request
    const bodyType =
      componentData.property.request.state.dataset === RequestDataset.RAW
        ? componentData.property.request.state.raw
        : componentData.property.request.state.dataset;
    let expectedRequest: RequestBody;
    let expectedMetaData;
    // Create request details for updating request inside collection
    if (!saveDescriptionOnly) {
      // Request details when overall API needs to be updated
      expectedRequest = {
        method: componentData.property.request.method,
        url: componentData.property.request.url,
        body: componentData.property.request.body,
        headers: componentData.property.request.headers,
        queryParams: componentData.property.request.queryParams,
        auth: componentData.property.request.auth,
        selectedRequestBodyType: setContentTypeHeader(bodyType),
        selectedRequestAuthType: componentData.property.request.state?.auth,
      };
      // create meta data
      expectedMetaData = {
        id: _id,
        name: componentData?.name,
        description: componentData?.description,
        type: ItemType.REQUEST,
      };
    } else {
      // Request details when only API description needs to be updated
      expectedRequest = {
        method: existingRequest?.request.method,
        url: existingRequest?.request.url,
        body: existingRequest?.request.body,
        headers: existingRequest?.request.headers,
        queryParams: existingRequest?.request.queryParams,
        auth: existingRequest?.request.auth,
        selectedRequestBodyType:
          existingRequest?.request?.selectedRequestBodyType,
        selectedRequestAuthType:
          existingRequest?.request?.selectedRequestAuthType,
      };
      // create meta data
      expectedMetaData = {
        id: _id,
        name: existingRequest?.name,
        description: componentData?.description,
        type: ItemType.REQUEST,
      };
    }

    // Update the request in particular Collection
    if (!folderId) {
      // Update Request when not inside folder
      const res = await updateCollectionRequest(_id, folderId, collectionId, {
        collectionId: collectionId,
        workspaceId: workspaceId,
        ...userSource,
        items: {
          ...expectedMetaData,
          request: expectedRequest,
        },
      });
      if (res.isSuccessful) {
        return true;
      } else {
        return false;
      }
    } else {
      // Update Request when inside folder
      const res = await updateCollectionRequest(_id, folderId, collectionId, {
        collectionId: collectionId,
        workspaceId: workspaceId,
        folderId: folderId,
        ...userSource,
        items: {
          name: folderName,
          type: ItemType.FOLDER,
          items: {
            ...expectedMetaData,
            request: expectedRequest,
          },
        },
      });
      if (res.isSuccessful) {
        return true;
      } else {
        return false;
      }
    }
  };

  /**
   * Handle updating tab
   * @param data :any - tab data i.e. collection, folder or request
   * @param route :string - path to collection, folder or request
   * @param _id :string - if of the tab
   */
  public updateTab = async (_id: string, data: any) => {
    this.tabRepository
      .getTabList()
      .subscribe((tabs) => {
        tabs.forEach((tab) => {
          if (tab.id === _id) {
            this.tabRepository.updateTab(tab.tabId, data);
          }
        });
      })
      .unsubscribe();
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
    let currentEnvironment: any;
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
  private addCollection = (collection: CollectionDocument) => {
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
  private getNextCollection: (list: CollectionDocument[], name: string) => any =
    (list, name) => {
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
        const proposedName: string = `${name}${i}`;
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
  public handleCreateCollection = async (
    workspaceId: string,
    collection: Observable<CollectionDocument[]>,
  ) => {
    let totalFolder: number = 0;
    let totalRequest: number = 0;
    let collectionList: CollectionDocument[] = [];
    await collection
      .subscribe((collections) => (collectionList = collections))
      .unsubscribe();
    collectionList.filter(
      (collection) => collection.workspaceId === workspaceId,
    );
    const newCollection = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: this.getNextCollection(collectionList, "New collection"),
      items: [],
      createdAt: new Date().toISOString(),
    };

    const response = await this.collectionService.addCollection({
      name: newCollection.name,
      workspaceId: workspaceId,
    });

    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      this.addCollection({
        ...res,
        id: res._id,
        workspaceId: workspaceId,
      });
      let path: Path = {
        workspaceId: workspaceId,
        collectionId: response.data.data._id,
      };
      const Samplecollection = generateSampleCollection(
        response.data.data._id,
        new Date().toString(),
      );

      response.data.data.items.map((item) => {
        if (item.type === ItemType.REQUEST) {
          totalRequest++;
        } else {
          totalFolder++;
          totalRequest += item.items.length;
        }
      });

      Samplecollection.id = response.data.data._id;
      Samplecollection.path = path;
      Samplecollection.name = response.data.data.name;
      Samplecollection.property.collection.requestCount = totalRequest;
      Samplecollection.property.collection.folderCount = totalFolder;

      this.handleOpenCollection(workspaceId, Samplecollection);
      moveNavigation("right");

      this.workspaceRepository.updateCollectionInWorkspace(workspaceId, {
        id: Samplecollection.id,
        name: newCollection.name,
      });
      notifications.success("New Collection Created");
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: "USER",
        collectionName: response.data.data.name,
        collectionId: response.data.data._id,
      });
      return;
    } else {
      this.collectionRepository.deleteCollection(newCollection.id);
      notifications.error(response.message ?? "Failed to create collection!");
    }
    return;
  };

  /**
   * Handles searching and filtering for collections, folders and requests from search bar and filters
   * @param collection :CollectionDocument - the collection to be searched and filtered
   * @param searchData :string - the search data
   * @returns :{filteredCollection :CollectionDocument[], filteredFolder: any[], filteredFile: any[]}
   */
  public handleSearchCollection = (
    collection: CollectionDocument[],
    searchData: string,
  ) => {
    const [, , searchNode] = useTree();
    const filteredCollection: any = [];
    const filteredFolder: any = [];
    const filteredFile: any = [];
    searchNode(
      searchData,
      filteredCollection,
      filteredFolder,
      filteredFile,
      collection,
    );
    return {
      filteredCollection,
      filteredFolder,
      filteredFile,
    };
  };

  /**
   * Import collection from giver data
   * @param workspaceId: string - the workspace id in which the collection is going to be imported
   * @param url: string - the url of the swagger
   * @param activeSync: boolean - if the active sync is enabled
   * @returns
   */
  private importCollectionData = async (
    workspaceId: string,
    url: ImportBodyUrl,
    activeSync: boolean,
  ) => {
    return await this.collectionService.importCollection(
      workspaceId,
      url,
      activeSync,
    );
  };

  /**
   * Import collection from file
   * @param workspaceId: string - workspace id in which the collection is going to be imported
   * @param file: Request - the file to be imported
   * @returns
   */
  private importCollectionFile = async (workspaceId: string, file: Request) => {
    return await this.collectionService.importCollectionFile(workspaceId, file);
  };

  /**
   * Import collection from Json object
   * @param workspaceId: string - the workspace id in which the collection is going to be imported
   * @param jsonObject: string - the json object
   * @param contentType: string - the type of content of jsonObject
   * @returns
   */
  private importCollectionFromJsonObject = async (
    workspaceId: string,
    jsonObject: string,
    contentType: ContentTypeEnum,
  ) => {
    return await this.collectionService.importCollectionFromJsonObject(
      workspaceId,
      jsonObject,
      contentType,
    );
  };

  /**
   * Handle collection from File
   * @param workspaceId: string - id of workspace in which collection is going to ne imported
   * @param file: Request - the file to be imported
   * @returns
   */
  private importCollectionFromFile = async (
    workspaceId: string,
    file: Request,
  ) => {
    return await this.collectionService.importCollectionFromFile(
      workspaceId,
      file,
    );
  };

  /**
   * Validate the body type of the import data from import collaction
   * @param data: string - the data to be validated
   * @returns
   */
  private validateImportBody = (data: string): ContentTypeEnum => {
    let contentType: ContentTypeEnum;
    try {
      JSON.parse(data);
      return (contentType = ContentTypeEnum["application/json"]);
    } catch (jsonError) {
      if (jsonError instanceof SyntaxError) {
        try {
          yaml.load(data);
          return (contentType = ContentTypeEnum["text/plain"]);
        } catch (yamlError) {
          return contentType;
        }
      } else {
        return contentType;
      }
    }
  };

  /**
   * Handle importing collction from Json Object
   * @param workspaceId :string
   * @param contentType: string - type of content in Json object
   * @param importJSON: string - Json object to import
   * @returns
   */
  private handleImportJsonObject = async (
    workspaceId: string,
    contentType: string,
    importJSON: string,
  ) => {
    if (!contentType) {
      return;
    }
    const response = await this.importCollectionFromJsonObject(
      workspaceId,
      importJSON,
      contentType,
    );

    if (response.isSuccessful) {
      const path: Path = {
        workspaceId: workspaceId,
        collectionId: response.data.data._id,
      };
      this.collectionService.addCollection({
        ...response.data.data,
        id: response.data.data._id,
        workspaceId: workspaceId,
      });
      const Samplecollection = generateSampleCollection(
        response.data.data._id,
        new Date().toString(),
      );

      Samplecollection.id = response.data.data._id;
      Samplecollection.path = path;
      Samplecollection.name = response.data.data.name;
      Samplecollection.save = true;
      // this.handleCreateTab(Samplecollection);
      moveNavigation("right");

      this.workspaceRepository.updateCollectionInWorkspace(workspaceId, {
        id: Samplecollection.id,
        name: Samplecollection.name,
      });
      MixpanelEvent(Events.IMPORT_COLLECTION, {
        collectionName: response.data.data.name,
        collectionId: response.data.data._id,
        importThrough: "ByObject",
      });
      notifications.success("Collection Imported successfully.");
      return;
    } else {
      notifications.error("Failed to import collection. Please try again.");
    }
  };

  /**
   * Handle importing collection from swagger url
   * @param workspaceId :string
   * @param requestBody :string - the url for swagger
   * @param validations : - the validations
   * @returns :void
   */
  private handleImportUrl = async (
    workspaceId: string,
    requestBody: string,
    validations: any,
  ) => {
    const response = await this.importCollectionData(
      workspaceId,
      requestBody,
      validations.activeSync,
    );

    if (response.isSuccessful) {
      const path: Path = {
        workspaceId: workspaceId,
        collectionId: response.data.data.collection._id,
      };
      const Samplecollection = generateSampleCollection(
        response.data.data._id,
        new Date().toString(),
      );

      Samplecollection.id = response.data.data.collection._id;
      Samplecollection.path = path;
      Samplecollection.name = response.data.data.collection.name;
      Samplecollection.save = true;
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
          workspaceId: workspaceId,
        });
        this.workspaceRepository.updateCollectionInWorkspace(workspaceId, {
          id: Samplecollection.id,
          name: Samplecollection.name,
        });
        notifications.success("Collection Imported successfully.");
      }
      // this.handleCreateTab(Samplecollection);
      moveNavigation("right");

      MixpanelEvent(Events.IMPORT_COLLECTION, {
        collectionName: response.data.data.collection.name,
        collectionId: response.data.data.collection._id,
        importThrough: "ByObject",
      });
      return;
    } else {
      notifications.error("Failed to import collection. Please try again.");
    }
  };

  /**
   * Handle file upload
   * @param file :Request - the file(JSON or YAML) to be uploaded to extract data
   * @returns :void
   */
  private handleFileUpload = async (workspaceId: string, file: Request) => {
    if (file) {
      const response = await this.importCollectionFromFile(workspaceId, file);
      if (response.isSuccessful) {
        const path: Path = {
          workspaceId: workspaceId,
          collectionId: response.data.data._id,
        };

        this.addCollection({
          ...response.data.data,
          id: response.data.data._id,
          workspaceId: workspaceId,
        });
        const Samplecollection = generateSampleCollection(
          response.data.data._id,
          new Date().toString(),
        );
        Samplecollection.id = response.data.data._id;
        Samplecollection.path = path;
        Samplecollection.name = response.data.data.name;
        Samplecollection.save = true;
        // this.handleCreateTab(Samplecollection);
        moveNavigation("right");

        this.workspaceRepository.updateCollectionInWorkspace(workspaceId, {
          id: Samplecollection.id,
          name: Samplecollection.name,
        });
        notifications.success("Collection Imported successfully.");
        MixpanelEvent(Events.IMPORT_COLLECTION, {
          collectionName: response.data.data.name,
          collectionId: response.data.data._id,
          importThrough: "ByFile",
        });
        return;
      } else if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error("Failed to import collection. Please try again.");
      }
    }
  };

  /**
   * Extracts git branches from file path
   * @param filePathResponse :string - the path to folder of local repository
   * @returns :{repositoryPath: string, repositoryBranch: string, getBranchList: string[], isRepositoryPath: boolean}
   */
  public extractGitBranch = async (filePathResponse: string) => {
    let repositoryPath: string = "";
    let repositoryBranch: string = "not exist";
    let getBranchList: string[] = [];
    let isRepositoryPath: boolean = false;

    repositoryPath = filePathResponse;
    try {
      const response = await invoke("get_git_branches", {
        path: repositoryPath,
      });
      if (response) {
        getBranchList = response
          .filter((elem) => {
            if (elem.startsWith("upstream/")) return false;
            else if (elem.startsWith("origin/HEAD -> origin/")) {
              const branchIterator = elem;
              repositoryBranch = branchIterator.replace(
                /^origin\/HEAD -> origin\//,
                "",
              );
              return false;
            }
            return true;
          })
          .map((elem) => {
            return {
              name: elem.replace(/^origin\//, ""),
              id: elem.replace(/^origin\//, ""),
              hide: false,
            };
          });
        isRepositoryPath = true;
        const activeResponse: string = await invoke("get_git_active_branch", {
          path: repositoryPath,
        });
        if (activeResponse) {
          return {
            repositoryPath,
            currentBranch: activeResponse,
            repositoryBranch,
            getBranchList,
            isRepositoryPath,
          };
        }
      }
    } catch (e) {}
  };

  /**
   * Handles the collection import with validations
   * @param importData
   * @param currentBranch
   * @param getBranchList
   * @param uploadCollection
   * @param validations
   * @returns
   */
  private handleImportCollection = async (
    workspaceId: string,
    importData: string,
    currentBranch: string,
    getBranchList: string[],
    uploadCollection: any,
    validations: {
      activeSync: boolean;
      isRepositoryPath: boolean;
      isRepositoryPathTouched: boolean;
      isRepositoryBranchTouched: boolean;
      importType: "file" | "text";
      isTextEmpty: boolean;
      isValidClientJSON: boolean;
      isValidServerJSON: boolean;
      isValidClientXML: boolean;
      isValidServerXML: boolean;
      isValidClientDeployedURL: boolean;
      isValidServerDeployedURL: boolean;
      isValidClientURL: boolean;
      isValidServerURL: boolean;
      repositoryBranch: string;
      repositoryPath: string;
    },
  ) => {
    if (validations.activeSync) {
      validations.isRepositoryPathTouched = true;
    }
    if (validations.isRepositoryPath) {
      validations.isRepositoryBranchTouched = true;
    }
    if (validations.importType === "text" && importData === "") {
      validations.isTextEmpty = true;
    }
    if (
      validations.importType === "text" &&
      importData &&
      ((validations.isValidClientJSON && validations.isValidServerJSON) ||
        (validations.isValidClientXML && validations.isValidServerXML))
    ) {
      const contentType = this.validateImportBody(importData);
      this.handleImportJsonObject(workspaceId, contentType, importData);
    } else if (
      validations.importType === "text" &&
      importData &&
      validations.isValidClientDeployedURL &&
      validations.isValidServerDeployedURL
    ) {
      const response =
        await this.collectionService.validateImportCollectionURL(importData);
      if (response?.data?.status === ResponseStatusCode.OK) {
        this.handleImportJsonObject(
          workspaceId,
          ContentTypeEnum["application/json"],
          response.data.response,
        );
      }
    } else if (
      validations.importType === "text" &&
      importData &&
      validations.isValidClientURL &&
      validations.isValidServerURL
    ) {
      const importUrl = importData.replace("localhost", "127.0.0.1") + "-json";
      const response =
        await this.collectionService.validateImportCollectionURL(importUrl);
      if (
        !validations.activeSync &&
        response?.data?.status === ResponseStatusCode.OK
      ) {
        const requestBody = {
          urlData: {
            data: JSON.parse(response.data.response),
            headers: response.data.headers,
          },
          url: importUrl,
        };
        this.handleImportUrl(workspaceId, requestBody, validations);
      } else if (
        validations.activeSync &&
        response?.data?.status === ResponseStatusCode.OK &&
        validations.isRepositoryPath &&
        validations.repositoryBranch &&
        validations.repositoryPath &&
        validations.repositoryBranch !== "not exist" &&
        currentBranch
      ) {
        if (
          getBranchList
            .map((elem) => {
              return elem.name;
            })
            .includes(currentBranch)
        ) {
          const requestBody = {
            urlData: {
              data: JSON.parse(response.data.response),
              headers: response.data.headers,
            },
            url: importUrl,
            primaryBranch: validations.repositoryBranch,
            currentBranch: currentBranch,
            localRepositoryPath: validations.repositoryPath,
          };
          this.handleImportUrl(workspaceId, requestBody, validations);
        } else {
          notifications.error(
            `Can't import local branch. Please push ${currentBranch} to remote first.`,
          );
        }
      }
    } else if (
      validations.importType === "file" &&
      uploadCollection?.file?.value?.length !== 0
    ) {
      this.handleFileUpload(workspaceId, uploadCollection?.file?.value);
      return;
    } else if (
      validations.importType === "file" &&
      uploadCollection?.file?.value?.length === 0
    ) {
      return;
    }
  };

  /**
   * Check body type of curl
   * @param type: string: type string to be checked from enum
   * @returns Request Body Type
   */
  private checkBodyType = (type: string) => {
    const contentTypeMapping: { [key: string]: string } = {
      "application/json": RequestDataType.JSON,
      "application/xml": RequestDataType.XML,
      "application/x-www-form-urlencoded": RequestDataset.URLENCODED,
      "multipart/form-data": RequestDataset.FORMDATA,
      "application/javascript": RequestDataType.JAVASCRIPT,
      "text/plain": RequestDataType.TEXT,
      "text/html": RequestDataType.HTML,
    };

    return contentTypeMapping[type] || RequestDataset.NONE;
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
      const sampleRequest = generateSampleRequest(
        UntrackedItems.UNTRACKED + uuidv4(),
        new Date().toString(),
      );
      if (response.data.data.request.selectedRequestBodyType) {
        const bodyType = this.checkBodyType(
          response.data.data.request.selectedRequestBodyType,
        );
        if (bodyType === RequestDataset.NONE) {
          sampleRequest.property.request.state.dataset = bodyType;
        } else if (
          bodyType !== RequestDataset.URLENCODED &&
          bodyType !== RequestDataset.FORMDATA
        ) {
          sampleRequest.property.request.state.dataset = RequestDataset.RAW;
          sampleRequest.property.request.state.raw = bodyType;
        } else {
          sampleRequest.property.request.state.dataset = bodyType;
        }
      }
      sampleRequest.name = response.data.data.name ?? "";
      sampleRequest.description = response.data.data.description ?? "";
      sampleRequest.type = response.data.data.type ?? ItemType.REQUEST;
      sampleRequest.property.request.method = response.data.data.request.method;
      sampleRequest.property.request.url = response.data.data.request.url;
      sampleRequest.property.request.body = response.data.data.request.body;
      sampleRequest.property.request.headers =
        response.data.data.request.headers;
      sampleRequest.property.request.queryParams =
        response.data.data.request.queryParams;
      sampleRequest.property.request.auth = response.data.data.request.auth;
      sampleRequest.property.request.state.auth =
        response.data.data.request.selectedRequestAuthType;

      const req = new InitRequestTab(sampleRequest.id, workspaceId);
      req.updateName(sampleRequest.name);
      req.updateAuth(sampleRequest.property.request?.auth);
      req.updateMethod(sampleRequest.property.request?.method);
      req.updateUrl(sampleRequest.property.request?.url);
      req.updateBody(sampleRequest.property.request?.body);
      req.updateHeaders(sampleRequest.property.request?.headers);
      req.updateQueryParams(sampleRequest.property.request?.queryParams);

      this.handleCreateTab(req.getValue());
      moveNavigation("right");
      notifications.success("API request is imported successfully.");
      return true;
    } else {
      if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error(
          "Failed to import API request. Please check the cURL text and try again.",
        );
      }
      return false;
    }
  };

  /**
   * Handle input change in add collection popup
   * @param importData: string - data to be validated
   * @returns :{isimportDataLoading = boolean, isValidClientURL = boolean, isValidClientJSON = boolean, isValidClientXML = boolean, isValidServerURL = boolean, isValidServerJSON = boolean, isValidServerXML = boolean, isValidClientDeployedURL = boolean, isValidServerDeployedURL = boolean}
   */
  public handleImportDataChange = async (importData: string) => {
    let isValidClientURL = false;
    let isValidClientJSON = false;
    let isValidClientXML = false;
    let isValidServerURL = false;
    let isValidServerJSON = false;
    let isValidServerXML = false;
    let isValidClientDeployedURL = false;
    let isValidServerDeployedURL = false;

    if (validateClientURL(importData)) {
      if (
        importData.includes("://127.0.0.1") ||
        importData.includes("://localhost")
      ) {
        isValidClientURL = true;
        const response =
          await this.collectionService.validateImportCollectionURL(
            importData.replace("localhost", "127.0.0.1") + "-json",
          );
        if (response?.data?.status === ResponseStatusCode.OK) {
          try {
            const res =
              await this.collectionService.validateImportCollectionInput(
                "",
                JSON.parse(response?.data?.response),
              );
            if (res.isSuccessful) {
              isValidServerURL = true;
            } else {
              notifications.error(res.message);
            }
          } catch (e) {}
        }
      } else {
        isValidClientDeployedURL = true;
        const response =
          await this.collectionService.validateImportCollectionURL(importData);
        if (response?.data?.status === ResponseStatusCode.OK) {
          try {
            const res =
              await this.collectionService.validateImportCollectionInput(
                "",
                JSON.parse(response?.data?.response),
              );
            if (res.isSuccessful) {
              isValidServerDeployedURL = true;
            }
          } catch (e) {}
        }
      }
    } else if (validateClientJSON(importData)) {
      isValidClientJSON = true;
      const response =
        await this.collectionService.validateImportCollectionInput(
          "",
          importData,
        );
      if (response.isSuccessful) {
        isValidServerJSON = true;
      }
    } else if (validateClientXML(importData)) {
      const response =
        await this.collectionService.validateImportCollectionInput(
          "",
          importData,
        );
      if (response.isSuccessful) {
        isValidClientXML = true;
        isValidServerXML = true;
      }
    }

    return {
      isValidClientURL,
      isValidClientJSON,
      isValidClientXML,
      isValidServerURL,
      isValidServerJSON,
      isValidServerXML,
      isValidClientDeployedURL,
      isValidServerDeployedURL,
    };
  };

  /**
   * Get folder location for active async
   * @returns :{repositoryPath: string, currentBranch: string, repositoryBranch: string, getBranchList: string[], isRepositoryPath: boolean}
   */
  public uploadFormFile = async () => {
    const filePathResponse: string = await invoke("fetch_folder_command");
    if (filePathResponse !== "Canceled") {
      return await this.extractGitBranch(filePathResponse);
    }
  };

  /**
   * Handles creating unique name for new collection, folder or request
   * @param list :any[] - list of collection, folder or request
   * @param type :string - type of element of list, i.e. collection, folder, request
   * @param name :string - name of new element
   * @returns :string - new proposed name of new collection, folder or request
   */
  private getNextName = (list, type, name) => {
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
      const proposedName: string = `${name}${i}`;
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
    collection: CollectionDocument,
  ) => {
    if (
      !hasWorkpaceLevelPermission(
        this.getUserRoleInWorspace(),
        workspaceLevelPermissions.SAVE_REQUEST,
      )
    ) {
      return;
    }
    const request = generateSampleRequest(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toString(),
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
        name: request.name,
        type: request.type,
        description: "",
        request: {
          method: request?.property?.request?.method,
        },
      },
    };
    this.collectionRepository.addRequestOrFolderInCollection(collection.id, {
      ...requestObj.items,
      id: request.id,
    });
    const response =
      await this.collectionService.addRequestInCollection(requestObj);
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;

      this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        request.id,
        res,
      );

      request.id = res.id;
      request.path.workspaceId = workspaceId;
      request.path.collectionId = collection.id;
      request.property.request.save.api = true;
      request.property.request.save.description = true;

      this.handleOpenRequest(
        workspaceId,
        collection,
        {
          id: "",
          name: "",
        },
        request,
      );
      moveNavigation("right");
      return;
    } else {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        collection.id,
        request.id,
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
    collection: CollectionDocument,
    explorer: Folder,
  ) => {
    if (
      !hasWorkpaceLevelPermission(
        this.getUserRoleInWorspace(),
        workspaceLevelPermissions.SAVE_REQUEST,
      )
    ) {
      return;
    }
    const sampleRequest = generateSampleRequest(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toString(),
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

    const requestObj: CreateApiRequestPostBody = {
      collectionId: collection.id,
      workspaceId: workspaceId,
      ...userSource,
      folderId: explorer.id,
      items: {
        name: explorer.name,
        type: ItemType.FOLDER,
        items: {
          name: sampleRequest.name,
          type: sampleRequest.type,
          description: "",
          request: {
            method: sampleRequest.property.request.method,
          },
        },
      },
    };

    this.collectionRepository.addRequestInFolder(
      requestObj.collectionId,
      requestObj.folderId,
      {
        ...requestObj.items.items,
        id: sampleRequest.id,
      },
    );
    const response =
      await this.collectionService.addRequestInCollection(requestObj);
    if (response.isSuccessful && response.data.data) {
      const request = response.data.data;

      this.collectionRepository.updateRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        sampleRequest.id,
        request,
      );

      sampleRequest.id = request.id;
      sampleRequest.path.workspaceId = workspaceId;
      sampleRequest.path.collectionId = collection.id;
      sampleRequest.path.folderId = explorer.id;
      sampleRequest.path.folderName = explorer.name;
      sampleRequest.property.request.save.api = true;
      sampleRequest.property.request.save.description = true;

      this.handleOpenRequest(workspaceId, collection, explorer, sampleRequest);
      moveNavigation("right");
      MixpanelEvent(Events.ADD_NEW_API_REQUEST, {
        source: "Side Panel Dropdown",
      });
      return;
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
    collection: CollectionDocument,
  ): Promise<void> => {
    // Check if the user has permission to add a folder at the workspace level
    if (
      !hasWorkpaceLevelPermission(
        this.getUserRoleInWorspace(),
        workspaceLevelPermissions.ADD_FOLDER,
      )
    ) {
      return;
    }

    // Generate a new folder object with a unique ID, name, description, type, and an empty items array
    const folder = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: this.getNextName(collection.items, ItemType.FOLDER, "New Folder"),
      description: "",
      type: ItemType.FOLDER,
      items: [],
    };

    // Add the new folder to the collection locally
    await this.collectionRepository.addRequestOrFolderInCollection(
      collection.id,
      folder,
    );

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
    if (response) {
      const path: Path = {
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
    collection: CollectionDocument,
    newCollectionName: string,
  ) => {
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
        notifications.success("Collection renamed successfully!");
      } else if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error("Failed to rename collection!");
      }
    }
    newCollectionName = "";
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
    collection: CollectionDocument,
    explorer: Folder,
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
    collection: CollectionDocument,
    folder: Folder,
    request: Request,
  ) => {
    const req = new InitRequestTab(request.id, workspaceId);
    const path: Path = {
      workspaceId: workspaceId,
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

  public handleOpenFolder = (
    workspaceId: string,
    collection: CollectionDocument,
    folder: Folder,
  ) => {
    const path: Path = {
      workspaceId: workspaceId,
      collectionId: collection.id ?? "",
      folderId: folder?.id,
      folderName: folder.name,
    };

    const sampleFolder = new InitFolderTab(folder.id, collection.workspaceId);
    sampleFolder.updateName(folder.name);
    sampleFolder.updatePath(path);
    sampleFolder.updateIsSave(true);
    sampleFolder.updateActiveSync(collection.activeSync);
    sampleFolder.updateSource(!folder?.source ? "SPEC" : folder.source);
    sampleFolder.updateIsDeleted(folder?.isDeleted);

    this.handleCreateTab(sampleFolder.getValue());
    moveNavigation("right");
  };

  public handleOpenCollection = (
    workspaceId: string,
    collection: CollectionDocument,
  ) => {
    let totalFolder: number = 0;
    let totalRequest: number = 0;
    if (collection.items) {
      collection.items.map((item) => {
        if (item.type === ItemType.REQUEST) {
          totalRequest++;
        } else {
          totalFolder++;
          totalRequest += item.items.length;
        }
      });
    }
    const path = {
      workspaceId: workspaceId,
      collectionId: collection.id ?? "",
    };

    const _collection = new InitCollectionTab(collection.id, workspaceId);
    _collection.updateName(collection.name);
    _collection.updateDescription(collection.description);
    _collection.updatePath(path);
    _collection.updateActiveSync(collection.activeSync);
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
    collection: CollectionDocument,
    folder: Folder,
    request: Request,
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
    if (newRequestName) {
      if (!(folder && "id" in folder)) {
        folder = { id: "" };
      }
      if (!folder.id) {
        let storage: any = request;
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
        }
      } else if (collection.id && workspaceId && folder.id) {
        let storage = request;
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
          },
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
        }
      }
    }
  };

  /**
   * Handles loading the collection from local repository from active branch
   * @param collection :CollectionDocument
   * @returns :{ activeSyncLoad: boolean; isBranchSynced: boolean }
   */
  public handleBranchSwitch = async (collection: CollectionDocument) => {
    const result: { activeSyncLoad: boolean; isBranchSynced: boolean } = {
      activeSyncLoad: true,
      isBranchSynced: true,
    };
    const detectBranch = collection?.currentBranch
      ? collection?.currentBranch
      : collection?.primaryBranch;
    const response = await this.collectionService.switchCollectionBranch(
      collection.id,
      detectBranch,
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
  };

  /**
   * Handles deleting a collection
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection going to be deleted
   * @param deletedIds :[string] | [] - the IDs of the collection to be deleted
   */
  private handleDeleteCollection = async (
    workspaceId: string,
    collection: CollectionDocument,
    deletedIds: string[] | [],
  ) => {
    const response = await this.collectionService.deleteCollection(
      workspaceId,
      collection.id,
    );

    if (response.isSuccessful) {
      this.collectionRepository.deleteCollection(collection.id);
      this.deleteCollectioninWorkspace(workspaceId, collection.id);
      notifications.success(`"${collection.name}" Collection deleted.`);
      this.removeMultipleTabs(deletedIds);
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
    collection: CollectionDocument,
    explorer: Folder,
    requestIds: [string],
  ) => {
    let userSource = {};
    if (collection.activeSync && explorer?.source === "USER") {
      userSource = {
        branchName: collection.currentBranch
          ? collection.currentBranch
          : collection.primaryBranch,
      };
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
    collection: CollectionDocument,
    request: Request,
    folder: Folder,
  ): Promise<boolean> => {
    let userSource = {};
    if (collection.activeSync) {
      userSource = {
        currentBranch: collection.currentBranch,
      };
    }

    let requestObject: any = {
      collectionId: collection.id,
      workspaceId: workspaceId,
      ...userSource,
    };

    if (folder && collection.id && workspaceId) {
      requestObject = {
        ...requestObject,
        folderId: folder.id,
      };
    }
    const response = await this.collectionService.deleteRequestInCollection(
      request.id,
      requestObject,
    );

    if (response.isSuccessful) {
      notifications.success(`"${request.name}" Request deleted.`);
      this.removeMultipleTabs([request.id]);
      return true;
    } else {
      notifications.error("Failed to delete the Request.");
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
    collection: CollectionDocument,
  ) => {
    const errMessage = `Failed to sync the collection. Local reposisitory branch is not set to ${collection?.currentBranch}.`;

    try {
      const activeResponse = await invoke("get_git_active_branch", {
        path: collection?.localRepositoryPath,
      });
      if (activeResponse) {
        const currentBranch: any = activeResponse;
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
    const responseJSON =
      await this.collectionService.validateImportCollectionURL(
        collection.activeSyncUrl,
      );
    if (responseJSON?.data?.status === ResponseStatusCode.OK) {
      const response = await this.importCollectionData(
        workspaceId,
        {
          url: collection.activeSyncUrl,
          urlData: {
            data: JSON.parse(responseJSON.data.response),
            headers: responseJSON.data.headers,
          },
          primaryBranch: collection?.primaryBranch,
          currentBranch: collection?.currentBranch
            ? collection?.currentBranch
            : collection?.primaryBranch,
        },
        collection.activeSync,
      );

      if (response.isSuccessful) {
        this.collectionRepository.updateCollection(
          collection.id,
          response.data.data.collection,
        );
        notifications.success("Collection synced.");
      } else {
        notifications.error("Failed to sync the collection. Please try again.");
      }
    } else {
      notifications.error(
        `Unable to detect ${collection.activeSyncUrl.replace("-json", "")}.`,
      );
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
    type: string,
    componentData,
  ) => {
    const saveType = {
      SAVE_DESCRIPTION: "SAVE_DESCRIPTION",
    };
    let userSource = {};
    const _id = componentData.id;
    if (path.length > 0) {
      let existingRequest;
      if (path[path.length - 1].type === ItemType.COLLECTION) {
        existingRequest = await this.readRequestOrFolderInCollection(
          path[path.length - 1].id,
          _id,
        );
      } else if (path[path.length - 1].type === ItemType.FOLDER) {
        existingRequest = await this.readRequestInFolder(
          path[0].id,
          path[path.length - 1].id,
          _id,
        );
      }
      const randomRequest: TabDocument = new InitRequestTab(
        "UNTRACKED-",
        "UNTRACKED-",
      ).getValue();
      const request = !existingRequest
        ? randomRequest.property.request
        : existingRequest.request;
      const expectedRequest = {
        method:
          type === saveType.SAVE_DESCRIPTION
            ? request.method
            : componentData.property.request.method,
        url:
          type === saveType.SAVE_DESCRIPTION
            ? request.url
            : componentData.property.request.url,
        body:
          type === saveType.SAVE_DESCRIPTION
            ? request.body
            : componentData.property.request.body,
        headers:
          type === saveType.SAVE_DESCRIPTION
            ? request.headers
            : componentData.property.request.headers,
        queryParams:
          type === saveType.SAVE_DESCRIPTION
            ? request.queryParams
            : componentData.property.request.queryParams,
        auth:
          type === saveType.SAVE_DESCRIPTION
            ? request.auth
            : componentData.property.request.auth,
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
        const res = await insertCollectionRequest({
          collectionId: path[path.length - 1].id,
          workspaceId: _workspaceMeta.id,
          ...userSource,
          items: {
            name: tabName,
            description,
            type: ItemType.REQUEST,
            request: expectedRequest,
          },
        });
        if (res.isSuccessful) {
          this.collectionRepository.addRequestOrFolderInCollection(
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
            // this.updateRequestName(res.data.data.name);
            // this.updateRequestDescription(res.data.data.description);
            // this.updateRequestPath(expectedPath);
            // this.updateRequestId(res.data.data.id);
            const progressiveTab = componentData.toMutableJSON();
            progressiveTab.isSaved = true;
            this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
          } else {
            /**
             * Create new copy of the existing request
             */
            const initRequestTab = new InitRequestTab(
              res.data.data.id,
              "UNTRACKED-",
            );
            initRequestTab.updateName(res.data.data.name);
            initRequestTab.updateDescription(res.data.data.description);
            initRequestTab.updatePath(expectedPath);
            initRequestTab.updateUrl(res.data.data.request.url);
            initRequestTab.updateMethod(res.data.data.request.method);
            initRequestTab.updateBody(res.data.data.request.body);
            initRequestTab.updateQueryParams(res.data.data.request.queryParams);
            initRequestTab.updateAuth(res.data.data.request.auth);
            initRequestTab.updateHeaders(res.data.data.request.headers);

            this.tabRepository.createTab(initRequestTab.getValue());
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
              request: expectedRequest,
            },
          },
        });
        if (res.isSuccessful) {
          this.collectionRepository.addRequestInFolder(
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
            const progressiveTab = componentData.toMutableJSON();
            progressiveTab.isSaved = true;
            this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
          } else {
            const initRequestTab = new InitRequestTab(
              res.data.data.id,
              "UNTRACKED-",
            );
            initRequestTab.updateName(res.data.data.name);
            initRequestTab.updateDescription(res.data.data.description);
            initRequestTab.updatePath(expectedPath);
            initRequestTab.updateUrl(res.data.data.request.url);
            initRequestTab.updateMethod(res.data.data.request.method);
            initRequestTab.updateBody(res.data.data.request.body);
            initRequestTab.updateQueryParams(res.data.data.request.queryParams);
            initRequestTab.updateAuth(res.data.data.request.auth);
            initRequestTab.updateHeaders(res.data.data.request.headers);
            this.tabRepository.createTab(initRequestTab.getValue());
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

  /**
   * Handle control of creating items
   * @param entityType :string - type of entity, collection, folder or request
   * @param args :object - arguments depending on entity type
   */
  public handleCreateItem = async (entityType: string, args: any) => {
    switch (entityType) {
      case "collection":
        this.handleCreateCollection(args.workspaceId, args.collection);
        break;
      case "folder":
        this.handleCreateFolderInCollection(args.workspaceId, args.collection);
        break;
      case "request":
        this.createNewTab();
        break;
      case "requestCollection":
        this.handleCreateRequestInCollection(args.workspaceId, args.collection);
        break;
      case "requestFolder":
        this.handleCreateRequestInFolder(
          args.workspaceId,
          args.collection,
          args.folder,
        );
        break;
    }
  };

  /**
   * Handle control of deleting item
   * @param entityType :srting - type of entity, collection, folder or request
   * @param args :object - arguments depending on entity type
   */
  public handleDeleteItem = async (entityType: string, args: any) => {
    switch (entityType) {
      case "collection":
        this.handleDeleteCollection(
          args.workspaceId,
          args.collection,
          args.deletedIds,
        );
        break;
      case "folder":
        this.handleDeleteFolder(
          args.workspaceId,
          args.collection,
          args.folder,
          args.requestIds,
        );
        break;
      case "request":
        this.handleDeleteRequest(
          args.workspaceId,
          args.collection,
          args.request,
          args.folder,
        );
        break;
    }
  };

  /**
   * Handle control of Renaming items
   * @param entityType :string - type of entity, collection, folder or request
   * @param args :object - arguments depending on entity type
   */
  public handleRenameItem = async (entityType: string, args: any) => {
    switch (entityType) {
      case "collection":
        this.handleRenameCollection(
          args.workspaceId,
          args.collection,
          args.newName,
        );
        break;
      case "folder":
        this.handleRenameFolder(
          args.workspaceId,
          args.collection,
          args.folder,
          args.newName,
        );
        break;
      case "request":
        this.handleRenameRequest(
          args.workspaceId,
          args.collection,
          args.folder,
          args.request,
          args.newName,
        );
        break;
    }
  };

  /**
   * Handle control of Import items
   * @param entityType :string - type of entity, collection, folder or request
   * @param args :object - arguments depending on entity type
   */
  public handleImportItem = async (entityType: string, args: any) => {
    switch (entityType) {
      case "collection":
        this.handleImportCollection(
          args.workspaceId,
          args.importData,
          args.currentBranch,
          args.getBranchList,
          args.uploadCollection,
          args.validations,
        );
        break;
      case "curl":
        this.handleImportCurl(args.workspaceId, args.importCurl);
        break;
    }
  };

  public handleOpenItem = async (entitytype: string, args: any) => {
    switch (entitytype) {
      case "collection":
        this.handleOpenCollection(args.workspaceId, args.collection);
        break;
      case "folder":
        this.handleOpenFolder(args.workspaceId, args.collection, args.folder);
        break;
      case "request":
        this.handleOpenRequest(
          args.workspaceId,
          args.collection,
          args.folder,
          args.request,
        );
        break;
    }
  };

  public handleOnChangeViewInRequest = async (view: string) => {
    requestSplitterDirection.set(view);
  };
}
