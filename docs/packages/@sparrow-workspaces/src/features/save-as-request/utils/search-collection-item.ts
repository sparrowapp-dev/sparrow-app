import { ItemType } from "@sparrow/common/enums/item-type.enum";

const helper = (tree, id, path) => {
  if (tree._id === id || tree.id === id) {
    path.push({
      name: tree.name,
      id: tree._id ? tree._id : tree.id,
      type: tree.type ? tree.type : ItemType.COLLECTION,
    });
    return {
      items: tree.items,
      path,
    };
  }

  // Recursively search through the tree structure
  if (tree && tree.items) {
    for (let j = 0; j < tree.items.length; j++) {
      path.push({
        name: tree.name,
        id: tree._id ? tree._id : tree.id,
        type: tree.type ? tree.type : ItemType.COLLECTION,
      }); // Recursive backtracking
      const data = helper(tree.items[j], id, path);
      if (data) {
        return data;
      }
      path.pop();
    }
  }
  return 0;
};

const searchTreeDocument = (tree, id) => {
  for (let i = 0; i < tree.length; i++) {
    const path = [];
    const data = helper(tree[i], id, path);
    if (data) {
      return data;
    }
  }
};

export { searchTreeDocument };
