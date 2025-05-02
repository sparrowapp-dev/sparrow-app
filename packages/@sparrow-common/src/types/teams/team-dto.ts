import type { TeamRoleBaseEnum } from "./team-base";

export interface TeamLogoDtoInterface {
  bufferString?: string;
  encoding?: string;
  mimetype?: string;
  size?: number;
}

export interface TeamWorkspaceDtoInterface {
  id: string; // MongoDB ObjectId as string
  name: string;
}

export interface TeamUserDtoInterface {
  id: string; // MongoDB ObjectId as string
  email: string;
  name: string;
  role: TeamRoleBaseEnum;
}

export interface TeamDtoInterface {
  name: string;
  description?: string;
  xUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  logo?: TeamLogoDtoInterface;
  workspaces?: TeamWorkspaceDtoInterface[];
  users: TeamUserDtoInterface[];
  owner: string[];
  admins?: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  createdBy?: string;
  updatedBy?: string;
  isNewInvite?: boolean;
}
