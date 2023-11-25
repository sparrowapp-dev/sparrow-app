import { ItemType } from "../enums/item-type.enum";

const generateSampleWorkspace = (id: string, date: string) => {
  return {
    id,
    name: "My Workspace",
    type: ItemType.WORKSPACE,
    description: "",
    property: {},
    save: false,
    path: {},
    createdAt: date,
  };
};
export { generateSampleWorkspace };
