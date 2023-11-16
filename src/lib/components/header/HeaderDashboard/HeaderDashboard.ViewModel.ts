import { rxdb } from "$lib/database/main.database";
import { userLogout } from "$lib/services/auth.service";
import { WorkspaceService } from "$lib/services/workspace.service";
import { setUser } from "$lib/store/auth.store";
import { setCurrentWorkspace } from "$lib/store/workspace.store";
import { clearAuthJwt } from "$lib/utils/jwt";
import { notifications } from "$lib/utils/notifications";
import { useNavigate } from "svelte-navigator";

export class HeaderDashboardViewModel {
  private navigate = useNavigate();
  private workspaceService = new WorkspaceService();
  constructor() {}

  get fetchWorkspaces() {
    return rxdb.workspace.find().$;
  }

  public getWorkspace = async (userId: string) => {
    const response = await this.workspaceService.fetchWorkspaces(userId);
    if (response.isSuccessful) {
      await rxdb.workspace.bulkInsert(response?.data?.data);
      setCurrentWorkspace(
        response?.data?.data[0]?._id,
        response?.data?.data[0]?.name,
      );
    }
  };

  public logout = async () => {
    const response = await userLogout();
    if (response.isSuccessful) {
      clearAuthJwt();
      setUser(null);
      this.navigate("/login");
    } else {
      notifications.error("Something went wrong");
      throw "error registering user: " + response.message;
    }
  };
}
