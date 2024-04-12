import type {
  CollectionDocument,
  TabDocument,
} from "$lib/database/app.database";
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { TabRepository } from "$lib/repositories/tab.repository";
import { updateCollectionRequest } from "$lib/services/collection";
import {
  isApiCreatedFirstTime,
  requestResponseStore,
  tabs,
} from "$lib/store/request-response-section";
import { RequestDataset } from "$lib/utils/enums";
import { ItemType } from "$lib/utils/enums/item-type.enum";
import { Events } from "$lib/utils/enums/mixpanel-events.enum";
import { setContentTypeHeader } from "$lib/utils/helpers";
import { moveNavigation } from "$lib/utils/helpers/navigation";
import type { CollectionItem } from "$lib/utils/interfaces/collection.interface";
import type {
  NewTab,
  RequestBody,
} from "$lib/utils/interfaces/request.interface";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { generateSampleRequest } from "$lib/utils/sample/request.sample";
import { v4 as uuidv4 } from "uuid";
export class CollectionPageViewModel {
  private tabRepository = new TabRepository();
  private collectionRepository = new CollectionRepository();
  movedTabStartIndex = 0;
  movedTabEndIndex = 0;

  constructor() {}

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

  get tabs() {
    return requestResponseStore.getTabList();
  }

  public syncTabWithStore = () => {
    this.tabRepository.syncTabsWithStore(tabs);
  };

  debouncedTab = this.debounce(this.syncTabWithStore, 2000);

  public handleCreateTab = (data: any) => {
    requestResponseStore.createTab(data);
    this.debouncedTab();
  };

  public handleRemoveTab = (id: string) => {
    requestResponseStore.removeTab(id);
    this.debouncedTab();
  };

  public createNewTab = () => {
    isApiCreatedFirstTime.set(true);
    this.handleCreateTab(
      generateSampleRequest("UNTRACKED-" + uuidv4(), new Date().toString()),
    );
    moveNavigation("right");
    MixpanelEvent(Events.ADD_NEW_API_REQUEST, { source: "TabBar" });
  };

  public handleActiveTab = (id: string) => {
    requestResponseStore.activeTab(id);
    this.debouncedTab();
  };

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

  public handleDropOnStart = (index: number) => {
    this.movedTabStartIndex = index;
  };
  public handleDropOnEnd = (index: number) => {
    this.movedTabEndIndex = index;
  };

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

  public readRequestOrFolderInCollection = (
    collectionId: string,
    uuid: string,
  ): Promise<CollectionItem> => {
    return this.collectionRepository.readRequestOrFolderInCollection(
      collectionId,
      uuid,
    );
  };

  public readCollection = (uuid: string): Promise<CollectionDocument> => {
    return this.collectionRepository.readCollection(uuid);
  };

  public saveAPIRequest = async (
    componentData,
    saveDescriptionOnly = false,
  ) => {
    const { folderId, folderName, collectionId, workspaceId } =
      componentData.path;
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
    const bodyType =
      componentData.property.request.state.dataset === RequestDataset.RAW
        ? componentData.property.request.state.raw
        : componentData.property.request.state.dataset;
    let expectedRequest: RequestBody;
    let expectedMetaData;
    if (!saveDescriptionOnly) {
      // Save overall api
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
      expectedMetaData = {
        id: _id,
        name: componentData?.name,
        description: componentData?.description,
        type: ItemType.REQUEST,
      };
    } else {
      // Save api description only
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
      expectedMetaData = {
        id: _id,
        name: existingRequest?.name,
        description: componentData?.description,
        type: ItemType.REQUEST,
      };
    }

    if (!folderId) {
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
