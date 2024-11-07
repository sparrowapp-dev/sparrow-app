/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type Method } from "axios";
import type { RequestData } from "@sparrow/common/dto/requestdata";
import { getUserToken, getRefToken } from "@app/utils/token";
import { refreshToken } from "@app/services/auth.service";
import constants from "@app/constants/constants";
import { setAuthJwt } from "@app/utils/jwt";
import { ErrorMessages } from "@sparrow/common/enums/enums";
import { invoke } from "@tauri-apps/api/core";
import { DashboardViewModel } from "@app/pages/dashboard-page/Dashboard.ViewModel";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
import type { HttpClientResponseInterface } from "@app/types/http-client";
import { listen } from "@tauri-apps/api/event";
import { webSocketDataStore } from "@sparrow/workspaces/features/socket-explorer/store";
import { v4 as uuidv4 } from "uuid";
import { RequestDataTypeEnum } from "@sparrow/common/types/workspace";
import { notifications } from "@sparrow/library/ui";
import { appInsights } from "@app/logger";
import { socketIoDataStore } from "@sparrow/workspaces/features/socketio-explorer/store";
import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
import { TabRepository } from "@app/repositories/tab.repository";
const apiTimeOut = constants.API_SEND_TIMEOUT;

const tabRepository = new TabRepository();

const error = (
  error: string,
  data?: any,
  tabId: string = "",
): HttpClientResponseInterface<any> => {
  return {
    status: "error",
    isSuccessful: false,
    message: error,
    data,
  };
};

const success = (data: any): HttpClientResponseInterface<any> => {
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
): Promise<HttpClientResponseInterface<any>> => {
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
        console.log("sent", JSON.parse(data));

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
 * Sends a WebSocket message to a specific tab and handles the response.
 *
 * @param tab_id - The ID of the tab to which the message should be sent.
 * @param message - The message to be sent to the web socket.
 *
 */
const sendSocketIoMessage = async (
  tab_id: string,
  message: string,
  _eventName: string,
) => {
  // debugger;
  let url = "";
  socketIoDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(tab_id);
    if (wsData) {
      url = wsData.url;
    }
    return webSocketDataMap;
  });
  let urlObject = new URL(url);
  await invoke("send_socketio_message", {
    tabid: tab_id,
    namespace: urlObject.pathname || "/",
    event: _eventName,
    message: message,
  })
    .then(async (data: string) => {
      try {
        // Logic to handle response
        console.log("sent", JSON.parse(data));

        socketIoDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tab_id);
          let asdf = [];
          asdf.push(_eventName);
          asdf.push(message || "(empty)");
          const r = JSON.stringify(asdf);
          if (wsData) {
            wsData.messages.unshift({
              data: r,
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
        console.log("disconnected", data);
        let listener;
        webSocketDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tab_id);
          if (wsData) {
            listener = wsData.listener;
            wsData.messages.unshift({
              data: `Disconnected from ${url}`,
              transmitter: "disconnector",
              timestamp: formatTime(new Date()),
              uuid: uuidv4(),
            });
            wsData.status = "disconnected";
            webSocketDataMap.set(tab_id, wsData);
            if (listener) {
              listener();
            }
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
 * Disconnects a WebSocket connection for a specific tab and handles the response.
 *
 * @param tab_id - The ID of the tab for which the WebSocket connection should be disconnected.
 *
 */
const disconnectSocketIo = async (tab_id: string) => {
  let url = "";
  socketIoDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(tab_id);
    if (wsData) {
      url = wsData.url;
      wsData.status = "disconnecting";
      wsData.url = "";
      webSocketDataMap.set(tab_id, wsData);
    }
    return webSocketDataMap;
  });
  await invoke("disconnect_socketio", { tabid: tab_id })
    .then(async (data: string) => {
      try {
        // Logic to handle response
        console.log("disconnected", data);
        let listener;
        socketIoDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tab_id);
          if (wsData) {
            listener = wsData.listener;
            wsData.messages.unshift({
              data: `Disconnected from ${url}`,
              transmitter: "disconnector",
              timestamp: formatTime(new Date()),
              uuid: uuidv4(),
            });
            wsData.status = "disconnected";
            webSocketDataMap.set(tab_id, wsData);
            if (listener) {
              listener();
            }
          }
          return webSocketDataMap;
        });

        notifications.success(
          `${SocketIORequestDefaultAliasBaseEnum.NAME} disconnected successfully.`,
        );
      } catch (e) {
        console.error(e);
        notifications.error(
          `Failed to disconnect ${SocketIORequestDefaultAliasBaseEnum.NAME}. Please try again.`,
        );
        return error("error");
      }
    })
    .catch((e) => {
      console.error(e);
      notifications.error(
        `Failed to disconnect ${SocketIORequestDefaultAliasBaseEnum.NAME}. Please try again.`,
      );
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
      filter: "All messages",
      url: url,
      listener: null,
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
          console.log(dt);
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
        notifications.success("WebSocket connected successfully.");

        // All the response of particular web socket can be listened here. (Can be shifted to another place)
        const listener = await listen(`ws_message_${tabId}`, (event) => {
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
        webSocketDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tabId);
          if (wsData) {
            wsData.listener = listener;
            webSocketDataMap.set(tabId, wsData);
          }
          return webSocketDataMap;
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
 * Connects to a WebSocket at a specified URL for a specific tab and handles the response.
 *
 * @param {string} url - The WebSocket server URL to connect to.
 * @param {string} tabId - The ID of the tab for which the WebSocket connection should be established.
 * @param {string} requestHeaders - The request headers to be sent with the WebSocket connection.
 *
 * @description
 * The function also sets up a listener for messages from the WebSocket connection.
 */
const connectSocketIo = async (
  url: string,
  tabId: string,
  requestHeaders: string,
) => {
  console.table({ url, tabId, requestHeaders });
  socketIoDataStore.update((webSocketDataMap) => {
    webSocketDataMap.set(tabId, {
      messages: [],
      status: "connecting",
      search: "",
      contentType: RequestDataTypeEnum.TEXT,
      body: "",
      filter: "All messages",
      url: url,
      listener: null,
    });

    return webSocketDataMap;
  });

  let urlObject;
  try {
    urlObject = new URL(url);
  } catch (e) {
    console.error(e);
    socketIoDataStore.update((webSocketDataMap) => {
      webSocketDataMap.delete(tabId);
      return webSocketDataMap;
    });
    notifications.error(
      `Failed to connect ${SocketIORequestDefaultAliasBaseEnum.NAME}. Please try again.`,
    );
    return;
  }
  await invoke("connect_socketio", {
    url: urlObject.origin || "",
    namespace: urlObject.pathname || "/",
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
        socketIoDataStore.update((webSocketDataMap) => {
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
        notifications.success(
          `${SocketIORequestDefaultAliasBaseEnum.NAME} connected successfully.`,
        );

        // All the response of particular web socket can be listened here. (Can be shifted to another place)
        const listener = await listen(
          `socket-message-${tabId}`,
          async (event) => {
            await new Promise((res, rej) => {
              setTimeout(() => {
                res("resolved");
              }, 10);
            });
            const tabData = await tabRepository.getTabByTabId(tabId);
            const tabDataJSON = tabData?.toMutableJSON();
            let socketIOresponse = event.payload;
            const match = socketIOresponse.match(/\[.*\]/);
            let socketIoResponseArray;
            if (match) {
              socketIoResponseArray = JSON.parse(match[0]);
            }

            let tabEvents = tabDataJSON.property.socketio?.events;
            let isIncludeInResponse = false;
            for (let i = 0; i < tabEvents.length; i++) {
              if (
                tabEvents[i].listen &&
                tabEvents[i].event === socketIoResponseArray[0]
              ) {
                isIncludeInResponse = true;
                break;
              }
            }
            if (
              socketIOresponse.startsWith("42") &&
              isIncludeInResponse &&
              socketIoResponseArray[1]
            ) {
              socketIoDataStore.update((webSocketDataMap) => {
                const wsData = webSocketDataMap.get(tabId);
                if (wsData) {
                  wsData.messages.unshift({
                    data: JSON.stringify(socketIoResponseArray),
                    transmitter: "receiver",
                    timestamp: formatTime(new Date()),
                    uuid: uuidv4(),
                  });
                  webSocketDataMap.set(tabId, wsData);
                }
                return webSocketDataMap;
              });
            }
          },
        );
        socketIoDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tabId);
          if (wsData) {
            wsData.listener = listener;
            webSocketDataMap.set(tabId, wsData);
          }
          return webSocketDataMap;
        });
      } catch (e) {
        console.error(e);
        notifications.error(
          `Failed to fetch ${SocketIORequestDefaultAliasBaseEnum.NAME} response. Please try again.`,
        );
        return error("error");
      }
    })
    .catch((e) => {
      console.error(e);
      socketIoDataStore.update((webSocketDataMap) => {
        webSocketDataMap.delete(tabId);
        return webSocketDataMap;
      });
      notifications.error(
        `Failed to connect ${SocketIORequestDefaultAliasBaseEnum.NAME}. Please try again.`,
      );
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
  signal?: AbortSignal,
) => {
  console.table({ url, method, headers, body, request });
  const startTime = performance.now();

  try {
    const data = await invoke("make_http_request_v2", {
      url,
      method,
      headers,
      body,
      request,
    });

    // Handle the response and update UI accordingly
    if (signal?.aborted) {
      throw new Error(); // Ignore response if request was cancelled
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    try {
      const responseBody = JSON.parse(data);
      const apiResponse: Response = JSON.parse(responseBody.body) as Response;
      console.table(apiResponse);

      const appInsightData = {
        id: uuidv4(),
        name: "RPC Duration Metric",
        duration,
        success: true,
        responseCode: parseInt(apiResponse.status),
        properties: {
          source: "frontend",
          type: "RPC_HTTP",
        },
      };
      appInsights.trackDependencyData(appInsightData);
      return success(apiResponse);
    } catch (e) {
      throw new Error("Error parsing response");
    }
  } catch (e) {
    if (signal?.aborted) {
      throw new DOMException("Request was aborted", "AbortError");
    }
    console.error(e);
    appInsights.trackDependencyData({
      id: uuidv4(),
      name: "RPC Duration Metric",
      duration: performance.now() - startTime,
      success: false,
      responseCode: 400,
      properties: {
        source: "frontend",
        type: "RPC_HTTP",
      },
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
  sendSocketIoMessage,
  connectSocketIo,
  disconnectSocketIo,
  // getHeaders,
};
