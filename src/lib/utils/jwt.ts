import constants from "$lib/utils/constants";

const jwtDecode = (jwt: string) => {
  return JSON.parse(window.atob(jwt.split(".")[1]));
};

const setJwt = (token: string) => {
  localStorage.setItem(constants.AUTH_TOKEN, token);
};

export { jwtDecode, setJwt };
