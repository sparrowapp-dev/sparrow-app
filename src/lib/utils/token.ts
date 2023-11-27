import constants from "$lib/utils/constants";

const getUserToken = () => {
  let token = null;
  token = getCookie(constants.AUTH_TOKEN);
  return token;
};

const getRefToken = () => {
  let token = null;
  token = getCookie(constants.REF_TOKEN);
  return token;
};

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) {
      let cookie = c.substring(nameEQ.length, c.length);
      if (cookie[cookie.length - 1] == "#") {
        cookie = cookie.substring(0, cookie.length - 1);
      }
      return cookie;
    }
  }
  return null;
}

export { getUserToken, getRefToken };
