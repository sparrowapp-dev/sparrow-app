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
import { emit } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/window";

//------------------------------Navigation-------------------------------//
export const navigateToRegister = () => {
  navigate("/register");
};

export const authNavigate = async () => {
  emit("oauthevent", { message: "initiate oauth" });
  const webView = WebviewWindow.getByLabel("oauth");
  await webView.setFocus();
};

//---------------- Handle Login ------------------//
const handleLogin = async (loginCredentials: loginUserPostBody) => {
  const response = await loginUser(loginCredentials);

  if (response.isSuccessful) {
    resizeWindowOnLogin();
    setAuthJwt(constants.AUTH_TOKEN, response?.data?.data?.accessToken.token);
    setAuthJwt(constants.REF_TOKEN, response?.data?.data?.refreshToken.token);
    setUser(jwtDecode(response.data?.data?.accessToken?.token));
    notifications.success("Login successful!");
    navigate("/home");
  } else {
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
  handleLogin(loginCredentials);
  return {};
};
