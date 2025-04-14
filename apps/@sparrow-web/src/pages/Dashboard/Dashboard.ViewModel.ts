import { EnvironmentRepository } from "../../repositories/environment.repository";
import { TeamRepository } from "../../repositories/team.repository";
import { WorkspaceRepository } from "../../repositories/workspace.repository";
import { TestflowRepository } from "../../repositories/testflow.repository";
import { CollectionRepository } from "../../repositories/collection.repository";
import { EnvironmentService } from "../../services/environment.service";
import { TeamService } from "../../services/team.service";
import { WorkspaceService } from "../../services/workspace.service";
import {
  InitCollectionTab,
  InitEnvironmentTab,
  InitFolderTab,
  InitTestflowTab,
  moveNavigation,
  Sleep,
  throttle,
} from "@sparrow/common/utils";
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
import {
  CollectionTabAdapter,
  GraphqlTabAdapter,
  RequestTabAdapter,
  SocketIoTabAdapter,
  WorkspaceTabAdapter,
} from "../../adapter";
import { navigate } from "svelte-navigator";
import type { Observable } from "rxjs";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { Events, ItemType } from "@sparrow/common/enums";
import { AiAssistantWebSocketService } from "../../services/ai-assistant.ws.service";
import constants from "src/constants/constants";
import { SocketTabAdapter } from "@app/adapter/socket-tab";

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
  private aiAssistantWebSocketService =
    AiAssistantWebSocketService.getInstance();
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
          hubUrl,
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
          hubUrl,
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
          hubUrl,
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
          hubUrl,
          description,
          users,
          collections: collection ? collection : [],
          admins: admins,
          team: {
            teamId: team.id,
            teamName: team.name,
            hubUrl: team?.hubUrl || "",
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
    window.location.href = constants.SPARROW_AUTH_URL + "/init?source=web";
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

  // redirects to Sparrow Docs.
  public redirectDocs = async () => {
    window.open(constants.DOCS_URL, "_blank");
    return;
  };

  // redirects to Sparrow Feature Updates.
  public redirectFeatureUpdates = async () => {
    window.open(constants.SPARROW_GITHUB + "/sparrow-app/releases");
    return;
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

  public constructBaseUrl = async (_teamId: string) => {
    const teamData = await this.teamRepository.getTeamDoc(_teamId);
    const hubUrl = teamData?.hubUrl;

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
  };

  /**
   * Create workspace in the team
   * @param teamId ID of team where workspace need to be created
   */
  public handleCreateWorkspace = async (
    workspaceName: string,
    teamId: string,
  ) => {
    const baseUrl = await this.constructBaseUrl(teamId);
    const response = await this.workspaceService.createWorkspace(
      {
        name: workspaceName,
        id: teamId,
      },
      baseUrl,
    );
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

      const initWorkspaceTab = new WorkspaceTabAdapter().adapt(res._id, res);
      await this.tabRepository.createTab(initWorkspaceTab, res._id);
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

    const initWorkspaceTab = new WorkspaceTabAdapter().adapt(id, ws);
    await this.tabRepository.createTab(initWorkspaceTab, id);
    await this.workspaceRepository.setActiveWorkspace(id);
    navigate("collections");
  };

  /**
   * Switch from one team to another
   * @param _teamId - team id
   */
  public handleSwitchTeam = async (_teamId: string) => {
    this.teamRepository.setOpenTeam(_teamId);
  };

  public getTabData = async (id: string) => {
    return await this.tabRepository.getTabById(id);
  };

  public getWorkspaceById = async (id: string): Promise<WorkspaceDocument> => {
    return await this.workspaceRepository.readWorkspace(id);
  };

  public getTabByID = async (id: string) => {
    return await this.tabRepository.getTabById(id);
  };

  /**
   * Connect the web socket on login
   */
  public connectWebSocket = async () => {
    await this.aiAssistantWebSocketService.connectWebSocket();
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
      notifications.success(`New hub ${team.name} is created.`);
    } else {
      notifications.error("Failed to create a new hub. Please try again.");
    }
    MixpanelEvent(Events.CREATE_NEW_TEAM);
    return response;
  };

  public switchAndCreateRequestTab = async (
    workspaceId: string,
    collectionId: string,
    folderId: string,
    tree: any,
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
        await this.tabRepository.createTab(adaptedGraphql, workspaceId);
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
        await this.tabRepository.createTab(adaptedSocket, workspaceId);
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
        await this.tabRepository.createTab(adaptedSocketIo, workspaceId);
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
        await this.tabRepository.createTab(adaptedRequest, workspaceId);
      }
    }
    moveNavigation("right");
  };

  public switchAndCreateCollectionTab = async (
    workspaceId: string,
    collection: any,
  ) => {
    const collectionTab = new CollectionTabAdapter().adapt(
      workspaceId,
      collection,
    );
    // Create the tab with the new collection
    await this.tabRepository.createTab(collectionTab, workspaceId);

    // Update UI
    moveNavigation("right");
  };

  public switchAndCreateFolderTab = async (
    workspaceId: string,
    collectionId: any,
    folder: any,
  ) => {
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

    await this.tabRepository.createTab(sampleFolder.getValue(), workspaceId);
    moveNavigation("right");
  };

  public switchAndCreateWorkspaceTab = async (workspace: any) => {
    const initWorkspaceTab = new WorkspaceTabAdapter().adapt(
      workspace._id,
      workspace,
    );

    // Create tab and set active workspace
    await this.tabRepository.createTab(initWorkspaceTab, workspace._id);
    moveNavigation("right");
  };

  public switchAndCreateEnvironmentTab = async (environment: any) => {
    const initEnvironmentTab = new InitEnvironmentTab(
      environment.id,
      environment.workspace,
    );

    initEnvironmentTab.setName(environment.title);
    initEnvironmentTab.setVariable(environment?.variable);

    await this.tabRepository.createTab(
      initEnvironmentTab.getValue(),
      environment.workspace,
    );
    moveNavigation("right");
  };

  public switchAndCreateTestflowTab = async (testflow: any) => {
    const path = {
      workspaceId: testflow.workspaceId,
      testflowId: testflow._id,
      collectionId: testflow.collectionId || "",
      folderId: testflow.folderId || "",
    };
    const testflowData = await this.testflowRepository.readTestflow(
      testflow._id,
    );

    const tab = new InitTestflowTab(testflow._id, testflow.workspaceId);
    tab.updateName(testflowData.name);
    tab.updateDescription(testflowData.description || "");
    tab.updatePath(path);
    tab.setNodes(testflowData.nodes);
    tab.setEdges(testflowData.edges);
    tab.updateIsSave(true);

    await new Sleep().setTime(100).exec();
    await this.tabRepository.createTab(tab.getValue(), testflow.workspaceId);
    moveNavigation("right");
  };

  public searchWorkspace = async (
    query: string,
  ): Promise<WorkspaceDocument[]> => {
    const workspaces = await this.workspaceRepository.searchWorkspaces(query);
    return workspaces;
  };

  public searchEnvironment = async (
    query: string,
  ): Promise<EnvironmentDocument[]> => {
    const environments =
      await this.environmentRepository.searchEnvironments(query);
    return environments;
  };

  public searchTestflow = async (query: string): Promise<any> => {
    const environments = await this.testflowRepository.searchTestflows(query);
    return environments;
  };

  public getRecentWorkspace = async (): Promise<WorkspaceDocument[]> => {
    return this.workspaceRepository.getRecentWorkspaces();
  };

  public getRecentEnvironment = async (): Promise<EnvironmentDocument[]> => {
    return this.environmentRepository.getRecentEnvironments();
  };

  public getRecentTestflow = async (): Promise<any> => {
    return this.testflowRepository.getRecentTestflows();
  };

  /**
   * Gets the request URL based on the type of request in the tree node
   * @param tree - The tree node containing request information
   * @returns The URL string for the request, or empty string if not found
   * @private
   */
  private getRequestUrl(tree: any): string {
    switch (tree.type) {
      case ItemType.GRAPHQL:
        return tree.graphql?.url || "";
      case ItemType.SOCKET_IO:
        return tree.socketio?.url || "";
      case ItemType.WEB_SOCKET:
        return tree.websocket?.url || "";
      case ItemType.REQUEST:
        return tree.request?.url || "";
      default:
        return "";
    }
  }

  /**
   * Creates a path string from an array of path segments
   * @param path - Array of path segments
   * @returns Joined path string with segments separated by " / "
   * @private
   */
  private createPath(path: string[]): string {
    return path.join(" / ");
  }

  /**
   * Helper method to recursively search through the tree structure
   * @param tree - Current tree node being searched
   * @param searchText - Text to search for
   * @param collection - Array to store found collections
   * @param folder - Array to store found folders
   * @param file - Array to store found files/requests
   * @param collectionId - ID of the current collection
   * @param path - Current path in the tree
   * @param folderDetails - Details of the current folder
   * @param workspaceMap - Map of workspace IDs to workspace details
   * @param currentWorkspaceId - ID of the current workspace
   * @private
   */
  private searchHelper(
    tree: any,
    searchText: string,
    collection: any[],
    folder: any[],
    file: any[],
    collectionId: string,
    path: string[],
    folderDetails: any,
    workspaceMap: Record<
      string,
      { teamName: string; workspaceName: string }
    > = {},
    currentWorkspaceId = tree.workspaceId,
  ): void {
    if (tree.workspaceId) {
      const workspaceDetails = workspaceMap[tree.workspaceId];
      if (workspaceDetails) {
        path.push(workspaceDetails.teamName);
        path.push(workspaceDetails.workspaceName);
      }
    }

    if (tree.name.toLowerCase().includes(searchText.toLowerCase())) {
      if (
        tree.type === ItemType.REQUEST ||
        tree.type === ItemType.GRAPHQL ||
        tree.type === ItemType.SOCKET_IO ||
        tree.type === ItemType.WEB_SOCKET
      ) {
        let currentFolderDetails =
          tree.folderId && tree.folderName
            ? { id: tree.folderId, name: tree.folderName }
            : tree.parentFolder
              ? { id: tree.parentFolder.id, name: tree.parentFolder.name }
              : folderDetails;

        const requestMethod =
          tree.type === ItemType.REQUEST ? tree.request?.method : tree.type;

        const requestData = {
          tree: JSON.parse(
            JSON.stringify({
              ...tree,
              folderId: currentFolderDetails?.id,
              folderName: currentFolderDetails?.name,
              request: {
                ...tree.request,
                url: this.getRequestUrl(tree),
                method: requestMethod,
              },
            }),
          ),
          collectionId,
          folderDetails: currentFolderDetails,
          path: this.createPath(path),
          updatedAt: new Date(tree.updatedAt || Date.now()),
          workspaceId: currentWorkspaceId,
          type: tree.type,
        };

        file.push(requestData);
      } else if (tree.type === ItemType.FOLDER) {
        folder.push({
          tree: JSON.parse(JSON.stringify(tree)),
          collectionId,
          path: this.createPath(path),
          updatedAt: new Date(tree.updatedAt || Date.now()),
          workspaceId: currentWorkspaceId,
        });
      } else if (
        tree.type !== ItemType.FOLDER &&
        !Object.values([
          ItemType.REQUEST,
          ItemType.GRAPHQL,
          ItemType.SOCKET_IO,
          ItemType.WEB_SOCKET,
        ]).includes(tree.type)
      ) {
        collection.push({
          tree: JSON.parse(JSON.stringify(tree)),
          collectionId,
          path: this.createPath(path),
          updatedAt: new Date(tree.updatedAt || Date.now()),
          workspaceId: currentWorkspaceId,
        });
      }
    }

    if (file.length < 3 || folder.length < 1 || collection.length < 1) {
      if (tree && tree.items) {
        for (let j = 0; j < tree.items.length; j++) {
          path.push(tree.name);
          const newFolderDetails =
            tree.type === ItemType.FOLDER
              ? { id: tree.id || tree._id, name: tree.name }
              : folderDetails;

          const childItem = tree.items[j];
          if (tree.type === ItemType.FOLDER) {
            childItem.parentFolder = {
              id: tree.id || tree._id,
              name: tree.name,
            };
          }

          this.searchHelper(
            childItem,
            searchText,
            collection,
            folder,
            file,
            collectionId,
            path,
            newFolderDetails,
            workspaceMap,
            currentWorkspaceId,
          );
          path.pop();
        }
      }
    }

    file.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    folder.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    collection.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Gets the latest items of each type from the tree
   * @param tree - Array of tree nodes to search
   * @param workspaceMap - Map of workspace IDs to workspace details
   * @returns Object containing arrays of latest collections, folders, and requests
   * @private
   */
  private getLatestItemsByType(
    tree: any[],
    workspaceMap: Record<
      string,
      { teamName: string; workspaceName: string }
    > = {},
  ) {
    const collections: any[] = [];
    const folders: any[] = [];
    const requests: any[] = [];
    const workspaces: any[] = [];

    const extractItems = (
      node: any,
      path: string[] = [],
      collectionId: string = "",
      currentWorkspaceId: string | null = null,
    ) => {
      if (!node) return;

      if (node.workspaceId) {
        const workspaceDetails = workspaceMap[node.workspaceId];
        if (workspaceDetails) {
          path.push(workspaceDetails.teamName);
          path.push(workspaceDetails.workspaceName);
        }
      }

      const workspaceId = node.workspaceId || currentWorkspaceId;

      const requestMethod =
        node.type === ItemType.REQUEST ? node.request?.method : node.type;

      const itemData = {
        tree: JSON.parse(
          JSON.stringify({
            ...node,
            request: {
              ...node.request,
              url: this.getRequestUrl(node),
              method: requestMethod,
            },
          }),
        ),
        collectionId: collectionId || node.id,
        path: this.createPath(path),
        updatedAt: new Date(node.updatedAt || Date.now()),
        workspaceId,
        type: node.type,
        folderDetails: [
          ItemType.REQUEST,
          ItemType.SOCKET_IO,
          ItemType.WEB_SOCKET,
          ItemType.GRAPHQL,
        ].includes(node.type)
          ? { id: path[path.length - 1]?.id, name: path[path.length - 1]?.name }
          : {},
      };

      switch (node.type) {
        case ItemType.FOLDER:
          folders.push(itemData);
          break;
        case ItemType.REQUEST:
        case ItemType.SOCKET_IO:
        case ItemType.WEB_SOCKET:
        case ItemType.GRAPHQL:
          requests.push(itemData);
          break;
        case ItemType.WORKSPACE:
          workspaces.push(itemData);
          break;
        default:
          if (!node.type) {
            collections.push(itemData);
          }
          break;
      }

      if (node.items) {
        const newPath = [...path, node.name];
        node.items.forEach((item: any) => {
          extractItems(item, newPath, collectionId || node.id, workspaceId);
        });
      }
    };

    tree.forEach((node) => extractItems(node));

    const sortByDate = (a: any, b: any) =>
      b.updatedAt.getTime() - a.updatedAt.getTime();

    return {
      latestCollections: collections.sort(sortByDate),
      latestFolders: folders.sort(sortByDate),
      latestRequests: requests.sort(sortByDate),
    };
  }

  /**
   * Main search method that handles searching through the tree structure
   * @param searchText - Text to search for
   * @param collection - Array to store found collections
   * @param folder - Array to store found folders
   * @param file - Array to store found files/requests
   * @param collectionData - Array of collection data to search through
   * @param workspacePath - Optional workspace path
   * @param workspaceMap - Map of workspace IDs to workspace details
   * @public
   */
  public async searchNode(
    searchText: string,
    workspaceMap: Record<
      string,
      { teamName: string; workspaceName: string }
    > = {},
  ) {
    let collectionTree = await this.collectionRepository.getCollectionDocs();
    const s = collectionTree.map((_t) => {
      return _t.toMutableJSON();
    });

    let newtree = s;
    let collection = [];
    let folder = [];
    let file = [];

    if (searchText.trim() === "") {
      // Clear existing arrays before populating with latest items
      collection.length = 0;
      folder.length = 0;
      file.length = 0;

      // Get latest items and ensure they're properly sorted
      const latestItems = this.getLatestItemsByType(newtree, workspaceMap);

      // Ensure we're getting the most recently updated items
      if (latestItems.latestCollections.length > 0) {
        collection.push(...latestItems.latestCollections);
      }
      if (latestItems.latestFolders.length > 0) {
        folder.push(...latestItems.latestFolders);
      }
      if (latestItems.latestRequests.length > 0) {
        file.push(...latestItems.latestRequests);
      }

      let environment = await this.getRecentEnvironment();

      environment = environment.map((_environment) => {
        const workspaceDetails = workspaceMap[_environment.workspaceId];
        const path: string[] = [];
        if (workspaceDetails) {
          path.push(workspaceDetails.teamName);
          path.push(workspaceDetails.workspaceName);
        }

        return {
          title: _environment.name,
          workspace: _environment.workspaceId,
          id: _environment.id,
          variable: _environment.variable,
          path: this.createPath(path),
        };
      });

      let workspace = await this.getRecentWorkspace();
      workspace = workspace.map((_value) => _value._data);

      let testflow = await this.getRecentTestflow();
      testflow = testflow.map((_value) => {
        const workspaceDetails = workspaceMap[_value._data.workspaceId];
        const path: string[] = [];
        if (workspaceDetails) {
          path.push(workspaceDetails.teamName);
          path.push(workspaceDetails.workspaceName);
        }

        return {
          ..._value._data,
          path: this.createPath(path),
        };
      });

      return { collection, folder, file, workspace, testflow, environment };
    }

    for (let i = 0; i < newtree.length; i++) {
      const path: string[] = [];

      this.searchHelper(
        newtree[i],
        searchText,
        collection,
        folder,
        file,
        newtree[i].id,
        path,
        {},
        workspaceMap,
      );
    }
    let workspace = await this.searchWorkspace(searchText);
    workspace = workspace.map((_value) => _value._data);

    let testflow = await this.searchTestflow(searchText);
    testflow = testflow.map((_value) => _value._data);

    let environment = await this.searchEnvironment(searchText);
    environment = environment.map((_environment) => ({
      title: _environment.name,
      workspace: _environment.workspaceId,
      id: _environment.id,
      variable: _environment.variable,
    }));

    return { collection, folder, file, workspace, testflow, environment };
  }
}
