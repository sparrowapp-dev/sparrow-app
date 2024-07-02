import { user } from "$lib/store";
import { UntrackedItems } from "$lib/utils/enums";
import type { WorkspaceDocument } from "@app/database/database";
import { TabRepository } from "@app/repositories/tab.repository";
import { TeamRepository } from "@app/repositories/team.repository";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { TeamService } from "@app/services/team.service";
import { WorkspaceService } from "@app/services/workspace.service";
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

  // sync teams data with backend server
  public refreshTeams = async (userId: string): Promise<void> => {
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

  // sync workspace data with backend server
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
        };
        data.push(item);
      }
      await this.workspaceRepository.bulkInsertData(data);
      return;
    }
  };

  public handleCreateWorkspace = async (teamId: string) => {
    console.log("inside handleCreateWorkspace", teamId);
    const workspaces = await this.workspaces;
    let workspaceList: WorkspaceDocument[] = [];
    await workspaces
      .subscribe((workspace) => (workspaceList = workspace))
      .unsubscribe();
    workspaceList.filter((workspace) => workspace.team?.teamId === teamId);
    const newWorkspace = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: this.getNextWorkspace(workspaceList, "My Workspace"),
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
      navigate("/dashboard/collections");
      notifications.success("New Workspace Created");
    }
  };

  public handleSwitchWorkspace = async (id: string) => {
    await this.workspaceRepository.setActiveWorkspace(id);
    navigate("/dashboard/collections");
  };
}
