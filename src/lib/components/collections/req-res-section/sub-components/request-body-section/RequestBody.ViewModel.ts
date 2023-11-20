/* eslint-disable @typescript-eslint/no-explicit-any */
import { rxdb } from "$lib/database/app.database";
export class RequestBodyViewModel {
  constructor() {}
  get tab() {
    return rxdb.tab.getTab();
  }
  public updateRequestState = async (data: any, route: string) => {
    await rxdb.tab.setRequestState(data, route);
    return;
  };
  public updateRequestBody = async (data: any, route: string) => {
    await rxdb.tab.setRequestBody(data, route);
    return;
  };
  public updateRequestBodyFormData = async (data: any, route: string) => {
    await rxdb.tab.setRequestBodyFormData(data, route);
    return;
  };
}
