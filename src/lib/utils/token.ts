import constants from "$lib/utils/constants";
const tokenName = constants.AUTH_TOKEN;

const getUserToken = () => {
  let token = "";
  const header = localStorage.getItem(tokenName);
  if (header) token = header;
  return token;
};

export { getUserToken };
