import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";

export class EnvironmentViewModel {
  private environmentRepository = new EnvironmentRepository();
  private workspaceRepository = new WorkspaceRepository();
  constructor() {}

  public getActiveWorkspace = () => {
    return this.workspaceRepository.getActiveWorkspace();
  };

  public addEnvironment = (environment) => {
    this.environmentRepository.addEnvironment(environment);
  };

  public updateEnvironment = (uuid, data) => {
    this.environmentRepository.updateEnvironment(uuid, data);
  };

  public deleteEnvironment = (id) => {
    this.environmentRepository.removeEnvironment(id);
  };

  public get activeEnvironment() {
    return this.environmentRepository.getActiveEnvironment();
  }

  public currentEnvironment = async (id: string) => {
    return await this.environmentRepository.getCurrentEnvironment(id);
  };
}
