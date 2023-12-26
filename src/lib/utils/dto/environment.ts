import type { EnvValuePair } from "../interfaces/request.interface";

export interface CreateEnvironmentPostBody {
  name: string;
  workspaceId: string;
  variable: EnvValuePair[];
}
