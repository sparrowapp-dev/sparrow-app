import { user } from "$lib/store";
import type { InviteBody } from "$lib/utils/dto/team-dto";
import { UntrackedItems, WorkspaceRole } from "$lib/utils/enums";
import type { WorkspaceDocument } from "@app/database/database";
import { GuestUserRepository } from "@app/repositories/guest-user.repository";
import { TabRepository } from "@app/repositories/tab.repository";
import { TeamRepository } from "@app/repositories/team.repository";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { TeamService } from "@app/services/team.service";
import { UserService } from "@app/services/user.service";
import { WorkspaceService } from "@app/services/workspace.service";
import { InitWorkspaceTab } from "@common/utils/init-workspace-tab";
import { notifications } from "@library/ui/toast/Toast";
import { BehaviorSubject, Observable } from "rxjs";
import { navigate } from "svelte-navigator";
import { v4 as uuidv4 } from "uuid";

export class TeamExplorerPageViewModel {
  constructor() {}
  private teamRepository = new TeamRepository();
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();
  private workspaceService = new WorkspaceService();
  private teamService = new TeamService();
  private guestUserRepository = new GuestUserRepository();
  private userService = new UserService();

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

  /**
   * @description - get the active team tab
   */
  public get activeTeamTab(): Observable<string> {
    return this._activeTeamTab.asObservable();
  }

  /**
   * @description - set the active team tab
   */
  private set activeTeamTab(value: string) {
    this._activeTeamTab.next(value);
  }

  /**
   * @description - Update the active team tab
   */
  public updateActiveTeamTab = (tab: string) => {
    this.activeTeamTab = tab;
  };

  /**
   * Generate available name of new workspace like My Workspace 2 if My Workspace is already taken
   * @param list :any[] - list of workspaces
   * @param name :string - name to be chacked
   * @returns :string - new unique name
   */
  private getNextWorkspace: (list: WorkspaceDocument[], name: string) => any = (
    list,
    name,
  ) => {
    const isNameAvailable: (proposedName: string) => boolean = (
      proposedName,
    ) => {
      return list.some((element) => {
        return element.name === proposedName;
      });
    };

    if (!isNameAvailable(name)) {
      return name;
    }

    for (let i = 2; i < list.length + 10; i++) {
      const proposedName: string = `${name} ${i}`;
      if (!isNameAvailable(proposedName)) {
        return proposedName;
      }
    }

    return null;
  };

  /**
   * sync teams data with backend server
   * @param userId User id
   */
  public refreshTeams = async (userId: string): Promise<void> => {
    if (!userId) return;

    let openTeamId: string = "";
    const teamsData = await this.teamRepository.getTeamData();
    teamsData.forEach((element) => {
      const elem = element.toMutableJSON();
      if (elem.isOpen) openTeamId = elem.teamId;
    });
    const response = await this.teamService.fetchTeams(userId);
    if (response?.isSuccessful && response?.data?.data) {
      const data = response.data.data.map((elem) => {
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
        return {
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
        };
      });
      if (openTeamId) {
        data.forEach((elem) => {
          if (elem.teamId === openTeamId) {
            elem.isOpen = true;
          } else {
            elem.isOpen = false;
          }
        });
      } else {
        data[0].isOpen = true;
      }

      await this.teamRepository.bulkInsertData(data);
    }
  };

  /**
   * sync workspace data with backend server
   * @param userId User id
   */
  public refreshWorkspaces = async (userId: string): Promise<void> => {
    if (!userId) return;
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
   * Create workspace in the team
   * @param teamId ID of team where workspace need to be created
   */
  public handleCreateWorkspace = async (teamId: string) => {
    const workspaces = await this.workspaces;
    let workspaceList: WorkspaceDocument[] = [];
    await workspaces
      .subscribe((workspace) => (workspaceList = workspace))
      .unsubscribe();
    const updatgedWorkspaceList = workspaceList.filter(
      (workspace) => workspace.team?.teamId === teamId,
    );
    const newWorkspace = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: this.getNextWorkspace(updatgedWorkspaceList, "My Workspace"),
      items: [],
      createdAt: new Date().toISOString(),
    };
    const response = await this.workspaceService.createWorkspace({
      name: newWorkspace.name,
      id: teamId,
    });
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      await this.workspaceRepository.addWorkspace({
        ...res,
        id: res._id,
      });
      user.subscribe(async (value) => {
        if (value) {
          await this.refreshTeams(value._id);
          await this.refreshWorkspaces(value._id);
        }
      });
      await this.workspaceRepository.setActiveWorkspace(res._id);
      const initWorkspaceTab = new InitWorkspaceTab(res._id, res._id);
      initWorkspaceTab.updateName(res.name);
      this.tabRepository.createTab(initWorkspaceTab.getValue());
      navigate("/dashboard/collections");
      notifications.success("New Workspace Created");
    }
  };

  /**
   * Switch from one workspace to another
   * @param id - Workspace id
   */
  public handleSwitchWorkspace = async (id: string) => {
    await this.workspaceRepository.setActiveWorkspace(id);
    const res = await this.workspaceRepository.readWorkspace(id);
    const initWorkspaceTab = new InitWorkspaceTab(id, id);
    initWorkspaceTab.updateId(id);
    initWorkspaceTab.updateName(res.name);
    this.tabRepository.createTab(initWorkspaceTab.getValue());
    navigate("/dashboard/collections");
  };

  /**
   * Invites new user to the team
   * @param _teamId - Team id in which users are invited.
   * @param _inviteBody - New team meta data.
   * @param _userId - Used id to be invited.
   */
  public handleTeamInvite = async (
    _teamId: string,
    _teamName: string,
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
      notifications.success(
        `Invite sent to ${_inviteBody.users.length} people for ${_teamName}.`,
      );
    } else {
      notifications.error("Failed to send invite. Please try again.");
    }
    return response;
  };

  /**
   * Removess a user from a specified team.
   * @param _teamId - The ID of the team.
   * @param _teamName - The name of the team.
   * @param _userId - The ID of the user.
   * @param _userName - The name of the user.
   */
  public removeMembersAtTeam = async (
    _teamId: string,
    _teamName: string,
    _userId: string,
    _userName: string,
  ) => {
    let loggedInUserId = "";
    user.subscribe((value) => {
      loggedInUserId = value?._id;
    });
    const response = await this.teamService.removeMembersAtTeam(
      _teamId,
      _userId,
    );
    if (response.isSuccessful) {
      const responseData = response.data.data;
      await this.teamRepository.modifyTeam(_teamId, responseData);
      await this.refreshWorkspaces(loggedInUserId);
      notifications.success(`${_userName} is removed from ${_teamName}`);
    } else {
      notifications.error(`Failed to remove ${_userName} from ${_teamName}`);
    }
    return response;
  };

  /**
   * Demoted a user to member status in a specified team.
   * @param _teamId - The ID of the team.
   * @param _teamName - The name of the team.
   * @param _userId - The ID of the user.
   * @param _userName - The name of the user.
   */
  public demoteToMemberAtTeam = async (
    _teamId: string,
    _teamName: string,
    _userId: string,
    _userName: string,
  ) => {
    let loggedInUserId = "";
    user.subscribe((value) => {
      loggedInUserId = value?._id;
    });
    const response = await this.teamService.demoteToMemberAtTeam(
      _teamId,
      _userId,
    );
    if (response.isSuccessful === true) {
      const responseData = response.data.data;
      await this.teamRepository.modifyTeam(_teamId, responseData);
      await this.refreshWorkspaces(loggedInUserId);
      notifications.success(`${_userName} is now a member`);
    } else {
      notifications.error(
        `Failed to change role for ${_userName}. Please try again.`,
      );
    }
    return response;
  };

  /**
   * Promotes a user to admin status in a specified team.
   * @param _teamId - The ID of the team.
   * @param _teamName - The name of the team.
   * @param _userId - The ID of the user.
   * @param _userName - The name of the user.
   */
  public promoteToAdminAtTeam = async (
    _teamId: string,
    _teamName: string,
    _userId: string,
    _userName: string,
  ) => {
    let loggedInUserId = "";
    user.subscribe((value) => {
      loggedInUserId = value?._id;
    });
    const response = await this.teamService.promoteToAdminAtTeam(
      _teamId,
      _userId,
    );
    if (response.isSuccessful) {
      const responseData = response.data.data;
      await this.teamRepository.modifyTeam(_teamId, responseData);
      await this.refreshWorkspaces(loggedInUserId);
      notifications.success(`${_userName} is now an admin`);
    } else {
      notifications.error(
        `Failed to change role for ${_userName}. Please try again.`,
      );
    }
    return response;
  };

  /**
   * Promotes a user to owner status in a specified team.
   * @param _teamId - The ID of the team.
   * @param _teamName - The name of the team.
   * @param _userId - The ID of the user.
   * @param _userName - The name of the user.
   */
  public promoteToOwnerAtTeam = async (
    _teamId: string,
    _teamName: string,
    _userId: string,
    _userName: string,
  ) => {
    let userId;
    user.subscribe(async (value) => {
      if (value) {
        userId = value._id;
      }
    });
    const res = await this.teamRepository.getTeamData();
    let count = 0;
    for (let index = 0; index < res.length; index++) {
      let ownerId = res[index]._data.owner;

      if (ownerId === userId) {
        count++;
      }
    }

    if (count > 1) {
      const response = await this.teamService.promoteToOwnerAtTeam(
        _teamId,
        _userId,
      );

      if (response.isSuccessful === true) {
        const responseData = response.data.data;
        await this.teamRepository.modifyTeam(_teamId, responseData);
        await this.refreshWorkspaces(userId);
        notifications.success(
          `${_userName} is now the new Owner of ${_teamName}.`,
        );
      } else {
        notifications.error(
          `Failed to update access of Owner. Please try again.`,
        );
      }
      return response;
    } else {
      notifications.error(
        "You must be owner of at least one other team to transfer ownership",
      );
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
      await this.tabRepository.removeTabsByQuery({
        selector: {
          "path.workspaceId": workspace._id,
        },
      });
      await this.teamRepository.removeWorkspaceFromTeam(
        workspace.team?.teamId,
        workspace._id,
      );
      const tabs = await this.tabRepository.getTabDocs();
      if (!tabs) {
        await this.tabRepository.activateInitialTab();
      }
      notifications.success(
        `${workspace.name} is removed from ${workspace?.team?.teamName}.`,
      );
    } else {
      notifications.error(
        `Failed to remove ${workspace.name} from ${workspace?.team?.teamName}. Please try again.`,
      );
    }
    return response;
  };

  /*
   * updates the team details
   * @param _teamId - team id to be updated
   * @param _teamData - team data that will be override
   */
  public updateTeam = async (_teamId: string, _teamData: any) => {
    const response = await this.teamService.updateTeam(_teamId, _teamData);
    if (response.isSuccessful) {
      delete response?._id;
      this.teamRepository.modifyTeam(_teamId, response.data.data);
    }
  };

  /**
   * Leaving a team 
   * @param teamId - The ID of the team where the user is trying to left.
   * @param _userId - The ID of the user who  is leaving the team.
  
**/

  public leaveTeam = async (userId: string, teamId: string) => {
    const response = await this.teamService.leaveTeam(teamId);

    if (!response.isSuccessful) {
      notifications.error(
        response.message ?? "Failed to leave the team. Please try again.",
      );
      return response;
    }

    await new Promise<void>((resolve) =>
      setTimeout(async () => {
        const activeTeam = await this.teamRepository.checkActiveTeam();
        if (activeTeam) {
          const teamIdToActivate =
            await this.workspaceRepository.activateInitialWorkspace();
          if (teamIdToActivate) {
            await this.teamRepository.setActiveTeam(teamIdToActivate);
          }
        }
        resolve();
      }, 500),
    );

    await new Promise<void>((resolve) =>
      setTimeout(async () => {
        await this.refreshTeams(userId);
        await this.refreshWorkspaces(userId);
        notifications.success("You left a team.");
        resolve();
      }, 500),
    );

    return response;
  };

  /**
   * Fetch guest user state
   * @returns boolean for is user guest user or not
   */
  public getGuestUser = async () => {
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    return isGuestUser;
  };

  /**
   * Validates the user email by making a GET request to the server.
   *
   * @param  email - The email address to be validated.
   * @returns A promise that resolves to the server's response.
   */
  public validateUserEmail = async (email: string) => {
    const response = await this.userService.validateUserEmail(email);
    if (response.isSuccessful) {
      if (response?.data?.data?.registeredWith === "unknown") {
        return false;
      }
      return true;
    }
    return false;
  };
}
