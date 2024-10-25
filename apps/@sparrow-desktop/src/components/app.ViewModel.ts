import { throttle } from "@sparrow/common/utils";
import { platform } from "@tauri-apps/plugin-os";
import { handleLoginV2 } from "@app/pages/auth-page/sub-pages/login-page/login-page";
import { listen } from "@tauri-apps/api/event";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { getCurrent } from "@tauri-apps/api/window";
import { Modal } from "@sparrow/library/ui";
import { userValidationStore } from "@app/store/deviceSync.store";
import { getAuthJwt, jwtDecode } from "../utils/jwt";
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
  private guestUserRepository = new GuestUserRepository();
  private workspaceRepository = new WorkspaceRepository();
  private tabRepository = new TabRepository();

  private workspaceSwitcher = async (id: string) => {
    if (!id) return;
    const res = await this.workspaceRepository.readWorkspace(id);
    if (!res) {
      console.error("workspace doesn't exist to switch!");
      return;
    }
    const initWorkspaceTab = new InitWorkspaceTab(id, id);
    initWorkspaceTab.updateId(id);
    initWorkspaceTab.updateName(res.name);
    await this.tabRepository.createTab(initWorkspaceTab.getValue(), id);
    await this.workspaceRepository.setActiveWorkspace(id);
    navigate("/dashboard/collections");
  };

  constructor() {}

  /**
   * Get the guest user state
   */
  private getGuestUserState = async () => {
    const response = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    return response?.getLatest().toMutableJSON().isGuestUser;
  };

  // Private method to validate user access
  private async validateUserAccess(
    webUserAccessToken: string | null,
  ): Promise<boolean> {
    const isGuestUser = await this.getGuestUserState();
    if (isGuestUser) return false;
    // different user
    const desktopUserAccessToken = localStorage.getItem(constants.AUTH_TOKEN);

    // Validate existing user
    if (webUserAccessToken && desktopUserAccessToken) {
      const webAppUserDetails = jwtDecode(webUserAccessToken);
      const desktopUserDetails = jwtDecode(desktopUserAccessToken);

      if (webAppUserDetails?._id && desktopUserDetails?._id) {
        if (webAppUserDetails._id !== desktopUserDetails._id) return false;
      }
    }
    return true;
  }

  // Private method to handle login and workspace switch
  private async handleLoginAndWorkspaceSwitch(
    url: string,
    workspaceId: string | null,
  ): Promise<void> {
    const tokens = getAuthJwt();
    if (!tokens[0] || !tokens[1]) {
      // client desktop is currently not logged in.
      await handleLoginV2(url);
    }

    if (workspaceId) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.workspaceSwitcher(workspaceId);
    }
  }

  private handleLoginAndWorkspaceSwitchThrottler = throttle(
    this.handleLoginAndWorkspaceSwitch,
    5000,
  );

  // Private method to process deep link
  private async processDeepLink(url: string): Promise<void> {
    try {
      await getCurrent().setFocus();
      const params = new URLSearchParams(url.split("?")[1]);
      const currentUserAccessToken = params.get("accessToken");
      const workspaceId = params.get("workspaceID");

      const isValidUser = await this.validateUserAccess(currentUserAccessToken);

      if (!isValidUser) {
        console.error({
          title: "Access Denied",
          content: "Please log out the current user before switching accounts",
        });
        userValidationStore.set({ isValid: false });
        return;
      }
      await this.handleLoginAndWorkspaceSwitchThrottler(url, workspaceId);
    } catch (error) {
      console.error(error);
    }
  }

  private processDeepLinkThrottler = throttle(this.processDeepLink, 5000);

  // Private platform-specific handlers
  private deepLinkHandlerWindows = async (
    deepLinkUrl: DeepLinkHandlerWindowsPayload,
  ): Promise<void> => {
    const url = deepLinkUrl.payload.url;
    if (url) {
      await this.processDeepLinkThrottler(url);
    }
  };

  private deepLinkHandlerMacOs = async (deepLinkUrl: string): Promise<void> => {
    if (deepLinkUrl) {
      await this.processDeepLinkThrottler(deepLinkUrl[0]);
    }
  };

  // Private method to register deep link handler
  public async registerDeepLinkHandler(): Promise<void> {
    try {
      const os = await platform();

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
