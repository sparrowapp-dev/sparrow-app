/* eslint-disable @typescript-eslint/no-explicit-any */

import { userLogout } from "$lib/services/auth.service";
import { WorkspaceService } from "$lib/services/workspace.service";
import { isLoggout, isResponseError, setUser } from "$lib/store/auth.store";

import { clearAuthJwt } from "$lib/utils/jwt";
import { notifications } from "$lib/components/toast-notification/ToastNotification";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import { resizeWindowOnLogOut } from "../window-resize";
import {
  RxDB,
  type TeamDocument,
  type WorkspaceDocument,
} from "$lib/database/app.database";
import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
import { requestResponseStore } from "$lib/store/request-response-section";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { EnvironmentService } from "$lib/services/environment.service";
import type { Observable } from "rxjs";
import { environmentType } from "$lib/utils/enums/environment.enum";
import { EnvironmentTabRepository } from "$lib/repositories/environment-tab.repository";
import { generateSampleEnvironment } from "$lib/utils/sample/environment.sample";
import { setCurrentWorkspace } from "$lib/store";
import { TeamRepository } from "$lib/repositories/team.repository";
import type {
  addUsersInWorkspace,
  addUsersInWorkspacePayload,
} from "$lib/utils/dto/workspace-dto";
import { type WorkspaceRole } from "$lib/utils/enums";
import type { MakeRequestResponse } from "$lib/utils/interfaces/common.interface";

export class HeaderDashboardViewModel {
  constructor() {}
  private workspaceRepository = new WorkspaceRepository();
  private teamRepository = new TeamRepository();
  private workspaceService = new WorkspaceService();
  private environmentRepository = new EnvironmentRepository();
  private environmentService = new EnvironmentService();
  private environmentTabRepository = new EnvironmentTabRepository();

  public getWorkspaceDocument = (elem: WorkspaceDocument) => {
    return {
      _id: elem.get("_id"),
      name: elem.get("name"),
      team: elem.get("team"),
      collections: elem.get("collections"),
    };
  };
  public get workspaces() {
    return this.workspaceRepository.getWorkspaces();
  }

  get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  public filterWorkspace = (team: any): Observable<WorkspaceDocument[]> => {
    return this.workspaceRepository.getFilteredWorkspaces(team);
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

  public addWorkspace = async (workspace) => {
    await this.workspaceRepository.addWorkspace(workspace);
  };

  public updateWorkspace = async (workspaceId: string, data: any) => {
    await this.workspaceRepository.updateWorkspace(workspaceId, data);
  };

  public updateCollectionInWorkspace = (workspaceId: string, collectionObj) => {
    this.workspaceRepository.updateCollectionInWorkspace(
      workspaceId,
      collectionObj,
    );
  };

  public updateEnvironmentInWorkspace = (
    workspaceId: string,
    environmentObj,
  ) => {
    this.workspaceRepository.updateEnvironmentInWorkspace(
      workspaceId,
      environmentObj,
    );
  };

  public modifyWorkspace = async (
    workspaceId: string,
    collectionsMethods: CollectionsMethods,
    newWorkspaceName: string,
    tabName: string,
  ) => {
    if (newWorkspaceName) {
      const workspace = await this.workspaceService.updateWorkspace(
        workspaceId,
        {
          name: newWorkspaceName,
        },
      );

      tabName = workspace?.data?.data.name;
      this.updateWorkspace(workspaceId, {
        name: newWorkspaceName,
      });

      collectionsMethods.updateTab(tabName, "name", workspaceId);
      collectionsMethods.updateTab(true, "save", workspaceId);
    }
  };

  public modifyWorkspaceDescription = async (
    workspaceId: string,
    collectionsMethods: CollectionsMethods,
    workspaceDescription: string,
  ) => {
    if (workspaceDescription) {
      await this.workspaceService.updateWorkspace(workspaceId, {
        description: workspaceDescription,
      });
      this.updateWorkspace(workspaceId, {
        description: workspaceDescription,
      });
      collectionsMethods.updateTab(
        workspaceDescription,
        "description",
        workspaceId,
      );
      collectionsMethods.updateTab(true, "save", workspaceId);
    }
  };

  public checkActiveWorkspace = async (
    workspaceId: string,
  ): Promise<boolean> => {
    return await this.workspaceRepository.checkActiveWorkspace(workspaceId);
  };

  // sync workspace data with backend server
  public refreshWorkspaces = async (userId: string): Promise<void> => {
    const response = await this.workspaceService.fetchWorkspaces(userId);
    let isAnyWorkspaceActive: undefined | string = undefined;
    const data = [];
    if (
      response?.isSuccessful &&
      response?.data?.data &&
      response?.data?.data?.length > 0
    ) {
      for (const elem of response.data.data) {
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
        const isActiveWorkspace = await this.checkActiveWorkspace(_id);
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
        this.activateInitialWorkspaceWithTeam();
      } else this.activateWorkspace(isAnyWorkspaceActive);
      return;
    }
  };

  // logout to frontend - clears local db, store, and cookies.
  public clientLogout = async (): Promise<void> => {
    setUser(null);
    setCurrentWorkspace("", "");
    await requestResponseStore.clearTabs();
    await RxDB.getInstance().destroyDb();
    await RxDB.getInstance().getDb();
    resizeWindowOnLogOut();
    isLoggout.set(true);
    isResponseError.set(false);
    clearAuthJwt();
  };

  // logout to backend - expires jwt - auth and refresh tokens
  public logout = async (): Promise<boolean> => {
    const response = await userLogout();
    if (response.isSuccessful) {
      await this.clientLogout();
      return true;
    } else {
      notifications.error(response.message);
      return false;
    }
  };

  public createWorkspace = async (workspace) => {
    const response = await this.workspaceService.createWorkspace(workspace);
    return response;
  };

  public refreshEnvironment = async (data, workspaceId) => {
    this.environmentRepository.refreshEnvironment(data, workspaceId);
    if (data) {
      data.forEach((environment) => {
        if (environment.type === environmentType.GLOBAL) {
          const sampleEnvironment = generateSampleEnvironment(
            environment.id,
            workspaceId,
            new Date().toString(),
          );
          sampleEnvironment.name = environment.name;
          sampleEnvironment.isActive = true;
          sampleEnvironment.type = environmentType.GLOBAL;
          sampleEnvironment.variable = environment.variable;
          this.environmentTabRepository.createTab(
            sampleEnvironment,
            workspaceId,
          );
        }
      });
    }
    return;
  };

  public getServerEnvironments = async (workspaceId: string) => {
    return await this.environmentService.fetchAllEnvironments(workspaceId);
  };
  public addUsersInWorkspace = async (
    workspaceId: string,
    addUsersInWorkspaceDto: addUsersInWorkspacePayload,
  ) => {
    const response = await this.workspaceService.addUsersInWorkspace(
      workspaceId,
      addUsersInWorkspaceDto,
    );
    return response;
  };
  public getUserDetailsOfWorkspace = async (workspaceId: string) => {
    const userDetails =
      await this.workspaceService.getUserDetailsOfWorkspace(workspaceId);
    return userDetails;
  };

  public updateUserRoleInWorkspace = async (
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ) => {
    const response = await this.workspaceService.changeUserRoleAtWorkspace(
      workspaceId,
      userId,
      role,
    );
    return response;
  };
  public updateUserRoleInWorkspaceInRXDB = async (
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<void> => {
    await this.workspaceRepository.updateUserRoleInWorkspace(
      workspaceId,
      userId,
      role,
    );
  };

  public addUsersInWorkspaceInRxDB = async (
    workspaceId: string,
    addUsersInWorkspaceDto: addUsersInWorkspace[],
  ): Promise<void> => {
    await this.workspaceRepository.addUserInWorkspace(
      workspaceId,
      addUsersInWorkspaceDto,
    );
  };

  public isUserInMultipleWorkspaces = async (
    userId: string,
  ): Promise<boolean> => {
    return await this.workspaceRepository.isUserInMultipleWorkspaces(userId);
  };

  public removeUserFromWorkspaceRxDB = async (
    workspaceId: string,
    userId: string,
  ): Promise<void> => {
    await this.workspaceRepository.removeUserFromWorkspace(workspaceId, userId);
  };

  public deleteUserFromWorkspace = async (
    workspaceId: string,
    userId: string,
  ): Promise<MakeRequestResponse> => {
    return await this.workspaceService.removeUserFromWorkspace(
      workspaceId,
      userId,
    );
  };

  public removeWorkspace = async (workspaceId: string) => {
    return await this.workspaceRepository.deleteWorkspace(workspaceId);
  };

  public deleteWorkspace = async (
    workspaceId: string,
  ): Promise<MakeRequestResponse> => {
    return await this.workspaceService.deleteWorkspace(workspaceId);
  };

  public handleWorkspaceDeletion = async (
    teamId: string,
    workspaceId: string,
  ): Promise<void> => {
    await this.removeWorkspace(workspaceId);
    await this.teamRepository.removeWorkspaceFromTeam(teamId, workspaceId);
    return;
  };

  public getActiveteam = (): Observable<TeamDocument> => {
    return this.teamRepository.getActiveTeam();
  };
}
