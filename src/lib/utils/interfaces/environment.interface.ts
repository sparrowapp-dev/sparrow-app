import type { EnvironmentDocument } from "$lib/database/app.database";
import type { Observable } from "rxjs";
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EnvironmentRepositoryMethods {
  getActiveWorkspace: () => Observable<any>;
  bulkInsert: (data: any) => any;
  getEnvironmentDocument: (data: EnvironmentDocument) => any;
  addEnvironment: (environment) => void;
  updateEnvironment: (uuid: string, data) => void;
  getParticularEnvironment: (environmentId: string) => any;
}

export interface EnvironmentServiceMethods {
  getAllEnvironments: (workspaceId: string) => any;
  getEnvironment: (workspaceId: string, environmentId: string) => any;
  updateEnvironment: (
    workspaceId: string,
    environmentId: string,
    data: any,
  ) => any;
}
