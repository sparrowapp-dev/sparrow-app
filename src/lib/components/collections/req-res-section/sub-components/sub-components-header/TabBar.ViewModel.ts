/* eslint-disable @typescript-eslint/no-explicit-any */
import { rxdb } from "$lib/database/app.database";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { addRxPlugin } from "rxdb";
addRxPlugin(RxDBUpdatePlugin);
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
addRxPlugin(RxDBQueryBuilderPlugin);
export class TabBarViewModel {
  constructor() {}

  get tabs() {
    return rxdb.tab.find().sort({ createdAt: "asc" }).$;
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
