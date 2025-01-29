import { EnvironmentRepository } from "../../repositories/environment.repository";
import { TeamRepository } from "../../repositories/team.repository";
import { WorkspaceRepository } from "../../repositories/workspace.repository";
import {TestflowRepository} from "../../repositories/testflow.repository";
import {CollectionRepository} from "../../repositories/collection.repository";
import { EnvironmentService } from "../../services/environment.service";
import { TeamService } from "../../services/team.service";
import { WorkspaceService } from "../../services/workspace.service";
import { InitCollectionTab, InitEnvironmentTab, InitFolderTab, InitTestflowTab, moveNavigation, Sleep, throttle } from "@sparrow/common/utils";
import { notifications } from "@sparrow/library/ui";
import { isGuestUserActive, setUser, user } from "@app/store/auth.store";
import { TabRepository } from "../../repositories/tab.repository";
import {
  RxDB,
  type EnvironmentDocument,
  type TeamDocument,
  type WorkspaceDocument,
} from "../../database/database";
import { clearAuthJwt, getClientUser } from "@app/utils/jwt";
import { userLogout } from "../../services/auth.service";
import { FeatureSwitchService } from "../../services/feature-switch.service";
import { FeatureSwitchRepository } from "../../repositories/feature-switch.repository";
import { GuestUserRepository } from "../../repositories/guest-user.repository";
import { v4 as uuidv4 } from "uuid";
import { GraphqlTabAdapter, RequestTabAdapter, SocketIoTabAdapter } from "../../adapter";
import { navigate } from "svelte-navigator";
import type { Observable } from "rxjs";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { Events } from "@sparrow/common/enums";
import { AiAssistantWebSocketService } from "../../services/ai-assistant.ws.service";
import { InitWorkspaceTab } from "@sparrow/common/utils";
import { SocketTabAdapter } from "@app/adapter/socket-tab";


export class DashboardViewModel {
  constructor() { }
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
  private collectionRepository = new CollectionRepository();
  private testflowRepository = new TestflowRepository();

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
   * Get list of collections from current active workspace
   * @returns :Observable<CollectionDocument[]> - the list of collection from current active workspace
   */
  public getCollectionList = () => {
    return this.collectionRepository.getCollection();
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

  public getTabData = async (id: string) => {
    return await this.tabRepository.getTabById(id);
  }

  public getWorkspaceById = async (id: string): Promise<WorkspaceDocument> => {
    return await this.workspaceRepository.readWorkspace(id);
  }

  public getTabByID = async (id: string) => {
    return await this.tabRepository.getTabById(id);
  }

  public switchAndCreateRequestTab = async (
    workspaceId: string,
    collectionId: string,
    folderId: string,
    tree: any
  ) => {
    switch (tree.type) {
      case "GRAPHQL": {
        const graphqlTabAdapter = new GraphqlTabAdapter();
        const adaptedGraphql = graphqlTabAdapter.adapt(
          workspaceId,
          collectionId,
          folderId,
          tree,
        );
        await this.tabRepository.createTab(adaptedGraphql);
        break;
      }
      case "WEBSOCKET": {
        const socketTabAdapter = new SocketTabAdapter();
        const adaptedSocket = socketTabAdapter.adapt(
          workspaceId,
          collectionId,
          folderId,
          tree,
        );
        await this.tabRepository.createTab(adaptedSocket);
        break;
      }
      case "SOCKETIO": {
        const socketIoTabAdapter = new SocketIoTabAdapter();
        const adaptedSocketIo = socketIoTabAdapter.adapt(
          workspaceId,
          collectionId,
          folderId,
          tree,
        );
        await this.tabRepository.createTab(adaptedSocketIo);
        break;
      }
      default: {


        const requestTabAdapter = new RequestTabAdapter();
        const adaptedRequest = requestTabAdapter.adapt(
          workspaceId,
          collectionId,
          folderId,
          tree,
        );
        await this.tabRepository.createTab(adaptedRequest);
      }
    }
    moveNavigation("right");
  }

  public switchAndCreateCollectionTab = async (workspaceId: string, collection: any) => {
    // Calculate collection stats
    let totalFolder = 0;
    let totalRequest = 0;

    if (collection.items) {
      collection.items.forEach((item: any) => {
        if (
          item.type === "REQUEST" ||
          item.type === "GRAPHQL" ||
          item.type === "SOCKETIO" ||
          item.type === "WEBSOCKET"
        ) {
          totalRequest++;
        } else {
          totalFolder++;
          totalRequest += item?.items?.length || 0;
        }
      });
    }

    const path = {
      workspaceId: workspaceId,
      collectionId: collection.id || "",
      folderId: "",
    };

    const _collection = new InitCollectionTab(collection.id, workspaceId);
    _collection.updateName(collection.name);
    _collection.updateDescription(collection.description);
    _collection.updatePath(path);
    _collection.updateTotalRequests(totalRequest);
    _collection.updateTotalFolder(totalFolder);
    _collection.updateIsSave(true);

    // Create the tab with the new collection
    await this.tabRepository.createTab(_collection.getValue());

    // Update UI
    moveNavigation("right");
  }

  public switchAndCreateFolderTab = async (workspaceId: string,
    collectionId: any,
    folder: any) => {
    const path = {
      workspaceId: workspaceId,
      collectionId: collectionId || "",
      folderId: folder.id,
      folderName: folder.name,
    };

    const sampleFolder = new InitFolderTab(folder.id, workspaceId);
    sampleFolder.updateName(folder.name);
    sampleFolder.updatePath(path);
    sampleFolder.updateIsSave(true);

    await this.tabRepository.createTab(sampleFolder.getValue());
    moveNavigation("right");
  }

  public switchAndCreateWorkspaceTab = async (workspace: any) => {
    const initWorkspaceTab = new InitWorkspaceTab(
      workspace._id,
      workspace._id,
    );
    initWorkspaceTab.updateName(workspace.name);

    // Create tab and set active workspace
    await this.tabRepository.createTab(
      initWorkspaceTab.getValue(),
      workspace._id,
    );
    await this.workspaceRepository.setActiveWorkspace(workspace._id);
    moveNavigation("right");
  }

  public switchAndCreateEnvironmentTab = async (environment: any) => {
    const initEnvironmentTab = new InitEnvironmentTab(
      environment.id,
      environment.workspace,
    );

    initEnvironmentTab.setName(environment.title);
    initEnvironmentTab.setVariable(environment?.variable);

    await this.tabRepository.createTab(initEnvironmentTab.getValue());
    moveNavigation("right");
  }

  public switchAndCreateTestflowTab = async (testflow: any) => {
    const path = {
      workspaceId: testflow.workspaceId,
      testflowId: testflow._id,
      collectionId: testflow.collectionId || "",
      folderId: testflow.folderId || "",
    };

    const tab = new InitTestflowTab(testflow._id, testflow.workspaceId);
    tab.updateName(testflow.name);
    tab.updateDescription(testflow.description || "");
    tab.updatePath(path);
    tab.setNodes(testflow.nodes);
    tab.setEdges(testflow.edges);
    tab.updateIsSave(true);

    await this.tabRepository.createTab(tab.getValue());
    moveNavigation("right");
  }

  public searchWorkspace = async (query: string): Promise<WorkspaceDocument[]> => { 
    const workspaces = await this.workspaceRepository.searchWorkspaces(query);
    return workspaces;
  }

  public searchEnvironment = async (query: string): Promise<EnvironmentDocument[]> => { 
    const environments = await this.environmentRepository.searchEnvironments(query);
    return environments;
  }

  public searchTestflow = async (query: string): Promise<any> => { 
    const environments = await this.testflowRepository.searchTestflows(query);
    return environments;
  }

  public getRecentWorkspace = async (): Promise<WorkspaceDocument[]> => { 
    return this.workspaceRepository.getRecentWorkspaces();
  }

  public getRecentEnvironment = async (): Promise<EnvironmentDocument[]> => { 
    return this.environmentRepository.getRecentEnvironments();
  }

  public getRecentTestflow = async (): Promise<any> => { 
    return this.testflowRepository.getRecentTestflows();
  }
}
