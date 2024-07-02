import { TabRepository } from "@app/repositories/tab.repository";
import { TeamRepository } from "@app/repositories/team.repository";
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

  public handleApiClick = (api: any): void => {
   
    console.log("Inside handle Click");
    //set new active api req functionality is reamaining
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
