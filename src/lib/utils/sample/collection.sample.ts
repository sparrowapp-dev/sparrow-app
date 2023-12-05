import { ItemType } from "../enums/item-type.enum";

const generateSampleCollection = (id: string, date: string) => {
  return {
    id,
    name: "My Collection",
    type: ItemType.COLLECTION,
    description: "",
    property: {},
    save: false,
    path: {},
    createdAt: date,
  };
};
export { generateSampleCollection };
