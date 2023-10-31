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

export const tabs = writable([]);

let tabStore = [];
tabs.subscribe((value) => {
  tabStore = value;
});

export const updateInitialRequest = (value) => {
  apiRequest.set(value);
};

export const handleTabAddons = (type, name, id) => {
  const newTab = { type: type, name: name, id: id };
  tabs.update((value) => {
    return [...value, newTab];
  });
  apiRequest.set(newTab);
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
    updateInitialRequest(tabStore[tabStore.length - 1]);
  } else {
    updateInitialRequest({});
  }
};
