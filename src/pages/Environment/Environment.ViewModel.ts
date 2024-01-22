import { EnvironmentTabRepository } from "$lib/repositories/environment-tab.repository";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import { EnvironmentService } from "$lib/services/environment.service";
import type { CreateEnvironmentPostBody } from "$lib/utils/dto";
import { environmentType } from "$lib/utils/enums/environment.enum";
import { generateSampleEnvironment } from "$lib/utils/sample/environment.sample";

export class EnvironmentViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private environmentTabRepository = new EnvironmentTabRepository();
  private environmentService = new EnvironmentService();

  constructor() {}

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

  public getactiveEnvironmentTab = (workspaceId: string) => {
    return this.environmentTabRepository.getEnvironmentTab(workspaceId);
  };

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

  public deleteEnvironmentTab = async (environmentId) => {
    const flag =
      await this.environmentTabRepository.deleteEnvironmentTab(environmentId);
    if (flag) {
      const globalEnvironment =
        await this.environmentRepository.getGlobalEnvironment();
      const sampleEnvironment = generateSampleEnvironment(
        globalEnvironment.id,
        globalEnvironment.workspaceId,
        new Date().toString(),
      );
      sampleEnvironment.name = globalEnvironment.name;
      sampleEnvironment.isActive = true;
      sampleEnvironment.type = environmentType.GLOBAL;
      sampleEnvironment.variable = globalEnvironment.variable;

      this.createEnvironmentTab(
        sampleEnvironment,
        sampleEnvironment.workspaceId,
      );
    }
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
