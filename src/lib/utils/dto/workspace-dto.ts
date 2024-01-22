//------- workspace Interface ------------//
export interface WorkspacePostBody {
  name: string;
  id: string;
}

export interface WorkspacePutBody {
  name?: string;
  description?: string;
}

export interface InvalidWorkspacePostBody {
  name: boolean;
  id: boolean;
}
