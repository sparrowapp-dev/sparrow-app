import { TeamRepository } from "$lib/repositories/team.repository";
import { TeamService } from "$lib/services/team.service";

export class TeamsViewModel {
  private teamRepository = new TeamRepository();
  private teamService = new TeamService();
  constructor() {}
  public addTeam = (team) => {
    this.teamRepository.createTeam(team);
  };
  public modifyTeam = (teamId, team) => {
    this.teamRepository.modifyTeam(teamId, team);
  };

  public createTeam = async (team) => {
    const response = await this.teamService.createTeam(team);
    return response;
  };
}
