import { throttle } from "@sparrow/common/utils";
import { platform } from "@tauri-apps/plugin-os";
import { handleLoginV2 } from "@app/pages/auth-page/sub-pages/login-page/login-page";
import { listen } from "@tauri-apps/api/event";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { getCurrent } from "@tauri-apps/api/window";
import { Modal } from "@sparrow/library/ui";
import { userValidationStore } from '@app/store/deviceSync.store';
// import { TeamExplorerPageViewModel } from "../../../@sparrow-desktop/src/pages/teams-page/sub-pages/TeamExplorerPage/TeamExplorerPage.ViewModel";
import { jwtDecode } from "../utils/jwt";
import constants from "@app/constants/constants";
import { EnvironmentRepository } from "../repositories/environment.repository";
import { WorkspaceRepository } from "../repositories/workspace.repository";
import { EnvironmentService } from "../services/environment.service";
import { InitTab } from "@sparrow/common/factory";
import { GuestUserRepository } from "../repositories/guest-user.repository";
import { TabRepository } from "../repositories/tab.repository";
import { navigate } from "svelte-navigator";
import { InitWorkspaceTab } from "@sparrow/common/utils";

interface DeepLinkHandlerWindowsPayload {
  payload: {
    url: string;
  };
}

interface JwtPayload {
  _id: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
}

export class AppViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private tabRepository = new TabRepository();
    private handleLoginThrottler = throttle(handleLoginV2, 5000);
    
    private workspaceSwitcher = async (id: string) => {
        if (!id) return;
        const res = await this.workspaceRepository.readWorkspace(id);
        const initWorkspaceTab = new InitWorkspaceTab(id, id);
        initWorkspaceTab.updateId(id);
        initWorkspaceTab.updateName(res.name);
        await this.tabRepository.createTab(initWorkspaceTab.getValue(), id);
        await this.workspaceRepository.setActiveWorkspace(id);
        navigate("/dashboard/collections");
      };

  constructor() {}

  // Private method to handle auto login
  private async performAutoLogin(accessToken: string, refreshToken: string): Promise<boolean> {
    try {
      localStorage.setItem(constants.AUTH_TOKEN, accessToken);
      localStorage.setItem(constants.REFRESH_TOKEN, refreshToken);
      
      const userDetails = jwtDecode<JwtPayload>(accessToken);
      return !!userDetails;
    } catch (error) {
      return false;
    }
  }

  // Private method to validate user access
  private async validateUserAccess(url: string, currentUserAccessToken: string | null): Promise<boolean> {
    try {
      const existingUserToken = localStorage.getItem(constants.AUTH_TOKEN);

      // Handle auto login for new users
      if (!existingUserToken && currentUserAccessToken) {
        const params = new URLSearchParams(url.split("?")[1]);
        const refreshToken = params.get("refreshToken");
        
        if (refreshToken) {
          const autoLoginSuccess = await this.performAutoLogin(currentUserAccessToken, refreshToken);
          userValidationStore.set({ isValid: autoLoginSuccess, checked: true });
          return autoLoginSuccess;
        }
      }

      // Validate existing user
      if (currentUserAccessToken && existingUserToken) {
        try {
          const currentUserDetails = jwtDecode<JwtPayload>(currentUserAccessToken);
          const existingUserDetails = jwtDecode<JwtPayload>(existingUserToken);

          if (!currentUserDetails || !existingUserDetails) {
            userValidationStore.set({ isValid: false, checked: true });
            return false;
          }

          const areUsersEqual = currentUserDetails._id === existingUserDetails._id;
          userValidationStore.set({ isValid: areUsersEqual, checked: true });
          return areUsersEqual;
        } catch (error) {
          userValidationStore.set({ isValid: false, checked: true });
          return false;
        }
      }

      userValidationStore.set({ isValid: false, checked: true });
      return false;
    } catch (error) {
      userValidationStore.set({ isValid: false, checked: true });
      return false;
    }
  }

  // Private method to handle login and workspace switch
  private async handleLoginAndWorkspaceSwitch(url: string, workspaceId: string | null): Promise<void> {
    await this.handleLoginThrottler(url);
    
    if (workspaceId) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.workspaceSwitcher(workspaceId);
    }
  }

  // Private method to process deep link
  private async processDeepLink(url: string): Promise<void> {
    try {
      await getCurrent().setFocus();
      
      const params = new URLSearchParams(url.split("?")[1]);
      const currentUserAccessToken = params.get("accessToken");
      const workspaceId = params.get("workspaceID");
      
      const isValidUser = await this.validateUserAccess(url, currentUserAccessToken);

      if (!isValidUser && currentUserAccessToken) {
        Modal.error({
          title: "Access Denied",
          content: "Please log out the current user before switching accounts"
        });
        return;
      }

      await this.handleLoginAndWorkspaceSwitch(url, workspaceId);
      
    } catch (error) {
      Modal.error({
        title: "Error",
        content: "An error occurred while processing your request"
      });
    }
  }

  // Private platform-specific handlers
  private deepLinkHandlerWindows = async (deepLinkUrl: DeepLinkHandlerWindowsPayload): Promise<void> => {
    const url = deepLinkUrl.payload.url;
    if (url) {
      await this.processDeepLink(url);
    }
  };

  private deepLinkHandlerMacOs = async (deepLinkUrl: string): Promise<void> => {
    if (deepLinkUrl) {
      await this.processDeepLink(deepLinkUrl);
    }
  };

  // Private method to register deep link handler
  public async registerDeepLinkHandler(): Promise<void> {
    try {
      const os = await platform();
      console.log("Registering deep link handler for:", os);

      if (os === "windows") {
        await listen("deep-link-urls", this.deepLinkHandlerWindows);
      } else if (os === "macos") {
        await onOpenUrl(this.deepLinkHandlerMacOs);
      } else {
        console.warn("Unsupported platform for deep linking:", os);
      }
    } catch (error) {
      console.error("Error registering deep link handler:", error);
    }
  }
}
