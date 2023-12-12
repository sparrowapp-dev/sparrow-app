import { WorkspaceService } from "$lib/services/workspace.service";

import { WorkspaceRepository } from "$lib/repositories/workspace.repository";

import type { WorkspaceDocument } from "$lib/database/app.database";

export class WorkspaceViewModel {
  constructor() {}
  private workspaceRepository = new WorkspaceRepository();

  private workspaceService = new WorkspaceService();

  public getWorkspaceDocument = (elem: WorkspaceDocument) => {
    return {
      _id: elem.get("_id"),
      name: elem.get("name"),
      collections: elem.get("collections"),
    };
  };

  public addWorkspace = (workspace) => {
    this.workspaceRepository.addWorkspace(workspace);
  };

  public updateWorkspace = (workspaceId: string, name: string) => {
    this.workspaceRepository.updateWorkspace(workspaceId, name);
  };

  public createWorkspace = async (workspace) => {
    const response = await this.workspaceService.createWorkspace(workspace);
    return response;
  };
}
