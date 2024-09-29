import { user } from "@app/store/auth.store";
import type { addUsersInWorkspacePayload } from "@deprecate/utils/dto";
import { Events, WorkspaceRole } from "@deprecate/utils/enums";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { throttle } from "@sparrow/common/utils";
import type { TeamDocument, WorkspaceDocument } from "../../database/database";
import type { UpdatesDocType } from "../../models/updates.model";
import { CollectionRepository } from "../../repositories/collection.repository";
import { EnvironmentRepository } from "../../repositories/environment.repository";
import { TabRepository } from "../../repositories/tab.repository";
import { TeamRepository } from "../../repositories/team.repository";
import { UpdatesRepository } from "../../repositories/updates.repository";
import { WorkspaceRepository } from "../../repositories/workspace.repository";
import { CollectionService } from "../../services/collection.service";
import { UpdatesService } from "../../services/updates.service";
import { WorkspaceService } from "../../services/workspace.service";
import { notifications } from "@sparrow/library/ui";
import type { Observable } from "rxjs";

export default class WorkspaceExplorerViewModel {
  // Private Repositories
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();
  private teamRepository = new TeamRepository();
  private updatesRepository = new UpdatesRepository();
  private collectionRepository = new CollectionRepository();
  private environmentRepository = new EnvironmentRepository();

  // Private Services
  private collectionService = new CollectionService();
  private workspaceService = new WorkspaceService();
  private updatesService = new UpdatesService();
  constructor() {}

  /**
   * Get active tab(if any)
   * @returns :Observable<any> | undefined - active tab
   */
  public getActiveTab = () => {
    return this.tabRepository.getTab();
  };

  /**
   * Get the active workspace from the workspace repository.
   *
   * @returns The active workspace object.
   */
  get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  /**
   * Read the team document from the team repository.
   *
   * @param teamId - The ID of the team to be read.
   * @returns A promise that resolves to the team document.
   */
  public readTeam = async (teamId: string) => {
    return await this.teamRepository.getTeamDoc(teamId);
  };
  /**
   * Updates the name of a workspace and reflects the changes in the associated tab.
   * @param - The ID of the workspace to be updated.
   * @param - The new name for the workspace.
   * @returns  A promise that resolves when the workspace name is updated.
   */
  public updateWorkspaceName = async (workspaceId: string, newName: string) => {
    if (!newName) return;
    const response = await this.workspaceService.updateWorkspace(workspaceId, {
      name: newName,
    });

    if (response.isSuccessful) {
      const updatedata = {
        name: newName,
        updatedAt: response.data.data.updatedAt,
      };
      await this.workspaceRepository.updateWorkspace(workspaceId, updatedata);
      await this.tabRepository.updateTabByMongoId(workspaceId, updatedata);
      notifications.success("Workspace renamed successfully!");
      return;
    }
  };

  /**
   * Updates the description of a workspace and synchronizes the change with the relevant repositories.
   *
   * @param - The ID of the workspace to be updated.
   * @param  - The new description to be set for the workspace.
   * @returns - A promise that resolves when the description update is complete.
   */

  public updateWorkspaceDescription = async (
    workspaceId: string,
    newDescription: string,
  ) => {
    const response = await this.workspaceService.updateWorkspace(workspaceId, {
      description: newDescription,
    });

    if (response.isSuccessful) {
      const updatedata = {
        description: newDescription,
      };
      notifications.success("Description updated successfully!");
      await this.workspaceRepository.updateWorkspace(workspaceId, updatedata);
      return;
    }
  };

  /**
   * Returns a workspace document
   * @param workspaceId - workspace id
   * @returns - workspace document
   */
  public getWorkspaceById = async (
    workspaceId: string,
  ): Promise<WorkspaceDocument> => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };

  /**
   * Return a team document
   * @param teamId - team id
   * @returns = team document
   */
  public getTeamById = async (teamId: string): Promise<TeamDocument> => {
    return await this.teamRepository.getTeamDoc(teamId);
  };

  /**
   * Delete the workspace and update the local DB as per changes
   * Updates workspace, team, and tab repository.
   * Also updates active workspace state, if active workspace is deleted
   * @param workspace - workspace document
   * @returns - A promise that resolves when the delete workspace is complete.
   */
  public handleDeleteWorkspace = async (workspace: WorkspaceDocument) => {
    const isActiveWorkspace =
      await this.workspaceRepository.checkActiveWorkspace(workspace._id);
    const workspaces = await this.workspaceRepository.getWorkspacesDocs();
    if (isActiveWorkspace && workspaces.length === 1) {
      notifications.error(
        "Failed to delete the last workspace. Please create a new workspace before deleting this workspace.",
      );
      return;
    }
    const response = await this.workspaceService.deleteWorkspace(workspace._id);
    if (response.isSuccessful) {
      await this.workspaceRepository.deleteWorkspace(workspace._id);
      if (isActiveWorkspace) {
        await this.workspaceRepository.activateInitialWorkspace();
      }
      await this.teamRepository.removeWorkspaceFromTeam(
        workspace.team?.teamId,
        workspace._id,
      );
      await this.tabRepository.removeTabsByQuery({
        selector: {
          "path.workspaceId": workspace._id,
        },
      });
      await this.collectionRepository.removeCollections(workspace._id);
      await this.environmentRepository.removeEnvironments(workspace._id);
      notifications.success(
        `${workspace.name} is removed from ${workspace?.team?.teamName}.`,
      );
    } else {
      notifications.error(
        `Failed to remove ${workspace.name} from ${workspace?.team?.teamName}. Please try again.`,
      );
    }
    MixpanelEvent(Events.Delete_Workspace, {
      source: "delete workspace",
    });
    return response;
  };

  /**
   * Invites users to a workspace.
   * @param _workspaceId current workspace Id.
   * @param _workspaceName current workspace name.
   * @param _data The payload containing users and their roles.
   * @param _invitedUserCount count of users to be invited.
   * @returns A promise resolving to the response from the invitation operation.
   */
  public inviteUserToWorkspace = async (
    _workspaceId: string,
    _workspaceName: string,
    _data: addUsersInWorkspacePayload,
    _invitedUserCount: number,
  ) => {
    const response = await this.workspaceService.addUsersInWorkspace(
      _workspaceId,
      _data,
    );
    if (response?.data?.data) {
      const newTeam = response.data.data.users;
      this.workspaceRepository.addUserInWorkspace(_workspaceId, newTeam);
      notifications.success(
        `Invite sent to ${_invitedUserCount} people for ${_workspaceName}.`,
      );
    } else {
      notifications.error(`Failed to sent invite. Please try again.`);
    }
    if (_data.role === WorkspaceRole.WORKSPACE_VIEWER) {
      MixpanelEvent(Events.Invite_To_Workspace_Viewer, {
        source: "invite to workspace as viewer",
      });
    } else if (_data.role === WorkspaceRole.WORKSPACE_EDITOR) {
      MixpanelEvent(Events.Invite_To_Workspace_Editor, {
        source: "invite to workspace as editor",
      });
    }

    return response;
  };

  /**
   * Fetches updates for a specified workspace and inserts them into the repository if successful.
   *
   * @param workspaceId - The ID of the workspace to fetch updates for.
   */
  public fetchWorkspaceUpdates = async (workspaceId: string) => {
    const response = await this.updatesService.getUpdates(workspaceId, "1");
    if (response.isSuccessful) {
      await this.updatesRepository.insertUpdates(
        response.data.data,
        workspaceId,
      );
    }
  };

  /**
   * Retrieves a list of workspace updates as an observable.
   *
   * @param workspaceId - The ID of the workspace to retrieve updates for.
   * @returns An observable emitting updates for the specified workspace.
   */
  public getWorkspaceUpdatesList = (
    workspaceId: string,
  ): Observable<UpdatesDocType[]> => {
    return this.updatesRepository.getUpdatesObservable(workspaceId);
  };

  /**
   * Fetches previous updates for a specified workspace and inserts them into the repository if conditions are met.
   *
   * @param workspaceId - The ID of the workspace to fetch previous updates for.
   */
  private fetchPreviousUpdates = async (workspaceId: string) => {
    const exisitingUpdates =
      await this.updatesRepository.getUpdatesObservableDocs(workspaceId);
    // Check if existing updates exist and the number of updates is a multiple of 20
    if (exisitingUpdates && exisitingUpdates[0]?.updates?.length % 20 === 0) {
      const page = (parseInt(exisitingUpdates[0]?.pageNumber) + 1).toString();
      const response = await this.updatesService.getUpdates(workspaceId, page);
      if (response.isSuccessful) {
        await this.updatesRepository.insertUpdates(
          response.data.data,
          workspaceId,
        );
      }
    }
  };

  /**
   * Throttled function to fetch previous updates for a specified workspace and insert them into the repository if conditions are met.
   * Throttling ensures that the function is not called more frequently than once every 2000 milliseconds (2 seconds).
   */
  private refetchPreviousUpdatesThrotller = throttle(
    this.fetchPreviousUpdates,
    2000,
  );

  /**
   * Initiates a throttled fetch of previous updates for a specified workspace.
   *
   * @param workspaceId - The ID of the workspace for which previous updates are to be refetched.
   */
  public refetchPreviousUpdates = async (workspaceId: string) => {
    this.refetchPreviousUpdatesThrotller(workspaceId);
  };

  /**
   * sync workspace data with backend server
   * @param userId User id
   */
  public refreshWorkspaces = async (userId: string): Promise<void> => {
    const workspaces = await this.workspaceRepository.getWorkspacesDocs();
    const idToEnvironmentMap = {};
    workspaces.forEach((element) => {
      idToEnvironmentMap[element._id] = element?.environmentId;
    });
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
          environmentId: idToEnvironmentMap[_id],
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
      if (!isAnyWorkspaceActive) {
        await this.workspaceRepository.activateInitialWorkspace();
        return;
      } else this.workspaceRepository.setActiveWorkspace(isAnyWorkspaceActive);
      return;
    }
  };

  /**
   * Removes a user from a workspace.
   * @param _workspaceId - The ID of the workspace where remove user is to take place.
   * @param _workspaceName - The name of the workspace where remove user is to take place.
   * @param _userId - The ID of the user who is being removed.
   * @param _userName - The name of the user who is being removed.
   */
  public removeUserFromWorkspace = async (
    _workspaceId: string,
    _workspaceName: string,
    _userId: string,
    _userName: string,
  ) => {
    let loggedInUserId = "";
    user.subscribe((value) => {
      loggedInUserId = value?._id;
    });

    const response = await this.workspaceService.removeUserFromWorkspace(
      _workspaceId,
      _userId,
    );
    if (response.isSuccessful === true) {
      await this.refreshWorkspaces(loggedInUserId);
      notifications.success(`${_userName} is removed from ${_workspaceName}`);
    } else {
      notifications.error(
        `Failed to remove ${_userName} from ${_workspaceName}`,
      );
    }
    MixpanelEvent(Events.Remove_User_Workspace);
    return response;
  };

  /**
   * Change the role of a user in a workspace.
   * @param _workspaceId - The ID of the workspace where the role change is to take place.
   * @param _workspaceName - The name of the workspace where the role change is to take place.
   * @param _userId - The ID of the user whose role is being changed.
   * @param _userName - The name of the user whose role is being changed.
   * @param _body - Users role at workspace level example => editor or viewer.
   */
  public changeUserRoleAtWorkspace = async (
    _workspaceId: string,
    _workspaceName: string,
    _userId: string,
    _userName: string,
    _body: WorkspaceRole,
  ) => {
    let loggedInUserId = "";
    user.subscribe((value) => {
      loggedInUserId = value?._id;
    });
    const response = await this.workspaceService.changeUserRoleAtWorkspace(
      _workspaceId,
      _userId,
      _body,
    );
    if (response.isSuccessful) {
      await this.refreshWorkspaces(loggedInUserId);
      if (_body === WorkspaceRole.WORKSPACE_VIEWER) {
        notifications.success(
          `${_userName} is now a viewer on ${_workspaceName}`,
        );
      } else if (_body === WorkspaceRole.WORKSPACE_EDITOR) {
        notifications.success(
          `${_userName} is now a editor on ${_workspaceName}`,
        );
      }
    } else {
      notifications.error(
        `Failed to change role for ${_userName}. Please try again.`,
      );
    }
    MixpanelEvent(Events.Workspace_Role_Changed);
    return response;
  };
}
