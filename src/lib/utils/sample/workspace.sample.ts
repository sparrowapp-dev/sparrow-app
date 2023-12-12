import { ItemType } from "../enums/item-type.enum";
import { WorkspaceDefault } from "../enums/request.enum";

const generateSampleWorkspace = (id: string, date: string) => {
  return {
    id,
    name: WorkspaceDefault.NAME,
    type: ItemType.WORKSPACE,
    description: "",
    property: {
      workspace: {
        requestCount: 0,
        collectionCount: 0,
      },
    },
    save: true,
    path: { workspaceId: "", collectionId: "" },
    isActive: true,
    createdAt: date,
  };
};
export { generateSampleWorkspace };
