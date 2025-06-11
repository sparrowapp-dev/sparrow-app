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
import { version } from "../../../src-tauri/tauri.conf.json";

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
    "x-app-version": version,
  };
};

const getMultipartAuthHeaders = () => {
  return {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${getUserToken()}`,
    "x-app-version": version,
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
    "x-app-version": version,
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
  await invoke("send_websocket_message", { tabid: tab_id, message: message })
    .then(async (data: string) => {
      try {
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
  let url = "";
  socketIoDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(tab_id);
    if (wsData) {
      url = wsData.url;
    }
    return webSocketDataMap;
  });
  let urlObject = new URL(url);
  await invoke("send_socket_io_message", {
    tabid: tab_id,
    event: _eventName,
    message: message,
  })
    .then(async (data: string) => {
      try {
        // Logic to handle response
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
        notifications.error(
          `Failed to send message over ${SocketIORequestDefaultAliasBaseEnum.NAME} connection. Please try again.`,
        );
        return removeSocketDataFromMap(tab_id, url);
      }
    })
    .catch((e) => {
      console.error(e);
      notifications.error(
        `Failed to send message over ${SocketIORequestDefaultAliasBaseEnum.NAME} connection. Please try again.`,
      );
      return removeSocketDataFromMap(tab_id, url);
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
  let abortController;
  let isRequestCancelled = false;
  webSocketDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(tab_id);
    if (wsData) {
      url = wsData.url;
      if (wsData?.status === "connecting") {
        wsData.status = "disconnected";
        abortController = wsData?.abortController;
        isRequestCancelled = true;
        wsData.messages.unshift({
          data: `Connection aborted`,
          transmitter: "disconnector",
          timestamp: formatTime(new Date()),
          uuid: uuidv4(),
        });
      } else {
        wsData.status = "disconnecting";
        isRequestCancelled = false;
      }
      wsData.url = "";
      webSocketDataMap.set(tab_id, wsData);
    }
    return webSocketDataMap;
  });
  if (isRequestCancelled) {
    if (abortController) {
      abortController.abort(); // Abort the request using the stored controller
    }
    return;
  }
  await invoke("disconnect_websocket", { tabid: tab_id })
    .then(async (data: string) => {
      try {
        // Logic to handle response
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

const addSocketDataToMap = (tabId, url) => {
  try {
    updateSocketDataStore(
      tabId,
      `Connected to ${url}`,
      "connecter",
      "connected",
    );
    notifications.success(
      `${SocketIORequestDefaultAliasBaseEnum.NAME} connected successfully.`,
    );
  } catch (error) {
    console.error(error);
  }
};

const removeSocketDataFromMap = (tab_id, url, err = "") => {
  socketIoDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(tab_id);

    // If no websocket data exists for the given tab_id, return the map as is
    if (!wsData) return webSocketDataMap;

    const { connectListener, disconnectListener, messageListener } = wsData;

    if (err && err.includes("Invalid")) {
      const errorMesssage = err.replace(/["\\]/g, "").trim();
      // Clean up listeners and update the error message in map.
      connectListener?.();
      disconnectListener?.();
      messageListener?.();
      updateSocketDataStore(
        tab_id,
        errorMesssage,
        "disconnector",
        "disconnected",
      );

      // notifications.error(
      //   `Failed to connect ${SocketIORequestDefaultAliasBaseEnum.NAME}. Please try again.`,
      // );
    } else {
      updateSocketDataStore(
        tab_id,
        `Disconnected from ${url}`,
        "disconnector",
        "disconnected",
      );

      connectListener?.();
      disconnectListener?.();
      messageListener?.();
    }

    return webSocketDataMap;
  });
};

// Function to update process socket io messages
async function processMessageEvent(tabId, event) {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Retrieve tab data and check event inclusion
  const tabData = await tabRepository.getTabByTabId(tabId);
  const tabDataJSON = tabData?.toMutableJSON();
  const socketIOresponse = event.payload;
  const eventName = socketIOresponse.event;
  const message = socketIOresponse.message;

  // Check if event should be included
  const isIncludeInResponse = tabDataJSON?.property.socketio?.events.some(
    (tabEvent) => tabEvent.listen && tabEvent.event === eventName,
  );

  // Update WebSocket data store if conditions are met
  if (socketIOresponse && isIncludeInResponse && message) {
    updateSocketDataStore(
      tabId,
      JSON.stringify([
        eventName,
        typeof message[0] === "string"
          ? message[0]
          : JSON.stringify(message[0]),
      ]),
      "receiver",
    );
  }
}

// Function to update WebSocket data store
function updateSocketDataStore(tabId, data, transmitter, status = "") {
  socketIoDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(tabId);
    if (wsData) {
      wsData.messages.unshift({
        data,
        transmitter,
        timestamp: formatTime(new Date()),
        uuid: uuidv4(),
      });
      if (status && status.length) wsData.status = status;
      webSocketDataMap.set(tabId, wsData);
    }
    return webSocketDataMap;
  });
}

const storeListenerstoMap = (
  connectListener,
  disconnectListener,
  messageListener,
  tabId,
) => {
  socketIoDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(tabId);
    if (wsData) {
      wsData.connectListener = connectListener;
      wsData.disconnectListener = disconnectListener;
      wsData.messageListener = messageListener;
    }
    return webSocketDataMap;
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
  let abortController;
  let isRequestCancelled = false;
  socketIoDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(tab_id);

    if (wsData) {
      url = wsData.url;
      if (wsData?.status === "connecting") {
        wsData.status = "disconnected";
        abortController = wsData?.abortController;
        isRequestCancelled = true;
        updateSocketDataStore(
          tab_id,
          `Connection aborted`,
          "disconnector",
          "disconnected",
        );
      } else {
        wsData.status = "disconnecting";
        isRequestCancelled = false;
      }
      wsData.url = "";
      webSocketDataMap.set(tab_id, wsData);
    }
    return webSocketDataMap;
  });
  if (isRequestCancelled) {
    if (abortController) {
      abortController.abort(); // Abort the request using the stored controller
    }
    return;
  }
  await invoke("disconnect_socket_io", { tabid: tab_id })
    .then(async (data: string) => {
      try {
        // Logic to handle response
        const response = JSON.parse(data);

        if (response.is_successful) {
          notifications.success(
            `${SocketIORequestDefaultAliasBaseEnum.NAME} disconnected successfully.`,
          );
        } else {
          notifications.error(
            `Failed to disconnect ${SocketIORequestDefaultAliasBaseEnum.NAME}. ${response.message}`,
          );
        }
      } catch (e) {
        console.error(e);
        notifications.error(
          `Failed to disconnect ${SocketIORequestDefaultAliasBaseEnum.NAME}. Please try again.`,
        );
      }
    })
    .catch((e) => {
      console.error(e);
      notifications.error(
        `Failed to disconnect ${SocketIORequestDefaultAliasBaseEnum.NAME}. Please try again.`,
      );
      return removeSocketDataFromMap(tab_id, url);
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
  const httpurl = convertWebSocketUrl(url);
  const abortController = new AbortController();
  console.table({ url, httpurl, tabId, requestHeaders });
  webSocketDataStore.update((webSocketDataMap) => {
    webSocketDataMap.set(tabId, {
      abortController: abortController,
      messages: [],
      status: "connecting",
      search: "",
      contentType: RequestDataTypeEnum.TEXT,
      body: "",
      filter: "All Messages",
      url: url,
      listener: null,
    });

    return webSocketDataMap;
  });

  const { signal } = abortController; // Extract the signal for the request

  await invoke("connect_websocket", {
    url: url,
    httpurl: httpurl,
    tabid: tabId,
    headers: requestHeaders,
  })
    .then(async () => {
      try {
        if (signal?.aborted) {
          // Ignore response if request was cancelled
          return;
        }
        // Store the WebSocket and initialize data
        webSocketDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tabId);
          if (wsData) {
            wsData.messages.unshift({
              data: `Connected to ${url}`,
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
          if (event?.payload?.type === "disconnect") {
            let disconnectListener;
            webSocketDataStore.update((webSocketDataMap) => {
              const wsData = webSocketDataMap.get(tabId);
              if (wsData) {
                disconnectListener = wsData.listener;
                wsData.messages.unshift({
                  data: `Disconnected from ${url}`,
                  transmitter: "disconnector",
                  timestamp: formatTime(new Date()),
                  uuid: uuidv4(),
                });
                wsData.status = "disconnected";
                webSocketDataMap.set(tabId, wsData);
                if (disconnectListener) {
                  disconnectListener();
                }
              }
              return webSocketDataMap;
            });
          } else {
            webSocketDataStore.update((webSocketDataMap) => {
              const wsData = webSocketDataMap.get(tabId);
              if (wsData) {
                wsData.messages.unshift({
                  data: event?.payload?.data,
                  transmitter: "receiver",
                  timestamp: formatTime(new Date()),
                  uuid: uuidv4(),
                });
                webSocketDataMap.set(tabId, wsData);
              }
              return webSocketDataMap;
            });
          }
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
      // Store the error state in websocket
      webSocketDataStore.update((webSocketDataMap) => {
        const wsData = webSocketDataMap.get(tabId);
        if (wsData) {
          wsData.messages.unshift({
            data: e,
            transmitter: "disconnector",
            timestamp: formatTime(new Date()),
            uuid: uuidv4(),
          });
          wsData.status = "disconnected";
          webSocketDataMap.set(tabId, wsData);
        }
        return webSocketDataMap;
      });

      // webSocketDataStore.update((webSocketDataMap) => {
      //   webSocketDataMap.delete(tabId);
      //   return webSocketDataMap;
      // });
      // notifications.error("Failed to connect WebSocket. Please try again.");
      return error(e);
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
  const abortController = new AbortController();
  socketIoDataStore.update((webSocketDataMap) => {
    webSocketDataMap.set(tabId, {
      abortController: abortController,
      messages: [],
      status: "connecting",
      search: "",
      contentType: RequestDataTypeEnum.TEXT,
      body: "",
      filter: "All Messages",
      url: url,
      connectListener: null,
      disconnectListener: null,
      messageListener: null,
    });

    return webSocketDataMap;
  });

  const { signal } = abortController; // Extract the signal for the request

  let urlObject;
  try {
    let validUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      validUrl = "http://" + url;
    }
    urlObject = new URL(validUrl);
  } catch (e) {
    console.error("Invalid host name", e);
    removeSocketDataFromMap(tabId, url, "Invalid host name");
    return;
  }

  await invoke("connect_socket_io", {
    url: urlObject.origin || "",
    namespace: urlObject.pathname || "/",
    tabid: tabId,
    headers: requestHeaders,
  })
    .then(async () => {
      try {
        // All the response of particular web socket can be listened here. (Can be shifted to another place)
        // Connect Listener
        const connectListener = await listen(
          `socket-connect-${tabId}`,
          async () => {
            if (signal?.aborted) {
              return;
            }
            return addSocketDataToMap(tabId, url);
          },
        );
        // Disconnect listener
        const disconnectListener = await listen(
          `socket-disconnect-${tabId}`,
          async (data) => {
            if (signal?.aborted) {
              return;
            }
            const err = data.payload.message;
            console.error("invalid namespace", err);
            return removeSocketDataFromMap(tabId, url, err);
          },
        );
        // Handle message listener
        const messageListener = await listen(
          `socket-message-${tabId}`,
          (event) => {
            if (signal?.aborted) {
              return;
            }
            processMessageEvent(tabId, event);
          },
        );

        // store listeners inside map against tab id for future removal
        storeListenerstoMap(
          connectListener,
          disconnectListener,
          messageListener,
          tabId,
        );
      } catch (e) {
        console.error(e);
        notifications.error(
          `Failed to fetch ${SocketIORequestDefaultAliasBaseEnum.NAME} response. Please try again.`,
        );
        return error("error");
      }
    })
    .catch((e) => {
      console.error("Invalid host name", e);
      removeSocketDataFromMap(tabId, url, "Invalid host name");
      return error("error");
    });
};

/**
 *
 * @param signal - AbortSignal to listen for abort events
 * @returns
 */
const waitForAbort = (signal: AbortSignal): Promise<never> => {
  return new Promise((_, reject) => {
    if (signal?.aborted) {
      return reject(new Error("Aborted before starting"));
    }

    signal?.addEventListener(
      "abort",
      () => {
        reject(new Error("Aborted during request"));
      },
      { once: true },
    );
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
    const data = await Promise.race([
      invoke("make_http_request_v2", {
        url,
        method,
        headers,
        body,
        request,
      }),
      waitForAbort(signal),
    ]);
    // Handle the response and update UI accordingly
    if (signal?.aborted) {
      throw new Error(); // Ignore response if request was cancelled
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    try {
      const responseBody = JSON.parse(data);
      const apiResponse: Response = JSON.parse(responseBody.body) as Response;

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
      const responseBody = JSON.parse(data);
      return error(responseBody.body);
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

/**
 * Function to convert schema into required type. (Will shift to util in future, DO NOT REMOVE IT.)
 */
const formatGraphQLSchema = (introspectionData) => {
  const schema = {};
  introspectionData.__schema?.types?.forEach((type) => {
    // Ignore built-in types like __Schema, __Type, etc.
    if (type?.name?.startsWith("__")) return;

    // Create header comments for the types
    const headerComment = type?.description ? `"""${type?.description}"""` : "";
    const typeDef = [];

    switch (type?.kind) {
      case "OBJECT":
        // Special handling for Query, Mutation, and Subscription
        if (["Query", "Mutation", "Subscription"].includes(type?.name)) {
          typeDef.push(`type ${type?.name} {`);
          type?.fields?.forEach((field) => {
            const args = field?.args
              .map((arg) => `${arg?.name}: ${formatFieldType(arg?.type)}`)
              .join(", ");
            const fieldComment = field?.description
              ? `"""${field?.description}"""`
              : "";
            typeDef.push(`  ${fieldComment}`);
            typeDef.push(
              `  ${field?.name}(${args}): ${formatFieldType(field?.type)}${
                field?.type?.kind === "NON_NULL" ? "!" : ""
              }`,
            );
          });
          typeDef.push("}");
        } else {
          typeDef.push(`type ${type?.name} {`);
          type?.fields?.forEach((field) => {
            const fieldComment = field?.description
              ? `"""${field?.description}"""`
              : "";
            typeDef.push(`  ${fieldComment}`);
            typeDef.push(
              `  ${field?.name}: ${formatFieldType(field?.type)}${
                field?.type?.kind === "NON_NULL" ? "!" : ""
              }`,
            );
          });
          typeDef.push("}");
        }
        break;

      case "INPUT_OBJECT":
        typeDef.push(`input ${type.name} {`);
        type.inputFields.forEach((field) => {
          const fieldComment = field.description
            ? `"""${field.description}"""`
            : "";
          typeDef.push(`  ${fieldComment}`);
          typeDef.push(
            `  ${field.name}: ${formatFieldType(field.type)}${
              field.type.kind === "NON_NULL" ? "!" : ""
            }`,
          );
        });
        typeDef.push("}");
        break;

      case "SCALAR":
        typeDef.push(`scalar ${type.name}`);
        break;

      default:
        break;
    }

    // Store the formatted type definition in the schema object
    schema[type?.name] = headerComment
      ? `${headerComment}\n${typeDef.join("\n")}`
      : typeDef.join("\n");
  });

  // Combine all the types into a single schema string
  return Object.values(schema).join("\n\n");
};

// Helper function to format field types, handling nested types and non-null markers
const formatFieldType = (type) => {
  if (type?.kind === "NON_NULL") return `${formatFieldType(type?.ofType)}!`;
  if (type?.kind === "LIST") return `[${formatFieldType(type?.ofType)}]`;
  return type?.name || type?.ofType?.name || "";
};

/**
 * Invoke RPC Function to fetch graphql result.
 * @param url - Request URL
 * @param headers - Request Header
 * @param body - Request GraphQL Query
 */
const makeGraphQLRequest = async (
  _url: string,
  _headers: string,
  _query: string,
  _variables?: string,
  _signal?: AbortSignal,
): Promise<
  HttpClientResponseInterface<{
    body: string;
    headers: object;
    status: string;
  }>
> => {
  let httpResponse: string;
  const abortGraphqlRequestErrorMessage = `Running GraphQL Request with url ${_url} is aborted by the user`;
  const startTime = performance.now();
  try {
    httpResponse = await invoke("send_graphql_request", {
      url: _url,
      headers: _headers,
      query: _query,
      variables: _variables || "{}",
    });
    const endTime = performance.now();
    const duration = endTime - startTime;
    const appInsightData = {
      id: uuidv4(),
      name: "RPC Duration Metric",
      duration,
      success: true,
      responseCode: 200,
      properties: {
        source: "frontend",
        type: "RPC_GRAPHQL",
      },
    };
    appInsights.trackDependencyData(appInsightData);
  } catch (err) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    appInsights.trackDependencyData({
      id: uuidv4(),
      name: "RPC Duration Metric",
      duration: duration,
      success: false,
      responseCode: 400,
      properties: {
        source: "frontend",
        type: "RPC_GRAPHQL",
      },
    });
    if (_signal?.aborted) {
      // Check if request is aborted after request fails
      throw new DOMException(abortGraphqlRequestErrorMessage, "AbortError");
    }
    return success({
      body: {},
      headers: {},
      status: 400,
    });
  }
  if (_signal?.aborted) {
    // Check if request is aborted after request success
    throw new DOMException(abortGraphqlRequestErrorMessage, "AbortError");
  }
  try {
    const parsedResponse = JSON.parse(httpResponse);
    return success(parsedResponse);
  } catch (err) {
    throw err;
  }
};

export {
  makeRequest,
  getAuthHeaders,
  getRefHeaders,
  getMultipartAuthHeaders,
  makeHttpRequestV2,
  connectWebSocket,
  sendMessage,
  disconnectWebSocket,
  sendSocketIoMessage,
  connectSocketIo,
  disconnectSocketIo,
  makeGraphQLRequest,
};
