import { throttle } from "@sparrow/common/utils";

import { handleLoginV2 } from "@app/pages/auth-page/sub-pages/login-page/login-page";
import { listen } from "@tauri-apps/api/event";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { userValidationStore } from "@app/store/deviceSync.store";
import { getAuthJwt, jwtDecode } from "../utils/jwt";
import constants from "@app/constants/constants";
import { EnvironmentRepository } from "../repositories/environment.repository";
import { WorkspaceRepository } from "../repositories/workspace.repository";
import { GuestUserRepository } from "../repositories/guest-user.repository";
import { TabRepository } from "../repositories/tab.repository";
import { navigate } from "svelte-navigator";
import { platform } from "@tauri-apps/plugin-os";
import { v4 as uuidv4 } from "uuid";
import { isGuestUserActive } from "@app/store/auth.store";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { Events } from "@sparrow/common/enums";
import { TeamRepository } from "@app/repositories/team.repository";
import { GuideRepository } from "@app/repositories/guide.repository";
import { WorkspaceTabAdapter } from "@app/adapter/workspace-tab";
import * as Sentry from "@sentry/svelte";
import { policyConfig } from "../../../../packages/@sparrow-common/src/store/policyStore";

interface DeepLinkHandlerWindowsPayload {
  payload: {
    url: string;
  };
}

export class AppViewModel {
  private guestUserRepository = new GuestUserRepository();
  private workspaceRepository = new WorkspaceRepository();
  private tabRepository = new TabRepository();
  private teamRepository = new TeamRepository();
  private environmentRepository = new EnvironmentRepository();
  private guideRepository = new GuideRepository();

  private workspaceSwitcher = async (id: string) => {
    if (!id) return;
    const res = await this.workspaceRepository.readWorkspace(id);
    if (!res) {
      console.error("workspace doesn't exist to switch!");
      return;
    }
    const initWorkspaceTab = new WorkspaceTabAdapter().adapt(id, res);
    await this.tabRepository.createTab(initWorkspaceTab, id);
    await this.workspaceRepository.setActiveWorkspace(id);
    navigate("collections");
  };

  constructor() {}

  /**
   * add guest user in local db
   */
  public addGuestUser = async () => {
    await this.guestUserRepository.insert({
      id: uuidv4(),
      name: "guestUser",
      isGuestUser: true,
      isBannerActive: true,
    });
  };

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

  /**
   *
   * @param data query to find details
   * @returns data from guest user repository
   */
  public findUser = async (data) => {
    const res = await this.guestUserRepository.findOne(data);
    return res;
  };

  /**
   * create dummy team and workspace for guest user
   */
  private createGuestUserTeamWorkspace = async () => {
    const response = await this.findUser({ name: "guestUser" });
    const user = response?.getLatest().toMutableJSON();
    const teamId = uuidv4();
    const workspaceId = uuidv4();
    const dummyTeam = {
      teamId: teamId,
      name: "Hub",
      workspaces: [{ name: "My Workspace", workspaceId: workspaceId }],
      users: [{ id: user.id, name: user.name, email: "", role: "owner" }],
      owner: user.id,
      admins: [],
      isActiveTeam: true,
      isOpen: true,
      isNewInvite: false,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    };
    await this.teamRepository.createTeam(dummyTeam);
    const dummyWorkspace = {
      _id: workspaceId,
      name: "My Workspace",
      team: {
        teamId: teamId,
        teamName: "Hub",
      },
      admins: [{ id: user.id, name: user.name }],
      users: [{ id: user.id, name: user.name, email: "", role: "admin" }],
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      isActiveWorkspace: true,
      isNewInvite: false,
      environmentId: "",
      collections: [],
    };
    await this.workspaceRepository.addWorkspace(dummyWorkspace);
    const environmentId = uuidv4();
    const newEnvironment = {
      id: environmentId,
      name: "Global Variables",
      variable: [
        {
          key: "",
          value: "",
          checked: true,
        },
      ],
      isActive: false,
      type: "GLOBAL",
      workspaceId: workspaceId,
      createdAt: new Date().toISOString(),
      createdBy: "username",
      updatedBy: "username",
      updatedAt: "2024-07-16T11:12:55.920Z",
    };

    this.environmentRepository.addEnvironment(newEnvironment);

    this.guideRepository.insert({ isActive: true, id: "environment-guide" });
    this.guideRepository.insert({ isActive: true, id: "collection-guide" });
  };

  private skipLoginHandler = async () => {
    // Save Guest User in local DB
    const response = await this.getGuestUserState();
    if (response) {
      await this.createGuestUserTeamWorkspace();
      isGuestUserActive.set(true);
      navigate("/guest/collections");
      MixpanelEvent(Events.CONTINUE_WITHOUT_SIGNUP, {
        source: "Sparrow Auth",
      });
    }
  };


  private async processDeepLink(url: string): Promise<void> {
    try {
      await getCurrentWindow().setFocus();
      const params = new URLSearchParams(url.split("?")[1]);
      const currentUserAccessToken = params.get("accessToken");
      const existingAccessToken = localStorage.getItem("AUTH_TOKEN");
      const workspaceId = params.get("workspaceID");
      const isSparrowEdge = params.get("isSparrowEdge");

      // If running in Sparrow Edge mode and a valid access token already exists,
      // skip further login logic to avoid overriding the existing user session.
      if (isSparrowEdge === "true" && existingAccessToken) {
        return;
      }

      // Get current policy settings
      let policySettings: any;
      policyConfig.subscribe(value => {
        policySettings = value;
      })();

      if (!policySettings?.enableLogin) {
        console.error({
          title: "Access Denied",
          content: "Sign-in has been disabled by organization policy"
        });
        return;
      }

      // Handle Sparrow Edge case
      if (isSparrowEdge === "true" && !existingAccessToken) {
        // Check if sign-in is disabled by policy
        
        await this.addGuestUser();
        setTimeout(async () => {
          await this.skipLoginHandler();
        }, 1000);
        return;
      }

      // Validate user access
      const isValidUser = await this.validateUserAccess(currentUserAccessToken);
      if (!isValidUser) {
        console.error({
          title: "Access Denied",
          content: "Please log out the current user before switching accounts"
        });
        userValidationStore.set({ isValid: false });
        return;
      }

      // Check if sign-in is disabled when trying to log in
      if (currentUserAccessToken && !policySettings.enableLogin) {
        console.error({
          title: "Access Denied",
          content: "Sign-in has been disabled by organization policy"
        });
        return;
      }

      // Check if workspace switching is disabled when trying to switch workspaces
      if (workspaceId && policySettings?.hubCreationAllowed) {
        console.error({
          title: "Access Denied",
          content: "Workspace access has been disabled by organization policy"
        });
        return;
      }

      // If all policy checks pass, proceed with login and workspace switching
      await this.handleLoginAndWorkspaceSwitchThrottler(url, workspaceId);
    } catch (error) {
      Sentry.captureException(error);
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
      Sentry.captureException(error);
      console.error("Error registering deep link handler:", error);
    }
  }
}
