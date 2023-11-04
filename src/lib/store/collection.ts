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

const updationIdHelper = (tree, dummyId, originalId) => {
  if (tree._id === dummyId || tree.id === dummyId) {
    if (tree._id) {
      tree._id = originalId;
    } else {
      tree.id = originalId;
    }
    return 0;
  }

  // Recursively search through the tree structure
  if (tree && tree.items) {
    for (let j = 0; j < tree.items.length; j++) {
      if (!updationIdHelper(tree.items[j], dummyId, originalId)) {
        return 0;
      }
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
    // debugger;
    // Iterate through the tree to find the target folder and add the item
    for (let i = 0; i < tree.length; i++) {
      if (!insertionHelper(tree[i], folderId, type, name, id, method)) {
        console.log("new", tree);
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
  const updateNodeId: (
    tree: any,
    dummyId: string,
    originalId: string,
  ) => void = (tree, dummyId, originalId) => {
    for (let i = 0; i < tree.length; i++) {
      if (!updationIdHelper(tree[i], dummyId, originalId)) {
        console.log("old", tree);
        setCollectionList(tree);
        return;
      }
    }
    return;
  };
  const updateHeadId: (
    tree: any,
    dummyId: string,
    originalId: string,
  ) => void = (tree, dummyId, originalId) => {
    // Iterate through the tree to find the target folder and add the item
    // tree.push({ name, _id, items: [] });
    for (let i = 0; i < tree.length; i++) {
      if (tree[i]._id === dummyId) {
        tree[i]._id = originalId;
        setCollectionList(tree);
        return;
      }
    }
    return;
  };

  return { insertNode, insertHead, updateNodeId, updateHeadId };
};
export { collectionList, setCollectionList, useCollectionTree };
