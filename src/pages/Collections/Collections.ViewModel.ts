/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionDocument } from "$lib/database/app.database";
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { TabRepository } from "$lib/repositories/tab.repository";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import {
  requestResponseStore,
  tabs,
} from "$lib/store/request-response-section";
import { ItemType } from "$lib/utils/enums/item-type.enum";
import type { CollectionItem } from "$lib/utils/interfaces/collection.interface";
import type { Collection } from "$lib/utils/interfaces/request.interface";
import { EnvironmentService } from "$lib/services-v2/environment.service";
import type { UpdateEnvironmentPostBody } from "$lib/utils/dto";
import { CollectionService } from "$lib/services/collection.service";
import { notifications } from "$lib/components/toast-notification/ToastNotification";
export class CollectionsViewModel {
  private tabRepository = new TabRepository();
  private collectionRepository = new CollectionRepository();
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private environmentService = new EnvironmentService();
  private collectionService = new CollectionService();
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

  public syncTabWithStore = () => {
    this.tabRepository.syncTabsWithStore(tabs);
  };

  debouncedTab = this.debounce(this.syncTabWithStore, 2000);

  get tabs() {
    return requestResponseStore.getTabList();
  }

  get activeTab() {
    return requestResponseStore.getTab();
  }

  get environments() {
    return this.environmentRepository.getEnvironment();
  }

  get collection() {
    return this.collectionRepository.getCollection();
  }

  public handleCreateTab = (data: any) => {
    requestResponseStore.createTab(data);
    this.debouncedTab();
  };

  public handleRemoveTab = (id: string) => {
    requestResponseStore.removeTab(id);
    this.debouncedTab();
  };

  public clearTabs = () => {
    tabs.set([]);
    this.debouncedTab();
  };

  public handleActiveTab = (id: string) => {
    requestResponseStore.activeTab(id);
    this.debouncedTab();
  };

  public updateTab = async (data: any, route: string, _id: string) => {
    requestResponseStore.setTabProperty(data, route, _id);
    this.debouncedTab();
  };

  public updateRequestProperty = async (
    data: any,
    route: string,
    id: string,
  ) => {
    requestResponseStore.setRequestProperty(data, route, id);
    this.debouncedTab();
  };
  public updateRequestState = async (data: any, route: string) => {
    requestResponseStore.setRequestState(data, route);
    this.debouncedTab();
  };

  public updateRequestAuth = async (data: any, route: string) => {
    requestResponseStore.setRequestAuth(data, route);
    this.debouncedTab();
  };

  public updateRequestBody = async (data: any, route: string) => {
    requestResponseStore.setRequestBody(data, route);
    this.debouncedTab();
  };

  public updateRequestBodyFormData = async (data: any, route: string) => {
    requestResponseStore.setRequestBodyFormData(data, route);
    this.debouncedTab();
  };

  public removeMultipleTabs = async (ids: string[]) => {
    requestResponseStore.removeMultipleTabs(ids);
    this.debouncedTab();
  };

  public setRequestSave = async (data: boolean, route: string, id: string) => {
    requestResponseStore.setRequestSave(data, route, id);
    this.debouncedTab();
  };

  public deleteCollection = async (id: string) => {
    this.collectionRepository.deleteCollection(id);
  };

  public updateCollectionName = async (id: string, name: string) => {
    this.collectionRepository.updateCollection(id, name);
  };

  public updateFolderName = async (
    id: string,
    folderId: string,
    name: string,
  ) => {
    this.collectionRepository.updateFolderName(id, folderId, name);
  };

  public deleteRequestOrFolderInCollection = async (
    id: string,
    deleteId: string,
  ) => {
    this.collectionRepository.deleteRequestOrFolderInCollection(id, deleteId);
  };
  public getCollectionList = () => {
    return this.collectionRepository.getCollection();
  };
  public getActiveWorkspace = () => {
    return this.workspaceRepository.getActiveWorkspace();
  };

  public deleteCollectioninWorkspace = (
    workspaceId: string,
    collectionId: string,
  ) => {
    return this.workspaceRepository.deleteCollectionInWorkspace(
      workspaceId,
      collectionId,
    );
  };

  public addRequestInFolder = (
    collectionId: string,
    folderId: string,
    request,
  ): void => {
    this.collectionRepository.addRequestInFolder(
      collectionId,
      folderId,
      request,
    );
  };
  public updateRequestInFolder = (
    collectionId: string,
    folderId: string,
    uuid: string,
    request,
  ): void => {
    this.collectionRepository.updateRequestInFolder(
      collectionId,
      folderId,
      uuid,
      request,
    );
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

  public readCollection = (uuid: string): Promise<CollectionDocument> => {
    return this.collectionRepository.readCollection(uuid);
  };

  public updateRequestInFolderCollection = (
    collectionId: string,
    uuid: string,
    item: any,
    folderId?: string,
  ): void => {
    this.collectionRepository.updateRequestInFolderCollection(
      collectionId,
      uuid,
      item,
      folderId,
    );
  };

  public deleteRequestInFolderCollection = (
    collectionId: string,
    uuid: string,
    folderId: string,
  ): void => {
    this.collectionRepository.deleteRequestInFolderCollection(
      collectionId,
      uuid,
      folderId,
    );
  };

  public addRequestOrFolderInCollection = (
    collectionId: string,
    items: any,
  ) => {
    this.collectionRepository.addRequestOrFolderInCollection(
      collectionId,
      items,
    );
  };
  public updateRequestOrFolderInCollection = (
    collectionId: string,
    uuid: string,
    items: any,
  ) => {
    this.collectionRepository.updateRequestOrFolderInCollection(
      collectionId,
      uuid,
      items,
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

  public deleteRequestInFolder = (
    collectionId: string,
    folderId: string,
    requestId: string,
  ) => {
    this.collectionRepository.deleteRequestInFolder(
      collectionId,
      folderId,
      requestId,
    );
  };

  public addCollection = (collection) => {
    this.collectionRepository.addCollection(collection);
  };

  public updateCollection = (uuid, data) => {
    this.collectionRepository.updateCollection(uuid, data);
  };

  public getNoOfApisandFolders = async (
    collection: CollectionDocument,
    folderId?: string,
  ): Promise<Collection> => {
    let folderCount: number = 0;
    let requestCount: number = 0;
    let dataObj: Collection;
    const items = collection._data.items as CollectionItem[];
    if (folderId) {
      items.forEach((item) => {
        if (item.type === ItemType.FOLDER && item.id === folderId) {
          dataObj = {
            requestCount: item.items.length,
          };
          return;
        }
      });
      return dataObj;
    }
    items.forEach((item) => {
      if (item.type === ItemType.FOLDER) {
        requestCount += item.items.length;
        folderCount++;
      } else if (item.type === ItemType.REQUEST) {
        requestCount++;
      }
    });
    dataObj = {
      requestCount: requestCount,
      folderCount: folderCount,
    };
    return dataObj;
  };

  public initActiveEnvironmentToWorkspace = async (
    workspaceId: string,
    environmentId: string,
  ) => {
    this.workspaceRepository.updateWorkspace(workspaceId, { environmentId });
  };

  public currentEnvironment = async (id: string) => {
    return await this.environmentRepository.readEnvironment(id);
  };

  public getGlobalEnvironment = async () => {
    return await this.environmentRepository.getGlobalEnvironment();
  };

  public updateEnvironment = async (
    workspaceId: string,
    environmentId: string,
    environment: UpdateEnvironmentPostBody,
  ) => {
    return await this.environmentService.updateEnvironment(
      workspaceId,
      environmentId,
      environment,
    );
  };

  public deleteApiRequest = async (
    currentWorkspaceId,
    collectionId,
    requestId,
    requestName,
    activeSync,
    source,
    currentBranch,
    primaryBranch,
    folderId,
  ): boolean => {
    let userSource = {};
    if (activeSync && source === "USER") {
      userSource = {
        currentBranch: currentBranch ? currentBranch : primaryBranch,
        source: "USER",
      };
    }

    let requestObject = {
      collectionId,
      workspaceId: currentWorkspaceId,
      ...userSource,
    };

    if (folderId && collectionId && currentWorkspaceId) {
      requestObject = {
        ...requestObject,
        folderId,
      };
    }
    const response = await this.collectionService.deleteRequestInCollection(
      requestId,
      requestObject,
    );

    if (response.isSuccessful) {
      notifications.success(`"${requestName}" Request deleted.`);
      this.handleRemoveTab(requestId);
      return true;
    } else {
      notifications.error("Failed to delete the Request.");
      return false;
    }
  };
}
