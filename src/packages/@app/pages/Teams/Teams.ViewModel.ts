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
    console.log("teams in repo---->", teams);
    teams.subscribe((value) => {
      console.log("value--->", value);
    });
    return teams;
  }

  /**
   * @description - get environment list from local db
   */
  get tabs() {
    const tabs = this.tabRepository.getTabList();
    console.log("teams in repo---->", tabs);
    tabs.subscribe((value) => {
      console.log("value--->", value);
    });
    return tabs;
  }
}
