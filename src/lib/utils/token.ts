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
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

export { getUserToken, getRefToken };
