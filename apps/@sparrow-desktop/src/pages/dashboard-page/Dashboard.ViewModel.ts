import { EnvironmentRepository } from "../../repositories/environment.repository";
import { TeamRepository } from "../../repositories/team.repository";
import { WorkspaceRepository } from "../../repositories/workspace.repository";
import { EnvironmentService } from "../../services/environment.service";
import { TeamService } from "../../services/team.service";
import { WorkspaceService } from "../../services/workspace.service";
import { Sleep, throttle } from "@sparrow/common/utils";
import { notifications } from "@sparrow/library/ui";
import { isGuestUserActive, setUser, user } from "@app/store/auth.store";
import { TabRepository } from "../../repositories/tab.repository";
import {
  RxDB,
  type TeamDocument,
  type WorkspaceDocument,
} from "../../database/database";
import { clearAuthJwt, getClientUser } from "@app/utils/jwt";
import { userLogout } from "../../services/auth.service";
import { FeatureSwitchService } from "../../services/feature-switch.service";
import { FeatureSwitchRepository } from "../../repositories/feature-switch.repository";
import { GuestUserRepository } from "../../repositories/guest-user.repository";
import { v4 as uuidv4 } from "uuid";
import { TeamAdapter } from "../../adapter";
import { navigate } from "svelte-navigator";
import type { Observable } from "rxjs";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { Events } from "@sparrow/common/enums";
import { AiAssistantWebSocketService } from "../../services/ai-assistant.ws.service";
import { InitWorkspaceTab } from "@sparrow/common/utils";

export class DashboardViewModel {
  constructor() {}
  private teamRepository = new TeamRepository();
  private workspaceRepository = new WorkspaceRepository();
  private teamService = new TeamService();
  private workspaceService = new WorkspaceService();
  private environmentService = new EnvironmentService();
  private environmentRepository = new EnvironmentRepository();
  private tabRepository = new TabRepository();
  private featureSwitchService = new FeatureSwitchService();
  private featureSwitchRepository = new FeatureSwitchRepository();
  private guestUserRepository = new GuestUserRepository();
  private aiAssistantWebSocketService = new AiAssistantWebSocketService();

  public getTeamData = async () => {
    return await this.teamRepository.getTeamData();
  };

  public setOpenTeam = async (teamId) => {
    await this.teamRepository.setOpenTeam(teamId);
  };

  /**
   * Get the active workspace
   * @returns - the active workspace
   */
  public getActiveWorkspace = () => {
    return this.workspaceRepository.getActiveWorkspace();
  };

  /**
   * @description - get environment list from local db
   */
  get environments() {
    return this.environmentRepository.getEnvironment();
  }

  /**
   * @description - get workspace list from local db
   */
  public workspaces = async (): Promise<Observable<WorkspaceDocument[]>> => {
    const workspaces = await this.workspaceRepository.getWorkspaces();
    return workspaces;
  };

  /**
   * @description - get observalble team list from local db
   */
  public getTeams = async (): Promise<Observable<TeamDocument[]>> => {
    return await this.teamRepository.getTeams();
  };

  /**
   *
   * @returns guest user state
   */
  public getGuestUserState = async () => {
    const response = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    return response?.getLatest().toMutableJSON().isGuestUser;
  };

  /**
   *
   * @returns guest user state
   */
  public updateGuestBannerState = async () => {
    await this.guestUserRepository.updateGuestUserState(
      {
        name: "guestUser",
      },
      {
        isBannerActive: false,
      },
    );
  };

  /**
   * @description - link environment to particular workspace
   * @param workspaceId  - workspace id
   * @param environmentId - environment id
   */
  public initActiveEnvironmentToWorkspace = async (
    workspaceId: string,
    environmentId: string,
  ) => {
    this.workspaceRepository.updateWorkspace(workspaceId, { environmentId });
  };

  /**
   * sync teams data with backend server
   * @param userId User id
   */
  public refreshTeams = async (userId: string): Promise<void> => {
    if (!userId) return;
    const response = await this.teamService.fetchTeams(userId);
    let isAnyTeamsOpen: undefined | string = undefined;
    if (response?.isSuccessful && response?.data?.data) {
      const data = [];
      for (const elem of response.data.data) {
        const {
          _id,
          name,
          users,
          description,
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
        const isOpenTeam = await this.teamRepository.checkIsTeamOpen(_id);
        if (isOpenTeam) isAnyTeamsOpen = _id;
        const item = {
          teamId: _id,
          name,
          users,
          description,
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
          isOpen: isOpenTeam,
        };
        data.push(item);
      }

      await this.teamRepository.bulkInsertData(data);
      await this.teamRepository.deleteOrphanTeams(
        data.map((_team) => {
          return _team.teamId;
        }),
      );
      if (!isAnyTeamsOpen) {
        this.teamRepository.setOpenTeam(data[0].teamId);
        return;
      }
    }
  };

  public checkActiveWorkspace = async (
    workspaceId: string,
  ): Promise<boolean> => {
    return await this.workspaceRepository.checkActiveWorkspace(workspaceId);
  };

  public activateInitialWorkspaceWithTeam = async (): Promise<void> => {
    const teamIdToActivate =
      await this.workspaceRepository.activateInitialWorkspace();
    if (teamIdToActivate)
      await this.teamRepository.setActiveTeam(teamIdToActivate);
    return;
  };

  // Function to set a workspace as active
  public activateWorkspace = async (id: string): Promise<void> => {
    await this.workspaceRepository.setActiveWorkspace(id);
    return;
  };

  /**
   * sync workspace data with backend server
   * @param userId User id
   */
  public refreshWorkspaces = async (userId: string): Promise<void> => {
    if (!userId) return;
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
          updatedAt,
          updatedBy,
          isNewInvite,
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
          environmentId: "",
          isActiveWorkspace: isActiveWorkspace,
          createdAt,
          createdBy,
          updatedAt,
          updatedBy,
          isNewInvite,
        };
        data.push(item);
      }
      await this.workspaceRepository.bulkInsertData(data);
      await this.workspaceRepository.deleteOrphanWorkspaces(
        data.map((_workspace) => {
          return _workspace._id;
        }),
      );
      if (!isAnyWorkspaceActive) {
        this.workspaceRepository.setActiveWorkspace(data[0]._id);
        return;
      }
      return;
    }
  };

  private refreshTeamsWorkspacesThrottle = async (_userId: string) => {
    await this.refreshTeams(_userId);
    await this.refreshWorkspaces(_userId);
  };
  private refreshTeamsWorkspacesThrottler = throttle(
    this.refreshTeamsWorkspacesThrottle,
    2000,
  );

  public refreshTeamsWorkspaces = async (_userId: string) => {
    this.refreshTeamsWorkspacesThrottler(_userId);
  };

  /**
   * clear local DB and clear guest user details from store
   */
  public clearLocalDB = async (): Promise<void> => {
    setUser(null);
    isGuestUserActive.set(false);
    await this.tabRepository.clearTabs();
    await this.guestUserRepository.clearTabs();
    await RxDB.getInstance().destroyDb();
    await RxDB.getInstance().getDb();
    clearAuthJwt();
  };

  /**
   *
   * @returns guest user
   */
  public getGuestUser = async () => {
    const response = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    return response?.getLatest().toMutableJSON();
  };

  public clientLogout = async (): Promise<void> => {
    setUser(null);
    await this.tabRepository.clearTabs();
    await RxDB.getInstance().destroyDb();
    await RxDB.getInstance().getDb();
    clearAuthJwt();
  };

  // logout to backend - expires jwt - auth and refresh tokens
  public handleLogout = async (): Promise<boolean> => {
    const response = await userLogout();
    if (response.isSuccessful) {
      await this.clientLogout();
      MixpanelEvent(Events.SIGNOUT);
      return true;
    } else {
      notifications.error(response.message);
      return false;
    }
  };

  /**
   * Fetch all features from server and save in DB
   */
  public getAllFeatures = async () => {
    const features = await this.featureSwitchService.getAllFeatures();
    if (features.isSuccessful) {
      await this.featureSwitchRepository.bulkInsertData(features.data.data);
    }
  };

  /**
   * add guest user in local db
   */
  public addGuestUser = async () => {
    await this.guestUserRepository.insert({
      id: uuidv4(),
      name: "guestUser",
      isGuestUser: true,
      isBannerActive: true,
    });
  };

  /**
   *
   * @param data query to find details
   * @returns data from guest user repository
   */
  public findUser = async (data) => {
    const res = await this.guestUserRepository.findOne(data);
    return res;
  };

  /**
   * Create workspace in the team
   * @param teamId ID of team where workspace need to be created
   */
  public handleCreateWorkspace = async (
    workspaceName: string,
    teamId: string,
  ) => {
    const response = await this.workspaceService.createWorkspace({
      name: workspaceName,
      id: teamId,
    });
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      await this.workspaceRepository.addWorkspace({
        ...res,
        id: res._id,
      });
      await new Sleep().setTime(2000).exec();
      const clientUserId = getClientUser().id;
      if (clientUserId) {
        await this.refreshTeams(clientUserId);
        await this.refreshWorkspaces(clientUserId);
      }

      const initWorkspaceTab = new InitWorkspaceTab(res._id, res._id);
      initWorkspaceTab.updateName(res.name);
      await this.tabRepository.createTab(initWorkspaceTab.getValue(), res._id);
      await this.workspaceRepository.setActiveWorkspace(res._id);
      navigate("collections");
      notifications.success("New Workspace created successfully.");
    } else {
      notifications.error(response?.message);
    }
    MixpanelEvent(Events.Create_New_Workspace_TopBar);

    return response;
  };

  /**
   * Switch from one workspace to another
   * @param id - Workspace id
   */
  public handleSwitchWorkspace = async (id: string) => {
    if (!id) return;
    const ws = await this.workspaceRepository.readWorkspace(id);
    if (!ws) return;

    const initWorkspaceTab = new InitWorkspaceTab(id, id);
    initWorkspaceTab.updateName(ws.name);
    await this.tabRepository.createTab(initWorkspaceTab.getValue(), id);
    await this.workspaceRepository.setActiveWorkspace(id);
    navigate("collections");
  };

  /**
   * Connect the web socket on login
   */
  public connectWebSocket = async () => {
    await this.aiAssistantWebSocketService.connectWebSocket();
  };
}
