/* eslint-disable @typescript-eslint/no-explicit-any */
//-----
// Local Database
import type {
  CollectionDocument,
  EnvironmentDocument,
  TabDocument,
  WorkspaceDocument,
} from "$lib/database/app.database";

//-----
// Stores
import { user, userWorkspaceLevelRole } from "$lib/store";
import {
  isApiCreatedFirstTime,
  requestResponseStore,
  tabs,
  progressiveTab,
} from "$lib/store/request-response-section";
//-----

//-----
// Repositories
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { TabRepository } from "$lib/repositories/tab.repository";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
//-----

//-----
// Services
import { EnvironmentService } from "$lib/services-v2/environment.service";
//-----
import { CollectionService } from "$lib/services/collection.service";
import { notifications } from "$lib/components/toast-notification/ToastNotification";
import { setContentTypeHeader } from "$lib/utils/helpers";
import { RequestDataset } from "$lib/utils/enums";
import { updateCollectionRequest } from "$lib/services/collection";
import { v4 as uuidv4 } from "uuid";

//-----
//External Imports
import yaml from "js-yaml";
import { invoke } from "@tauri-apps/api/core";
//-----

//-----
//Utils
import {
  debounce,
  isUrlValid,
  validateClientJSON,
  validateClientURL,
  validateClientXML,
  useTree,
} from "$lib/utils/collections/utils";
import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
import {
  PERMISSION_NOT_FOUND_TEXT,
  workspaceLevelPermissions,
} from "$lib/utils/constants/permissions.constant";
import { type CreateApiRequestPostBody } from "$lib/utils/dto";
import { setAuthType, setBodyType } from "$lib/utils/helpers/auth.helper";
import type { UpdateEnvironmentPostBody } from "$lib/utils/dto";
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
import { RequestDataType } from "$lib/utils/enums";
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
import { boolean } from "yup";
import type { Observable } from "rxjs";

export default class CollectionsViewModel {
  private tabRepository = new TabRepository();
  private collectionRepository = new CollectionRepository();
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private environmentService = new EnvironmentService();
  private collectionService = new CollectionService();
  movedTabStartIndex = 0;
  movedTabEndIndex = 0;

  constructor() {}

  /**
   * Wrapper function lets fucntion to be executed only one in a time period
   * @param func :Function - the to be debounced
   * @param delay :number - the time period limit for debouncing
   */
  public debounce = (func: Function, delay: number) => {
    let timerId;

    return function (...args) {
      /* eslint-disable @typescript-eslint/no-this-alias */
      const context = this;

      clearTimeout(timerId);
      timerId = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  };

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
   * Syncs tabs with repository
   */
  public syncTabWithStore = () => {
    this.tabRepository.syncTabsWithStore(tabs);
  };

  /**
   * Prevent syncTabWithStore() to be called multiple times in 2 seconds
   */
  debouncedTab = this.debounce(this.syncTabWithStore, 2000);

  /**
   * Return current tabs list of top tab bar component
   */
  get tabs() {
    return requestResponseStore.getTabList();
  }

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
    return requestResponseStore.getTab();
  };

  /**
   * Handles creating a new tab
   * @param data :any - data of the tab i.e. collection, folder or request
   */
  public handleCreateTab = (data: NewTab) => {
    requestResponseStore.createTab(data);
    this.debouncedTab();
  };

  /**
   * Remove the tab from tab list in store
   * @param id - tab id
   */
  public handleRemoveTab = (id: string) => {
    requestResponseStore.removeTab(id);
    this.debouncedTab();
  };

  /**
   * Create new tab with untracked id
   */
  public createNewTab = () => {
    isApiCreatedFirstTime.set(true);
    this.handleCreateTab(
      generateSampleRequest("UNTRACKED-" + uuidv4(), new Date().toString()),
    );
    moveNavigation("right");
    MixpanelEvent(Events.ADD_NEW_API_REQUEST, { source: "TabBar" });
  };

  /**
   * Set active tab in store
   * @param id - tab id
   */
  public handleActiveTab = (id: string) => {
    requestResponseStore.activeTab(id);
    this.debouncedTab();
  };

  /**
   * Handle tab drop on tab list
   * @param event
   */
  public onDropEvent = (event: Event) => {
    event.preventDefault();
    const tabList = this.tabs;
    let updatedTabList: TabDocument[] = [];
    tabList.subscribe((value) => {
      updatedTabList = value;
    });
    const element = updatedTabList.splice(this.movedTabStartIndex, 1);
    updatedTabList.splice(this.movedTabEndIndex, 0, element[0]);
    updatedTabList = updatedTabList.map((tab, index) => {
      tab.index = index;
      return tab;
    });
    const newTabList: NewTab[] = updatedTabList as NewTab[];
    tabs.set(newTabList);
    this.syncTabWithStore();
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
  private readCollection = (uuid: string): Promise<CollectionDocument> => {
    return this.collectionRepository.readCollection(uuid);
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
  public updateTab = async (data: any, route: string, _id: string) => {
    requestResponseStore.setTabProperty(data, route, _id);
    this.debouncedTab();
  };

  /**
   * Handle deleting collection from repository
   * @param workspaceId :string - workspace id in which the collection is saved
   * @param collectionId :string - collection id to be deleted
   * @returns :void
   */
  public deleteCollectioninWorkspace = (
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
  public removeMultipleTabs = async (ids: string[]) => {
    requestResponseStore.removeMultipleTabs(ids);
    this.debouncedTab();
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
  public getActiveWorkspace = () => {
    return this.workspaceRepository.getActiveWorkspace();
  };

  /**
   * Adds collection to the repository
   * @param collection :CollectionDocument - the collection to be added
   */
  public addCollection = (collection: CollectionDocument) => {
    this.collectionRepository.addCollection(collection);
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
      Samplecollection.save = true;
      this.handleCreateTab(Samplecollection);
      moveNavigation("right");

      this.workspaceRepository.updateCollectionInWorkspace(workspaceId, {
        id: Samplecollection.id,
        name: newCollection.name,
      });
      notifications.success("New Collection Created");
      // MixpanelEvent(Events.CREATE_COLLECTION, {
      //   source: collectionSource,
      //   collectionName: response.data.data.name,
      //   collectionId: response.data.data._id,
      // });
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
   * Handle creating new empty api request
   */
  public handleCreateApiRequest = () => {
    this.handleCreateTab(
      generateSampleRequest("UNTRACKED-" + uuidv4(), new Date().toString()),
    );
    moveNavigation("right");
    MixpanelEvent(Events.ADD_NEW_API_REQUEST, { source: "Side Panel TopBar" });
  };

  /**
   * Import collection from giver data
   * @param workspaceId: string - the workspace id in which the collection is going to be imported
   * @param url: string - the url of the swagger
   * @param activeSync: boolean - if the active sync is enabled
   * @returns
   */
  public importCollectionData = async (
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
  public importCollectionFile = async (workspaceId: string, file: Request) => {
    return await this.collectionService.importCollectionFile(workspaceId, file);
  };

  /**
   * Import collection from Json object
   * @param workspaceId: string - the workspace id in which the collection is going to be imported
   * @param jsonObject: string - the json object
   * @param contentType: string - the type of content of jsonObject
   * @returns
   */
  public importCollectionFromJsonObject = async (
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
  public importCollectionFromFile = async (
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
  public validateImportBody = (data: string): ContentTypeEnum => {
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
  public handleImportJsonObject = async (
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
      this.handleCreateTab(Samplecollection);
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
  public handleImportUrl = async (
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
      this.handleCreateTab(Samplecollection);
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
  public handleFileUpload = async (workspaceId: string, file: Request) => {
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
        this.handleCreateTab(Samplecollection);
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
  public handleImportCollection = async (
    workspaceId: string,
    importData: string,
    currentBranch: string,
    getBranchList: string[],
    uploadCollection: string,
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
  public checkBodyType = (type: string) => {
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
  public handleImportCurl = async (importCurl: string) => {
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

      this.handleCreateTab(sampleRequest);
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
  public handleInputDataChange = async (importData: string) => {
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
    isimportDataLoading = false;

    return {
      isValidClientURL,
      isValidClientJSON,
      isValidClientXML,
      isValidServerURL,
      isValidServerJSON,
      isValidServerXML,
      isValidClientDeployedURL,
      isValidServerDeployedURL,
      isimportDataLoading,
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
  public getNextName: (
    list: any[],
    type: string,
    name: string,
  ) => string | undefined = (list, type, name) => {
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
  public handleCreateRequestInCollection = async (
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

      this.handleCreateTab(request);
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
  public handleCreateRequestInFolder = async (
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
      sampleRequest.path.collectionId = collectionId;
      sampleRequest.path.folderId = explorer.id;
      sampleRequest.path.folderName = explorer.name;
      sampleRequest.property.request.save.api = true;
      sampleRequest.property.request.save.description = true;

      this.handleCreateTab(sampleRequest);
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
    if (
      !hasWorkpaceLevelPermission(
        this.getUserRoleInWorspace(),
        workspaceLevelPermissions.ADD_FOLDER,
      )
    ) {
      return;
    }
    const folder = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: this.getNextName(collection.items, ItemType.FOLDER, "New Folder"),
      description: "",
      type: ItemType.FOLDER,
      items: [],
    };

    await this.collectionRepository.addRequestOrFolderInCollection(
      collection.id,
      folder,
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
    const response = await this.collectionService.addFolderInCollection(
      workspaceId,
      collection.id,
      {
        ...userSource,
        name: folder.name,
        description: folder.description,
      },
    );

    if (response) {
      const path: Path = {
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: response.data.data.id,
        folderName: response.data.data.name,
      };

      const SampleFolder = generateSampleFolder(
        response.data.data.id,
        new Date().toString(),
      );

      SampleFolder.id = response.data.data.id;
      SampleFolder.path = path;
      SampleFolder.name = response.data.data.name;
      SampleFolder.save = true;
      this.handleCreateTab(SampleFolder);
      moveNavigation("right");

      const folderObj = response.data.data;
      await this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        folder.id,
        folderObj,
      );
    } else {
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
  public handleRenameCollection = async (
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
        this.updateTab(newCollectionName, "name", collection.id);
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
  public handleRenameFolder = async (
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
        this.updateTab(newFolderName, "name", explorer.id);
      }
    }
  };

  /**
   * Handles opening a request on a tab
   * @param request : - The request going to be opened on tab
   * @param path : - The path to the request
   */
  public handleOpenRequestOnTab = (request: Request, path: Path) => {
    let _request: any = generateSampleRequest(
      request.id,
      new Date().toString(),
    );
    _request.path = path;
    _request.name = request.name;
    if (request.description) _request.description = request.description;
    if (request.request.url)
      _request.property.request.url = request.request?.url;
    if (request.request.body)
      _request.property.request.body = request.request?.body;
    if (request.request.method)
      _request.property.request.method = request.request?.method;
    if (request.request.queryParams)
      _request.property.request.queryParams = request.request?.queryParams;
    if (request.request.auth)
      _request.property.request.auth = request.request?.auth;
    if (request.request.headers)
      _request.property.request.headers = request.request?.headers;
    if (request.request.actSync) _request.activeSync = request.request?.actSync;
    if (request.isDeleted) _request.isDeleted = request.isDeleted;
    if (request.source === "SPEC") _request.source = request.source;
    if (request.request.selectedRequestBodyType)
      _request = setBodyType(
        _request,
        request.request?.selectedRequestBodyType,
      );
    if (request.request.selectedRequestAuthType)
      _request = setAuthType(_request, request.request.selectedRequestAuthType);
    _request.property.request.save.api = true;
    _request.property.request.save.description = true;
    this.handleCreateTab(_request);
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
  public handleRenameRequest = async (
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
          this.updateTab(newRequestName, "name", request.id);
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
          this.updateTab(newRequestName, "name", request.id);
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
  public handleDeleteCollection = async (
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
  public handleDeleteFolder = async (
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
  public handleDeleteRequest = async (
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
        this.handleCreateApiRequest();
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
          args.updateCollection,
          args.validations,
        );
        break;
      case "curl":
        this.handleImportCurl(args.importCurl);
        break;
    }
  };
}
