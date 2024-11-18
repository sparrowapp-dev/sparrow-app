export interface IdWrapper2 {
  id: string;
}

export interface Workspace extends IdWrapper2 {}

export interface WorkspaceWrapper {
  workspace: Workspace;
}
