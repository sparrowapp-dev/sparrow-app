import { loginUser } from "../../../services/auth.service";
import constants from "@app/constants/constants";
import type { loginUserPostBody } from "@deprecate/utils/dto";
import { notifications } from "@sparrow/library/ui";
import { navigate } from "svelte-navigator";
import { jwtDecode, setAuthJwt } from "@app/utils/jwt";
import { setUser } from "@app/store/auth.store";
import { resizeWindowOnLogOut, resizeWindowOnLogin } from "../../../utils";
import mixpanel from "mixpanel-browser";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
import ActiveSideBarTabViewModel from "../../Dashboard/ActiveSideBarTab.ViewModel";
import { GuideRepository } from "../../../repositories/guide.repository";

//------------------------------MixPanel-------------------------------//

export const sendUserDataToMixpanel = (userDetails) => {
  if (constants.ENABLE_MIX_PANEL === "true") {
    mixpanel.identify(userDetails._id);
    mixpanel.people.set({ $email: userDetails.email });
  }
};

//------------------------------Navigation-------------------------------//
export const navigateToRegister = () => {
  navigate("/register");
};

export const authNavigate = async () => {};
const _activeSidebarTabViewModel = new ActiveSideBarTabViewModel();
const _guideRepository = new GuideRepository();

//---------------- Handle Login ------------------//
const handleLogin = async (loginCredentials: loginUserPostBody) => {
  const response = await loginUser(loginCredentials);

  if (response.isSuccessful) {
    resizeWindowOnLogin();
    setAuthJwt(constants.AUTH_TOKEN, response?.data?.data?.accessToken.token);
    setAuthJwt(constants.REF_TOKEN, response?.data?.data?.refreshToken.token);
    const userDetails = jwtDecode(response.data?.data?.accessToken?.token);
    setUser(jwtDecode(response.data?.data?.accessToken?.token));
    sendUserDataToMixpanel(userDetails);
    MixpanelEvent(Events.USER_LOGIN, {
      Login_Method: "Email",
      Success: response.isSuccessful,
    });
    notifications.success("Login successful!");
    navigate("/dashboard/workspaces");
    _activeSidebarTabViewModel.addActiveTab("workspaces");
    return response;
  } else {
    navigate("/");
    resizeWindowOnLogOut();
    // isResponseError.set(true);
    notifications.error(response.message);
    throw "error login user: " + response.message;
  }
};
export async function handleLoginV2(url: string) {
  const params = new URLSearchParams(url.split("?")[1]);
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");
  const event = params.get("event");

  if (accessToken && refreshToken) {
    const userDetails = jwtDecode(accessToken);
    setAuthJwt(constants.AUTH_TOKEN, accessToken);
    setAuthJwt(constants.REF_TOKEN, refreshToken);
    setUser(jwtDecode(accessToken));
    sendUserDataToMixpanel(userDetails);
    MixpanelEvent(Events.USER_LOGIN, {
      Login_Method: "Email",
      Success: true,
    });
    notifications.success("Login successful!");
    if (event === "register") {
      navigate("/app/collections?first=true");
      _guideRepository.insert({ isActive: true, id: "environment-guide" });
      _guideRepository.insert({ isActive: true, id: "collection-guide" });
    } else {
      navigate("/app/collections?first=false");

      _guideRepository.insert({ isActive: false, id: "environment-guide" });
      _guideRepository.insert({ isActive: false, id: "collection-guide" });
    }
    _activeSidebarTabViewModel.addActiveTab("collections");
    await resizeWindowOnLogin();
  } else {
    notifications.error("Invalid token!");
  }
}

//------------------------- Handle Login Validation -----------------//
export const handleLoginValidation = async (
  loginCredentials: loginUserPostBody,
) => {
  // const { isError, errorObject } = await checkValidation(
  //   loginSchema,
  //   loginCredentials,
  // );
  // if (isError) {
  //   return errorObject;
  // }

  return handleLogin(loginCredentials);
};
