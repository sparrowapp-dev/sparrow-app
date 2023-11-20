import { loginStatus } from "$lib/store/auth.store";
import constants from "$lib/utils/constants";

const jwtDecode = (jwt: string) => {
  return JSON.parse(window.atob(jwt.split(".")[1]));
};

const setAuthJwt = (key: string, token: string) => {
  localStorage.setItem(key, token);
};

const accessToken = localStorage.getItem("AUTH_TOKEN");
const refreshTokenToken = localStorage.getItem("REF_TOKEN");
if (accessToken && refreshTokenToken) {
  loginStatus.set(true);
}

const clearAuthJwt = (): void => {
  localStorage.removeItem(constants.AUTH_TOKEN);
  localStorage.removeItem(constants.REF_TOKEN);
};

export { jwtDecode, setAuthJwt, clearAuthJwt };
