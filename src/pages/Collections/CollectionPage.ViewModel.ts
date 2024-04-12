import type { TabDocument } from "$lib/database/app.database";
import { TabRepository } from "$lib/repositories/tab.repository";
import {
  isApiCreatedFirstTime,
  requestResponseStore,
  tabs,
} from "$lib/store/request-response-section";
import { Events } from "$lib/utils/enums/mixpanel-events.enum";
import { moveNavigation } from "$lib/utils/helpers/navigation";
import type { NewTab } from "$lib/utils/interfaces/request.interface";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { generateSampleRequest } from "$lib/utils/sample/request.sample";
import { v4 as uuidv4 } from "uuid";
export class CollectionPageViewModel {
  private tabRepository = new TabRepository();
  movedTabStartIndex = 0;
  movedTabEndIndex = 0;

  constructor() {}

  public debounce = (func, delay) => {
    let timerId;

    return function (...args) {
      /* eslint-disable @typescript-eslint/no-this-alias */
      const context = this;

      clearTimeout(timerId);
      timerId = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  };

  get tabs() {
    return requestResponseStore.getTabList();
  }

  public syncTabWithStore = () => {
    this.tabRepository.syncTabsWithStore(tabs);
  };

  debouncedTab = this.debounce(this.syncTabWithStore, 2000);

  public handleCreateTab = (data: any) => {
    requestResponseStore.createTab(data);
    this.debouncedTab();
  };

  public handleRemoveTab = (id: string) => {
    requestResponseStore.removeTab(id);
    this.debouncedTab();
  };

  public createNewTab = () => {
    isApiCreatedFirstTime.set(true);
    this.handleCreateTab(
      generateSampleRequest("UNTRACKED-" + uuidv4(), new Date().toString()),
    );
    moveNavigation("right");
    MixpanelEvent(Events.ADD_NEW_API_REQUEST, { source: "TabBar" });
  };

  public handleActiveTab = (id: string) => {
    requestResponseStore.activeTab(id);
    this.debouncedTab();
  };

  public onDropEvent = (event: Event) => {
    event.preventDefault();
    const tabList = this.tabs;
    let updatedTabList: TabDocument[] = [];
    tabList.subscribe((value) => {
      updatedTabList = value;
    });
    const element = updatedTabList.splice(this.movedTabStartIndex, 1);
    updatedTabList.splice(this.movedTabEndIndex, 0, element[0]);
    updatedTabList = updatedTabList.map((tab, index) => {
      tab.index = index;
      return tab;
    });
    const newTabList: NewTab[] = updatedTabList as NewTab[];
    tabs.set(newTabList);
    this.syncTabWithStore();
  };

  public handleDropOnStart = (index: number) => {
    this.movedTabStartIndex = index;
  };
  public handleDropOnEnd = (index: number) => {
    this.movedTabEndIndex = index;
  };
}
