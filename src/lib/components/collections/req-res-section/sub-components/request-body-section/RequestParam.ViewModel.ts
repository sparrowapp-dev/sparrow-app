import { rxdb } from "$lib/database/app.database";
/* eslint-disable @typescript-eslint/no-explicit-any */
export class RequestParamViewModel {
  constructor() {}

  get tab() {
    return rxdb.tab.getTab();
  }

  public updateRequestState = async (data: any, route: string) => {
    await rxdb.tab.setRequestState(data, route);
    return;
  };
}
