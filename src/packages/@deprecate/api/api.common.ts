/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type Method } from "axios";
import type { RequestData } from "../utils/dto/requestdata";
import { getUserToken, getRefToken } from "$lib/utils/token";
import { refreshToken } from "@app/services/auth.service";
import constants from "$lib/utils/constants";
import { setAuthJwt } from "$lib/utils/jwt";
import { isLoading } from "$lib/store/auth.store";
import { ErrorMessages } from "$lib/utils/enums/enums";
import { invoke } from "@tauri-apps/api/core";
import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { Events } from "$lib/utils/enums/mixpanel-events.enum";
import type { MakeRequestResponse } from "$lib/utils/interfaces/common.interface";
import type { Response } from "$lib/utils/interfaces/request.interface";
import { listen } from "@tauri-apps/api/event";
import { webSocketDataStore } from "@workspaces/features/socket-explorer/store";
import { v4 as uuidv4 } from "uuid";
import { RequestDataTypeEnum } from "@common/types/workspace";
import { notifications } from "@library/ui/toast/Toast";

const apiTimeOut = constants.API_SEND_TIMEOUT;

const error = (
  error: string,
  data?: any,
  tabId: string = "",
): MakeRequestResponse => {
  return {
    status: "error",
    isSuccessful: false,
    message: error,
    data,
    tabId,
  };
};

const success = (data: any): MakeRequestResponse => {
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

const getMultipartAuthHeaders = () => {
  return {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${getUserToken()}`,
  };
};

// const getHeaders = () => {
//   return {
//     "Content-type": "application/json",
//     Authorization: `Bearer ${getUserToken()}`,
//   };
// };

const getRefHeaders = () => {
  return {
    Authorization: `Bearer ${getRefToken()}`,
  };
};

export const regenerateAuthToken = async (
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
  includeAxiosData?: boolean,
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
      if (includeAxiosData) {
        return success(response, "");
      } else {
        return success(response.data, "");
      }
    } else {
      return error(response.data.message);
    }
  } catch (e) {
    if (
      e.response?.data?.statusCode === 401 &&
      e.response?.data?.message === ErrorMessages.ExpiredToken
    ) {
      return await regenerateAuthToken(method, url, requestData);
    } else if (
      e.response?.data?.statusCode === 401 &&
      e.response.data.message === ErrorMessages.Unauthorized
    ) {
      const _viewModel = new HeaderDashboardViewModel();
      await _viewModel.clientLogout();
      return error("Unauthorized");
    }
    if (e.code === "ERR_NETWORK") {
      return error(e.message);
    } else if (e.response?.data) {
      return error(e.response?.data?.message);
    }
    return error(e);
  } finally {
    isLoading.set(false);
  }
};

function timeout(timeout: number) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      rej("Timeout");
    }, timeout);
  });
}

const makeHttpRequest = async (
  url: string,
  method: string,
  headers: string,
  body: string,
  request: string,
) => {
  console.table({ url, method, headers, body, request });
  let response;
  MixpanelEvent(Events.SEND_API_REQUEST, { method: method });
  url = url.trim().replace(/ /g, "%20");
  body = body.replace(/\[SPARROW_AMPERSAND$/, "");
  return Promise.race([
    timeout(apiTimeOut),
    invoke("make_http_request", {
      url,
      method,
      headers,
      body,
      request,
    }),
  ])
    .then(async (data: string) => {
      try {
        response = JSON.parse(data);
        response = JSON.parse(response.body);
        return success(response);
      } catch (e) {
        return error("error");
      }
    })
    .catch(() => {
      return error("error");
    });
};

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  const secondsStr = seconds < 10 ? "0" + seconds : seconds;

  return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
}

/**
 * Sends a WebSocket message to a specific tab and handles the response.
 *
 * @param tab_id - The ID of the tab to which the message should be sent.
 * @param message - The message to be sent to the web socket.
 *
 */
const sendMessage = async (tab_id: string, message: string) => {
  // debugger;
  await invoke("send_websocket_message", { tabid: tab_id, message: message })
    .then(async (data: string) => {
      try {
        // Logic to handle response
        console.log("sent", JSON.parse(data));

        webSocketDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tab_id);
          if (wsData) {
            wsData.messages.push({
              data: message,
              transmitter: "sender",
              timestamp: formatTime(new Date()),
              uuid: uuidv4(),
            });
            webSocketDataMap.set(tab_id, wsData);
          }
          return webSocketDataMap;
        });
      } catch (e) {
        console.error(e);
        return error("error");
      }
    })
    .catch((e) => {
      console.error(e);
      return error("error");
    });
};

/**
 * Disconnects a WebSocket connection for a specific tab and handles the response.
 *
 * @param tab_id - The ID of the tab for which the WebSocket connection should be disconnected.
 *
 */
const disconnectWebSocket = async (tab_id: string, _url: string) => {
  webSocketDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(tab_id);
    if (wsData) {
      wsData.status = "disconnecting";
      webSocketDataMap.set(tab_id, wsData);
    }
    return webSocketDataMap;
  });
  await invoke("disconnect_websocket", { tabid: tab_id })
    .then(async (data: string) => {
      try {
        // Logic to handle response
        console.log("disconnected", data);
        webSocketDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tab_id);
          if (wsData) {
            wsData.messages.push({
              data: `Disconnected from ${_url}`,
              transmitter: "disconnector",
              timestamp: formatTime(new Date()),
              uuid: uuidv4(),
            });
            wsData.status = "disconnected";
            webSocketDataMap.set(tab_id, wsData);
          }
          return webSocketDataMap;
        });
        notifications.success("WebSocket disconnected successfully.");
      } catch (e) {
        console.error(e);
        notifications.error(
          "Failed to disconnect WebSocket. Please try again.",
        );
        return error("error");
      }
    })
    .catch((e) => {
      console.error(e);
      notifications.error("Failed to disconnect WebSocket. Please try again.");
      return error("error");
    });
};

/**
 * Connects to a WebSocket at a specified URL for a specific tab and handles the response.
 *
 * @param {string} url - The WebSocket server URL to connect to.
 * @param {string} tabId - The ID of the tab for which the WebSocket connection should be established.
 * @param {string} requestHeaders - The request headers to be sent with the WebSocket connection.
 *
 * @description
 * The function also sets up a listener for messages from the WebSocket connection.
 */
const connectWebSocket = async (
  url: string,
  tabId: string,
  requestHeaders: string,
) => {
  // debugger;
  webSocketDataStore.update((webSocketDataMap) => {
    webSocketDataMap.set(tabId, {
      messages: [],
      status: "connecting",
      search: "",
      contentType: RequestDataTypeEnum.TEXT,
      body: "",
    });

    return webSocketDataMap;
  });
  await invoke("connect_websocket", {
    url: url,
    tabid: tabId,
    headers: requestHeaders,
  })
    .then(async (data: string) => {
      try {
        // Logic to handle response
        if (data) {
          const dt = JSON.parse(data);
          console.log(dt);
        }
        // Store the WebSocket and initialize data
        webSocketDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tabId);
          if (wsData) {
            wsData.messages.push({
              data: `Connected from ${url}`,
              transmitter: "connecter",
              timestamp: formatTime(new Date()),
              uuid: uuidv4(),
            });
            wsData.status = "connected";
            webSocketDataMap.set(tabId, wsData);
          }
          return webSocketDataMap;
        });
        notifications.success("WebSocket connected successfully");

        // All the response of particular web socket can be listened here. (Can be shifted to another place)
        listen(`ws_message_${tabId}`, (event) => {
          console.log("event---->", event);

          webSocketDataStore.update((webSocketDataMap) => {
            const wsData = webSocketDataMap.get(tabId);
            if (wsData) {
              wsData.messages.push({
                data: event.payload,
                transmitter: "receiver",
                timestamp: formatTime(new Date()),
                uuid: uuidv4(),
              });
              webSocketDataMap.set(tabId, wsData);
            }
            return webSocketDataMap;
          });
        });
      } catch (e) {
        console.error(e);
        notifications.error(
          "Failed to fetch WebSocket response. Please try again.",
        );
        return error("error");
      }
    })
    .catch((e) => {
      console.error(e);
      webSocketDataStore.update((webSocketDataMap) => {
        webSocketDataMap.delete(tabId);
        return webSocketDataMap;
      });
      notifications.error("Failed to connect WebSocket. Please try again.");
      return error("error");
    });
};

/**
 * Invoke RPC Communication
 * @param url - Request URL
 * @param method - Request Method
 * @param headers - Request Headers
 * @param body - Request Body
 * @param request - Request Body Type
 * @param tabId - Tab ID
 * @returns
 */
const makeHttpRequestV2 = async (
  url: string,
  method: string,
  headers: string,
  body: string,
  request: string,
) => {
  // create a race condition between the timeout and the api call
  console.table({ url, method, headers, body, request });

  return Promise.race([
    timeout(apiTimeOut),
    // Invoke communication
    invoke("make_http_request_v2", {
      url,
      method,
      headers,
      body,
      request,
    }),
  ])
    .then(async (data: string) => {
      try {
        const responseBody = JSON.parse(data);
        const apiResponse: Response = JSON.parse(responseBody.body) as Response;
        console.table(apiResponse);
        return success(apiResponse);
      } catch (e) {
        console.error(e);
        return error("error");
      }
    })
    .catch((e) => {
      console.error(e);
      return error("error");
    });
};

export {
  makeRequest,
  getAuthHeaders,
  getRefHeaders,
  makeHttpRequest,
  getMultipartAuthHeaders,
  makeHttpRequestV2,
  connectWebSocket,
  sendMessage,
  disconnectWebSocket,
  // getHeaders,
};
