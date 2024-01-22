import { RxDB } from "$lib/database/app.database";

export class ActiveSideBarTabReposistory {
  constructor() {}
  public activeTab = () => {
    return RxDB.getInstance()
      .rxdb.activesidebartab.findOne({
        selector: {
          activeTabId: "activeTabId",
        },
      })
      .exec();
  };
  public setActiveTab = async (activeTabName: string) => {
    const activTab = await RxDB.getInstance().rxdb.activesidebartab.insert({
      activeTabId: "activeTabId",
      activeTabName,
    });
    return activTab;
  };
  public getActiveTab = () => {
    return RxDB.getInstance().rxdb.activesidebartab.findOne({
      selector: {
        activeTabId: "activeTabId",
      },
    }).$;
  };

  public updateActiveTab = async (newActiveTabName: string) => {
    const activeTab = await this.activeTab();
    await activeTab.incrementalPatch({
      activeTabName: newActiveTabName,
    });
    return;
  };
  /* eslint-disable @typescript-eslint/no-explicit-any */
  public clearActiveTabs = async (): Promise<any> => {
    return RxDB.getInstance().rxdb.activesidebartab.find().remove();
  };
}
