import authApi from "$lib/api/auth.api";
import { authActions } from "$lib/store/auth.store";
import type { loginUserPostBody, registerUserPostBody } from "$lib/utils/dto";
import axios from "axios";
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

const forgotPassword = (email: object) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`${apiUrl}/api/auth/forgot-password`, email)
      .then((res) => {
        resolve({ mssg: "success", res });
      })
      .catch((err) => {
        reject({ mssg: "failed", err });
      });
  });
};

export default {
  registerUser,
  loginUser,
  forgotPassword,
};
