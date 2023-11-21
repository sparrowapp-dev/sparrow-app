/* eslint-disable @typescript-eslint/no-explicit-any */
import { rxdb } from "$lib/database/app.database";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { addRxPlugin } from "rxdb";
addRxPlugin(RxDBUpdatePlugin);
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { TabRepository } from "$lib/repositories/tab.repository";
addRxPlugin(RxDBQueryBuilderPlugin);
export class TabBarViewModel {
  private tabRepository = new TabRepository();
  constructor() {}

  get tabs() {
    return rxdb.tab.find().sort({ createdAt: "asc" }).$;
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
