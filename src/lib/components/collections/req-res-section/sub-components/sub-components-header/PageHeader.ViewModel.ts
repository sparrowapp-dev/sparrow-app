/* eslint-disable @typescript-eslint/no-explicit-any */
import { rxdb } from "$lib/database/app.database";

export class PageHeaderViewModel {
  constructor() {}
  get tab() {
    return rxdb.tab.getTab();
  }
  public updateTab = async (data: any, route: string) => {
    await rxdb.tab.setTabProperty(data, route);
    return;
  };
}
