import constants from "@deprecate/utils/constants";

const getUserToken = () => {
  let token = null;
  token = localStorage.getItem(constants.AUTH_TOKEN);
  return token;
};

const getRefToken = () => {
  let token = null;
  token = localStorage.getItem(constants.REF_TOKEN);
  return token;
};

export { getUserToken, getRefToken };
