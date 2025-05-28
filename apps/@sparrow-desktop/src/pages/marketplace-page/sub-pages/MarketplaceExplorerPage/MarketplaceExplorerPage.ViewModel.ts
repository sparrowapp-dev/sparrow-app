// Repositories

import { WorkspaceService } from "@app/services/workspace.service";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import constants from "@app/constants/constants";
import { getClientUser } from "@app/utils/jwt";
import { TabRepository } from "../../../../repositories/tab.repository";
import { WorkspaceTabAdapter } from "@app/adapter";
import { navigate } from "svelte-navigator";
import { CollectionService } from "@app/services/collection.service";
import { CollectionRepository } from "@app/repositories/collection.repository";
import { EnvironmentService } from "@app/services/environment.service";
import { EnvironmentRepository } from "@app/repositories/environment.repository";
import { TestflowService } from "@app/services/testflow.service";
import { TestflowRepository } from "@app/repositories/testflow.repository";
import { createDeepCopy } from "@sparrow/common/utils";

class MarketplaceExplorerViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private workspaceService = new WorkspaceService();
  private tabRepository = new TabRepository();
  private collectionService = new CollectionService();
  private collectionRepository = new CollectionRepository();
  private environmentService = new EnvironmentService();
  private environmentRepository = new EnvironmentRepository();
  private testflowService = new TestflowService();
  private testflowRepository = new TestflowRepository();

  constructor() {}

  /**
   * @description - get public workspaces list from local db
   */
  get publicWorkspaces() {
    const workspaces = this.workspaceRepository.getPublicWorkspacesDocs();
    return workspaces;
  }

  public constructBaseUrl = async (_id: string) => {
    const workspaceData = await this.workspaceRepository.readWorkspace(_id);
    const hubUrl = workspaceData?.team?.hubUrl;

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
  };

  public fetchPublicWorkpsace = async (currentPage) => {
    const workspaces =
      await this.workspaceService.fetchPublicWorkspaceList(currentPage);
    return workspaces;
  };

  /**
   * Adds a workspace to repository and switches to it
   * @param workspace - Workspace document to add and switch to
   */
  public addAndSwitchWorkspace = async (workspace) => {
    const clientUser = getClientUser();
    // Check if workspace already exists
    const existingWorkspace = await this.workspaceRepository.readWorkspace(
      workspace._id,
    );

    // If workspace doesn't exist, add it to repository
    if (!existingWorkspace) {
      const {
        _id,
        name,
        description,
        workspaceType,
        users,
        admins,
        team,
        createdAt,
        createdBy,
        collection,
        updatedAt,
        updatedBy,
        isNewInvite,
      } = workspace;

      const item = {
        _id,
        name,
        description,
        workspaceType: workspaceType,
        isShared: true,
        users: [
          {
            email: clientUser?.email,
            id: clientUser?.id,
            name: clientUser?.name,
            role: "viewer",
          },
        ],
        collections: collection ? collection : [],
        admins: admins,
        team: {
          teamId: team.id,
          teamName: team.name,
          hubUrl: team?.hubUrl || "",
        },
        environmentId: "",
        isActiveWorkspace: false,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
        isNewInvite,
      };

      await this.workspaceRepository.addWorkspace(item);
    }

    // Switch to the workspace
    const workspaceData =
      existingWorkspace ||
      (await this.workspaceRepository.readWorkspace(workspace._id));
    const initWorkspaceTab = new WorkspaceTabAdapter().adapt(
      workspace._id,
      workspaceData,
    );
    await this.tabRepository.createTab(initWorkspaceTab, workspace._id);
    await this.workspaceRepository.setActiveWorkspace(workspace._id);
    navigate("collections");
  };

  public searchPublicWorkspaces = async (
    searchTerm: string,
    page: number = 1,
  ) => {
    const workspaces = await this.workspaceService.searchPublicWorkspaces(
      searchTerm,
      page,
    );
    return workspaces;
  };
}

export default MarketplaceExplorerViewModel;
