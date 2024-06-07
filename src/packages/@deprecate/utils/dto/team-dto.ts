//------- Team Interface ------------//
export interface TeamPostBody {
  name: string;
  description: string;
  owner: string;
  image?: File;
  createdAt: string;
  createdBy: string;
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
