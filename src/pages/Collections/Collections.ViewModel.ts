/* eslint-disable @typescript-eslint/no-explicit-any */
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { TabRepository } from "$lib/repositories/tab.repository";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import {
  requestResponseStore,
  tabs,
} from "$lib/store/request-response-section";

export class CollectionsViewModel {
  private tabRepository = new TabRepository();
  private collectionRepository = new CollectionRepository();
  private workspaceRepository = new WorkspaceRepository();
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

  public handleCreateTab = (data: any) => {
    requestResponseStore.createTab(data);
    this.debouncedTab();
  };

  public handleRemoveTab = (id: string) => {
    requestResponseStore.removeTab(id);
    this.debouncedTab();
  };

  public handleActiveTab = (id: string) => {
    requestResponseStore.activeTab(id);
    this.debouncedTab();
  };

  public updateTab = async (data: any, route: string) => {
    requestResponseStore.setTabProperty(data, route);
    this.debouncedTab();
  };

  public updateRequestProperty = async (data: any, route: string) => {
    requestResponseStore.setRequestProperty(data, route);
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

  public getCollectionList = () => {
    return this.collectionRepository.getCollection();
  };
  public getActiveWorkspace = () => {
    return this.workspaceRepository.getActiveWorkspace();
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
}
