export enum TeamRoleBaseEnum {
    OWNER = "owner",
    ADMIN = "admin",
    MEMBER = "member",
  }

interface TeamWorkspaceBaseInterface {
    workspaceId: string;
    name: string;
  }
  
  interface TeamUserBaseInterface {
    id: string;
    email: string;
    name: string;
    role: TeamRoleBaseEnum;
  }
  
  export interface TeamBaseInterface {
    teamId: string;
    name: string;
    logo: object;
    workspaces: TeamWorkspaceBaseInterface[];
    users: TeamUserBaseInterface[];
    owner: string;
    admins: string[];
    isActiveTeam: boolean;
    isOpen: boolean;
    isNewInvite: boolean;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
  }