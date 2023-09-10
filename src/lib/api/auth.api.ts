import constants from "$lib/utils/constants";
import { post } from "$lib/api/api.common";
import type {
  loginUserPostBody,
  registerUserPostBody,
} from "$lib/utils/dto/auth-dto";

const apiUrl = constants.API_URL;

const registerUser = async (userInfo: registerUserPostBody) => {
  return await post(`${apiUrl}/api/user`, userInfo);
};

const loginUser = async (userInfo: loginUserPostBody) => {
  return await post(`${apiUrl}/api/auth/login`, userInfo);
};

export default {
  registerUser,
  loginUser,
};
