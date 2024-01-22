import { WorkspaceService } from "$lib/services/workspace.service";

import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import {
  requestResponseStore,
  tabs,
} from "$lib/store/request-response-section";
import { TabRepository } from "$lib/repositories/tab.repository";
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { TeamService } from "$lib/services/team.service";
import { TeamRepository } from "$lib/repositories/team.repository";
import type { TeamDocument } from "$lib/database/app.database";

export class TeamViewModel {
  constructor() {}
  private workspaceRepository = new WorkspaceRepository();
  private tabRepository = new TabRepository();
  private collectionRepository = new CollectionRepository();
  private workspaceService = new WorkspaceService();
  private teamService = new TeamService();
  private teamRepository = new TeamRepository();

  public debounce = (func, delay) => {
    let timerId;

    return function (...args) {
      /* eslint-disable @typescript-eslint/no-this-alias */
      const context = this;

      clearTimeout(timerId);
      timerId = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  };

  public syncTabWithStore = () => {
    this.tabRepository.syncTabsWithStore(tabs);
  };

  debouncedTab = this.debounce(this.syncTabWithStore, 2000);

  get tabs() {
    return requestResponseStore.getTabList();
  }

  public get collection() {
    return this.collectionRepository.getCollection();
  }

  public get workspaces() {
    return this.workspaceRepository.getWorkspaces();
  }

  public get teams() {
    return this.teamRepository.getTeams();
  }

  public get activeTeam() {
    return this.teamRepository.getActiveTeam();
  }

  public get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  public checkActiveTeam = async (teamId: string): Promise<boolean> => {
    return await this.teamRepository.checkActiveTeam(teamId);
  };

  public activateTeam = (teamId: string): void => {
    this.teamRepository.setActiveTeam(teamId);
    return;
  };

  public addTeam = async (team) => {
    await this.teamRepository.createTeam(team);
  };
  public modifyTeam = async (teamId, team) => {
    await this.teamRepository.modifyTeam(teamId, team);
  };

  public createTeam = async (team) => {
    const response = await this.teamService.createTeam(team);
    return response;
  };

  public activateInitialTeamWorkspace = async (): Promise<void> => {
    const workspaceIdToActivate =
      await this.teamRepository.activateInitialTeamWithWorkspace();
    if (workspaceIdToActivate)
      await this.workspaceRepository.setActiveWorkspace(workspaceIdToActivate);
    return;
  };

  public getTeamDocument = (elem: TeamDocument) => {
    return {
      teamId: elem.get("teamId"),
      name: elem.get("name"),
      logo: elem.get("logo"),
      workspaces: elem.get("workspaces"),
      users: elem.get("users"),
      owner: elem.get("owner"),
      admins: elem.get("admins"),
      isActiveTeam: elem.get("isActiveTeam"),
      createdAt: elem.get("createdAt"),
      createdBy: elem.get("createdBy"),
      updatedAt: elem.get("updatedAt"),
      updatedBy: elem.get("updatedBy"),
    };
  };

  public handleCreateTab = (data) => {
    requestResponseStore.createTab(data);
    this.debouncedTab();
  };

  public addWorkspace = async (workspace) => {
    await this.workspaceRepository.addWorkspace(workspace);
  };

  public updateWorkspace = async (id, data) => {
    await this.workspaceRepository.updateWorkspace(id, data);
  };

  public createWorkspace = async (workspace) => {
    const response = await this.workspaceService.createWorkspace(workspace);
    return response;
  };

  // sync teams data with backend server
  public refreshTeams = async (userId: string): Promise<void> => {
    const response = await this.teamService.fetchTeams(userId);
    if (response?.isSuccessful && response?.data?.data) {
      const data = response.data.data.map((elem) => {
        const {
          _id,
          name,
          users,
          logo,
          workspaces,
          owner,
          admins,
          createdAt,
          createdBy,
          updatedAt,
          updatedBy,
        } = elem;
        const updatedWorkspaces = workspaces.map((workspace) => ({
          workspaceId: workspace.id,
          name: workspace.name,
        }));
        return {
          teamId: _id,
          name,
          users,
          logo,
          workspaces: updatedWorkspaces,
          owner,
          admins,
          isActiveTeam: false,
          createdAt,
          createdBy,
          updatedAt,
          updatedBy,
        };
      });
      await this.teamRepository.bulkInsertData(data);
      return;
    }
  };
}
