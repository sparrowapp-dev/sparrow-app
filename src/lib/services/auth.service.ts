import authApi from "$lib/api/auth.api";
import { authActions } from "$lib/store/auth.store";
import type {
  loginUserPostBody,
  registerUserPostBody,
} from "$lib/utils/dto/auth-dto";

const registerUser = async (userInfo: registerUserPostBody) => {
  const response = await authApi.registerUser(userInfo);
  if (!response.isSuccessful) throw response.message;
  authActions.setUser(response.data);
};

const loginUser = async (userInfo: loginUserPostBody) => {
  const response = await authApi.loginUser(userInfo);
  if (!response.isSuccessful)
    throw "error registering user: " + response.message;
  authActions.setUser(response.data);
};

export default {
  registerUser,
  loginUser,
};
