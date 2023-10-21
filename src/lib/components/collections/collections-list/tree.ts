import { collectionList, setCollectionList } from "$lib/store/collection";

let tree;

collectionList.subscribe((value) => {
  tree = JSON.parse(JSON.stringify(value));
});

const helper = (
  tree,
  folderId: string,
  type: string,
  name: string,
  method: string,
) => {
  if (tree._id === folderId || tree.id === folderId) {
    if (type === "FILE") {
      tree.items.push({
        id: new Date(),
        name: name,
        type: type,
        request: {
          method: method,
        },
      });
      return 0;
    } else if (type === "FOLDER") {
      tree.items.push({
        id: new Date(),
        name,
        description: "",
        type,
        items: [],
      });
      return 0;
    }
  }

  if (tree && tree.items) {
    for (let j = 0; j < tree.items.length; j++) {
      if (!helper(tree.items[j], folderId, type, name, method)) return 0;
    }
  }
  return 1;
};

const insertTreeNode = (
  folderId: string,
  type: string,
  name: string,
  method?: string,
): void => {
  for (let i = 0; i < tree.length; i++) {
    if (!helper(tree[i], folderId, type, name, method)) {
      setCollectionList(tree);
      return;
    }
  }
};

export { insertTreeNode };
