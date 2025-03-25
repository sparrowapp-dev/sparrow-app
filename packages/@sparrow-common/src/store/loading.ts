import { writable } from "svelte/store";

// Create the writable store with an initial empty object
export const loadingState = writable<Map<string | number, boolean>>(new Map());

export const startLoading = (id: string) => {
  loadingState.update((currentMap) => {
    const updatedMap = new Map(currentMap);
    updatedMap.set(id, true);
    return updatedMap;
  });
};

export const stopLoading = (id: string) => {
  loadingState.update((currentMap) => {
    const updatedMap = new Map(currentMap);
    updatedMap.set(id, false);
    return updatedMap;
  });
};
