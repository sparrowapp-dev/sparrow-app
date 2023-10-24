import { writable } from "svelte/store";

const collectionList = writable([]);

const setCollectionList = (collection) => {
  collectionList.set(collection);
};
export { collectionList, setCollectionList };
