//------- workspace Interface ------------//
export interface WorkspacePostBody {
  name: string;
  type: string;
}

export interface WorkspacePutBody {
  name?: string;
  description?: string;
}
