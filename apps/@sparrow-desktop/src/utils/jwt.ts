import constants from "@app/constants/constants";

const jwtDecode = (jwt: string) => {
  return JSON.parse(window.atob(jwt.split(".")[1]));
};

const setAuthJwt = (key: string, token: string) => {
  if (token[token.length - 1] == "#") {
    token = token.slice(0, -1);
  }
  localStorage.setItem(key, token);
};

const getAuthJwt = () => {
  const authToken = localStorage.getItem("AUTH_TOKEN");
  const refToken = localStorage.getItem("REF_TOKEN");
  return [authToken, refToken];
};

const clearAuthJwt = (): void => {
  localStorage.removeItem(constants.AUTH_TOKEN);
  localStorage.removeItem(constants.REF_TOKEN);
};

export { jwtDecode, setAuthJwt, clearAuthJwt, getAuthJwt };
