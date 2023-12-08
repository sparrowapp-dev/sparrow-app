import { ItemType } from "../enums/item-type.enum";

const generateSampleWorkspace = (id: string, date: string) => {
  return {
    id,
    name: "MY WORKSPACE",
    type: ItemType.WORKSPACE,
    description: "",
    property: {
      workspace: {
        requestCount: 0,
        collectionCount: 0,
      },
    },
    save: true,
    path: { workspaceId: "" },
    isActive: true,
    createdAt: date,
  };
};
export { generateSampleWorkspace };
