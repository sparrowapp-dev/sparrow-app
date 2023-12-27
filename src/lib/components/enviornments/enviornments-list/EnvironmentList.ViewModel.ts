/* eslint-disable @typescript-eslint/no-explicit-any */
import { EnvironmentRepository } from "$lib/repositories/evironment.repository";
import { EnvironmentService } from "$lib/services/environment.service";

export class EnvironmentListViewModel {
  private environmentReponsitory = new EnvironmentRepository();
  private EnvironmentService = new EnvironmentService();
  constructor() {}

  public getAllEnvironments = async (workspaceId: string) => {
    return await this.EnvironmentService.fetchEnvironment(workspaceId);
  };

  public bulkInsert = (data: any) => {
    this.environmentReponsitory.bulkInsertData(data);
  };
}
