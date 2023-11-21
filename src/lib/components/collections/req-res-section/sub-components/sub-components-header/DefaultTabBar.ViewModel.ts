import { TabRepository } from "$lib/repositories/tab.repository";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DefaultTabBarViewModel {
  private tabRepository = new TabRepository();
  constructor() {}

  public handleCreateTab = (data: any) => {
    this.tabRepository.createTab(data);
  };
}
