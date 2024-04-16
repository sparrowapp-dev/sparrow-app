import { v4 as uuidv4 } from "uuid";

// ---- local db
import type {
  CollectionDocument,
  TabDocument,
} from "$lib/database/app.database";

// ---- Repository
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { TabRepository } from "$lib/repositories/tab.repository";

// ---- Services
import { updateCollectionRequest } from "$lib/services/collection";

// ---- Store
import {
  isApiCreatedFirstTime,
  requestResponseStore,
  tabs,
} from "$lib/store/request-response-section";

// ---- enums
import { RequestDataset } from "$lib/utils/enums";
import { ItemType } from "$lib/utils/enums/item-type.enum";
import { Events } from "$lib/utils/enums/mixpanel-events.enum";

// ---- helpers
import { setContentTypeHeader } from "$lib/utils/helpers";
import { moveNavigation } from "$lib/utils/helpers/navigation";
import { generateSampleRequest } from "$lib/utils/sample/request.sample";

// ---- Interface
import type { CollectionItem } from "$lib/utils/interfaces/collection.interface";
import type {
  NewTab,
  RequestBody,
} from "$lib/utils/interfaces/request.interface";

// ---- mixpanel
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
export class CollectionPageViewModel {
  private tabRepository = new TabRepository();
  private collectionRepository = new CollectionRepository();
  movedTabStartIndex = 0;
  movedTabEndIndex = 0;

  constructor() {}

  /**
   * This function is used when a function need to be called after certain interval only.
   * @param func
   * @param delay
   * @returns
   */
  public debounce = (func, delay) => {
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
   * Return current tabs list of top tab bar component
   */
  get tabs() {
    return requestResponseStore.getTabList();
  }

  /**
   * Sync the tab list with store
   */
  private syncTabWithStore = () => {
    this.tabRepository.syncTabsWithStore(tabs);
  };

  debouncedTab = this.debounce(this.syncTabWithStore, 2000);

  /**
   * Create new tab in tab list store
   * @param data - new tab
   */
  public handleCreateTab = (data: any) => {
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
}
