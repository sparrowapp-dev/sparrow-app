import { TabRepository } from "@app/repositories/tab.repository";
import { TeamRepository } from "@app/repositories/team.repository";

export class TeamsViewModel {
  constructor() {}
  private teamRepository = new TeamRepository();
  private tabRepository = new TabRepository();

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
}
