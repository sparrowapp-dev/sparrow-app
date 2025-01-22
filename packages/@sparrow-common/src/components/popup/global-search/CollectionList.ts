// import { setCollectionList } from "$lib/store/collection";

import type { Collection } from "../../../interfaces/collection.interface";
const selectMethodsStore = writable([]);
const selectedMethodsCollectionStore = writable([]);
const latestItemsStore = writable([]);

let tree: any[];
const filterTree: Collection[] = [];
let selectedAPIMethods: string[] = [];
selectMethodsStore.subscribe((value) => {
  if (value) {
    selectedAPIMethods = value;
  }
});
import { writable } from "svelte/store";

// COLLECTION LIST
const collectionList = writable([]);

const setCollectionList = (collection) => {
  collectionList.set(collection);
};

export enum ItemType {
  FOLDER = "FOLDER",
  REQUEST = "REQUEST",
  COLLECTION = "COLLECTION",
  WORKSPACE = "WORKSPACE",
  PERSONAL = "PERSONAL",
  WEB_SOCKET = "WEBSOCKET",
  ENVIRONMENT = "ENVIRONMENT",
  TESTFLOW = "TESTFLOW",
  SOCKET_IO = "SOCKETIO",
  GRAPHQL = "GRAPHQL",
}

/**
 * Recursive helper function to modify the tree data structure by adding files or folders.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const helper: (
  tree: any,
  folderId: string,
  type: string,
  name: string,
  id: string,
  method?: string,
) => number = (tree, folderId, type, name, id, method?) => {
  if (tree._id === folderId || tree.id === folderId) {
    if (type === "REQUEST") {
      tree.items.push({
        id,
        name,
        type,
        request: {
          method: method,
        },
        folderId,
        folderName: name,
      });
    } else if (type === "FOLDER") {
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
      if (!helper(tree.items[j], folderId, type, name, id, method)) return 0;
    }
  }
  return 1;
};

const createPath: (path: string[]) => string = (path) => {
  const res = "/" + path.join("/");
  return res;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const searchHelper: (
  tree: any,
  searchText: string,
  collection: any[],
  folder: any[],
  file: any[],
  collectionId: string,
  path: string[],
  folderDetails: Record<string, string>,
) => void = (
  tree,
  searchText,
  collection,
  folder,
  file,
  collectionId,
  path,
  folderDetails,
) => {
  if (tree.name.toLowerCase().includes(searchText.toLowerCase())) {
    if (tree.type === "REQUEST") {
      file.push({
        tree: JSON.parse(JSON.stringify(tree)),
        collectionId,
        folderDetails,
        path: createPath(path),
      });
    } else if (tree.type === "FOLDER") {
      folder.push({
        tree: JSON.parse(JSON.stringify(tree)),
        collectionId,
        path: createPath(path),
      });
    } else {
      collection.push({
        tree: JSON.parse(JSON.stringify(tree)),
        collectionId,
        path: createPath(path),
      });
    }
  }

  // Recursively search through the tree structure
  if (tree && tree.items) {
    for (let j = 0; j < tree.items.length; j++) {
      path.push(tree.name); // Recursive backtracking
      searchHelper(
        tree.items[j],
        searchText,
        collection,
        folder,
        file,
        collectionId,
        path,
        tree.type === "FOLDER" ? { id: tree.id, name: tree.name } : {},
      );
      path.pop();
    }
  }
  return;
};

const sortHelperMethod: (
  tree: any,
  path: string[],
  selectedMethods: string[],
  filterTree: any[],
) => any[] = (tree, path, selectedMethods, filterTree) => {
  if (
    tree.type === ItemType.REQUEST &&
    selectedMethods.includes(tree.request.method)
  ) {
    if (path.length === 2) {
      filterTree[0].items[filterTree[0].items.length - 1].items.push(tree);
    } else {
      filterTree[0].items.push(tree);
    }
  } else if (tree.type == ItemType.FOLDER) {
    filterTree[0].items.push({ ...tree, items: [] });
  } else if (
    !(tree.type === ItemType.REQUEST) &&
    !(tree.type === ItemType.FOLDER)
  ) {
    filterTree = [{ ...tree, items: [] }];
  }
  // Recursively search through the tree structure
  if (tree && tree.items) {
    for (let j = 0; j < tree.items.length; j++) {
      path.push(tree.name); // Recursive backtracking
      sortHelperMethod(tree.items[j], path, selectedMethods, filterTree);
      path.pop();
    }
  }
  return filterTree;
};

/**
 * Custom hook function for interacting with the tree data structure.
 */
const useTree = (): any[] => {
  const insertNode: (
    folderId: string,
    type: string,
    name: string,
    id: string,
    method?: string,
  ) => void = (folderId, type, name, id, method?) => {
    // Iterate through the tree to find the target folder and add the item
    for (let i = 0; i < tree.length; i++) {
      if (!helper(tree[i], folderId, type, name, id, method)) {
        setCollectionList(tree);
        return;
      }
    }
    return;
  };
  const insertHead: (name: string, _id: string) => void = (name, _id) => {
    // Iterate through the tree to find the target folder and add the item
    tree.push({ name, _id, items: [] });
    setCollectionList(tree);
    return;
  };
  const searchNode: (
    searchText: string,
    collection: any[],
    folder: any[],
    file: any[],
    collectionData: any[],
    workspacePath?: string,
  ) => void = (
    searchText,
    collection,
    folder,
    file,
    collectionData,
    workspacePath,
  ) => {
    const filteredByMethodTrees = [];
    tree = collectionData;
    console.log("current search ttext is", searchText);
    if (searchText.trim()=="" ) {
      const {
        latestCollections,
        latestFolders,
        latestRequests,
        latestWorkspaces,
      } = getLatestItemsByType(tree);

      collection.push(...latestCollections);
      folder.push(...latestFolders);
      file.push(...latestRequests);

      // Combine all latest items for the store
      latestItemsStore.set([
        ...latestWorkspaces,
        ...latestCollections,
        ...latestFolders,
        ...latestRequests,
      ]);
      return;
    }
    // iterate through the tree and filter according to api methods selected
    if (selectedAPIMethods.length > 0) {
      for (let i = 0; i < tree.length; i++) {
        const path = [];
        const treeCol = sortHelperMethod(
          tree[i],
          path,
          selectedAPIMethods,
          filterTree,
        );
        filteredByMethodTrees.push(...treeCol);
      }
    }
    let filteredTrees = [];
    // iterate through the tree and remove empty collection and folder on filter
    if (filteredByMethodTrees.length > 0) {
      filteredTrees = filteredByMethodTrees.filter((collectionObj) => {
        if (collectionObj.items.length > 0) {
          const items = collectionObj.items.filter(
            (item) =>
              !(item.type === ItemType.FOLDER && item.items.length === 0),
          );
          collectionObj.items = items;
          if (collectionObj.items.length > 0) {
            return true;
          } else {
            return false;
          }
        }
      });
    } else {
      filteredTrees = tree;
    }
    selectedMethodsCollectionStore.update(() => filteredTrees);
    // Iterate through the tree to find the target folder and add the item
    for (let i = 0; i < filteredTrees.length; i++) {
      const path = [];
      if (workspacePath) {
        path.push(workspacePath);
      }
      searchHelper(
        filteredTrees[i],
        searchText,
        collection,
        folder,
        file,
        filteredTrees[i].id,
        path,
        {},
      );
    }
    return;
  };
  return [insertNode, insertHead, searchNode];
};

const getLatestItemsByType = (tree: any[]) => {
  const collections: any[] = [];
  const folders: any[] = [];
  const requests: any[] = [];
  const workspaces: any[] = [];

  const extractItems = (
    node: any,
    path: string[] = [],
    collectionId: string = "",
  ) => {
    if (!node) return;

    const itemData = {
      tree: JSON.parse(JSON.stringify(node)),
      collectionId: collectionId || node.id,
      path: createPath(path),
      updatedAt: new Date(node.updatedAt || Date.now()), // Fallback to current time if no updatedAt
      folderDetails:
        node.type === ItemType.REQUEST
          ? {
              id: path[path.length - 1]?.id,
              name: path[path.length - 1]?.name,
            }
          : {},
    };

    // Sort items into their respective arrays
    switch (node.type) {
      case ItemType.COLLECTION:
        collections.push(itemData);
        break;
      case ItemType.FOLDER:
        folders.push(itemData);
        break;
      case ItemType.REQUEST:
        requests.push(itemData);
        break;
      case ItemType.WORKSPACE:
        workspaces.push(itemData);
        break;
    }

    // Recursively process child items
    if (node.items) {
      const newPath = [...path, node.name];
      node.items.forEach((item: any) => {
        extractItems(item, newPath, collectionId || node.id);
      });
    }
  };

  // Process all trees
  tree.forEach((node) => extractItems(node));

  // Sort function for all arrays
  const sortByDate = (a: any, b: any) =>
    b.updatedAt.getTime() - a.updatedAt.getTime();

  // Return specific numbers of each type
  return {
    latestWorkspaces: workspaces.sort(sortByDate).slice(0, 1), // 1 workspace
    latestCollections: collections.sort(sortByDate).slice(0, 1), // 1 collection
    latestFolders: folders.sort(sortByDate).slice(0, 1), // 1 folder
    latestRequests: requests.sort(sortByDate).slice(0, 3), // 3 requests
  };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const getNextName: (list: any[], type: string, name: string) => any = (
  list,
  type,
  name,
) => {
  const isNameAvailable: (proposedName: string) => boolean = (proposedName) => {
    return list.some((element) => {
      return element.type === type && element.name === proposedName;
    });
  };

  if (!isNameAvailable(name)) {
    return name;
  }

  for (let i = 2; i < list.length + 10; i++) {
    const proposedName: string = `${name}${i}`;
    if (!isNameAvailable(proposedName)) {
      return proposedName;
    }
  }

  return null;
};

export { useTree, getNextName };
