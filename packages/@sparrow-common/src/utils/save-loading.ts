import { loadingState } from "../stores";
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
