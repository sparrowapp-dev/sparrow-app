import { writable } from "svelte/store";

export const isExpandCollection = writable<boolean>(false);
export const isExpandEnvironment = writable<boolean>(false);
export const isExpandTestflow = writable<boolean>(false);
export const openedComponent = writable(new Map());

export const addCollectionItem = (item, name:string) => {
    openedComponent.update((map) => {
      const newMap = new Map(map);
      newMap.set(item.id, name);
      return newMap;
    });
  };

 export const removeCollectionItem = (id ) => {
    openedComponent.update((map) => {
      const newMap = new Map(map);
      newMap.delete(id); // Remove the entry by ID
      return newMap;
    });
  };