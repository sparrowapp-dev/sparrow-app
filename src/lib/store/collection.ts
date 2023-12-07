import { ItemType } from "$lib/utils/enums/item-type.enum";
import type { RequestBody } from "$lib/utils/interfaces/request.interface";
import { writable } from "svelte/store";

const collectionList = writable([]);
export const isShowCollectionPopup = writable(false);
export const isShowFolderPopup = writable(false);
export const isShowFilePopup = writable(false);
export const isSelectedCollection = writable(false);

export const currentCollectionWorkspaceId = writable({
  collectionId: "",
  workspaceId: "",
  name: "",
});

export const deletedCollectionWorkspaceId = writable({
  collectionId: null,
  workspaceId: null,
});
export const currentCollectionWorkspaceFolderId = writable({
  collectionId: null,
  workspaceId: null,
  folderId: null,
});

export const currentCollectionWorkspaceFolderRequestId = writable({
  collectionId: null,
  workspaceId: null,
  folderId: null,
  requestId: null,
  items: {
    name: "",
    type: "REQUEST",
  },
});

export const currentFolderIdName = writable({ folderId: "", folderName: "" });

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
  request?: RequestBody,
) => number = (tree, folderId, type, name, id, request?) => {
  if (tree._id === folderId || tree.id === folderId) {
    if (type === ItemType.REQUEST) {
      tree.items.push({
        id,
        name,
        type,
        request: {
          method: request.method,
          url: request.url,
          body: request.body,
          Headers: request.headers,
          queryParams: request.queryParams,
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
      if (!insertionHelper(tree.items[j], folderId, type, name, id, request))
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

const updationNodeHelper = (tree, id, data) => {
  if (tree._id === id || tree.id === id) {
    tree.name = data.name;
    tree.request.url = data.request.url;
    tree.request.body = data.request.body;
    tree.request.headers = data.request.headers;
    tree.request.method = data.request.method;
    tree.request.queryParams = data.request.queryParams;
    return 0;
  }

  // Recursively search through the tree structure
  if (tree && tree.items) {
    for (let j = 0; j < tree.items.length; j++) {
      if (!updationNodeHelper(tree.items[j], id, data)) {
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
    request?: RequestBody,
  ) => void = (tree, folderId, type, name, id, request?) => {
    // Iterate through the tree to find the target folder/API Request and add the item
    for (let i = 0; i < tree.length; i++) {
      if (!insertionHelper(tree[i], folderId, type, name, id, request)) {
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
    // Push new collection to the workspace
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
    // Iterate through the tree to find the target folder/API and update the item
    for (let i = 0; i < tree.length; i++) {
      if (tree[i]._id === dummyId) {
        tree[i]._id = originalId;
        setCollectionList(tree);
        return;
      }
    }
    return;
  };

  const updateNodeData: (tree: any, id: string, data: any) => void = (
    tree,
    id,
    data,
  ) => {
    for (let i = 0; i < tree.length; i++) {
      if (!updationNodeHelper(tree[i], id, data)) {
        setCollectionList(tree);
        return;
      }
    }
    return;
  };

  return { insertNode, insertHead, updateNodeId, updateHeadId, updateNodeData };
};
export { collectionList, setCollectionList, useCollectionTree };
