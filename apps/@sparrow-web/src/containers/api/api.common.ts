/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type Method } from "axios";
import type { RequestData } from "@sparrow/common/dto/requestdata";
import { getUserToken, getRefToken } from "@app/utils/token";
import { refreshToken } from "@app/services/auth.service";
import constants from "@app/constants/constants";
import { setAuthJwt } from "@app/utils/jwt";
import { ErrorMessages } from "@sparrow/common/enums/enums";
import { invoke } from "@tauri-apps/api/core";
import { DashboardViewModel } from "@app/pages/Dashboard/Dashboard.ViewModel";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
import type { HttpClientResponseInterface as HttpClientResponseInterface } from "@sparrow/common/http-client/client";
import { listen } from "@tauri-apps/api/event";
import { webSocketDataStore } from "@sparrow/workspaces/features/socket-explorer/store";
import { v4 as uuidv4 } from "uuid";
import { RequestDataTypeEnum } from "@sparrow/common/types/workspace";
import { notifications } from "@sparrow/library/ui";
import { appInsights } from "@app/logger";

const apiTimeOut = constants.API_SEND_TIMEOUT;

const error = (
  error: string,
  data?: any,
  tabId: string = "",
): HttpClientResponseInterface => {
  return {
    status: "error",
    isSuccessful: false,
    message: error,
    data,
    tabId,
  };
};

const success = (data: any): HttpClientResponseInterface => {
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
  const startTime = performance.now();
  try {
    const response = await axios({
      method: method,
      url: url,
      data: requestData?.body,
      headers: requestData?.headers,
    });
    const endTime = performance.now(); // End timing
    const duration = endTime - startTime; // Calculate duration in milliseconds

    if (response.status === 201 || response.status === 200) {
      appInsights.trackDependencyData({
        id: uuidv4(),
        target: url,
        name: `${method} ${url}`,
        duration,
        success: true,
        responseCode: response.status,
        properties: {
          message: response?.data?.message,
          source: "frontend",
          type: "HTTP",
        },
      });
      if (includeAxiosData) {
        return success(response, "");
      } else {
        return success(response.data, "");
      }
    } else {
      appInsights.trackDependencyData({
        id: uuidv4(),
        target: url,
        name: `${method} ${url}`,
        duration,
        success: false,
        responseCode: response.status,
        properties: {
          message: response?.data?.message,
          source: "frontend",
          type: "HTTP",
        },
      });
      return error(response.data.message);
    }
  } catch (e) {
    const endTime = performance.now(); // End timing
    const duration = endTime - startTime; // Calculate duration in milliseconds
    appInsights.trackDependencyData({
      id: uuidv4(),
      target: url,
      name: `${method} ${url}`,
      duration,
      success: false,
      responseCode: e?.response?.status || 400,
      properties: {
        message: e?.response?.data?.message,
        source: "frontend",
        type: "HTTP",
      },
    });
    if (
      e.response?.data?.statusCode === 401 &&
      e.response?.data?.message === ErrorMessages.ExpiredToken
    ) {
      return await regenerateAuthToken(method, url, requestData);
    } else if (
      e.response?.data?.statusCode === 401 &&
      e.response.data.message === ErrorMessages.JWTFailed
    ) {
      const _viewModel = new DashboardViewModel();
      await _viewModel.clientLogout();
      return error("Unauthorized");
    } else if (e.response?.data?.statusCode === 401) {
      return error("Unauthorized");
    }
    if (e.code === "ERR_NETWORK") {
      return error(e.message);
    } else if (e.response?.data) {
      return error(e.response?.data?.message);
    }
    return error(e);
  } finally {
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

        webSocketDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tab_id);
          if (wsData) {
            wsData.messages.unshift({
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
const disconnectWebSocket = async (tab_id: string) => {
  let url = "";
  webSocketDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(tab_id);
    if (wsData) {
      url = wsData.url;
      wsData.status = "disconnecting";
      wsData.url = "";
      webSocketDataMap.set(tab_id, wsData);
    }
    return webSocketDataMap;
  });
  await invoke("disconnect_websocket", { tabid: tab_id })
    .then(async (data: string) => {
      try {
        // Logic to handle response
        webSocketDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tab_id);
          if (wsData) {
            wsData.messages.unshift({
              data: `Disconnected from ${url}`,
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

const convertWebSocketUrl = (url: string) => {
  // Check if the URL starts with 'wss://'
  if (url.startsWith("wss://")) {
    return "https:/" + url.slice(5); // Replace 'wss://' with 'https://'
  }

  // Check if the URL starts with 'ws://'
  if (url.startsWith("ws://")) {
    return "http:/" + url.slice(4); // Replace 'ws://' with 'http://'
  }

  // If the URL does not start with 'wss://' or 'ws://', return it unchanged
  return url;
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
  const httpurl = convertWebSocketUrl(url);
  console.table({ url, httpurl, tabId, requestHeaders });
  webSocketDataStore.update((webSocketDataMap) => {
    webSocketDataMap.set(tabId, {
      messages: [],
      status: "connecting",
      search: "",
      contentType: RequestDataTypeEnum.TEXT,
      body: "",
      filter: "All Messages",
      url: url,
    });

    return webSocketDataMap;
  });
  await invoke("connect_websocket", {
    url: url,
    httpurl: httpurl,
    tabid: tabId,
    headers: requestHeaders,
  })
    .then(async (data: string) => {
      try {
        // Logic to handle response
        if (data) {
          const dt = JSON.parse(data);
        }
        // Store the WebSocket and initialize data
        webSocketDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tabId);
          if (wsData) {
            wsData.messages.unshift({
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
          webSocketDataStore.update((webSocketDataMap) => {
            const wsData = webSocketDataMap.get(tabId);
            if (wsData) {
              wsData.messages.unshift({
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
 * @param contentType - Request Body Type
 * @param tabId - Tab ID
 * @returns
 */
const makeHttpRequestV2 = async (
  url: string,
  method: string,
  headers: string,
  body: string,
  contentType: string,
  signal?: AbortSignal,
) => {
  const startTime = performance.now();
  const selectedAgent = localStorage.getItem("selectedAgent");
  try {
    let response;
    if (selectedAgent === "Cloud Agent") {
      const proxyUrl = constants.PROXY_SERVICE + "/proxy/http-request";
      response = await axios({
        data: { url, method, headers, body, contentType },
        url: proxyUrl,
        method: "POST",
      });
    } else {
      try {
        let jsonHeader;
        try {
          jsonHeader = JSON.parse(headers);
        } catch (error) {
          jsonHeader = {};
        }
        const headersObject = jsonHeader.reduce((acc, header) => {
          if (header.checked !== false) {
            // Include only headers that are checked or do not have a `checked` property
            acc[header.key] = header.value;
          }
          return acc;
        }, {});
        let requestData = body || {};

        if (contentType === "multipart/form-data") {
          const formData = new FormData();
          const parsedBody = JSON.parse(body);
          (parsedBody || []).forEach((field) => {
            if (field.checked !== false) {
              formData.append(field.key, field.value);
            }
          });
          requestData = formData;

          // Remove Content-Type header to let Axios set it automatically with boundary
          delete headersObject["Content-Type"];
        } else if (contentType === "application/x-www-form-urlencoded") {
          const urlSearchParams = new URLSearchParams();
          const parsedBody = JSON.parse(body);
          (parsedBody || []).forEach((field) => {
            if (field.checked !== false) {
              urlSearchParams.append(field.key, field.value);
            }
          });
          requestData = urlSearchParams;
        } else if (
          contentType === "application/json" ||
          contentType === "text/plain"
        ) {
          // Add Content-Type to headersObject explicitly
          headersObject["Content-Type"] = contentType;
        }

        const axiosResponse = await axios({
          method,
          url,
          data: requestData || {},
          headers: { ...headersObject },
          validateStatus: function (status) {
            return true;
          },
        });
        response = {
          ...axiosResponse,
          data: {
            status: `${axiosResponse.status} ${axiosResponse.statusText}`,
            data: axiosResponse.data,
            headers: Object.fromEntries(Object.entries(axiosResponse.headers)),
          },
          status: 200,
          statusText: "OK",
        };
      } catch (axiosError: any) {
        const error = axiosError;
        response = {
          data: {
            status: `${error.response.status} ${error.response.statusText}`,
            data: error.response?.data || error.message,
            headers: error.response?.headers
              ? Object.fromEntries(Object.entries(error.response.headers))
              : {},
          },
          status: 200,
          statusText: "OK",
          headers: error.response?.headers || {},
          config: error.config,
        };
      }
    }
    if (signal?.aborted) {
      throw new DOMException("Request was aborted", "AbortError");
    }
    const endTime = performance.now();
    const duration = endTime - startTime;
    try {
      let responseData;
      if (typeof response.data.data !== "string") {
        responseData = JSON.stringify(response.data.data);
      } else {
        responseData = response.data.data;
      }
      if (!response.data.status) {
        throw new Error("Error parsing response");
      }

      appInsights.trackDependencyData({
        id: uuidv4(),
        name: "Cloud Agent Duration Metric",
        duration: duration,
        success: true,
        responseCode: parseInt(response.data.status),
        properties: { source: "frontend", type: "CA_HTTP" },
      });
      return success({
        body: responseData,
        status: response.data.status,
        headers: response.data.headers,
      });
    } catch (e) {
      console.error("Response parsing error:", e);
      throw new Error("Error parsing response");
    }
  } catch (e) {
    if (signal?.aborted) {
      throw new DOMException("Request was aborted", "AbortError");
    }

    console.error("Request error:", e);
    appInsights.trackDependencyData({
      id: uuidv4(),
      name: "Browser Agent Duration Metric",
      duration: performance.now() - startTime,
      success: false,
      responseCode: 400,
      properties: { source: "frontend", type: "BA_HTTP" },
    });
    throw new Error("Error with the request");
  }
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
