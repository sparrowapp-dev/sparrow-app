import { userLogout } from "$lib/services/auth.service";
import { WorkspaceService } from "$lib/services/workspace.service";
import { isResponseError, setUser } from "$lib/store/auth.store";
import { setCurrentWorkspace } from "$lib/store/workspace.store";
import { clearAuthJwt } from "$lib/utils/jwt";
import { notifications } from "$lib/utils/notifications";
import { useNavigate } from "svelte-navigator";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";

export class HeaderDashboardViewModel {
  private navigate = useNavigate();
  private workspaceRepository = new WorkspaceRepository();
  private workspaceService = new WorkspaceService();
  constructor() {}

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
        const { _id, name, owner, permissions, createdAt, createdBy } = elem;
        return {
          _id,
          name,
          owner,
          permissions,
          createdAt,
          createdBy,
        };
      });
      await this.workspaceRepository.bulkInsertData(data);
      return;
    }
  };

  // logout
  public logout = async (): Promise<void> => {
    const response = await userLogout();
    if (response.isSuccessful) {
      isResponseError.set(false);
      clearAuthJwt();
      setUser(null);
      await this.workspaceRepository.clearWorkspaces();
      setCurrentWorkspace("", "");
      this.navigate("/login");
    } else {
      notifications.error("Something went wrong");
      throw "error registering user: " + response.message;
    }
    return;
  };
}
