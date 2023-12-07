import { userLogout } from "$lib/services/auth.service";
import { WorkspaceService } from "$lib/services/workspace.service";
import { isLoggout, isResponseError, setUser } from "$lib/store/auth.store";
import { setCurrentWorkspace } from "$lib/store/workspace.store";
import { clearAuthJwt } from "$lib/utils/jwt";
import { notifications } from "$lib/utils/notifications";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import { TabRepository } from "$lib/repositories/tab.repository";
import { resizeWindowOnLogOut } from "../window-resize";
import { requestResponseStore } from "$lib/store/request-response-section";
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { ActiveSideBarTabReposistory } from "$lib/repositories/active-sidebar-tab.repository";

export class HeaderDashboardViewModel {
  constructor() {}
  private workspaceRepository = new WorkspaceRepository();
  private tabRepository = new TabRepository();
  private workspaceService = new WorkspaceService();
  private collectionRepository = new CollectionRepository();
  private activeSideBarTabRepository = new ActiveSideBarTabReposistory();

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

  // sync workspace data with backend server
  public refreshWorkspaces = async (userId: string): Promise<void> => {
    const response = await this.workspaceService.fetchWorkspaces(userId);
    if (response?.isSuccessful && response?.data?.data) {
      const data = response.data.data.map((elem) => {
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
    resizeWindowOnLogOut();
    isLoggout.set(true);
    isResponseError.set(false);
    clearAuthJwt();
    setUser(null);
    setCurrentWorkspace("", "");
    await this.workspaceRepository.clearWorkspaces();
    await this.collectionRepository.clearCollections();
    await requestResponseStore.clearTabs();
    await this.tabRepository.clearTabs();
    await this.activeSideBarTabRepository.clearActiveTabs();
  };

  // logout to backend - expires jwt - auth and refresh tokens
  public logout = async (): Promise<boolean> => {
    const response = await userLogout();
    if (response.isSuccessful) {
      this.clientLogout();
      return true;
    } else {
      notifications.error(response.message);
      return false;
    }
  };
}
