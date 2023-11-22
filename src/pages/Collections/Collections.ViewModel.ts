/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TabDocument } from "$lib/database/app.database";
import { TabRepository } from "$lib/repositories/tab.repository";

export class CollectionsViewModel {
  private tabRepository = new TabRepository();
  constructor() {}

  get tabs() {
    return this.tabRepository.getTabList();
  }

  get activeTab() {
    return this.tabRepository.getTab();
  }

  public extractTabDocument = (doc: TabDocument) => {
    return this.tabRepository.extractTabDocument(doc);
  };
  public handleCreateTab = (data: any) => {
    this.tabRepository.createTab(data);
  };
  public handleRemoveTab = (id: string) => {
    this.tabRepository.removeTab(id);
  };
  public handleActiveTab = (id: string) => {
    this.tabRepository.activeTab(id);
  };

  public updateTab = async (data: any, route: string) => {
    await this.tabRepository.setTabProperty(data, route);
  };

  public updateRequestProperty = async (data: any, route: string) => {
    await this.tabRepository.setRequestProperty(data, route);
  };

  public updateRequestState = async (data: any, route: string) => {
    await this.tabRepository.setRequestState(data, route);
  };
}
