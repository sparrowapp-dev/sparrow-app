import { ActiveSideBarTabReposistory } from "$lib/repositories/active-sidebar-tab.repository";

export default class ActiveSideBarTabViewModel {
  private activeSideTabRepository = new ActiveSideBarTabReposistory();

  public getActiveTab = () => {
    return this.activeSideTabRepository.getActiveTab();
  };
  public addActiveTab = async (activeTabName: string) => {
    this.activeSideTabRepository.setActiveTab(activeTabName);
  };
  public updateActiveTab = async (activeTabName: string) => {
    this.activeSideTabRepository.updateActiveTab(activeTabName);
  };
}
