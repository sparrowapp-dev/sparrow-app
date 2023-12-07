import { rxdb } from "$lib/database/app.database";

export class ActiveSideBarTabReposistory {
  constructor() {}

  public setActiveTab = async (activeTabName: string) => {
    const activTab = await rxdb.activeSideBarTab.insert({
      activeTabId: "activeTabId",
      activeTabName,
    });
    return activTab;
  };
  public getActiveTab = async () => {
    const activeTabData = await rxdb.activeSideBarTab
      .findOne({
        selector: {
          activeTabId: "activeTabId",
        },
      })
      .exec();
    return activeTabData;
  };

  public updateActiveTab = async (newActiveTabName: string) => {
    const activeTab = await this.getActiveTab();
    await activeTab.incrementalPatch({
      activeTabName: newActiveTabName,
    });
    return;
  };
  /* eslint-disable @typescript-eslint/no-explicit-any */
  public clearActiveTabs = async (): Promise<any> => {
    return rxdb.activeSideBarTab.find().remove();
  };
}
