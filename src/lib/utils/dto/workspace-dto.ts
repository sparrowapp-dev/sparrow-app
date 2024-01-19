//------- workspace Interface ------------//
export interface WorkspacePostBody {
  name: string;
  id: string;
}

export interface WorkspacePutBody {
  name?: string;
  description?: string;
}
