import { ItemType } from "../enums/item-type.enum";
import { CollectionDefault } from "../enums/request.enum";
import type { NewTab } from "../interfaces/request.interface";

const generateSampleCollection = (id: string, date: string): NewTab => {
  return {
    id,
    name: CollectionDefault.NAME,
    type: ItemType.COLLECTION,
    description: "",
    property: {
      collection: {
        requestCount: 0,
        folderCount: 0,
      },
    },
    save: false,
    path: { workspaceId: "", collectionId: "" },
    isActive: true,
    createdAt: date,
  };
};
export { generateSampleCollection };
