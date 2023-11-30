/* eslint-disable @typescript-eslint/no-explicit-any */
import { TabRepository } from "$lib/repositories/tab.repository";
import {
  requestResponseStore,
  tabs,
} from "$lib/store/request-response-section";
import { CollectionRepository } from "$lib/repositories/collection.repository";

export class CollectionsViewModel {
  private tabRepository = new TabRepository();
  private collectionRepository = new CollectionRepository();
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

  public deleteCollectionData = async (id: string) => {
    this.collectionRepository.deleteCollection(id);
    this.debouncedTab();
  };

  public updateCollectionName = async (id: string, name: string) => {
    this.collectionRepository.updateCollection(id, name);
    this.debouncedTab();
  };
}
