import { ActiveSideBarTabReposistory } from "$lib/repositories/active-sidebar-tab.repository";

export default class ActiveSideBarTabViewModel {
  private activeSideTabRepository = new ActiveSideBarTabReposistory();

  public getActiveTab = async () => {
    const activeTab = await this.activeSideTabRepository.getActiveTab();
    if (activeTab && activeTab._data.activeTabName) {
      return activeTab._data.activeTabName;
    } else {
      null;
    }
  };
  public addActiveTab = async (activeTabName: string) => {
    this.activeSideTabRepository.setActiveTab(activeTabName);
  };
  public updateActiveTab = async (activeTabName: string) => {
    this.activeSideTabRepository.updateActiveTab(activeTabName);
  };
}
