import { jwtDecode, setAuthJwt } from "@app/utils/jwt";
import { EnvironmentRepository } from "../../repositories/environment.repository";
import { GuestUserRepository } from "../../repositories/guest-user.repository";
import { GuideRepository } from "../../repositories/guide.repository";
import { TeamRepository } from "../../repositories/team.repository";
import { WorkspaceRepository } from "../../repositories/workspace.repository";
import { InitTab } from "@sparrow/common/factory";
import { v4 as uuidv4 } from "uuid";
import { identifyUser } from "@app/utils/posthog/posthogConfig";
import { setUser } from "@app/store/auth.store";
import constants from "@app/constants/constants";
import mixpanel from "mixpanel-browser";
import { notifications } from "@sparrow/library/ui";
import { navigate } from "svelte-navigator";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { isFirstTimeInTestFlow } from "@sparrow/workspaces/stores";
import { isUserFirstSignUp } from "@app/store/user.store";
import { Events } from "@sparrow/common/enums";

export class AuthViewModel {
  constructor() {}
  private guestUserRepository = new GuestUserRepository();
  private teamRepository = new TeamRepository();
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private initTab = new InitTab();
  private guideRepository = new GuideRepository();

  /**
   * Insert the guestr user in local DB
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
   *
   * @param data query to find details
   * @returns data from guest user repository
   */
  public findUser = async (data) => {
    const res = await this.guestUserRepository.findOne(data);
    return res;
  };

  private sendUserDataToMixpanel = (userDetails) => {
    if (constants.ENABLE_MIX_PANEL === "true") {
      mixpanel.identify(userDetails._id);
      mixpanel.people.set({ $email: userDetails.email });
    }
  };

  public handleAccountLogin = async(url: string) => {
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
      await this.guideRepository.insert({ isActive: false, id: "collection-guide" });
    }
  } else {
    console.error("acces token and refresh token not found!");
  }
}

  /**
   * create dummy team and workspace for guest user
   */
  public createGuestUserTeamWorkspace = async () => {
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
}
