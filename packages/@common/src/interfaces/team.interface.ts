export interface CurrentTeam {
  name: string;
  id: string;
  base64String: object;
}

export interface Team {
  name: string;
  description?: string;
  logo?: logoDto;
  workspaces?: WorkspaceDto[];
  users: UserDto[];
  owner: string;
  admins?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  isNewInvite?: boolean;
}

export interface WorkspaceDto {
  id: string;
  name: string;
}

export interface UserDto {
  id: string;
  role: string;
  name: string;
  email: string;
}
export class logoDto {
  bufferString?: string;
  encoding?: string;
  mimetype?: string;
  size?: number;
}
