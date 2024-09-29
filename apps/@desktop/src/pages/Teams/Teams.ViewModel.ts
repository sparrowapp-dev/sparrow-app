import { TeamAdapter } from "../../adapter";
import { TabRepository } from "../../repositories/tab.repository";
import { TeamRepository } from "../../repositories/team.repository";
import { TeamService } from "../../services/team.service";
import { notifications } from "@sparrow/library/ui";
import { user } from "@app/store/auth.store";

import { WorkspaceRepository } from "../../repositories/workspace.repository";
import { CollectionRepository } from "../../repositories/collection.repository";
import { GithubRepoReposistory } from "../../repositories/github-repo.repository";
import { GithubService } from "../../services/github.service";
import { moveNavigation } from "@deprecate/utils/helpers";
import { navigate } from "svelte-navigator";
import { InitWorkspaceTab } from "@sparrow/common/utils";
import { GuestUserRepository } from "../../repositories/guest-user.repository";
import type { MakeRequestResponse } from "@deprecate/utils/interfaces/common.interface";
import type { Team } from "@deprecate/utils/interfaces";
import { UserService } from "../../services/user.service";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { Events } from "@deprecate/utils/enums";

export class TeamsViewModel {
  constructor() {}
  private teamRepository = new TeamRepository();
  private workspaceRepository = new WorkspaceRepository();
  private tabRepository = new TabRepository();
  private teamService = new TeamService();
  private githhubRepoRepository = new GithubRepoReposistory();
  private githubService = new GithubService();
  private guestUserRepository = new GuestUserRepository();

  private collectionRepository = new CollectionRepository();
  private userService = new UserService();

  /**
   * @description - get environment list from local db
   */
  get teams() {
    const teams = this.teamRepository.getTeams();
    return teams;
  }

  /**
   * @description - get environment list from local db
   */
  get tabs() {
    const tabs = this.tabRepository.getTabList();
    return tabs;
  }

  /**
   * @description - get open team from local db
   */
  public get openTeam() {
    return this.teamRepository.getOpenTeam();
  }

  /**
   * sync teams data with backend server
   * @param userId - used to query teams with field userId
   */
  public refreshTeams = async (userId: string): Promise<void> => {
    let openTeamId: string = "";
    const teamsData = await this.teamRepository.getTeamData();
    teamsData.forEach((element) => {
      const elem = element.toMutableJSON();
      if (elem.isOpen) openTeamId = elem.teamId;
    });
    const response = await this.teamService.fetchTeams(userId);
    if (response?.isSuccessful && response?.data?.data) {
      const data = response.data.data.map((elem) => {
        const teamAdapter = new TeamAdapter();
        return teamAdapter.adapt(elem).getValue();
      });
      if (openTeamId) {
        data.forEach((elem) => {
          if (elem.teamId === openTeamId) {
            elem.isOpen = true;
          } else {
            elem.isOpen = false;
          }
        });
      } else {
        data[0].isOpen = true;
      }
      await this.teamRepository.bulkInsertData(data);
    }
  };

  /**
   * creates a new team
   * @param name - team name
   * @param description - team description
   * @param file - team base-64 icon
   * @returns
   */
  public createTeam = async (name: string, description: string, file: File) => {
    let userId = "";
    user.subscribe(async (value) => {
      if (value) {
        userId = value._id;
      }
    })();

    const team = {
      name: name,
      description: description,
      image: file,
      owner: userId.toString(),
      createdAt: new Date().toISOString(),
      createdBy: userId.toString(),
    };
    const response = await this.teamService.createTeam(team);

    if (response?.isSuccessful && response?.data?.data) {
      const teamAdapter = new TeamAdapter();
      const adaptedTeam = teamAdapter.adapt(response.data.data).getValue();
      await this.teamRepository.insert(adaptedTeam);
      await this.teamRepository.setOpenTeam(response.data.data?._id);
      notifications.success(`New team ${team.name} is created.`);
    } else {
      notifications.error("Failed to create a new team. Please try again.");
    }
    MixpanelEvent(Events.CREATE_NEW_TEAM);
    return response;
  };
  /**
   * Getting all workspace data
   */
  public get workspaces() {
    return this.workspaceRepository.getWorkspaces();
  }

  /**
   * Getting all the collection
   */
  public get collection() {
    return this.collectionRepository.getCollection();
  }

  /**
   * Switch from one workspace to another
   * @param id - Workspace id
   */
  public handleSwitchWorkspace = async (id: string) => {
    const res = await this.workspaceRepository.readWorkspace(id);
    const initWorkspaceTab = new InitWorkspaceTab(id, id);
    initWorkspaceTab.updateId(id);
    initWorkspaceTab.updateName(res.name);
    await this.tabRepository.createTab(initWorkspaceTab.getValue(), id);
    await this.workspaceRepository.setActiveWorkspace(id);
    navigate("/dashboard/collections");
  };

  /**
   * Switch from one team to another
   * @param id - team id
   */
  public setOpenTeam = async (id: string) => {
    await this.teamRepository.setOpenTeam(id);
  };

  /**
   * Switch to latest tab on Api Click
   * @param id - Api id
   */
  public handleApiClick = async (api: any): void => {
    await this.tabRepository.activeTab(api.id, api.path.workspaceId);
    await this.workspaceRepository.setActiveWorkspace(api.path.workspaceId);
    moveNavigation("right");
    navigate("/dashboard/collections");
  };

  /**
   * @description - Fetches github repository data
   */
  public getGithubRepo = async () => {
    const githubRepoId = "sparrow-github";
    const document = await this.githhubRepoRepository.findOne({
      id: githubRepoId,
    });
    return document;
  };

  /**
   * @description - refreshes github respository data
   */
  public fetchGithubRepo = async () => {
    const githubRepoId = "sparrow-github";
    const response = await this.githubService.getRepoMetaData(
      "sparrowapp-dev/sparrow-app",
    );
    if (response.isSuccessful) {
      const githubDocument = await this.githhubRepoRepository.findOne({
        id: githubRepoId,
      });
      if (!githubDocument) {
        await this.githhubRepoRepository.insert({
          id: githubRepoId,
          stargazers_count: response.data.stargazers_count,
        });
      } else {
        await this.githhubRepoRepository.update(
          {
            id: githubRepoId,
          },
          {
            stargazers_count: response.data.stargazers_count,
          },
        );
      }
      return response.data;
    }
  };

  /**
   * Fetch guest user state
   * @returns boolean for is user guest user or not
   */
  public getGuestUser = async () => {
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    return isGuestUser;
  };

  /**
   * Disable the new invite tag for a user in a specific team.
   * @param teamId - The ID of the team for which the new invite tag should be disabled.
   * @returns A Promise that resolves to the updated Team object if successful, otherwise undefined.
   */
  public disableNewInviteTag = async (
    teamId: string,
  ): Promise<Team | undefined> => {
    let loggedInUserId = "";
    user.subscribe((value) => {
      loggedInUserId = value?._id;
    });
    const response: MakeRequestResponse =
      await this.userService.disableNewInviteTag(loggedInUserId, teamId);
    if (response.isSuccessful === true) {
      return response.data.data;
    }
    return;
  };

  /**
   * Modify a team's details.
   * @param teamId - The ID of the team to modify.
   * @param team - An object containing the updated team details.
   * @returns A Promise that resolves when the team modification is complete.
   */
  public modifyTeam = async (teamId: string, team: any): Promise<void> => {
    await this.teamRepository.modifyTeam(teamId, team);
  };
}
