import { TabRepository } from "$lib/repositories/tab.repository";
/* eslint-disable @typescript-eslint/no-explicit-any */

export class RequestParamViewModel {
  private tabRepository = new TabRepository();
  constructor() {}

  get tab() {
    return this.tabRepository.getTab();
  }

  public updateRequestState = async (data: any, route: string) => {
    await this.tabRepository.setRequestState(data, route);
    return;
  };
}
