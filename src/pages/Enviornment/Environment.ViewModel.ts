import { EnvironmentRepository } from "$lib/repositories/evironment.repository";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";

export class EnvironmentViewModel {
  private environmentRepository = new EnvironmentRepository();
  private workspaceRepository = new WorkspaceRepository();
  constructor() {}

  public getActiveWorkspace = () => {
    return this.workspaceRepository.getActiveWorkspace();
  };
}
