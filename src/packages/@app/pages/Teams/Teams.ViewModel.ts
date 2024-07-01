import { user } from "$lib/store";
import { generateSamepleTeam } from "$lib/utils/sample";
import { TabRepository } from "@app/repositories/tab.repository";
import { TeamRepository } from "@app/repositories/team.repository";
import { TeamService } from "@app/services/team.service";
import { notifications } from "@library/ui/toast/Toast";

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
          isNewInvite,
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
          isNewInvite,
        };
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
    const teamObj = generateSamepleTeam(name, description, file, userId);
    const response = await this.teamService.createTeam(teamObj);

    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      await this.refreshTeams(userId);
      await this.teamRepository.setOpenTeam(response.data.data?._id);

      notifications.success(`New team ${teamObj.name} is created.`);
    } else {
      notifications.error(
        response.message ?? "Failed to create a new team. Please try again.",
      );
    }
    return response;
  };
}
