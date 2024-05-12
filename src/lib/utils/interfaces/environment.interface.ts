import type { Observable } from "rxjs";
import type { CreateEnvironmentPostBody } from "../dto";
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EnvironmentRepositoryMethods {
  getActiveWorkspace: () => Observable<any>;
  createEnvironment: (environment) => void;
  updateEnvironment: (uuid: string, data) => void;
  removeEnvironment: (environmentId: string) => void;
  initActiveEnvironmentToWorkspace: (
    workspaceId: string,
    environmentId: string,
  ) => void;

  createEnvironmentTab: (tab, workspaceId: string) => void;
  deleteEnvironmentTab: (environmentId: string) => void;
}

export interface EnvironmentServiceMethods {
  getEnvironments: (workspaceId: string) => any;
  updateEnvironment: (
    workspaceId: string,
    environmentId: string,
    data: any,
  ) => any;
  deleteEnvironment: (environentId: string, workspaceId: string) => any;
  createEnvironment: (environment: CreateEnvironmentPostBody) => any;
}
