export interface CurrentWorkspace {
  name: string;
  id: string;
}

export interface WorkspaceMethods {
  handleCreateTab: (data) => void;
}
