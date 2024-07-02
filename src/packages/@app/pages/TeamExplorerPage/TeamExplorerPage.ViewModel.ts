import type { InviteBody } from "$lib/utils/dto/team-dto";
import { TabRepository } from "@app/repositories/tab.repository";
import { TeamRepository } from "@app/repositories/team.repository";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { TeamService } from "@app/services/team.service";
import { WorkspaceService } from "@app/services/workspace.service";
import { notifications } from "@library/ui/toast/Toast";
import { BehaviorSubject, Observable } from "rxjs";

export class TeamExplorerPageViewModel {
  constructor() {}
  private teamRepository = new TeamRepository();
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();
  private teamService = new TeamService();
  private workspaceService = new WorkspaceService();

  private _activeTeamTab: BehaviorSubject<string> = new BehaviorSubject(
    "Workspaces",
  );

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
   * @description - get all workspaces from local db
   */
  public get workspaces() {
    return this.workspaceRepository.getWorkspaces();
  }

  public get activeTeamTab(): Observable<string> {
    return this._activeTeamTab.asObservable();
  }

  private set activeTeamTab(value: string) {
    this._activeTeamTab.next(value);
  }

  public updateActiveTeamTab = (tab: string) => {
    this.activeTeamTab = tab;
  };

  // sync workspace data with backend server
  public refreshWorkspaces = async (userId: string): Promise<void> => {
    const response = await this.workspaceService.fetchWorkspaces(userId);
    let isAnyWorkspaceActive: undefined | string = undefined;
    const data = [];
    const isSuccessful = response?.isSuccessful;
    const res = response?.data?.data;
    if (isSuccessful && res) {
      for (const elem of res) {
        const {
          _id,
          name,
          description,
          users,
          admins,
          team,
          createdAt,
          createdBy,
          collection,
        } = elem;
        const isActiveWorkspace =
          await this.workspaceRepository.checkActiveWorkspace(_id);
        if (isActiveWorkspace) isAnyWorkspaceActive = _id;
        const item = {
          _id,
          name,
          description,
          users,
          collections: collection ? collection : [],
          admins: admins,
          team: {
            teamId: team.id,
            teamName: team.name,
          },

          isActiveWorkspace: isActiveWorkspace,
          createdAt,
          createdBy,
        };
        data.push(item);
      }
      await this.workspaceRepository.bulkInsertData(data);
      if (!isAnyWorkspaceActive) {
        const teamIdToActivate =
          await this.workspaceRepository.activateInitialWorkspace();
        if (teamIdToActivate)
          await this.teamRepository.setActiveTeam(teamIdToActivate);
        return;
      } else this.workspaceRepository.setActiveWorkspace(isAnyWorkspaceActive);
      return;
    }
  };

  public handleTeamInvite = async (
    _teamId: string,
    _inviteBody: InviteBody,
    _userId: string,
  ) => {
    const response = await this.teamService.inviteMembersAtTeam(
      _teamId,
      _inviteBody,
    );
    if (response.isSuccessful) {
      const responseData = response.data.data;
      await this.refreshWorkspaces(_userId);
      await this.teamRepository.modifyTeam(_teamId, responseData);
      if (responseData?.nonExistingUsers?.length > 0) {
        responseData.nonExistingUsers.forEach((elem) => {
          notifications.error(`${elem} doesn't exist.`);
        });
      }
      if (responseData?.alreadyTeamMember?.length > 0) {
        responseData.alreadyTeamMember.forEach((elem) => {
          notifications.error(`${elem} already in team.`);
        });
      }
      if (
        !responseData?.nonExistingUsers?.length &&
        !responseData?.alreadyTeamMember?.length
      ) {
        notifications.success("Invite sent.");
      }
    } else {
      notifications.error("Failed to sent invite. Please try again.");
    }
    return response;
  };
}
