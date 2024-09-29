import type {
  loginUserPostBody,
  registerUserPostBody,
  EmailPostBody,
  verifyPostbody,
  resetPasswordPostBody,
} from "@deprecate/utils/dto";
import { makeRequest, getRefHeaders } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
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

const loginWithGoogle = async () => {
  const response = await makeRequest("GET", `${apiUrl}/api/auth/google`, {
    headers: getRefHeaders(),
  });

  return response;
};

const forgotPassword = async (emailInfo: EmailPostBody) => {
  const response = await makeRequest(
    "POST",
    `${apiUrl}/api/user/send-verification-email`,
    {
      body: emailInfo,
    },
  );

  return response;
};

const verifyEmail = async (verifyInfo: verifyPostbody) => {
  const response = await makeRequest(
    "POST",
    `${apiUrl}/api/user/verify-email`,
    {
      body: verifyInfo,
    },
  );
  return response;
};

const resetPassword = async (changePasswordBody: resetPasswordPostBody) => {
  const response = await makeRequest(
    "POST",
    `${apiUrl}/api/user/change-password`,
    {
      body: changePasswordBody,
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

export {
  registerUser,
  loginUser,
  forgotPassword,
  refreshToken,
  userLogout,
  loginWithGoogle,
  verifyEmail,
  resetPassword,
};
