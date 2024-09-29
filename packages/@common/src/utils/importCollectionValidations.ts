import yaml from "js-yaml";
export function isUrlValid(str: string) {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR IP (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$", // fragment locator
    "i",
  );
  return pattern.test(str);
}

import { ItemType } from "@sparrow/common/enums/item-type.enum";
import type { Collection } from "@sparrow/common/interfaces/collection.interface";
// import {
//   selectMethodsStore,
//   selectedMethodsCollectionStore,
// } from "@app/store/auth.store/methods";
import { ContentTypeEnum } from "../enums";
/* eslint-disable @typescript-eslint/no-explicit-any */
let tree: any[];
const filterTree: Collection[] = [];
let selectedAPIMethods: string[] = [];
// selectMethodsStore.subscribe((value) => {
//   if (value) {
//     selectedAPIMethods = value;
//   }
// });

export const debounce = (func, delay = 1000) => {
  let timerId: any;

  return function (...args) {
    /* eslint-disable @typescript-eslint/no-this-alias */
    const context = this;

    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

export const validateClientURL = (url = "") => {
  const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlPattern.test(url);
};

export const validateClientJSON = (jsonString = "") => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};

export const validateClientXML = (yamlString = "") => {
  try {
    const parsedYaml = yaml.load(yamlString);

    // Check if parsed content is either an object or an array
    return (
      typeof parsedYaml === "object" &&
      parsedYaml !== null &&
      !Array.isArray(parsedYaml)
    );
  } catch (error) {
    return false;
  }
};

export const validateImportBody = (data: string) => {
  let contentType;
  try {
    JSON.parse(data);
    return (contentType = ContentTypeEnum["application/json"]);
  } catch (jsonError) {
    if (jsonError instanceof SyntaxError) {
      try {
        yaml.load(data);
        return (contentType = ContentTypeEnum["text/plain"]);
      } catch (yamlError) {
        return contentType;
      }
    } else {
      return contentType;
    }
  }
};
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
  workspaceId: string,
  path: string[],
  folderDetails: Record<string, string>,
  activeSync: boolean,
) => void = (
  tree,
  searchText,
  collection,
  folder,
  file,
  collectionId,
  workspaceId,
  path,
  folderDetails,
  activeSync,
) => {
  const treeDoc = tree;
  if (!tree.name) {
    tree = tree._data;
  }
  if (tree.name.toLowerCase().includes(searchText.toLowerCase())) {
    if (tree.type === "REQUEST") {
      file.push({
        tree: JSON.parse(JSON.stringify(tree)),
        collectionId,
        workspaceId,
        folderDetails,
        path: createPath(path),
        activeSync,
      });
    } else if (tree.type === "FOLDER") {
      folder.push({
        tree: JSON.parse(JSON.stringify(tree)),
        collectionId,
        workspaceId,
        path: createPath(path),
        activeSync,
      });
    } else {
      collection.push({
        tree: treeDoc,
        collectionId,
        workspaceId,
        path: createPath(path),
        activeSync,
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
        workspaceId,
        path,
        tree.type === "FOLDER" ? { id: tree.id, name: tree.name } : {},
        activeSync,
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
        // setCollectionList(tree);
        return;
      }
    }
    return;
  };
  const insertHead: (name: string, _id: string) => void = (name, _id) => {
    // Iterate through the tree to find the target folder and add the item
    tree.push({ name, _id, items: [] });
    // setCollectionList(tree);
    return;
  };
  const searchNode: (
    searchText: string,
    collection: any[],
    folder: any[],
    file: any[],
    collectionData: any[],
  ) => void = (searchText, collection, folder, file, collectionData) => {
    const filteredByMethodTrees = [];
    tree = collectionData;
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
      searchHelper(
        filteredTrees[i],
        searchText,
        collection,
        folder,
        file,
        filteredTrees[i].id,
        filteredTrees[i].workspaceId,
        path,
        {},
        filteredTrees[i]?.activeSync,
      );
    }
    return;
  };
  return [insertNode, insertHead, searchNode];
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
