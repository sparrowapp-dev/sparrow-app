import { rxdb } from "$lib/database/app.database";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { addRxPlugin } from "rxdb";
addRxPlugin(RxDBUpdatePlugin);

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TabBarViewModel {
  constructor() {}

  get tabs() {
    return rxdb.tab.find().$;
  }

  get activeTab() {
    return rxdb.tab.findOne({
      selector: {
        isActive: true,
      },
    }).$;
  }

  public handleCreateTab = (data: any) => {
    rxdb.tab.createTab(data);
  };
  public handleRemoveTab = async (id: string) => {
    await rxdb.tab.removeTab(id);
  };
  public handleActiveTab = (id: string) => {
    rxdb.tab.activeTab(id);
  };
}
