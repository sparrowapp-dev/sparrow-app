interface AuthProvider {
  name: string;
  oAuthId: string;
}
interface UserWorkspaceDto {
  workspaceId: string;
  name: string;
}
export class TeamDto {
  id: string;
  name: string;
}

export interface User {
  name: string;
  email: string;
  password?: string;
  authProviders?: AuthProvider[];
  teams: TeamDto[];
  personalWorkspaces: UserWorkspaceDto[];
  createdAt?: Date;
  updatedAt?: Date;
  refresh_tokens?: string[];
}
