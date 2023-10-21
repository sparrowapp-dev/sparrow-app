import { collectionList, setCollectionList } from "$lib/store/collection";

let tree: object[];

collectionList.subscribe((value: object[]) => {
  tree = JSON.parse(JSON.stringify(value));
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const helper = (
  tree: any,
  folderId: string,
  type: string,
  name: string,
  id: string,
  method?: string,
): number => {
  if (tree._id === folderId || tree.id === folderId) {
    if (type === "FILE") {
      tree.items.push({
        id,
        name,
        type,
        request: {
          method: method,
        },
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

const useTree = () => {
  return [
    (
      folderId: string,
      type: string,
      name: string,
      id: string,
      method?: string,
    ): void => {
      for (let i = 0; i < tree.length; i++) {
        if (!helper(tree[i], folderId, type, name, id, method)) {
          setCollectionList(tree);
          return;
        }
      }
      return;
    },
  ];
};

export { useTree };
