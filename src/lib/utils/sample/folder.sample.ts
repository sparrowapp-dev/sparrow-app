import { ItemType } from "../enums/item-type.enum";
import { FolderDefault } from "../enums/request.enum";
import type { NewTab } from "../interfaces/request.interface";

const generateSampleFolder = (id: string, date: string): NewTab => {
  return {
    id,
    name: FolderDefault.NAME,
    type: ItemType.FOLDER,
    description: "",
    property: {
      folder: {
        requestCount: 0,
        folderCount: 0,
      },
    },
    save: true,
    path: {
      workspaceId: "",
      collectionId: "",
      folderId: "",
      folderName: "",
    },
    isActive: true,
    createdAt: date,
  };
};
export { generateSampleFolder };
