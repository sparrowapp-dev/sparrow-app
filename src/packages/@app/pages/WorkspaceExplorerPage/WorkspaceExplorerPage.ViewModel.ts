import { TabRepository } from "@app/repositories/tab.repository";
import { TeamRepository } from "@app/repositories/team.repository";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { CollectionService } from "@app/services/collection.service";
import { WorkspaceService } from "@app/services/workspace.service";
import { InitWorkspaceTab } from "@common/utils/init-workspace-tab";

export default class WorkspaceExplorerViewModel {
  // Private Repositories
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();
  private teamRepository = new TeamRepository();

  // Private Services
  private collectionService = new CollectionService();
  private workspaceService = new WorkspaceService();
  constructor() {}

  /**
   * Get active tab(if any)
   * @returns :Observable<any> | undefined - active tab
   */
  public getActiveTab = () => {
    return this.tabRepository.getTab();
  };

  get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  public readTeam = async (teamId: string) => {
    return await this.teamRepository.getTeam(teamId);
  };
  /**
   * Updates the name of a workspace and reflects the changes in the associated tab.
   * @param - The ID of the workspace to be updated.
   * @param - The new name for the workspace.
   * @returns  A promise that resolves when the workspace name is updated.
   */
  public updateWorkspaceName = async (workspaceId: string, newName: string) => {
    const response = await this.workspaceService.updateWorkspace(workspaceId, {
      name: newName,
    });

    if (response) {
      const updatedata = {
        name: newName,
        updatedAt: response.data.data.updatedAt,
      };
      let tabId = "";
      await this.workspaceRepository.updateWorkspace(workspaceId, updatedata);
      await this.getActiveTab().subscribe((tab: any) => {
        tabId = tab.tabId;
      });
      await this.tabRepository.updateTab(tabId, updatedata);
      const initWorkspaceTab = new InitWorkspaceTab(
        response.data.data._id,
        workspaceId,
      );
      return initWorkspaceTab.updateName(newName);
    }
  };

  /**
   * Updates the description of a workspace and synchronizes the change with the relevant repositories.
   *
   * @param - The ID of the workspace to be updated.
   * @param  - The new description to be set for the workspace.
   * @returns - A promise that resolves when the description update is complete.
   */

  public updateWorkspaceDescription = async (
    workspaceId: string,
    newDescription: string,
  ) => {
    const response = await this.workspaceService.updateWorkspace(workspaceId, {
      description: newDescription,
    });

    if (response) {
      const updatedata = {
        description: newDescription,
      };
      await this.workspaceRepository.updateWorkspace(workspaceId, updatedata);
      let tabId = "";
      const res = await this.getActiveTab();
      res.subscribe((tab: any) => {
        tabId = tab.tabId;
      });
      await this.tabRepository.updateTab(tabId, updatedata);
      const initWorkspaceTab = new InitWorkspaceTab(
        response.data.data._id,
        workspaceId,
      );
      return initWorkspaceTab.updateName(newDescription);
    }
  };
}
