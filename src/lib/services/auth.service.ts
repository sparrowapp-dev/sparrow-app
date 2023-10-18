import authApi from "$lib/api/auth.api";
import { setUser } from "$lib/store/auth.store";
import type { loginUserPostBody, registerUserPostBody } from "$lib/utils/dto";
import { post } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
import { jwtDecode, setJwt } from "$lib/utils/jwt";
const apiUrl = constants.API_URL;

const registerUser = async (userInfo: registerUserPostBody) => {
  const response = await authApi.registerUser(userInfo);
  if (!response.isSuccessful) throw response.message;
  setJwt(response.data.data.accessToken.token);
  setUser(jwtDecode(response.data.data.accessToken.token));
};

const loginUser = async (userInfo: loginUserPostBody) => {
  const response = await authApi.loginUser(userInfo);
  if (!response.isSuccessful)
    throw "error registering user: " + response.message;
  setJwt(response.data.data.accessToken.token);
  setUser(jwtDecode(response.data.data.accessToken.token));
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
