import { TabRepository } from "$lib/repositories/tab.repository";
/* eslint-disable @typescript-eslint/no-explicit-any */

export class RequestBodyViewModel {
  private tabRepository = new TabRepository();
  constructor() {}
  get tab() {
    return this.tabRepository.getTab();
  }
  public updateRequestState = async (data: any, route: string) => {
    await this.tabRepository.setRequestState(data, route);
    return;
  };
  public updateRequestBody = async (data: any, route: string) => {
    await this.tabRepository.setRequestBody(data, route);
    return;
  };
  public updateRequestBodyFormData = async (data: any, route: string) => {
    await this.tabRepository.setRequestBodyFormData(data, route);
    return;
  };
}
