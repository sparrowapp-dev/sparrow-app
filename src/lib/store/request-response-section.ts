import { writable } from "svelte/store";

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

export const currentTab = writable({ id: null });
export const tabs = writable([]);

let tabStore = [];
tabs.subscribe((value) => {
  tabStore = value;
});

export const updateCurrentTab = (value) => {
  currentTab.set(value);
};

export const handleTabAddons = (
  id,
  name,
  method,
  type = "REQUEST",
  body = "",
  url = "",
  header = "",
  requestType = "JSON",
  response = "",
) => {
  const newTab = {
    method: method,
    name: name,
    type,
    id: id,
    body,
    url,
    header,
    requestType,
    response,
  };
  tabs.update((value) => {
    return [...value, newTab];
  });
  updateCurrentTab(newTab);
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
    updateCurrentTab(tabStore[tabStore.length - 1]);
  } else {
    updateCurrentTab({ id: null });
  }
};
