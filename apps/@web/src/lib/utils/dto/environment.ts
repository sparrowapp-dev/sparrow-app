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

export interface EnvironmentDto {
  _id: string;
  name: string;
  type: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  variable: EnvValuePair[];
}

export interface EnvironmentResponseDto {
  isSuccessful: boolean;
  messagee: string;
  status: string;
  tabId: string;
  data: UpdateEnvironmentResponseDto;
}

export interface UpdateEnvironmentResponseDto {
  data: EnvironmentDto;
  httpStatusCode: number;
  message: string;
}
