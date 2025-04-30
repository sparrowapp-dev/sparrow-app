import constants from "../constants/constants";
import { navigate } from "svelte-navigator";
import { jwtDecode, setAuthJwt, getAuthJwt, getClientUser } from "../utils/jwt";
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
import { WorkspaceService } from "src/services/workspace.service";
import { CollectionService } from "src/services/collection.service";
import { CollectionRepository } from "src/repositories/collection.repository";
import { createDeepCopy } from "@sparrow/common/utils";
import { EnvironmentService } from "src/services/environment.service";
import { TestflowRepository } from "src/repositories/testflow.repository";
import { TestflowService } from "src/services/testflow.service";
const _guideRepository = new GuideRepository();
const guestUserRepository = new GuestUserRepository();
const teamRepository = new TeamRepository();
const environmentRepository = new EnvironmentRepository();
const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService();
const collectionService = new CollectionService();
const collectionRepository = new CollectionRepository();
const environmentService = new EnvironmentService();
const testflowRepository = new TestflowRepository();
const testflowService = new TestflowService();

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
  return response?.getLatest().toMutableJSON();
};

/**
 * add guest user in local db
 */
const addGuestUser = async () => {
  const guestUser = {
    id: uuidv4(),
    name: "guestUser",
    isGuestUser: true,
    isBannerActive: true,
  };
  await guestUserRepository.insert(guestUser);
  return guestUser;
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
  await teamRepository.createTeam(dummyTeam);
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

const createPublicTeamWorkspace = async (user: any, workspaceData: any) => {
  const teamId = "sharedWorkspaceTeam";
  const dummyTeam = {
    teamId: teamId,
    name: "Shared Workspaces",
    workspaces: [{ name: workspaceData.name, workspaceId: workspaceData._id }],
    users: [{ id: user.id, name: user.name, email: "", role: "member" }],
    owner: user.id,
    admins: [],
    isActiveTeam: true,
    isOpen: false,
    isNewInvite: false,
    createdAt: new Date().toISOString(),
    createdBy: user.id,
    updatedAt: new Date().toISOString(),
    updatedBy: user.id,
  };
  const {
    _id,
    name,
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
  } = workspaceData;
  const item = {
    _id,
    name,
    description,
    workspaceType: "PUBLIC",
    isShared: true,
    users: [
      {
        email: user?.email,
        id: user?.id,
        name: user?.name,
        role: "viewer",
      },
    ],
    collections: collection ? collection : [],
    admins: admins,
    team: {
      teamId: teamId,
      teamName: "Shared Workspaces",
      hubUrl: "",
    },
    environmentId: "",
    isActiveWorkspace: false,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    isNewInvite,
  };
  const existingWorkspace = await workspaceRepository.readWorkspace(
    workspaceData._id,
  );
  if (existingWorkspace) {
    await workspaceRepository.setActiveWorkspace(workspaceData._id);
    return;
  }
  const existingTeam = await teamRepository.getTeamDoc(teamId);
  if (existingTeam) {
    await teamRepository.removeTeam(teamId);
    await workspaceRepository.deleteWorkspacesByTeamId(teamId);
  }
  await teamRepository.createTeam(dummyTeam);
  await workspaceRepository.addWorkspace(item);
  await fetchCollections(workspaceData._id);
  await refreshEnvironment(workspaceData._id);
  await refreshTestflow(workspaceData._id);
};

/**
 * Fetch collections from services and insert to repository
 * @param workspaceId - id of current workspace
 */
const fetchCollections = async (
  workspaceId: string,
): Promise<{ collectionItemTabsToBeDeleted?: string[] }> => {
  const res = await collectionService.fetchPublicCollection(
    workspaceId,
    constants.API_URL,
  );
  if (res?.isSuccessful && res?.data?.data) {
    const collections = res.data.data;
    await collectionRepository.bulkInsertData(
      workspaceId,
      collections?.map((_collection: any) => {
        const collection = createDeepCopy(_collection);
        collection["workspaceId"] = workspaceId;
        collection["id"] = _collection._id;
        if (!collection?.description) collection.description = "";
        delete collection._id;
        return collection;
      }),
    );
  }

  return {};
};

/**
 * @description - refreshes environment data with sync to mongo server
 * @param workspaceId - workspace Id to which environment belongs
 * @returns
 */
const refreshEnvironment = async (
  workspaceId: string,
): Promise<{
  environmentTabsToBeDeleted?: string[];
}> => {
  const response = await environmentService.fetchAllPublicEnvironments(
    workspaceId,
    constants.API_URL,
  );
  if (response?.isSuccessful && response?.data?.data) {
    const environments = response.data.data;
    await environmentRepository.refreshEnvironment(
      environments?.map((_environment: any) => {
        const environment = createDeepCopy(_environment);
        environment["id"] = environment._id;
        environment["workspaceId"] = workspaceId;
        delete environment._id;
        return environment;
      }),
    );
  }
  return {};
};

/**
 * @description - refreshes testflow data with sync to mongo server
 * @param workspaceId - workspace Id to which testflow belongs
 * @returns
 */
const refreshTestflow = async (
  workspaceId: string,
): Promise<{
  testflowTabsToBeDeleted?: string[];
}> => {
  const response = await testflowService.fetchAllPublicTestflow(
    workspaceId,
    constants.API_URL,
  );
  if (response?.isSuccessful && response?.data?.data) {
    const testflows = response.data.data;
    await testflowRepository.refreshTestflow(
      testflows?.map((_testflow: any) => {
        const testflow = createDeepCopy(_testflow);
        testflow["workspaceId"] = workspaceId;
        return testflow;
      }),
    );
  }
  return {};
};

export async function handleLogin(url: string) {
  const tokens = getAuthJwt();
  const urlParams = new URLSearchParams(url.split("?")[1]);
  const workspaceId = urlParams.get("workspaceId");
  const clientUser = getClientUser();

  if ((!tokens[0] || !tokens[1]) && !url) {
    let guestUser = await getGuestUserState();
    if (guestUser?.isGuestUser) {
      return;
    } else {
      guestUser = await addGuestUser();
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
    if (workspaceId) {
      const workspaceData =
        await workspaceService.fetchPublicWorkspace(workspaceId);
      if (workspaceData.isSuccessful) {
        const res = workspaceData?.data?.data;
        await createPublicTeamWorkspace(clientUser, res);
        setTimeout(async () => {
          await workspaceRepository.setActiveWorkspace(workspaceId);
        }, 1000);
      }
    }
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
    navigate("/app/collections?first=true");
    _guideRepository.insert({ isActive: true, id: "environment-guide" });
    _guideRepository.insert({ isActive: true, id: "collection-guide" });
    isUserFirstSignUp.set(true);
  } else {
    navigate("/app/collections?first=false");

    _guideRepository.insert({ isActive: false, id: "environment-guide" });
    _guideRepository.insert({ isActive: false, id: "collection-guide" });
  }
}
