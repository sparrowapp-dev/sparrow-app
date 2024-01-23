import { loginUser } from "$lib/services/auth.service";
import constants from "$lib/utils/constants";
import type { loginUserPostBody } from "$lib/utils/dto";
import { notifications } from "$lib/utils/notifications";
import { checkValidation, loginSchema } from "$lib/utils/validation";
import { navigate } from "svelte-navigator";
import { jwtDecode, setAuthJwt } from "$lib/utils/jwt";
import { isResponseError, setUser } from "$lib/store/auth.store";
import {
  resizeWindowOnLogOut,
  resizeWindowOnLogin,
} from "$lib/components/header/window-resize";
import { invoke } from "@tauri-apps/api";
import mixpanel from "mixpanel-browser";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { Events } from "$lib/utils/enums/mixpanel-events.enum";
import ActiveSideBarTabViewModel from "./../../dashboard/ActiveSideBarTab.ViewModel";
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

export const authNavigate = async () => {
  await invoke("open_oauth_window");
};
const _activeSidebarTabViewModel = new ActiveSideBarTabViewModel();

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
    navigate("/dashboard/collections");
    _activeSidebarTabViewModel.addActiveTab("collections");
    return response;
  } else {
    navigate("/");
    resizeWindowOnLogOut();
    isResponseError.set(true);
    notifications.error(response.message);
    throw "error login user: " + response.message;
  }
};

//------------------------- Handle Login Validation -----------------//
export const handleLoginValidation = async (
  loginCredentials: loginUserPostBody,
) => {
  const { isError, errorObject } = await checkValidation(
    loginSchema,
    loginCredentials,
  );
  if (isError) {
    return errorObject;
  }

  return handleLogin(loginCredentials);
};
