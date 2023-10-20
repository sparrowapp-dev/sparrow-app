import type {
  loginUserPostBody,
  registerUserPostBody,
  EmailPostBody,
} from "$lib/utils/dto";
import { makeRequest, getRefHeaders } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
const apiUrl: string = constants.API_URL;

const registerUser = async (userInfo: registerUserPostBody) => {
  const response = await makeRequest("POST", `${apiUrl}/api/user`, {
    body: userInfo,
  });
  return response;
};

const loginUser = async (userInfo: loginUserPostBody) => {
  const response = await makeRequest("POST", `${apiUrl}/api/auth/login`, {
    body: userInfo,
  });
  return response;
};

const forgotPassword = async (email: EmailPostBody) => {
  const response = await makeRequest(
    "POST",
    `${apiUrl}/api/auth/forgot-password`,
    {
      body: email,
    },
  );
  return response;
};

const userLogout = async () => {
  const response = await makeRequest("GET", `${apiUrl}/api/user/logout`, {
    headers: getRefHeaders(),
  });
  return response;
};

const refreshToken = async () => {
  const response = await makeRequest(
    "POST",
    `${apiUrl}/api/auth/refresh-token`,
    {
      headers: getRefHeaders(),
    },
  );
  return response;
};

export { registerUser, loginUser, forgotPassword, refreshToken, userLogout };
