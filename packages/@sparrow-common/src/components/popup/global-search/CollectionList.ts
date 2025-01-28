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
const getRequestUrl = (tree: any): string => {
  switch (tree.type) {
    case ItemType.GRAPHQL:
      return tree.graphql?.url || "";
    case ItemType.SOCKET_IO:
      return tree.socketio?.url || "";
    case ItemType.WEB_SOCKET:
      return tree.websocket?.url || "";
    case ItemType.REQUEST:
      return tree.request?.url || "";
    default:
      return "";
  }
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const helper = (
  tree: any,
  folderId: string,
  type: string,
  name: string,
  id: string,
  method?: string,
) => {
  if (tree._id === folderId || tree.id === folderId) {
    if (type === "REQUEST") {
      tree.items.push({
        id,
        name,
        type,
        request: {
          method: method,
        },
        folderId: tree.id, // Use the parent folder's ID
        folderName: tree.name, // Use the parent folder's name
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

  if (tree && tree.items) {
    for (let j = 0; j < tree.items.length; j++) {
      if (!helper(tree.items[j], folderId, type, name, id, method)) return 0;
    }
  }
  return 1;
};

const createPath: (path: string[]) => string = (path) => {
  const res = path.join(" / ");
  return res;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const searchHelper = (
  tree: any,
  searchText: string,
  collection: any[],
  folder: any[],
  file: any[],
  collectionId: string,
  path: string[],
  folderDetails: any,
  workspaceMap = {},
  currentWorkspaceId = tree.workspaceId,
) => {
  if (tree.workspaceId) {
    const workspaceDetails = workspaceMap[tree.workspaceId];
    if (workspaceDetails) {
      path.push(workspaceDetails.teamName);
      path.push(workspaceDetails.workspaceName);
    }
  }

  if (tree.name.toLowerCase().includes(searchText.toLowerCase())) {
    if (
      (tree.type === ItemType.REQUEST ||
        tree.type === ItemType.GRAPHQL ||
        tree.type === ItemType.SOCKET_IO ||
        tree.type === ItemType.WEB_SOCKET) &&
      file.length < 3
    ) {
      let currentFolderDetails =
        tree.folderId && tree.folderName
          ? { id: tree.folderId, name: tree.folderName }
          : tree.parentFolder
            ? { id: tree.parentFolder.id, name: tree.parentFolder.name }
            : folderDetails;

      // Determine the appropriate method based on request type
      const requestMethod =
        tree.type === ItemType.REQUEST
          ? tree.request?.method // Use actual HTTP method for REST requests
          : tree.type; // Use type as method for other request types

      const requestData = {
        tree: JSON.parse(
          JSON.stringify({
            ...tree,
            folderId: currentFolderDetails?.id,
            folderName: currentFolderDetails?.name,
            request: {
              ...tree.request,
              url: getRequestUrl(tree),
              method: requestMethod,
            },
          }),
        ),
        collectionId,
        folderDetails: currentFolderDetails,
        path: createPath(path),
        updatedAt: new Date(tree.updatedAt || Date.now()),
        workspaceId: currentWorkspaceId,
        type: tree.type,
      };

      file.push(requestData);
    } else if (tree.type === ItemType.FOLDER && folder.length < 1) {
      folder.push({
        tree: JSON.parse(JSON.stringify(tree)),
        collectionId,
        path: createPath(path),
        updatedAt: new Date(tree.updatedAt || Date.now()),
        workspaceId: currentWorkspaceId,
      });
    } else if (
      collection.length < 1 &&
      tree.type !== ItemType.FOLDER &&
      !Object.values([
        ItemType.REQUEST,
        ItemType.GRAPHQL,
        ItemType.SOCKET_IO,
        ItemType.WEB_SOCKET,
      ]).includes(tree.type)
    ) {
      collection.push({
        tree: JSON.parse(JSON.stringify(tree)),
        collectionId,
        path: createPath(path),
        updatedAt: new Date(tree.updatedAt || Date.now()),
        workspaceId: currentWorkspaceId,
      });
    }
  }

  if (file.length < 3 || folder.length < 1 || collection.length < 1) {
    if (tree && tree.items) {
      for (let j = 0; j < tree.items.length; j++) {
        path.push(tree.name);
        const newFolderDetails =
          tree.type === ItemType.FOLDER
            ? { id: tree.id || tree._id, name: tree.name }
            : folderDetails;

        const childItem = tree.items[j];
        if (tree.type === ItemType.FOLDER) {
          childItem.parentFolder = {
            id: tree.id || tree._id,
            name: tree.name,
          };
        }

        searchHelper(
          childItem,
          searchText,
          collection,
          folder,
          file,
          collectionId,
          path,
          newFolderDetails,
          workspaceMap,
          currentWorkspaceId,
        );
        path.pop();
      }
    }
  }

  file.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  folder.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  collection.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
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
    workspaceMap?: Record<string, { teamName: string; workspaceName: string }>,
    
  ) => void = (
    searchText,
    collection,
    folder,
    file,
    collectionData,
    workspacePath,
    workspaceMap = {},
    currentWorkspaceId,
  ) => {
    const filteredByMethodTrees = [];
    tree = collectionData;
    console.log("current search text is", tree);

    if (searchText.trim() === "") {
      // Clear existing arrays before populating with latest items
      collection.length = 0;
      folder.length = 0;
      file.length = 0;

      // Get latest items and ensure they're properly sorted
      const latestItems = getLatestItemsByType(tree, workspaceMap);

      // Ensure we're getting the most recently updated items
      if (latestItems.latestCollections.length > 0) {
        collection.push(...latestItems.latestCollections);
      }
      if (latestItems.latestFolders.length > 0) {
        folder.push(...latestItems.latestFolders);
      }
      if (latestItems.latestRequests.length > 0) {
        file.push(...latestItems.latestRequests);
      }

      // Update the latestItemsStore with all items
      latestItemsStore.set(
        [
          ...latestItems.latestWorkspaces,
          ...latestItems.latestCollections,
          ...latestItems.latestFolders,
          ...latestItems.latestRequests,
        ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
      );

      return;
    }

    // Rest of the existing search logic remains unchanged
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

    for (let i = 0; i < filteredTrees.length; i++) {
      const path = [];

      searchHelper(
        filteredTrees[i],
        searchText,
        collection,
        folder,
        file,
        filteredTrees[i].id,
        path,
        {},
        workspaceMap,
      );
    }
    return;
  };
  return [insertNode, insertHead, searchNode];
};

const getLatestItemsByType = (
  tree: any[],
  workspaceMap: Record<
    string,
    { teamName: string; workspaceName: string }
  > = {},
) => {
  const collections: any[] = [];
  const folders: any[] = [];
  const requests: any[] = [];
  const workspaces: any[] = [];

  const extractItems = (
    node: any,
    path: string[] = [],
    collectionId: string = "",
    currentWorkspaceId: string | null = null,
  ) => {
    if (!node) return;

    if (node.workspaceId) {
      const workspaceDetails = workspaceMap[node.workspaceId];
      if (workspaceDetails) {
        path.push(workspaceDetails.teamName);
        path.push(workspaceDetails.workspaceName);
      }
    }

    const workspaceId = node.workspaceId || currentWorkspaceId;

    // Determine the appropriate method based on request type
    const requestMethod =
      node.type === ItemType.REQUEST
        ? node.request?.method // Use actual HTTP method for REST requests
        : node.type; // Use type as method for other request types

    const itemData = {
      tree: JSON.parse(
        JSON.stringify({
          ...node,
          request: {
            ...node.request,
            url: getRequestUrl(node),
            method: requestMethod,
          },
        }),
      ),
      collectionId: collectionId || node.id,
      path: createPath(path),
      updatedAt: new Date(node.updatedAt || Date.now()),
      workspaceId,
      type: node.type,
      folderDetails: [
        ItemType.REQUEST,
        ItemType.SOCKET_IO,
        ItemType.WEB_SOCKET,
        ItemType.GRAPHQL,
      ].includes(node.type)
        ? { id: path[path.length - 1]?.id, name: path[path.length - 1]?.name }
        : {},
    };

    switch (node.type) {
      case ItemType.FOLDER:
        folders.push(itemData);
        break;
      case ItemType.REQUEST:
      case ItemType.SOCKET_IO:
      case ItemType.WEB_SOCKET:
      case ItemType.GRAPHQL:
        requests.push(itemData);
        break;
      case ItemType.WORKSPACE:
        workspaces.push(itemData);
        break;
      default:
        if (!node.type) {
          collections.push(itemData);
        }
        break;
    }

    if (node.items) {
      const newPath = [...path, node.name];
      node.items.forEach((item: any) => {
        extractItems(item, newPath, collectionId || node.id, workspaceId);
      });
    }
  };

  tree.forEach((node) => extractItems(node));

  const sortByDate = (a: any, b: any) =>
    b.updatedAt.getTime() - a.updatedAt.getTime();

  return {
    latestCollections: collections.sort(sortByDate).slice(0, 3),
    latestFolders: folders.sort(sortByDate).slice(0, 3),
    latestRequests: requests.sort(sortByDate).slice(0, 3),
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
export { searchHelper, getLatestItemsByType };