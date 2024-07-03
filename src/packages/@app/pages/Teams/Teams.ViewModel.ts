import { TeamAdapter } from "@app/adapter";
import { TabRepository } from "@app/repositories/tab.repository";
import { TeamRepository } from "@app/repositories/team.repository";
import { TeamService } from "@app/services/team.service";
import { notifications } from "@library/ui/toast/Toast";
import { user } from "$lib/store";

import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { CollectionRepository } from "@app/repositories/collection.repository";
import { GithubRepoReposistory } from "@app/repositories/github-repo.repository";
import { GithubService } from "@app/services/github.service";
import { moveNavigation } from "$lib/utils/helpers";
import { navigate } from "svelte-navigator";
export class TeamsViewModel {
  constructor() {}
  private teamRepository = new TeamRepository();
  private workspaceRepository = new WorkspaceRepository();
  private tabRepository = new TabRepository();
  private teamService = new TeamService();
  private githhubRepoRepository = new GithubRepoReposistory();
  private githubService = new GithubService();

  private collectionRepository = new CollectionRepository();

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
    await this.workspaceRepository.setActiveWorkspace(id);
    navigate("/dashboard/collections");
  };

 /**
   * Switch from one team to another
   * @param id - Workspace id
   */
 public setOpenTeam = async (id: string) => {
  await this.teamRepository.setOpenTeam(id);
};


  /**
   * Switch to latest tab on Api Click
   * @param id - Api id
   */
  public handleApiClick = (api: any): void => {
   this.tabRepository.activeTab(api.id)
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
}
