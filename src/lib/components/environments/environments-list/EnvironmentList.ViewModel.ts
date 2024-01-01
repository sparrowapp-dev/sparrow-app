/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EnvironmentDocument } from "$lib/database/app.database";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { EnvironmentService } from "$lib/services/environment.service";
import type { CreateEnvironmentPostBody } from "$lib/utils/dto";

export class EnvironmentListViewModel {
  private environmentRepository = new EnvironmentRepository();
  private EnvironmentService = new EnvironmentService();
  constructor() {}

  public getEnvironmentDocument = (elem: EnvironmentDocument) => {
    return {
      id: elem.get("id"),
      name: elem.get("name"),
      type: elem.get("type"),
      isActive: elem.get("isActive"),
      variable: elem.get("variable"),
      createdBy: elem.get("createdBy"),
      createdAt: elem.get("createdAt"),
      updatedBy: elem.get("updatedBy"),
      updatedAt: elem.get("updatedAt"),
    };
  };

  public activateEnvironment = (id: string): void => {
    this.environmentRepository.setActiveEnvironment(id);
  };

  public getAllEnvironments = async (workspaceId: string) => {
    return await this.EnvironmentService.fetchAllEnvironments(workspaceId);
  };

  public get environment() {
    return this.environmentRepository.getEnvironment();
  }

  public addEnvironment = async (environment: CreateEnvironmentPostBody) => {
    return await this.EnvironmentService.addEnvironment(environment);
  };

  public bulkInsert = (data: any) => {
    this.environmentRepository.bulkInsertData(data);
  };

  public removeEnvironment = (environmentId: string): void => {
    this.environmentRepository.removeEnvironment(environmentId);
  };
  public deleteEnvironment = (
    workspaceId: string,
    environmentId: string,
  ): void => {
    this.EnvironmentService.deleteEnvironment(workspaceId, environmentId);
  };
}
