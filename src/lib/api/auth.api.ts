import { constants } from "$lib/utils/constants";
import { post } from "$lib/api/api.common";

const apiUrl = constants.API_URL;

const registerUser = async (userInfo) => {
  return await post(`${apiUrl}/api/user`, userInfo);
};

const loginUser = async (userInfo) => {
  return await post(`${apiUrl}/api/auth/login`, userInfo);
};

export default {
  registerUser,
  loginUser,
};
