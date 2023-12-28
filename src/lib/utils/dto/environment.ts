import type { EnvValuePair } from "../interfaces/request.interface";

export interface CreateEnvironmentPostBody {
  name: string;
  workspaceId: string;
  variable: EnvValuePair[];
}

export interface UpdateEnvironmentPostBody {
  name: string;
  variable: EnvValuePair[];
}
