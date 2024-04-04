import { TeamRepository } from "$lib/repositories/team.repository";

export class DashboardViewModel {
  constructor() {}
  private teamRepository = new TeamRepository();

  public getTeamData = async () => {
    return await this.teamRepository.getTeamData();
  };

  public setOpenTeam = async (teamId) => {
    await this.teamRepository.setOpenTeam(teamId);
  };
}
