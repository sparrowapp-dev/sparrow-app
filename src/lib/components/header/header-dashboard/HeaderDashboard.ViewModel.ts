import { rxdb } from "$lib/database/app.database";
import { userLogout } from "$lib/services/auth.service";
import { WorkspaceService } from "$lib/services/workspace.service";
import { setUser } from "$lib/store/auth.store";
import { setCurrentWorkspace } from "$lib/store/workspace.store";
import { clearAuthJwt } from "$lib/utils/jwt";
import { notifications } from "$lib/utils/notifications";
import { useNavigate } from "svelte-navigator";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { addRxPlugin } from "rxdb";
addRxPlugin(RxDBUpdatePlugin);

export class HeaderDashboardViewModel {
  private navigate = useNavigate();
  private workspaceService = new WorkspaceService();
  constructor() {}

  get workspaces() {
    return rxdb.workspace.find().$;
  }

  get activeWorkspace() {
    return rxdb.workspace.findOne({
      selector: {
        isActiveWorkspace: true,
      },
    }).$;
  }

  // Function to set a workspace as active
  public activateWorkspace = (id: string): void => {
    rxdb.workspace.setActiveWorkspace(id);
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
      await rxdb.workspace.bulkInsertData(data);
      return;
    }
  };

  // logout
  public logout = async (): Promise<void> => {
    const response = await userLogout();
    if (response.isSuccessful) {
      clearAuthJwt();
      setUser(null);
      await rxdb.workspace.find().remove();
      await rxdb.tab.find().remove();
      setCurrentWorkspace("", "");
      this.navigate("/login");
    } else {
      notifications.error("Something went wrong");
      throw "error registering user: " + response.message;
    }
    return;
  };
}
