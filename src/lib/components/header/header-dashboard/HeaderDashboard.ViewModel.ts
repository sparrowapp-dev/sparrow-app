import { userLogout } from "$lib/services/auth.service";
import { WorkspaceService } from "$lib/services/workspace.service";
import { isLoggout, isResponseError, setUser } from "$lib/store/auth.store";

import { clearAuthJwt } from "$lib/utils/jwt";
import { notifications } from "$lib/utils/notifications";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import { TabRepository } from "$lib/repositories/tab.repository";
import { resizeWindowOnLogOut } from "../window-resize";
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { ActiveSideBarTabReposistory } from "$lib/repositories/active-sidebar-tab.repository";
import { RxDB, type WorkspaceDocument } from "$lib/database/app.database";
import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
import { requestResponseStore } from "$lib/store/request-response-section";

export class HeaderDashboardViewModel {
  constructor() {}
  private workspaceRepository = new WorkspaceRepository();
  private tabRepository = new TabRepository();
  private workspaceService = new WorkspaceService();
  private collectionRepository = new CollectionRepository();
  private activeSideBarTabRepository = new ActiveSideBarTabReposistory();

  public getWorkspaceDocument = (elem: WorkspaceDocument) => {
    return {
      _id: elem.get("_id"),
      name: elem.get("name"),
      collections: elem.get("collections"),
    };
  };
  get workspaces() {
    return this.workspaceRepository.getWorkspaces();
  }

  get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  // Function to set a workspace as active
  public activateWorkspace = (id: string): void => {
    this.workspaceRepository.setActiveWorkspace(id);
    return;
  };

  public addWorkspace = (workspace) => {
    this.workspaceRepository.addWorkspace(workspace);
  };

  public updateWorkspace = (workspaceId: string, name: string) => {
    this.workspaceRepository.updateWorkspace(workspaceId, name);
  };

  public updateCollectionInWorkspace = (workspaceId: string, collectionObj) => {
    this.workspaceRepository.updateCollectionInWorkspace(
      workspaceId,
      collectionObj,
    );
  };

  public modifyWorkspace = async (
    componentData,
    collectionsMethods: CollectionsMethods,
    newWorkspaceName: string,
    tabName: string,
  ) => {
    if (newWorkspaceName) {
      const workspace = await this.workspaceService.updateWorkspace(
        componentData.id,
        {
          name: newWorkspaceName,
        },
      );

      tabName = workspace?.data?.data.name;
      this.updateWorkspace(componentData.id, tabName);

      collectionsMethods.updateTab(
        tabName,
        "name",
        componentData.path.workspaceId,
      );
      collectionsMethods.updateTab(
        true,
        "save",
        componentData.path.workspaceId,
      );
    }
  };

  // sync workspace data with backend server
  public refreshWorkspaces = async (userId: string): Promise<void> => {
    const response = await this.workspaceService.fetchWorkspaces(userId);

    if (response?.isSuccessful && response?.data?.data) {
      const data = response.data.data.map((elem, index) => {
        const {
          _id,
          name,
          owner,
          permissions,
          createdAt,
          createdBy,
          collection,
        } = elem;
        return {
          _id,
          name,
          owner,
          permissions,
          collections: collection,
          isActiveWorkspace: !index ? true : false,
          createdAt,
          createdBy,
        };
      });

      await this.workspaceRepository.bulkInsertData(data);
      return;
    }
  };

  // logout to frontend - clears local db, store, and cookies.
  public clientLogout = async (): Promise<void> => {
    setUser(null);
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
}
