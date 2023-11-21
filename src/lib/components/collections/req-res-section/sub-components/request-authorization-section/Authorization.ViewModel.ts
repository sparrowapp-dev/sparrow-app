import { TabRepository } from "$lib/repositories/tab.repository";
/* eslint-disable @typescript-eslint/no-explicit-any */
export class AuthorizationViewModel {
  private tabRepository = new TabRepository();
  constructor() {}
  public updateRequestAuth = async (data: any, route: string) => {
    await this.tabRepository.setRequestAuth(data, route);
    return;
  };
  public updateRequestState = async (data: any, route: string) => {
    await this.tabRepository.setRequestState(data, route);
    return;
  };
}
