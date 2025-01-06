import constants from "../constants/constants";
import { notifications } from "@sparrow/library/ui";
import { navigate } from "svelte-navigator";
import { jwtDecode, setAuthJwt, getAuthJwt } from "../utils/jwt";
import { isGuestUserActive, setUser } from "../store/auth.store";
import mixpanel from "mixpanel-browser";
import MixpanelEvent from "../utils/mixpanel/MixpanelEvent";
import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
import { GuideRepository } from "../repositories/guide.repository";
import { isUserFirstSignUp } from "src/store/user.store";
import { GuestUserRepository } from "src/repositories/guest-user.repository";
import { v4 as uuidv4 } from "uuid";
import { TeamRepository } from "src/repositories/team.repository";
import { EnvironmentRepository } from "src/repositories/environment.repository";
import { WorkspaceRepository } from "src/repositories/workspace.repository";
const _guideRepository = new GuideRepository();
const guestUserRepository = new GuestUserRepository();
const teamRepository = new TeamRepository();
const environmentRepository = new EnvironmentRepository();
const workspaceRepository = new WorkspaceRepository();

export const sendUserDataToMixpanel = (userDetails: {
  _id: string;
  email: string;
}) => {
  if (constants.ENABLE_MIX_PANEL === "true") {
    mixpanel.identify(userDetails._id);
    mixpanel.people.set({ $email: userDetails.email });
  }
};

/**
 * Get the guest user state
 */
const getGuestUserState = async () => {
  const response = await guestUserRepository.findOne({
    name: "guestUser",
  });
  return response?.getLatest().toMutableJSON().isGuestUser;
};

/**
 * add guest user in local db
 */
const addGuestUser = async () => {
  await guestUserRepository.insert({
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
const findUser = async (data) => {
  const res = await guestUserRepository.findOne(data);
  return res;
};

/**
 * create dummy team and workspace for guest user
 */
const createGuestUserTeamWorkspace = async () => {
  const response = await findUser({ name: "guestUser" });
  const user = response?.getLatest().toMutableJSON();
  const teamId = uuidv4();
  const workspaceId = uuidv4();
  const dummyTeam = {
    teamId: teamId,
    name: "Team",
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
  await teamRepository.createTeam(dummyTeam);
  const dummyWorkspace = {
    _id: workspaceId,
    name: "My Workspace",
    team: {
      teamId: teamId,
      teamName: "Team",
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
  await workspaceRepository.addWorkspace(dummyWorkspace);
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

  environmentRepository.addEnvironment(newEnvironment);

  _guideRepository.insert({ isActive: true, id: "environment-guide" });
  _guideRepository.insert({ isActive: true, id: "collection-guide" });
};

export async function handleLogin(url: string) {
  const tokens = getAuthJwt();
  if ((!tokens[0] || !tokens[1]) && !url) {
    const guestUser = await getGuestUserState();
    if (guestUser) {
      return;
    } else {
      await addGuestUser();
      await createGuestUserTeamWorkspace();
      isGuestUserActive.set(true);
      navigate("/guest/collections");
      MixpanelEvent(Events.CONTINUE_WITHOUT_SIGNUP, {
        source: "Sparrow Auth",
      });
      return;
    }
    // window.location.href = constants.SPARROW_AUTH_URL + "/init?source=web";
    // return;
  }
  if (!url) {
    return;
  }
  if (tokens[0] && tokens[1]) {
    // handles case if account already running in app
    return;
  }
  const params = new URLSearchParams(url.split("?")[1]);
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");
  const event = params.get("event");

  if (!accessToken || !refreshToken) {
    window.location.href = constants.SPARROW_AUTH_URL + "/init?source=web";
    return;
  }
  // handles case if token exist in url
  const userDetails = jwtDecode(accessToken);
  setAuthJwt(constants.AUTH_TOKEN, accessToken);
  setAuthJwt(constants.REF_TOKEN, refreshToken);
  setUser(jwtDecode(accessToken));
  sendUserDataToMixpanel(userDetails);

  MixpanelEvent(Events.USER_LOGIN, {
    Login_Method: "Email",
    Success: true,
  });
  // User login successfully
  if (event === "register") {
    navigate("/app/collections");
    _guideRepository.insert({ isActive: true, id: "environment-guide" });
    _guideRepository.insert({ isActive: true, id: "collection-guide" });
    isUserFirstSignUp.set(true);
  } else {
    navigate("/app/collections");

    _guideRepository.insert({ isActive: false, id: "environment-guide" });
    _guideRepository.insert({ isActive: false, id: "collection-guide" });
  }
}
