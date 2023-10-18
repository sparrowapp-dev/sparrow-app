import axios, { type Method } from "axios";
import type { RequestData } from "../utils/dto/requestdata";
import { getUserToken } from "$lib/utils/token";

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

const makeRequest = async (
  method: Method,
  url: string,
  requestData?: RequestData,
) => {
  try {
    const response = await axios({
      method: method,
      url: url,
      data: requestData?.body,
      headers: requestData?.headers,
    });
    if (response.status === 201 || response.status === 200) {
      return success(response.data);
    } else {
      return error(response.data.message);
    }
  } catch (e) {
    if (e.message) {
      return error(e.message);
    } else if (e.response.data) {
      return error(e.response.data.message);
    }
    return error(e);
  }
};

export { makeRequest, getAuthHeaders };
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
