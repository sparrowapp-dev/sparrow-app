import { ItemType } from "../enums/item-type.enum";
import { WorkspaceDefault } from "../enums/request.enum";
import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
const _workspaceViewModel = new HeaderDashboardViewModel();

const generateSampleWorkspace = (id: string, date: string, name?: string) => {
  const defaultWorkspaceName = generateUniqueWorkspaceName();
  return {
    _id: id,
    name: name ? name : defaultWorkspaceName,
    type: ItemType.WORKSPACE,
    description: "",
    property: {
      workspace: {
        requestCount: 0,
        collectionCount: 0,
      },
    },
    team: {
      teamId: "",
      teamName: "",
    },
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

function generateUniqueWorkspaceName() {
  const existingWorkspaces = [];
  const workspacesObservable = _workspaceViewModel.workspaces;
  workspacesObservable.subscribe((workspaces) => {
    workspaces.map((workspace) => {
      existingWorkspaces.push(workspace._data.name);
    });
  });
  if (!existingWorkspaces.length) {
    return WorkspaceDefault.NAME;
  }
  let counter = 2;
  while (
    existingWorkspaces.includes(
      WorkspaceDefault.NAME + (counter > 1 ? ` ${counter}` : ""),
    )
  ) {
    counter++;
  }

  return WorkspaceDefault.NAME + (counter > 1 ? ` ${counter}` : "");
}

export { generateSampleWorkspace };
