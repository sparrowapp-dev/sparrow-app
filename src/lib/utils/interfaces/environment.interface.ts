import type { Observable } from "rxjs";
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EnvironmentMethods {
  getAllEnvironments: (workspaceId: string) => any;
  getActiveWorkspace: () => Observable<any>;
  bulkInsert: (data: any) => any;
}
