import { writable } from "svelte/store";

export const isExpandCollection = writable<boolean>(false);
export const isExpandEnvironment = writable<boolean>(false);
export const isExpandTestflow = writable<boolean>(false);
export const opendComponent = writable(new Map());

export const addCollectionItem = (item, name:string) => {
    opendComponent.update((map) => {
      const newMap = new Map(map);
      newMap.set(item.id, name);
      return newMap;
    });
  };
  
 export const removeCollectionItem = (id ) => {
    opendComponent.update((map) => {
      const newMap = new Map(map);
      newMap.delete(id); // Remove the entry by ID
      return newMap;
    });
  };