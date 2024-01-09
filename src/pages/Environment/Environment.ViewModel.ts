import { EnvironmentTabRepository } from "$lib/repositories/environment-tab.repository";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import { EnvironmentService } from "$lib/services/environment.service";
import type { CreateEnvironmentPostBody } from "$lib/utils/dto";

export class EnvironmentViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private environmentTabRepository = new EnvironmentTabRepository();
  private environmentService = new EnvironmentService();

  constructor() {}

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

  public get getactiveEnvironmentTab() {
    return this.environmentTabRepository.getEnvironmentTab();
  }

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

  public initActiveEnvironmentToWorkspace = async (
    workspaceId: string,
    environmentId: string,
  ) => {
    this.workspaceRepository.updateWorkspace(workspaceId, { environmentId });
  };

  public createEnvironmentTab = async (tab, workspaceId: string) => {
    this.environmentTabRepository.createTab(tab, workspaceId);
  };

  public setEnvironmentTabProperty = async (data, route, environmentId) => {
    this.environmentTabRepository.setEnvironmentTabProperty(
      data,
      route,
      environmentId,
    );
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
