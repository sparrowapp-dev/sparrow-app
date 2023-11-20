import axios, { type Method } from "axios";
import type { RequestData } from "../utils/dto/requestdata";
import { getUserToken, getRefToken } from "$lib/utils/token";
import { refreshToken } from "$lib/services/auth.service";
import constants from "$lib/utils/constants";
import { clearAuthJwt, setAuthJwt } from "$lib/utils/jwt";
import { isLoading, loginStatus, setUser } from "$lib/store/auth.store";
import { navigate } from "svelte-navigator";
import { ErrorMessages } from "$lib/utils/enums/enums";
import { invoke } from "@tauri-apps/api";

const error = (error, data?) => {
  return {
    status: "error",
    isSuccessful: false,
    message: error,
    data,
  };
};

const success = (data) => {
  return {
    status: "success",
    isSuccessful: true,
    message: "",
    data,
  };
};

const getAuthHeaders = () => {
  return {
    Authorization: `Bearer ${getUserToken()}`,
  };
};

const getRefHeaders = () => {
  return {
    Authorization: `Bearer ${getRefToken()}`,
  };
};

const regenerateAuthToken = async (
  method: Method,
  url: string,
  requestData?: RequestData,
) => {
  const response = await refreshToken();
  if (response.isSuccessful) {
    setAuthJwt(constants.AUTH_TOKEN, response.data.data.newAccessToken.token);
    setAuthJwt(constants.REF_TOKEN, response.data.data.newRefreshToken.token);
    if (requestData && requestData.headers) {
      requestData.headers = getAuthHeaders();
    }
    return await makeRequest(method, url, requestData);
  } else {
    throw "error refresh token: " + response.message;
  }
};

const makeRequest = async (
  method: Method,
  url: string,
  requestData?: RequestData,
) => {
  isLoading.set(true);
  try {
    const response = await axios({
      method: method,
      url: url,
      data: requestData?.body,
      headers: requestData?.headers,
    });

    if (response.status === 201 || response.status === 200) {
      loginStatus.set(true);
      return success(response.data);
    } else {
      return error(response.data.message);
    }
  } catch (e) {
    if (e.response?.data?.message === ErrorMessages.ExpiredToken) {
      return await regenerateAuthToken(method, url, requestData);
    } else if (e.response.data.message === ErrorMessages.Unauthorized) {
      clearAuthJwt();
      setUser(null);
      navigate("/login");
      return error("unauthorized");
    }
    if (e.message) {
      return error(e.message);
    } else if (e.response.data) {
      return error(e.response.data.message);
    }
    return error(e);
  } finally {
    isLoading.set(false);
  }
};

const makeHttpRequest = async (
  url: string,
  method: string,
  headers: string,
  body: string,
  request: string,
) => {
  try {
    const response: string = await invoke("make_type_request_command", {
      url,
      method,
      headers,
      body,
      request,
    });

    if (!response) {
      throw new Error("Invalid response from the backend");
    }
    return await success(JSON.parse(response));
  } catch (e) {
    return error(e.message || "An error occurred");
  }
};

export { makeRequest, getAuthHeaders, getRefHeaders, makeHttpRequest };
//------------- We need this function in future ------------------//
// export const download = async (url, data, headers) => {
//   try {
//     let response = null;
//     if (data === null) {
//       response = await axios.get(url, {
//         headers,
//         responseType: "blob",
//       });
//     } else {
//       response = await axios.post(url, data, {
//         headers,
//         responseType: "blob",
//       });
//     }
//     var contentDisposition = response.headers["content-disposition"];
//     var filename = contentDisposition.match(/filename=(?<filename>[^,;]+);/)[0];
//     return success({
//       file: response.data,
//       filename: filename
//         .split("=")[1]
//         .replace(";", "")
//         .replace('"', "")
//         .replace('"', ""),
//     });
//   } catch (e) {
//     console.log(e);
//     if (e.response.data) {
//       let errorString = JSON.parse(await e.response.data.text());
//       return errorString;
//     }
//     return error(e);
//   }
// };
