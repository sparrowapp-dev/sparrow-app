import { ItemType } from "../enums/item-type.enum";
import { WorkspaceDefault } from "../enums/request.enum";

const generateSampleWorkspace = (_id: string, date: string, name?: string) => {
  return {
    _id,
    name: name ? name : WorkspaceDefault.NAME,
    type: ItemType.WORKSPACE,
    description: "",
    property: {
      workspace: {
        requestCount: 0,
        collectionCount: 0,
      },
    },
    team: [],
    owner: "",
    users: [],
    isActiveWorkspace: true,
    environmentId: "",
    collections: [],
    currentEnvironmentId: "",
    environments: [],
    save: true,
    path: { workspaceId: "", collectionId: "" },
    createdAt: date,
    createdBy: "",
  };
};
export { generateSampleWorkspace };
