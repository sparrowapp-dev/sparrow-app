import { TabRepository } from "$lib/repositories/tab.repository";
/* eslint-disable @typescript-eslint/no-explicit-any */

export class ParametersViewModel {
  private tabRepository = new TabRepository();
  constructor() {}
  public updateQueryParams = async (data: any, route: string) => {
    await this.tabRepository.setRequestProperty(data, route);
    return;
  };
  public updateURL = async (data: any, route: string) => {
    await this.tabRepository.setRequestProperty(data, route);
    return;
  };
}
