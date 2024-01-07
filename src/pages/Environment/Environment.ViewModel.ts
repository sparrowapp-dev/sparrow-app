import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import { EnvironmentService } from "$lib/services/environment.service";
import type { CreateEnvironmentPostBody } from "$lib/utils/dto";

export class EnvironmentViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private environmentService = new EnvironmentService();
  constructor() {}

  public getActiveWorkspace = () => {
    return this.workspaceRepository.getActiveWorkspace();
  };

  public createEnvironment = (environment) => {
    this.environmentRepository.addEnvironment(environment);
  };

  public updateEnvironment = (uuid, data) => {
    this.environmentRepository.updateEnvironment(uuid, data);
  };

  public deleteEnvironment = (id) => {
    this.environmentRepository.removeEnvironment(id);
  };

  // activates environment
  public activateEnvironment = (id: string): void => {
    this.environmentRepository.setActiveEnvironment(id);
  };

  public get activeEnvironment() {
    return this.environmentRepository.getActiveEnvironment();
  }

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

  public currentEnvironment = async (id: string) => {
    return await this.environmentRepository.getCurrentEnvironment(id);
  };

  public refreshEnvironment = async (data) => {
    this.environmentRepository.refreshEnvironment(data);
  };

  // services -----------------------------------------------------------
  public getServerEnvironments = async (workspaceId: string) => {
    return await this.environmentService.fetchAllEnvironments(workspaceId);
  };

  public deleteServerEnvironment = (
    environmentId: string,
    workspaceId: string,
  ) => {
    return this.environmentService.deleteEnvironment(
      workspaceId,
      environmentId,
    );
  };

  public createServerEnvironment = async (
    environment: CreateEnvironmentPostBody,
  ) => {
    return await this.environmentService.addEnvironment(environment);
  };

  public updateServerEnvironment = async (
    workspaceId: string,
    environmentId: string,
    data,
  ) => {
    return this.environmentService.updateEnvironment(
      workspaceId,
      environmentId,
      data,
    );
  };
}
