import constants from "$lib/utils/constants";
const tokenName = constants.AUTH_TOKEN;

const getUserToken = () => {
  let token = null;
  token = localStorage.getItem(tokenName);
  return token;
};

export { getUserToken };
