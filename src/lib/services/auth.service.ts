import authApi from "$lib/api/auth.api";
import { authActions } from "$lib/store/auth.store";
import type { loginUserPostBody, registerUserPostBody } from "$lib/utils/dto";
import { post } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
const apiUrl = constants.API_URL;

const registerUser = async (userInfo: registerUserPostBody) => {
  const response = await authApi.registerUser(userInfo);
  if (!response.isSuccessful) throw response.message;
  authActions.setUser(response.data);
};

const loginUser = async (userInfo: loginUserPostBody) => {
  const response = await authApi.loginUser(userInfo);
  if (!response.isSuccessful)
    throw "error registering user: " + response.message;
  console.log(response.data);
  authActions.setUser(response.data);
};

const forgotPassword = async (email: object) => {
  const response = await post(`${apiUrl}/api/auth/forgot-password`, email);
  return response;
};

export default {
  registerUser,
  loginUser,
  forgotPassword,
};
