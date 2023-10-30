import { ItemType } from "$lib/utils/enums/item-type.enum";
import { writable } from "svelte/store";

const collectionList = writable([]);

const setCollectionList = (collection) => {
  collectionList.set(collection);
};

/**
 * Recursive helper function to modify the tree data structure by adding files or folders.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const insertionHelper: (
  tree: any,
  folderId: string,
  type: string,
  name: string,
  id: string,
  method?: string,
) => number = (tree, folderId, type, name, id, method?) => {
  if (tree._id === folderId || tree.id === folderId) {
    if (type === ItemType.REQUEST) {
      tree.items.push({
        id,
        name,
        type,
        request: {
          method: method,
        },
      });
    } else if (type === ItemType.FOLDER) {
      tree.items.push({
        id,
        name,
        description: "",
        type,
        items: [],
      });
    }
    return 0;
  }

  // Recursively search through the tree structure
  if (tree && tree.items) {
    for (let j = 0; j < tree.items.length; j++) {
      if (!insertionHelper(tree.items[j], folderId, type, name, id, method))
        return 0;
    }
  }
  return 1;
};

const useCollectionTree = (): any => {
  const insertNode: (
    tree: any,
    folderId: string,
    type: string,
    name: string,
    id: string,
    method?: string,
  ) => void = (tree, folderId, type, name, id, method?) => {
    // Iterate through the tree to find the target folder and add the item
    for (let i = 0; i < tree.length; i++) {
      if (!insertionHelper(tree[i], folderId, type, name, id, method)) {
        setCollectionList(tree);
        return;
      }
    }
    return;
  };
  const insertHead: (tree: any, name: string, _id: string) => void = (
    tree,
    name,
    _id,
  ) => {
    // Iterate through the tree to find the target folder and add the item
    tree.push({ name, _id, items: [] });
    setCollectionList(tree);
    return;
  };
  return { insertNode, insertHead };
};
export { collectionList, setCollectionList, useCollectionTree };
