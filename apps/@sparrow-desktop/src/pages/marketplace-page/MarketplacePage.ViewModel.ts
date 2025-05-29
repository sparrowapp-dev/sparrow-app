// Repositories

import { WorkspaceService } from "@app/services/workspace.service";
import constants from "@app/constants/constants";
import { getClientUser } from "@app/utils/jwt";
import { WorkspaceTabAdapter } from "@app/adapter";
import { navigate } from "svelte-navigator";
import { RecentWorkspaceRepository } from "@app/repositories/recent-workspace.repository";
import { TabRepository } from "@app/repositories/tab.repository";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { notifications } from "@sparrow/library/ui";

class MarketplacePageViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private workspaceService = new WorkspaceService();
  private tabRepository = new TabRepository();
  private recentWorkspaceRepository = new RecentWorkspaceRepository();

  constructor() {}

  /**
   * Getting all workspace data
   */
  public get recentPublicWorkspaces() {
    return this.recentWorkspaceRepository.getRecentPublicWorkspaces();
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
  public addAndSwitchWorkspace = async (workspaceId: string) => {
    const clientUser = getClientUser();
    // Check if workspace already exists
    const existingWorkspace =
      await this.workspaceRepository.readWorkspace(workspaceId);
    let retrievedWorkspaceData;

    // If workspace doesn't exist, add it to repository
    if (!existingWorkspace) {
      const res = await this.workspaceService.fetchPublicWorkspace(workspaceId);
      if (res.isSuccessful && res?.data?.data) {
        retrievedWorkspaceData = res?.data?.data;
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
        } = retrievedWorkspaceData;
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
      } else {
        // Handle error if workspace fetch fails
        notifications.error("Failed to switch workspace.");
        return;
      }
    }

    // Switch to the workspace
    const workspaceData =
      existingWorkspace ||
      (await this.workspaceRepository.readWorkspace(workspaceId));
    const initWorkspaceTab = new WorkspaceTabAdapter().adapt(
      workspaceId,
      workspaceData,
    );
    await this.tabRepository.createTab(initWorkspaceTab, workspaceId);
    await this.workspaceRepository.setActiveWorkspace(workspaceId);
    navigate("collections");
    // Update the recent workspace repository
    const existingRecentWorkspace =
      await this.recentWorkspaceRepository.readWorkspace(workspaceId);
    if (!existingRecentWorkspace) {
      const {
        _id,
        name,
        description,
        workspaceType,
        team,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
      } = retrievedWorkspaceData;
      const recentWorkspaceItem = {
        _id,
        name,
        description,
        workspaceType,
        isShared: true,
        team: {
          teamId: team.id,
          teamName: team.name,
          hubUrl: team?.hubUrl || "",
        },
        lastVisited: new Date().toISOString(),
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
      };
      await this.recentWorkspaceRepository.addRecentWorkspace(
        recentWorkspaceItem,
      );
      // Limit public workspaces to 15 most recently visited
      await this.limitPublicWorkspaces(10);
    } else {
      // Update last visited time for existing recent workspace
      await this.recentWorkspaceRepository.updateWorkspace(workspaceId, {
        lastVisited: new Date().toISOString(),
      });
    }
  };

  private limitPublicWorkspaces = async (maxCount: number): Promise<void> => {
    // Get all public workspaces sorted by lastVisited
    const allPublicWorkspaces =
      await this.recentWorkspaceRepository.getRecentWorkspacesDocs();
    const publicWorkspaces = allPublicWorkspaces.filter(
      (workspace) => workspace.workspaceType === "PUBLIC",
    );

    // If we have more than the max count, remove the oldest ones
    if (publicWorkspaces.length > maxCount) {
      // Sort by lastVisited (most recent first)
      const sortedWorkspaces = publicWorkspaces.sort((a, b) => {
        const dateA = a.lastVisited ? new Date(a.lastVisited).getTime() : 0;
        const dateB = b.lastVisited ? new Date(b.lastVisited).getTime() : 0;
        return dateB - dateA;
      });

      // Get the workspaces to remove (oldest ones)
      const workspacesToRemove = sortedWorkspaces.slice(maxCount);

      // Delete each workspace that exceeds our limit
      for (const workspace of workspacesToRemove) {
        await this.recentWorkspaceRepository.deleteWorkspace(workspace._id);
      }
    }
  };
}

export default MarketplacePageViewModel;
