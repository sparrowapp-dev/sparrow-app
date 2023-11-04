import { writable } from "svelte/store";
import type {
  Tab,
  Path,
  CurrentTab,
} from "$lib/utils/interfaces/request.interface";
import { RequestType } from "$lib/utils/enums/request.enum";
import { ItemType } from "$lib/utils/enums/item-type.enum";
//this store is for collaps and expand section
export const collapsibleState = writable(false);

//this is for horizaontal and vertical mode
export const isHorizontalVertical = writable(false);

//store for Api Request ------>here i will store all new request
const initialRequest = [
  {
    url: "",
    method: "",
    body: "",
    headers: "",
    request: "",
  },
];
export const apiRequest = writable(initialRequest);

export const currentTab = writable<CurrentTab>({ id: null });
export const tabs = writable<Tab[]>([]);

let tabStore: Tab[] = [];
tabs.subscribe((value) => {
  tabStore = value;
});

export const updateCurrentTab = (value) => {
  currentTab.set(value);
};

export const handleTabAddons = (
  id: string,
  name: string,
  method: string,
  path: Path | null = null,
  type: string = ItemType.REQUEST,
  body: string = "",
  url: string = "",
  header: unknown = "",
  requestType = RequestType.JSON,
  response: Response | null = null,
  save: boolean = false,
  requestInProgress: boolean = false,
) => {
  const newTab = {
    method: method,
    name: name,
    type,
    id,
    body,
    url,
    header,
    requestType,
    response,
    path,
    save,
    requestInProgress,
  };

  const requestAlreadyExist = tabStore.filter((elem) => {
    if (elem.id === newTab.id) return true;
    else return false;
  });
  if (requestAlreadyExist.length === 0) {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    tabs.update((value: any) => {
      return [...value, newTab];
    });
    updateCurrentTab({ id: newTab.id });
  } else {
    updateCurrentTab({ id: requestAlreadyExist[0].id });
  }
};

export const handleTabRemove = (id: string) => {
  tabs.update((value) => {
    const filteredTabs = value.filter((elem) => {
      if (elem.id === id) return false;
      else return true;
    });
    return [...filteredTabs];
  });
  if (tabStore.length > 0) {
    updateCurrentTab({ id: tabStore[tabStore.length - 1].id });
  } else {
    updateCurrentTab({ id: null });
  }
};
