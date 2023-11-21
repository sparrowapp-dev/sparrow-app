/* eslint-disable @typescript-eslint/no-explicit-any */
import { TabRepository } from "$lib/repositories/tab.repository";

export class TabBarViewModel {
  private tabRepository = new TabRepository();
  constructor() {}

  get tabs() {
    return this.tabRepository.getTabList();
  }

  get activeTab() {
    return this.tabRepository.getTab();
  }

  public handleCreateTab = (data: any) => {
    this.tabRepository.createTab(data);
  };
  public handleRemoveTab = async (id: string) => {
    await this.tabRepository.removeTab(id);
  };
  public handleActiveTab = (id: string) => {
    this.tabRepository.activeTab(id);
  };
}
