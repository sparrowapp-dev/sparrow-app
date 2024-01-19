//------- Team Interface ------------//
export interface TeamPostBody {
  name: string;
  description: string;
}

interface Workspace {
  id: string;
  name: string;
}

export interface InviteBody {
  users: string[];
  role: string;
  workspaces?: Workspace[];
}
