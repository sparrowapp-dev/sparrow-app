import { writable } from "svelte/store";
import type {
  NewTab,
  CurrentTab,
} from "$lib/utils/interfaces/request.interface";

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
export const tabs = writable<NewTab[]>([]);

let tabStore: NewTab[] = [];
tabs.subscribe((value) => {
  tabStore = value;
});

export const updateCurrentTab = (value) => {
  currentTab.set(value);
};

export const handleTabAddons = (newTab: NewTab) => {
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

export const handleTabUpdate = (obj, id) => {
  tabs.update((value: any) => {
    const updatedTab = value.map((elem) => {
      if (elem.id === id) {
        elem = { ...elem, ...obj };
      }
      return elem;
    });
    return [...updatedTab];
  });
};

export const updateQueryParams = (params, id) => {
  tabs.update((value: any) => {
    const updatedTab = value.map((elem) => {
      if (elem.id === id) {
        elem.request.queryParams = params;
      }
      return elem;
    });
    return [...updatedTab];
  });
};

export const updateURL = (url, id) => {
  tabs.update((value: any) => {
    const updatedTab = value.map((elem) => {
      if (elem.id === id) {
        elem.request.url = url;
      }
      return elem;
    });
    return [...updatedTab];
  });
};

export const handleRequestTypeTabChange = (tab, id) => {
  tabs.update((value: any) => {
    const updatedTab = value.map((elem) => {
      if (elem.id === id) {
        elem.request.additions.raw = tab;
      }
      return elem;
    });
    return [...updatedTab];
  });
};

export const handleRequestDatasetTabChange = (tab, id) => {
  tabs.update((value: any) => {
    const updatedTab = value.map((elem) => {
      if (elem.id === id) {
        elem.request.additions.dataset = tab;
      }
      return elem;
    });
    return [...updatedTab];
  });
};

export const handleRawDataChange = (raw: string, id: string) => {
  tabs.update((value) => {
    const temp = value.map((elem) => {
      if (elem.id === id) {
        elem.request.body.raw = raw;
      }
      return elem;
    });
    return temp;
  });
};

export const updateUrlEncode = (urlencode, id: string) => {
  tabs.update((value: any) => {
    const updatedTab = value.map((elem) => {
      if (elem.id === id) {
        elem.request.body.urlencoded = urlencode;
      }
      return elem;
    });
    return [...updatedTab];
  });
};

export const updateFormDataText = (formdatatext, id: string) => {
  tabs.update((value: any) => {
    const updatedTab = value.map((elem) => {
      if (elem.id === id) {
        elem.request.body.formdata.text = formdatatext;
      }
      return elem;
    });
    return [...updatedTab];
  });
};

export const updateFormDataFile = (formdatafile, id: string) => {
  tabs.update((value: any) => {
    const updatedTab = value.map((elem) => {
      if (elem.id === id) {
        elem.request.body.formdata.file = formdatafile;
      }
      return elem;
    });
    return [...updatedTab];
  });
};
