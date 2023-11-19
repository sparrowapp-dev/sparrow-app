import { rxdb } from "$lib/database/app.database";
/* eslint-disable @typescript-eslint/no-explicit-any */
export class AuthorizationViewModel {
  constructor() {}
  public updateRequestAuth = async (data: any, route: string) => {
    await rxdb.tab.setRequestAuth(data, route);
    return;
  };
  public updateRequestState = async (data: any, route: string) => {
    await rxdb.tab.setRequestState(data, route);
    return;
  };
}
