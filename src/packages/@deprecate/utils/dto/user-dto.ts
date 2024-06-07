export interface User {
  _id: string;
  email: string;
  name: string;
  role?: string;
  workspaceId?: string;
  exp?: number;
  iat?: number;
}
