/* eslint-disable @typescript-eslint/no-explicit-any */
import { TabRepository } from "$lib/repositories/tab.repository";

export class PageHeaderViewModel {
  private tabRepository = new TabRepository();
  constructor() {}
  get tab() {
    return this.tabRepository.getTab();
  }
  public updateTab = async (data: any, route: string) => {
    await this.tabRepository.setTabProperty(data, route);
  };
}
