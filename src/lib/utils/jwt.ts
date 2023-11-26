import constants from "$lib/utils/constants";

const jwtDecode = (jwt: string) => {
  return JSON.parse(window.atob(jwt.split(".")[1]));
};

const setAuthJwt = (key: string, token: string) => {
  setCookie(key, token, 30);
};

const clearAuthJwt = (): void => {
  eraseCookie(constants.AUTH_TOKEN);
  eraseCookie(constants.REF_TOKEN);
};

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function eraseCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

export { jwtDecode, setAuthJwt, clearAuthJwt };
