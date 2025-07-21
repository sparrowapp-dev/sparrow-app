import { Sleep, throttle as Throttle } from "@sparrow/common/utils";
import { listen } from "@tauri-apps/api/event";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getAuthJwt, getClientUser, jwtDecode, setAuthJwt } from "../utils/jwt";
import constants from "@app/constants/constants";
import { EnvironmentRepository } from "../repositories/environment.repository";
import { WorkspaceRepository } from "../repositories/workspace.repository";
import { GuestUserRepository } from "../repositories/guest-user.repository";
import { TabRepository } from "../repositories/tab.repository";
import { navigate } from "svelte-navigator";
import { platform } from "@tauri-apps/plugin-os";
import { v4 as uuidv4 } from "uuid";
import { isGuestUserActive, setUser } from "@app/store/auth.store";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { Events } from "@sparrow/common/enums";
import { TeamRepository } from "@app/repositories/team.repository";
import { GuideRepository } from "@app/repositories/guide.repository";
import { WorkspaceTabAdapter } from "@app/adapter/workspace-tab";
import * as Sentry from "@sentry/svelte";
import {policyConfig} from "@sparrow/common/store"
import { TeamService } from "@app/services/team.service";
import { WorkspaceService } from "@app/services/workspace.service";
import { identifyUser } from "@app/utils/posthog/posthogConfig";
import { notifications } from "@sparrow/library/ui";
import { isUserFirstSignUp } from "@app/store/user.store";
import { isFirstTimeInTestFlow } from "@sparrow/workspaces/stores";
import mixpanel from "mixpanel-browser";

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
  private teamService = new TeamService();
  private workspaceService = new WorkspaceService();
  
  
  /**
   * sync workspace data with backend server
   * @param userId User id
   */
  public refreshWorkspaces = async (userId: string): Promise<void> => {
    if (!userId) return;
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
          hubUrl,
          description,
          workspaceType,
          users,
          admins,
          team,
          createdAt,
          createdBy,
          collection,
          updatedAt,
          updatedBy,
          isNewInvite,
        } = elem;
        const isActiveWorkspace =
          await this.workspaceRepository.checkActiveWorkspace(_id);
        if (isActiveWorkspace) isAnyWorkspaceActive = _id;
        const item = {
          _id,
          name,
          hubUrl,
          description,
          workspaceType,
          users,
          collections: collection ? collection : [],
          admins: admins,
          team: {
            teamId: team.id,
            teamName: team.name,
            hubUrl: team?.hubUrl || "",
          },
          environmentId: "",
          isActiveWorkspace: isActiveWorkspace,
          createdAt,
          createdBy,
          updatedAt,
          updatedBy,
          isNewInvite,
        };
        data.push(item);
      }
      await this.workspaceRepository.bulkInsertData(data);
      await this.workspaceRepository.deleteOrphanWorkspaces(
        data.map((_workspace) => {
          return _workspace._id;
        }),
      );
      if (!isAnyWorkspaceActive) {
        this.workspaceRepository.setActiveWorkspace(data[0]._id);
        return;
      }
      return;
    }
  };

   /**
   * sync teams data with backend server
   * @param userId User id
   */
  public refreshTeams = async (userId: string): Promise<void> => {
    if (!userId) return;
    const response = await this.teamService.fetchTeams(userId);
    let isAnyTeamsOpen: undefined | string = undefined;
    const userPlans = [];
    if (response?.isSuccessful && response?.data?.data) {
      const data = [];
      for (const elem of response.data.data) {
        userPlans.push(elem?.plan?.id.toString());
        const {
          _id,
          name,
          hubUrl,
          xUrl,
          githubUrl,
          linkedinUrl,
          users,
          description,
          logo,
          workspaces,
          owner,
          admins,
          plan,
          createdAt,
          createdBy,
          updatedAt,
          updatedBy,
          isNewInvite,
          billing
        } = elem;
        const updatedWorkspaces = workspaces?.map((workspace) => ({
          workspaceId: workspace.id,
          name: workspace.name,
        }));
        const isOpenTeam = await this.teamRepository.checkIsTeamOpen(_id);
        if (isOpenTeam) isAnyTeamsOpen = _id;
        const item = {
          teamId: _id,
          name,
          hubUrl,
          xUrl,
          githubUrl,
          linkedinUrl,
          users,
          description,
          logo,
          workspaces: updatedWorkspaces,
          owner,
          admins,
          plan,
          isActiveTeam: false,
          createdAt,
          createdBy,
          updatedAt,
          updatedBy,
          isNewInvite,
          isOpen: isOpenTeam,
          billing
        };
        data.push(item);
      }

      await this.teamRepository.bulkInsertData(data);
      await this.teamRepository.deleteOrphanTeams(
        data.map((_team) => {
          return _team.teamId;
        }),
      );
      if (!isAnyTeamsOpen) {
        this.teamRepository.setOpenTeam(data[0].teamId);
        return;
      }
    }
  };

  private workspaceSwitcher = async (id: string) => {
    if (!id) return;
    let res = await this.workspaceRepository.readWorkspace(id);
    if (!res) {
      const userId = getClientUser().id;
      if(userId){
        await Promise.all([
              this.refreshTeams(userId),
              this.refreshWorkspaces(userId),
            ]);
      }
      await new Sleep().setTime(1000).exec();
      res = await this.workspaceRepository.readWorkspace(id);
    }
    const initWorkspaceTab = new WorkspaceTabAdapter().adapt(id, res);
    await new Sleep().setTime(1000).exec();
    await this.tabRepository.createTab(initWorkspaceTab, id);
    await this.workspaceRepository.setActiveWorkspace(id);
    navigate("collections");
  };
  private triggerAccessDeniedModal;


  constructor(_triggerAccessDeniedModal) {
    this.triggerAccessDeniedModal = _triggerAccessDeniedModal;
  }

  private teamSwitcher = async (id: string) => {
    if (!id) return;
    const res = await this.teamRepository.getTeam(id);
    if (!res) {
      console.error("team doesn't exist to switch!");
      return;
    }
    this.teamRepository.setActiveTeam(id);
    navigate("home");
  };

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

  // Private method to validate user access
  private async validateUserAccess(
    webUserAccessToken: string | null,
  ): Promise<boolean> {
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


  private sendUserDataToMixpanel = (userDetails) => {
    if (constants.ENABLE_MIX_PANEL === "true") {
      mixpanel.identify(userDetails._id);
      mixpanel.people.set({ $email: userDetails.email });
    }
  };



  private handleAccountLogin = async(url: string) => {
    const params = new URLSearchParams(url.split("?")[1]);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const event = params.get("event");
    const method = params.get("method");

    if (accessToken && refreshToken) {
      const userDetails = jwtDecode(accessToken);
      
      identifyUser(userDetails.email);
      setAuthJwt(constants.AUTH_TOKEN, accessToken);
      setAuthJwt(constants.REF_TOKEN, refreshToken);
      setUser(jwtDecode(accessToken));
      this.sendUserDataToMixpanel(userDetails);

      notifications.success("You're logged in successfully.");
      if (event === "register") {
        navigate("/app/collections?first=true");
        isUserFirstSignUp.set(true);
        MixpanelEvent(Events.USER_SIGNUP, {
          method: method,
          Success: true,
        });
        await this.guideRepository.insert({ isActive: true, id: "environment-guide" });
        await this.guideRepository.insert({ isActive: true, id: "collection-guide" });
        isFirstTimeInTestFlow.set(true);
      } else {
        navigate("/app/collections?first=false");
        MixpanelEvent(Events.USER_LOGIN, {
          method: method,
          Success: true,
        });
        await this.guideRepository.insert({ isActive: false, id: "environment-guide" });
        await  this.guideRepository.insert({ isActive: false, id: "collection-guide" });
      }
    } else {
      console.error("acces token and refresh token not found!");
    }
  }

  /**
   *
   * @param data query to find details
   * @returns data from guest user repository
   */
  public findUser = async (data) => {
    const res = await this.guestUserRepository.findOne(data);
    return res;
  };

  private queue: Promise<void> = Promise.resolve();

  private enqueue = (url: string, handler: (url: string) => Promise<void>) => {
    // Chain the promises sequentially
      this.queue = this.queue.then(() => handler(url)).catch((e) => {
        console.error('Error processing deep link:', e);
      });

      return this.queue;
  }

  private  handleIncomingDeepLink = (url: string)  => {
    this.enqueue(url, (link) => this.processDeepLink(link));
  }

  private async processDeepLink(url: string): Promise<void> {
    try {
      await getCurrentWindow().setFocus();
      const params = new URLSearchParams(url.split("?")[1]);
      const currentUserAccessToken = params.get("accessToken");
      const workspaceId = params.get("workspaceID");
      const isSparrowEdge = params.get("isSparrowEdge");
      const tokens = getAuthJwt();

       const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
      const isGuestUser = guestUser?.getLatest()?.toMutableJSON()?.isGuestUser;
      if (isGuestUser) {
        // 1. desktop app status guest
        if(isSparrowEdge){
          // desktop and web both on guest user
          // show access denied (can't open web guest account to desktop)
            this.triggerAccessDeniedModal(true);
              return;
        }else if(currentUserAccessToken){
          // desktop is guest and web app is loogedIn
          // show access denied (logout desktop first to proceed)
            this.triggerAccessDeniedModal(true);
              return;
        }
        return;
      }else if(tokens[0]){
        // 2. desktop is currently  logged in.
        if(isSparrowEdge){
          // desktop is loggedIn and web is guest
          // show access denied (cant open web guest account to desktop)
            this.triggerAccessDeniedModal(true);
              return;
        }else if(currentUserAccessToken){
            const isValidUser = await this.validateUserAccess(currentUserAccessToken);
            if (!isValidUser) {
              // different account logged in on desktop and web
              // show access denied (logout desktop first to proceed)
              this.triggerAccessDeniedModal(true);
              return;
            }else{
              // same account logged in on desktop and web
               if (workspaceId) {
                  await this.workspaceSwitcher(workspaceId as string);
                }
                return;
            }
        }
        
      }else{
        // desktop app status identity
        if(isSparrowEdge){
          // desktop is identity and web is guest account
          // show access denied (cant open web guest account to desktop)

            
              return;
        }else if(currentUserAccessToken){
           // login successful
           await this.handleAccountLogin(url);
            if (workspaceId) {
              await new Sleep().setTime(4000).exec();
              await this.workspaceSwitcher(workspaceId as string);
            }
            return;
        }
      }
  
    } catch (error) {
      Sentry.captureException(error);
      console.error(error);
    }
  }

  private throttleHandleIncomingDeepLink = new Throttle(this.handleIncomingDeepLink as any, 1000);

  // Private platform-specific handlers
  private deepLinkHandlerWindows = async (
    deepLinkUrl: DeepLinkHandlerWindowsPayload,
  ): Promise<void> => {
    const url = deepLinkUrl.payload.url;
    if (url) {
      await this.throttleHandleIncomingDeepLink(url);
    }
  };

  private deepLinkHandlerMacOs = async (deepLinkUrl: string): Promise<void> => {
    if (deepLinkUrl) {
      await this.throttleHandleIncomingDeepLink(deepLinkUrl[0]);
    }
  };

  // Private method to register deep link handler
  public async registerDeepLinkHandler(): Promise<void> {
    try {
      const os = await platform();

      if (os === "windows" || os === "linux") {
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
