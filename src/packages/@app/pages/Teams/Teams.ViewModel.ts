import { TeamAdapter } from "@app/adapter";
import { TabRepository } from "@app/repositories/tab.repository";
import { TeamRepository } from "@app/repositories/team.repository";
import { TeamService } from "@app/services/team.service";
import { notifications } from "@library/ui/toast/Toast";
import { user } from "$lib/store";

export class TeamsViewModel {
  constructor() {}
  private teamRepository = new TeamRepository();
  private tabRepository = new TabRepository();
  private teamService = new TeamService();

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
}
