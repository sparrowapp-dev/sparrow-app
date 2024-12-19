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
import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
import { socketIoDataStore } from "../../../../../packages/@sparrow-workspaces/src/features/socketio-explorer/store/socketio";
import io from "socket.io-client";
import { TabRepository } from "src/repositories/tab.repository";
import { WorkspaceUserAgentBaseEnum } from "@sparrow/common/types/workspace/workspace-base";
import {
  SocketIORequestMessageTransmitterTabEnum,
  SocketIORequestStatusTabEnum,
  type EventsValues,
} from "@sparrow/common/types/workspace/socket-io-request-tab";
import { Sleep } from "@sparrow/common/utils";
const tabRepository = new TabRepository();
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
  const selectedAgent = localStorage.getItem(
    "selectedAgent",
  ) as WorkspaceUserAgentBaseEnum;

  try {
    webSocketDataStore.update((webSocketDataMap) => {
      const wsData = webSocketDataMap.get(tab_id);
      if (wsData) {
        const listener = wsData.listener;
        if (
          wsData.agent === WorkspaceUserAgentBaseEnum.BROWSER_AGENT ||
          wsData.agent === WorkspaceUserAgentBaseEnum.CLOUD_AGENT
        ) {
          wsData.messages.unshift({
            data: message,
            transmitter: "sender",
            timestamp: formatTime(new Date()),
            uuid: uuidv4(),
          });
          listener.send(message);
          webSocketDataMap.set(tab_id, wsData);
        }
      }
      return webSocketDataMap;
    });
  } catch (e) {
    console.error(e);
    notifications.error("Failed to send message");
    return error("error");
  }
};

/**
 * Disconnects a WebSocket connection for a specific tab and handles the response.
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

  webSocketDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(tab_id);
    if (wsData) {
      const socketInsta = wsData.listener;
      if (
        wsData.agent === WorkspaceUserAgentBaseEnum.BROWSER_AGENT ||
        wsData.agent === WorkspaceUserAgentBaseEnum.CLOUD_AGENT
      ) {
        socketInsta.close();
      }
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
  const selectedAgent = localStorage.getItem(
    "selectedAgent",
  ) as WorkspaceUserAgentBaseEnum;

  if (selectedAgent === WorkspaceUserAgentBaseEnum.BROWSER_AGENT) {
    // Existing browser agent implementation remains the same
    try {
      const headers = JSON.parse(requestHeaders);

      webSocketDataStore.update((webSocketDataMap) => {
        webSocketDataMap.set(tabId, {
          messages: [],
          status: "connecting",
          agent: selectedAgent,
          search: "",
          contentType: RequestDataTypeEnum.TEXT,
          body: "",
          filter: "All Messages",
          url: url,
        });
        return webSocketDataMap;
      });

      const ws = new WebSocket(url);

      webSocketDataStore.update((webSocketDataMap) => {
        const wsData = webSocketDataMap.get(tabId);
        if (wsData) {
          wsData.listener = ws;
          webSocketDataMap.set(tabId, wsData);
        }
        return webSocketDataMap;
      });

      return new Promise((resolve, reject) => {
        ws.onopen = () => {
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
          notifications.success("WebSocket connected successfully");
          resolve();
        };

        ws.onmessage = (event) => {
          webSocketDataStore.update((webSocketDataMap) => {
            const wsData = webSocketDataMap.get(tabId);
            if (wsData) {
              wsData.messages.unshift({
                data: event.data,
                transmitter: "receiver",
                timestamp: formatTime(new Date()),
                uuid: uuidv4(),
              });
              webSocketDataMap.set(tabId, wsData);
            }
            return webSocketDataMap;
          });
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          webSocketDataStore.update((webSocketDataMap) => {
            webSocketDataMap.delete(tabId);
            return webSocketDataMap;
          });
        };

        ws.onclose = () => {
          webSocketDataStore.update((webSocketDataMap) => {
            const wsData = webSocketDataMap.get(tabId);
            if (wsData) {
              wsData.messages.unshift({
                data: `Disconnected from ${url}`,
                transmitter: "disconnector",
                timestamp: formatTime(new Date()),
                uuid: uuidv4(),
              });
              wsData.status = "disconnected";
              webSocketDataMap.set(tabId, wsData);
            }
            return webSocketDataMap;
          });
        };
      });
    } catch (error) {
      console.error(error);
      webSocketDataStore.update((webSocketDataMap) => {
        webSocketDataMap.delete(tabId);
        return webSocketDataMap;
      });
      notifications.error("Failed to connect WebSocket");
      throw error;
    }
  } else if (selectedAgent === WorkspaceUserAgentBaseEnum.CLOUD_AGENT) {
    try {
      // Initialize store with connecting status
      try {
        webSocketDataStore.update((webSocketDataMap) => {
          webSocketDataMap.set(tabId, {
            messages: [],
            status: "connecting",
            agent: selectedAgent,
            search: "",
            contentType: RequestDataTypeEnum.TEXT,
            body: "",
            filter: "All Messages",
            url: url,
          });
          return webSocketDataMap;
        });
      } catch (storeError) {
        console.error("Failed to initialize WebSocket store:", storeError);
        notifications.error("Failed to initialize WebSocket connection state");
        throw new Error(`Store initialization failed: ${storeError.message}`);
      }

      // Validate and construct proxy URL
      let proxyUrl;
      try {
        if (!url) throw new Error("Target URL is required");
        if (!tabId) throw new Error("Tab ID is required");
        proxyUrl = `ws://localhost:9005/ws?tabid=${encodeURIComponent(tabId)}&targetUrl=${url}`;
        proxyUrl = convertWebSocketUrl(proxyUrl);
      } catch (urlError) {
        console.error("Invalid URL or tabId:", urlError);
        notifications.error("Invalid connection parameters");
        throw new Error(`URL construction failed: ${urlError.message}`);
      }

      // Create WebSocket connection
      let ws;
      try {
        ws = new WebSocket(proxyUrl, ["Auth", "Nayan"]);
      } catch (wsError) {
        console.error("WebSocket creation failed:", wsError);
        notifications.error("Failed to create WebSocket connection");
        throw new Error(`WebSocket initialization failed: ${wsError.message}`);
      }

      // Update store with WebSocket instance
      try {
        webSocketDataStore.update((webSocketDataMap) => {
          const wsData = webSocketDataMap.get(tabId);
          if (wsData) {
            wsData.listener = ws;
            webSocketDataMap.set(tabId, wsData);
          }
          return webSocketDataMap;
        });
      } catch (listenerError) {
        console.error(
          "Failed to update WebSocket listener in store:",
          listenerError,
        );
        ws.close();
        throw new Error(`Listener update failed: ${listenerError.message}`);
      }

      return new Promise((resolve, reject) => {
        // const connectionTimeout = setTimeout(() => {
        //   try {
        //     ws.close();
        //     notifications.error("Cloud Agent WebSocket connection timeout");
        //     reject(new Error("Connection timeout after 10000ms"));
        //   } catch (timeoutError) {
        //     console.error("Error during timeout handling:", timeoutError);
        //     reject(timeoutError);
        //   }
        // }, 10000);

        ws.onopen = () => {
          try {
            // clearTimeout(connectionTimeout);
            webSocketDataStore.update((webSocketDataMap) => {
              const wsData = webSocketDataMap.get(tabId);
              if (wsData) {
                wsData.messages.unshift({
                  data: `Connected to ${url} via Cloud Agent`,
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
              "WebSocket connected successfully via Cloud Agent",
            );
            resolve();
          } catch (openError) {
            console.error("Error in onopen handler:", openError);
            // reject(new Error(`Connection open failed: ${openError.message}`));
          }
        };

        ws.onmessage = (event) => {
          try {
            webSocketDataStore.update((webSocketDataMap) => {
              const wsData = webSocketDataMap.get(tabId);
              if (wsData) {
                wsData.messages.unshift({
                  data: event.data,
                  transmitter: "receiver",
                  timestamp: formatTime(new Date()),
                  uuid: uuidv4(),
                });
                webSocketDataMap.set(tabId, wsData);
              }
              return webSocketDataMap;
            });
          } catch (messageError) {
            console.error(
              "Error processing message:",
              messageError,
              "Message data:",
              event.data,
            );
            notifications.error("Failed to process incoming message");
          }
        };

        ws.onerror = (error) => {
          // clearTimeout(connectionTimeout);

          try {
            // Log the complete error event
            console.error("Cloud Agent WebSocket error details:", {
              readyState: ws.readyState,
              url: ws.url,
              protocol: ws.protocol,
              bufferedAmount: ws.bufferedAmount,
              extensions: ws.extensions,
              errorEvent: {
                type: error.type,
                timeStamp: error.timeStamp,
                eventPhase: error.eventPhase,
                isTrusted: error.isTrusted,
              },
            });
          } catch (errorHandlingError) {
            console.error("Error in error handler:", errorHandlingError);
            reject(errorHandlingError);
          }
        };

        ws.onclose = () => {
          try {
            // clearTimeout(connectionTimeout);
            webSocketDataStore.update((webSocketDataMap) => {
              const wsData = webSocketDataMap.get(tabId);
              if (wsData) {
                wsData.messages.unshift({
                  data: `Disconnected from ${url} (Cloud Agent)`,
                  transmitter: "disconnector",
                  timestamp: formatTime(new Date()),
                  uuid: uuidv4(),
                });
                wsData.status = "disconnected";
                webSocketDataMap.set(tabId, wsData);
              }
              return webSocketDataMap;
            });
          } catch (closeError) {
            console.error("Error handling WebSocket close:", closeError);
            notifications.error("Error during connection closure");
          }
        };
      });
    } catch (error) {
      console.error("Cloud Agent connection error:", error);

      // Attempt to clean up the store even if there's an error
      try {
        webSocketDataStore.update((webSocketDataMap) => {
          webSocketDataMap.delete(tabId);
          return webSocketDataMap;
        });
      } catch (cleanupError) {
        console.error("Failed to clean up WebSocket store:", cleanupError);
      }

      notifications.error(
        `Failed to connect WebSocket via Cloud Agent: ${error.message}`,
      );
      throw error;
    }
  }
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
      // const proxyUrl = constants.PROXY_SERVICE + "/proxy/http-request";
      const proxyUrl = "http://localhost:3000/proxy/http-request";
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

/**
 * Processes a Socket.IO message event for a specific tab, determining if the event should be included in the response.
 * @param _tabId - The unique identifier of the tab for which the event is being processed.
 * @param _event - The event object containing the payload with the event name and message data.
 * @returns A promise that resolves to a JSON string containing the event name and message (if included), or an empty string if the event is not included.
 */
const processMessageEvent = async (
  _tabId: string,
  _event: {
    payload: {
      event: string;
      message: any[];
    };
  },
): Promise<string> => {
  await new Sleep().setTime(10);

  // Retrieve tab data and check event inclusion
  const tabData = await tabRepository.getTabByTabId(_tabId);
  const tabDataJSON = tabData?.toMutableJSON();
  const socketIOresponse = _event.payload;
  const eventName = socketIOresponse.event;
  const message = socketIOresponse.message;

  // Check if event should be included
  const isIncludeInResponse = tabDataJSON?.property.socketio?.events.some(
    (tabEvent: EventsValues) => tabEvent.listen && tabEvent.event === eventName,
  );

  // Update WebSocket data store if conditions are met
  if (socketIOresponse && isIncludeInResponse && message) {
    return JSON.stringify([
      eventName,
      typeof message[0] === "string" ? message[0] : JSON.stringify(message[0]),
    ]);
  }
  return "";
};

/**
 * Generates a message indicating a successful connection to a specified URL.
 * @param _url - The URL of the connection.
 * @returns A message indicating the connection was established.
 */
const processConnectEvent = (_url: string): string => {
  return `Connected from ${_url}`;
};

/**
 * Generates a message indicating a disconnection from a specified URL.
 * @param _url - The URL of the disconnection.
 * @returns A message indicating the disconnection occurred.
 */
const processDisconnectEvent = (_url: string): string => {
  return `Disconnected from ${_url}`;
};

/**
 * Adds a Socket.IO listener to the map associated with a specific tab ID.
 * @param _socketIo - The Socket.IO instance or listener to be associated with the tab.
 * @param _tabId - The unique identifier of the tab for which the listener is being set.
 */
const insertSocketIoListenerToMap = (_socketIo: any, _tabId: string) => {
  socketIoDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(_tabId);
    if (wsData) {
      wsData.connectListener = _socketIo;
      webSocketDataMap.set(_tabId, wsData);
    }
    return webSocketDataMap;
  });
};

/**
 * Inserts a new Socket.IO data message into the map associated with a given tab ID.
 * Updates the tab's status if the transmitter indicates a connection or disconnection event.
 * @param _tabId - The unique identifier of the tab for which the data is being updated.
 * @param _data - The data message to be inserted into the Socket.IO map.
 * @param _transmitter - The transmitter type indicating the origin or purpose of the message (e.g., CONNECTER, DISCONNECTOR).
 */
const insertSocketIoDataToMap = (
  _tabId: string,
  _data: string,
  _transmitter: SocketIORequestMessageTransmitterTabEnum,
) => {
  socketIoDataStore.update((SocketIoDataMap) => {
    const wsData = SocketIoDataMap.get(_tabId);
    if (wsData) {
      wsData.messages.unshift({
        data: _data,
        transmitter: _transmitter,
        timestamp: formatTime(new Date()),
        uuid: uuidv4(),
      });
      if (_transmitter === SocketIORequestMessageTransmitterTabEnum.CONNECTER) {
        wsData.status = SocketIORequestStatusTabEnum.CONNECTED;
      } else if (
        _transmitter === SocketIORequestMessageTransmitterTabEnum.DISCONNECTOR
      ) {
        wsData.status = SocketIORequestStatusTabEnum.DISCONNECTED;
      }
      SocketIoDataMap.set(_tabId, wsData);
    }
    return SocketIoDataMap;
  });
};

/**
 * Removes Socket.IO from the tab data Map.
 * @param _tabId - Tab Id as a key to which data should be cleared from Map.
 */
const removeSocketIoDataFromMap = (_tabId: string): void => {
  socketIoDataStore.update((socketIoDataMap) => {
    const wsData = socketIoDataMap.get(_tabId);
    // If no websocket data exists for the given tab_id, return the map as is
    if (!wsData) return socketIoDataMap;
    // Clean up listeners and delete the socket data
    socketIoDataMap.delete(_tabId);
    notifications.error(
      `Failed to connect ${SocketIORequestDefaultAliasBaseEnum.NAME}. Please try again.`,
    );
    return socketIoDataMap;
  });
};

/**
 * Sends a Socket.IO event and message to a specific tab and handles the response.
 * @param _tabId - The ID of the tab to which the message should be sent.
 * @param _eventMessage - The event message to be sent to the SocketIO.
 * @param _eventName - The event name to be sent to the SocketIO.
 *
 */
const sendSocketIoMessage = async (
  _tabId: string,
  _eventMessage: string,
  _eventName: string,
): Promise<void> => {
  let url = "";
  socketIoDataStore.update((socketIoDataMap) => {
    const wsData = socketIoDataMap.get(_tabId);
    if (wsData) {
      url = wsData.url;
    }
    return socketIoDataMap;
  });

  socketIoDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(_tabId);
    const event = [];
    event.push(_eventName);
    event.push(_eventMessage || "(empty)");
    if (wsData) {
      const socketInsta = wsData.connectListener;
      socketInsta.emit(_eventName, _eventMessage);
      wsData.messages.unshift({
        data: JSON.stringify(event),
        transmitter: SocketIORequestMessageTransmitterTabEnum.SENDER,
        timestamp: formatTime(new Date()),
        uuid: uuidv4(),
      });
      webSocketDataMap.set(_tabId, wsData);
    }
    return webSocketDataMap;
  });
};

/**
 * Connects to a Socket.IO at a specified URL for a specific tab and handles the response.
 * @param _url - Socket.IO server URL to connect.
 * @param _tabId - ID of the tab for which the Socket.IO connection should be established.
 * @param _headers - Headers to be sent with the Socket.IO connection.
 */
const connectSocketIo = async (
  _url: string,
  _tabId: string,
  _headers: string,
): Promise<void> => {
  console.table({ URL: _url, Headers: _headers });
  const selectedAgent = localStorage.getItem(
    "selectedAgent",
  ) as WorkspaceUserAgentBaseEnum;
  socketIoDataStore.update((webSocketDataMap) => {
    webSocketDataMap.set(_tabId, {
      messages: [],
      agent: selectedAgent,
      status: SocketIORequestStatusTabEnum.CONNECTING,
      search: "",
      contentType: RequestDataTypeEnum.TEXT,
      body: "",
      filter: "All Messages",
      url: _url,
      connectListener: null,
    });

    return webSocketDataMap;
  });

  let urlObject: URL;
  try {
    let validUrl = _url;
    if (!_url.startsWith("http://") && !_url.startsWith("https://")) {
      validUrl = "http://" + _url;
    }
    urlObject = new URL(validUrl);
  } catch (e) {
    console.error(e);
    removeSocketIoDataFromMap(_tabId);
    return;
  }
  constants.API_URL;
  if (selectedAgent === WorkspaceUserAgentBaseEnum.CLOUD_AGENT) {
    const proxySocketIO = io(`${constants.SOCKET_IO_API_URL}/`, {
      path: "/socket.io", // Path to the WebSocket gateway
      transports: ["websocket"], // Ensure the transport is set to WebSocket
      query: {
        targetUrl: urlObject.origin || "",
        namespace: urlObject.pathname || "/",
        headers: _headers,
      },
      reconnection: false,
    });

    // store listeners inside map against tab id for future removal
    insertSocketIoListenerToMap(proxySocketIO, _tabId);

    proxySocketIO.onAny(async (event, args) => {
      if (event === "sparrow_internal_connect_error") {
        // Connect_error listener from the target Socket.IO.
        console.error(new DOMException(args + " (URL Issue)", "ConnectError"));
        removeSocketIoDataFromMap(_tabId);
      } else if (event === "sparrow_internal_connect") {
        // Connect listener from the target Socket.IO.
        const message = processConnectEvent(_url);
        insertSocketIoDataToMap(
          _tabId,
          message,
          SocketIORequestMessageTransmitterTabEnum.CONNECTER,
        );
        notifications.success(
          `${SocketIORequestDefaultAliasBaseEnum.NAME} connected successfully.`,
        );
      } else if (event === "sparrow_internal_disconnect") {
        // Disconnect listener from the target Socket.IO.
        console.error(
          new DOMException(args + " (Connection Lost)", "DisconnectError"),
        );
        const message = processDisconnectEvent(_url);
        insertSocketIoDataToMap(
          _tabId,
          message,
          SocketIORequestMessageTransmitterTabEnum.DISCONNECTOR,
        );
      } else {
        // Message listener from the target Socket.IO.
        const message = await processMessageEvent(_tabId, {
          payload: {
            event: event,
            message: args,
          },
        });
        if (message) {
          insertSocketIoDataToMap(
            _tabId,
            message,
            SocketIORequestMessageTransmitterTabEnum.RECEIVER,
          );
        }
      }
    });

    // Listen for connect_error events from the proxy Socket.IO.
    proxySocketIO.on("connect_error", (err) => {
      console.error(new DOMException(err + " (Proxy Failed)", "ConnectError"));
      removeSocketIoDataFromMap(_tabId);
    });
  } else {
    const parsedHeaders = JSON.parse(_headers as string);
    const headersObject: { [key: string]: string } = parsedHeaders.reduce(
      (
        acc: Record<string, string>,
        { key, value }: { key: string; value: string },
      ) => {
        acc[key] = value;
        return acc;
      },
      {} as { [key: string]: string },
    );
    delete headersObject["Sec-WebSocket-Key"];
    delete headersObject["Sec-WebSocket-Version"];

    const targetSocketIO = io(
      `${urlObject.origin || ""}${urlObject.pathname || "/"}`,
      {
        transports: ["websocket"],
        query: headersObject,
        reconnection: false,
      },
    );

    // store listeners inside map against tab id for future removal
    insertSocketIoListenerToMap(targetSocketIO, _tabId);

    // Listen for connect events from the target Socket.IO.
    targetSocketIO.on("connect", () => {
      const message = processConnectEvent(_url);
      insertSocketIoDataToMap(
        _tabId,
        message,
        SocketIORequestMessageTransmitterTabEnum.CONNECTER,
      );
      notifications.success(
        `${SocketIORequestDefaultAliasBaseEnum.NAME} connected successfully.`,
      );
    });

    // Listen for connect_error events from the target Socket.IO.
    targetSocketIO.on("connect_error", (err) => {
      console.error(new DOMException(err + " (URL Issue)", "ConnectError"));
      removeSocketIoDataFromMap(_tabId);
    });

    // Listen for disconnect events from the target Socket.IO.
    targetSocketIO.on("disconnect", (err) => {
      console.error(
        new DOMException(err + " (Connection Lost)", "DisconnectError"),
      );
      const message = processDisconnectEvent(_url);
      insertSocketIoDataToMap(
        _tabId,
        message,
        SocketIORequestMessageTransmitterTabEnum.DISCONNECTOR,
      );
    });

    // Listen for all dynamic events from the target Socket.IO.
    targetSocketIO.onAny(async (event: string, ...args: any[]) => {
      const message = await processMessageEvent(_tabId, {
        payload: {
          event: event,
          message: args,
        },
      });
      if (message) {
        insertSocketIoDataToMap(
          _tabId,
          message,
          SocketIORequestMessageTransmitterTabEnum.RECEIVER,
        );
      }
    });
  }
};

/**
 * Disconnects a Socket.IO connection for a specific tab and handles the response.
 * @param _tabId - The ID of the tab for which the Socket.IO connection should be disconnected.
 */
const disconnectSocketIo = async (_tabId: string): Promise<void> => {
  let url = "";
  socketIoDataStore.update((socketIoDataMap) => {
    const wsData = socketIoDataMap.get(_tabId);

    if (wsData) {
      url = wsData.url;
      wsData.status = SocketIORequestStatusTabEnum.DISCONNECTING;
      wsData.url = "";
      socketIoDataMap.set(_tabId, wsData);
    }
    return socketIoDataMap;
  });

  socketIoDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(_tabId);
    if (wsData) {
      const socketInsta = wsData.connectListener;
      if (wsData.agent === WorkspaceUserAgentBaseEnum.CLOUD_AGENT) {
        socketInsta?.emit(
          "sparrow_internal_disconnect",
          "client io disconnect",
        );
      } else {
        socketInsta?.disconnect();
      }
    }
    return webSocketDataMap;
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
  sendSocketIoMessage,
  connectSocketIo,
  disconnectSocketIo,
};
