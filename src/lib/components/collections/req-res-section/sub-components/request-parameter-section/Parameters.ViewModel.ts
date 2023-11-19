import { rxdb } from "$lib/database/app.database";
/* eslint-disable @typescript-eslint/no-explicit-any */
export class ParametersViewModel {
  constructor() {}
  public updateQueryParams = async (data: any, route: string) => {
    await rxdb.tab.setRequestProperty(data, route);
    return;
  };
  public updateURL = async (data: any, route: string) => {
    await rxdb.tab.setRequestProperty(data, route);
    return;
  };
}
