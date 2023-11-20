/* eslint-disable @typescript-eslint/no-explicit-any */
import { rxdb } from "$lib/database/app.database";

export class DefaultTabBarViewModel {
  constructor() {}

  public handleCreateTab = (data: any) => {
    rxdb.tab.createTab(data);
  };
}
