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
import { Base64Converter, Sleep, StatusCode } from "@sparrow/common/utils";
import { version } from "../../../package.json";

const tabRepository = new TabRepository();
const apiTimeOut = constants.API_SEND_TIMEOUT;

const isEnableWebSocketCloud = false;
const isEnableSocketIoCloud = false;

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

// Makes Http Request to the Sparrow backend
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
      appInsights?.trackDependencyData({
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
      appInsights?.trackDependencyData({
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
    appInsights?.trackDependencyData({
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
    }  else if (e.response?.data?.statusCode === 401) {
      return error("Unauthorized");
    }
    if (e.code === "ERR_NETWORK") {
      return error(e.message);
    } else if (e.response?.data) {
      return error(e.response?.data?.message, e.response?.data);
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
  try {
    let listener;
    webSocketDataStore.update((webSocketDataMap) => {
      const wsData = webSocketDataMap.get(tab_id);
      if (wsData) {
        listener = wsData.listener;
        // Check for the original agent type from the store, not the currently selected agent
        if (
          wsData.agent === WorkspaceUserAgentBaseEnum.BROWSER_AGENT ||
          !isEnableWebSocketCloud
        ) {
          wsData.messages.unshift({
            data: message,
            transmitter: "sender",
            timestamp: formatTime(new Date()),
            uuid: uuidv4(),
          });
          listener.send(message);
          webSocketDataMap.set(tab_id, wsData);
        } else {
          wsData.messages.unshift({
            data: message,
            transmitter: "sender",
            timestamp: formatTime(new Date()),
            uuid: uuidv4(),
          });
          listener.emit("message", message);
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
  webSocketDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(tab_id);
    if (wsData) {
      const socketInsta = wsData.listener;
      if (
        wsData.agent === WorkspaceUserAgentBaseEnum.BROWSER_AGENT ||
        !isEnableWebSocketCloud
      ) {
        socketInsta.close();

        // ToDo -> Messages and Constants strings/values should be stored in a single script (named Constants)
        notifications.success("WebSocket disconnected successfully.");
      } else {
        socketInsta?.emit(
          "sparrow_internal_disconnect",
          "client io disconnect",
        );
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
  const abortController = new AbortController();
  const selectedAgent = localStorage.getItem(
    "selectedAgent",
  ) as WorkspaceUserAgentBaseEnum;
  // Initialize WebSocket store
  webSocketDataStore.update((webSocketDataMap) => {
    webSocketDataMap.set(tabId, {
      abortController: abortController,
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

  const { signal } = abortController; // Extract the signal for the request

  if (
    selectedAgent === WorkspaceUserAgentBaseEnum.BROWSER_AGENT ||
    !isEnableWebSocketCloud
  ) {
    try {
      const ws = new WebSocket(url);
      // Update store with WebSocket instance
      webSocketDataStore.update((webSocketDataMap) => {
        const wsData = webSocketDataMap.get(tabId);
        if (wsData) {
          wsData.listener = ws;
          webSocketDataMap.set(tabId, wsData);
        }
        return webSocketDataMap;
      });

      return new Promise((resolve) => {
        let hasErrorOccurred = false;
        ws.onopen = () => {
          if (signal?.aborted) {
            return;
          }
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
          resolve("");
        };

        ws.onmessage = async (event) => {
          if (signal?.aborted) {
            return;
          }
          let result: string;

          if (event.data instanceof Blob) {
            // Convert Blob to text
            result = await event.data.text();
          } else if (typeof event.data === "string") {
            // Use directly if it's already a string
            result = event.data;
          } else if (typeof event.data === "object" && event.data !== null) {
            // Convert object to string (JSON.stringify)
            result = JSON.stringify(event.data);
          } else {
            result = "";
          }

          webSocketDataStore.update((webSocketDataMap) => {
            const wsData = webSocketDataMap.get(tabId);
            if (wsData) {
              wsData.messages.unshift({
                data: result,
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
          if (signal?.aborted) {
            return;
          }
          console.error("WebSocket error:", error);
          hasErrorOccurred = true;
        };

        ws.onclose = () => {
          if (signal?.aborted) {
            return;
          }
          webSocketDataStore.update((webSocketDataMap) => {
            const wsData = webSocketDataMap.get(tabId);
            if (wsData) {
              wsData.messages.unshift({
                data: hasErrorOccurred
                  ? "Error: Failed to connect Websocket"
                  : `Disconnected from ${url}`,
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
      if (signal?.aborted) {
        return;
      }
      console.error("WebSocket connection error:", error);
      webSocketDataStore.update((webSocketDataMap) => {
        webSocketDataMap.delete(tabId);
        return webSocketDataMap;
      });
      notifications.error("Failed to connect WebSocket");
      throw error;
    }
  } else if (selectedAgent === WorkspaceUserAgentBaseEnum.CLOUD_AGENT) {
    const proxySocketIO = io(`${constants.PROXY_SERVICE}/`, {
      path: "/socket.io", // Path to the WebSocket gateway
      transports: ["websocket"], // Ensure the transport is set to WebSocket
      query: {
        targetUrl: url || "",
        namespace: "/",
        headers: requestHeaders,
        targetType: "websocket",
      },
      reconnection: false,
    });

    // Update store with WebSocket instance
    webSocketDataStore.update((webSocketDataMap) => {
      const wsData = webSocketDataMap.get(tabId);
      if (wsData) {
        wsData.listener = proxySocketIO;
        webSocketDataMap.set(tabId, wsData);
      }
      return webSocketDataMap;
    });

    proxySocketIO.onAny(async (event, args) => {
      if (event === "sparrow_internal_connect_error") {
        if (signal?.aborted) {
          return;
        }
        // Connect_error listener from the target Socket.IO.
        console.error(new DOMException(args + " (URL Issue)", "ConnectError"));
        // removeSocketIoDataFromMap(_tabId);
        webSocketDataStore.update((webSocketDataMap) => {
          webSocketDataMap.delete(tabId);
          return webSocketDataMap;
        });
        notifications.error("Failed to connect WebSocket");
      } else if (event === "sparrow_internal_connect") {
        if (signal?.aborted) {
          return;
        }
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
      } else if (event === "sparrow_internal_disconnect") {
        if (signal?.aborted) {
          return;
        }
        // Disconnect listener from the target Socket.IO.
        console.error(
          new DOMException(args + " (Connection Lost)", "DisconnectError"),
        );
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
      } else {
        try {
          const parsed = JSON.parse(args);

          // Access the `data` array
          const bufferData = parsed.data;

          // Convert the buffer data to a string
          const result = String.fromCharCode(...bufferData);
          webSocketDataStore.update((webSocketDataMap) => {
            const wsData = webSocketDataMap.get(tabId);
            if (wsData) {
              wsData.messages.unshift({
                data: result,
                transmitter: "receiver",
                timestamp: formatTime(new Date()),
                uuid: uuidv4(),
              });
              webSocketDataMap.set(tabId, wsData);
            }
            return webSocketDataMap;
          });
        } catch (e) {
          console.error(e);
        }
      }
    });

    // Listen for connect_error events from the proxy Socket.IO.
    proxySocketIO.on("connect_error", (err) => {
      if (signal?.aborted) {
        return;
      }
      console.error(new DOMException(err + " (Proxy Failed)", "ConnectError"));
      webSocketDataStore.update((webSocketDataMap) => {
        webSocketDataMap.delete(tabId);
        return webSocketDataMap;
      });
      notifications.error("Failed to connect WebSocket");
    });
  }
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

    signal?.addEventListener("abort", () => {
        reject(new Error("Aborted during request"));
    }, { once: true });
  });
}

/**
 *
 * @param url
 * @param method
 * @param headers
 * @param body
 * @param contentType
 * @param selectedAgent
 * @param signal
 * @returns
 */
const makeHttpRequestV2 = async (
  url: string,
  method: string,
  headers: string,
  body: string,
  contentType: string,
  selectedAgent: WorkspaceUserAgentBaseEnum,
  signal?: AbortSignal,
) => {
  const startTime = performance.now();
  try {
    let response;
    if (selectedAgent === "Cloud Agent") {
      const proxyUrl = constants.PROXY_SERVICE + "/proxy/http-request";
      response = await Promise.race([axios({
          data: { url, method, headers, body, contentType },
          url: proxyUrl,
          method: "POST",
      }), waitForAbort(signal)]); 
    } else {
      try {
        let jsonHeader;
        try {
          jsonHeader = JSON.parse(headers);
        } catch (error) {
          jsonHeader = [];
        }
        const headersObject = jsonHeader.reduce(
          (
            acc: Record<string, string>,
            header: { key: string; value: string },
          ) => {
            acc[header.key] = header.value;
            return acc;
          },
          {},
        );
        let requestData = body || {};

        if (contentType === "multipart/form-data") {
          const formData = new FormData();
          const parsedBody = JSON.parse(body);
          for (const field of parsedBody || []) {
            try {
              if (field?.base) {
                const file = await new Base64Converter().base64ToFile(
                  field.base,
                  field.value,
                );
                formData.append(field.key, file);
              } else {
                formData.append(field.key, field.value);
              }
            } catch (e) {
              console.error(e);
              formData.append(field.key, field.value);
            }
          }
          requestData = formData;

          // Remove Content-Type header to let Axios set it automatically with boundary
          delete headersObject["Content-Type"];
        } else if (contentType === "application/x-www-form-urlencoded") {
          const urlSearchParams = new URLSearchParams();
          const parsedBody = JSON.parse(body);
          (parsedBody || []).forEach(
            (field: { key: string; value: string }) => {
              urlSearchParams.append(field.key, field.value);
            },
          );
          requestData = urlSearchParams;
        } else if (
          contentType === "application/json" ||
          contentType === "text/plain"
        ) {
          // Add Content-Type to headersObject explicitly
          headersObject["Content-Type"] = contentType;
        }

        const axiosResponse = await Promise.race([axios({
          method,
          url,
          data: requestData || {},
          headers: { ...headersObject },
          responseType: 'arraybuffer',
          validateStatus: function (status) {
            return true;
          },
        }), waitForAbort(signal)]);
        let responseData = "";
        const responseContentType = axiosResponse.headers['content-type'] || '';
        if(responseContentType.startsWith('image/')){
          const base64 = btoa(
            new Uint8Array(axiosResponse.data)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
      
          responseData = `data:${contentType};base64,${base64}`;

          response = {
            data: {
              status: `${axiosResponse.status} ${axiosResponse.statusText || new StatusCode().getText(axiosResponse.status)}`,
              data: `${responseData}`,
              headers: Object.fromEntries(Object.entries(axiosResponse.headers)),
            },
          };
        }else{
          responseData = new TextDecoder('utf-8').decode(axiosResponse.data);
          response = {
            data: {
              status: `${axiosResponse.status} ${new StatusCode().getText(axiosResponse.status)}`,
              data: responseData,
              headers: Object.fromEntries(Object.entries(axiosResponse.headers)),
            },
          };
        }

        
      } catch (axiosError: any) {
        if (signal?.aborted) {
          throw new Error();
        }

        // response = {
        //   data: {
        //     status: `${error.response.status} ${error.response.statusText}`,
        //     data: error.response?.data || error.message,
        //     headers: error.response?.headers
        //       ? Object.fromEntries(Object.entries(error.response.headers))
        //       : {},
        //   },
        // };
        return error(axiosError.message);
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
        throw new Error(
          response?.data?.data?.message || "Error parsing response",
        );
      }

      appInsights?.trackDependencyData({
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
      return error(e.toString());
    }
  } catch (e) {
    if (signal?.aborted) {
      throw new DOMException("Request was aborted", "AbortError");
    }

    console.error("Request error:", e);
    appInsights?.trackDependencyData({
      id: uuidv4(),
      name: "Browser Agent Duration Metric",
      duration: performance.now() - startTime,
      success: false,
      responseCode: 400,
      properties: { source: "frontend", type: "BA_HTTP" },
    });
    throw new Error(e);
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
  return `Connected to ${_url}`;
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
  const abortController = new AbortController();
  const selectedAgent = localStorage.getItem(
    "selectedAgent",
  ) as WorkspaceUserAgentBaseEnum;
  socketIoDataStore.update((webSocketDataMap) => {
    webSocketDataMap.set(_tabId, {
      messages: [],
      abortController: abortController,
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
  const { signal } = abortController; // Extract the signal for the request

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
  if (
    selectedAgent === WorkspaceUserAgentBaseEnum.BROWSER_AGENT ||
    !isEnableSocketIoCloud
  ) {
    const targetSocketIO = io(
      `${urlObject.origin || ""}${urlObject.pathname || "/"}`,
      {
        transports: ["websocket"],
        reconnection: false,
      },
    );

    // store listeners inside map against tab id for future removal
    insertSocketIoListenerToMap(targetSocketIO, _tabId);

    // Listen for connect events from the target Socket.IO.
    targetSocketIO.on("connect", () => {
      if (signal?.aborted) {
        return;
      }
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
      if (signal?.aborted) {
        return;
      }
      console.error(new DOMException(err + " (URL Issue)", "ConnectError"));
      insertSocketIoDataToMap(
        _tabId,
        err.toString(),
        SocketIORequestMessageTransmitterTabEnum.DISCONNECTOR,
      );
    });

    // Listen for disconnect events from the target Socket.IO.
    targetSocketIO.on("disconnect", (err) => {
      if (signal?.aborted) {
        return;
      }
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
      if (signal?.aborted) {
        return;
      }
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
  } else {
    const proxySocketIO = io(`${constants.PROXY_SERVICE}/`, {
      path: "/socket.io", // Path to the WebSocket gateway
      transports: ["websocket"], // Ensure the transport is set to WebSocket
      query: {
        targetUrl: urlObject.origin || "",
        namespace: urlObject.pathname || "/",
        headers: _headers,
        targetType: "socketio",
      },
      reconnection: false,
    });

    // store listeners inside map against tab id for future removal
    insertSocketIoListenerToMap(proxySocketIO, _tabId);

    proxySocketIO.onAny(async (event, args) => {
      if (event === "sparrow_internal_connect_error") {
        if (signal?.aborted) {
          return;
        }
        // Connect_error listener from the target Socket.IO.
        console.error(new DOMException(args + " (URL Issue)", "ConnectError"));
        removeSocketIoDataFromMap(_tabId);
      } else if (event === "sparrow_internal_connect") {
        if (signal?.aborted) {
          return;
        }
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
        if (signal?.aborted) {
          return;
        }
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
        if (signal?.aborted) {
          return;
        }
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
      if (signal?.aborted) {
        return;
      }
      console.error(new DOMException(err + " (Proxy Failed)", "ConnectError"));
      removeSocketIoDataFromMap(_tabId);
    });
  }
};

/**
 * Disconnects a Socket.IO connection for a specific tab and handles the response.
 * @param _tabId - The ID of the tab for which the Socket.IO connection should be disconnected.
 */
const disconnectSocketIo = async (_tabId: string): Promise<void> => {
  let url = "";
  let abortController;
  let isRequestCancelled = false;
  socketIoDataStore.update((socketIoDataMap) => {
    const wsData = socketIoDataMap.get(_tabId);
    if (wsData) {
      url = wsData.url;
      if (wsData?.status === "connecting") {
        wsData.status = "disconnected";
        abortController = wsData?.abortController;
        isRequestCancelled = true;

        insertSocketIoDataToMap(
          _tabId,
          "Connection aborted",
          SocketIORequestMessageTransmitterTabEnum.DISCONNECTOR,
        );
      } else {
        wsData.status = "disconnecting";
        isRequestCancelled = false;
      }
      wsData.url = "";
      socketIoDataMap.set(_tabId, wsData);
    }
    return socketIoDataMap;
  });
  if (isRequestCancelled) {
    if (abortController) {
      abortController.abort(); // Abort the request using the stored controller
    }
    return;
  }

  socketIoDataStore.update((webSocketDataMap) => {
    const wsData = webSocketDataMap.get(_tabId);
    if (wsData) {
      const socketInsta = wsData.connectListener;
      if (
        wsData.agent === WorkspaceUserAgentBaseEnum.BROWSER_AGENT ||
        !isEnableSocketIoCloud
      ) {
        socketInsta?.disconnect();
        notifications.success(
          `${SocketIORequestDefaultAliasBaseEnum.NAME} disconnected successfully.`,
        );
      } else {
        socketInsta?.emit(
          "sparrow_internal_disconnect",
          "client io disconnect",
        );
      }
    }
    return webSocketDataMap;
  });
};

/**
 * Invoke Proxy service function to fetch graphql result.
 * @param url - Request URL
 * @param headers - Request Header
 * @param body - Request GraphQL Query
 */
const makeGraphQLRequest = async (
  _url: string,
  _headers: string,
  _query: string,
  _selectedAgent: WorkspaceUserAgentBaseEnum,
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
    if (_selectedAgent === "Cloud Agent") {
      const proxyUrl = constants.PROXY_SERVICE + "/proxy/graphql-request";
      const axiosResponse = await axios({
        data: {
          url: _url,
          method: "POST",
          headers: _headers || "[]",
          body: JSON.stringify({
            query: _query,
            variables: _variables || {},
          }),
          contentType: "application/json",
        },
        url: proxyUrl,
        method: "POST",
      });

      httpResponse = JSON.stringify({
        body: JSON.stringify(axiosResponse.data.data),
        headers: axiosResponse.data.headers,
        status: axiosResponse.data.status,
      });
    } else {
      let jsonHeader;
        try {
          jsonHeader = JSON.parse(_headers);
        } catch (error) {
          jsonHeader = [];
        }
        const headersObject = jsonHeader.reduce(
          (
            acc: Record<string, string>,
            header: { key: string; value: string },
          ) => {
            acc[header.key] = header.value;
            return acc;
          },
          {},
        );
      const axiosResponse = await axios({
        method: "POST",
        url: _url,
        headers: {...headersObject},
        data: { query: _query, variables: _variables || {} } || {},
      });

      httpResponse = JSON.stringify({
        body: JSON.stringify(axiosResponse.data),
        headers: axiosResponse.headers,
        status:
          axiosResponse.status +
          " " +
          new StatusCode().getText(axiosResponse.status),
      });
    }
    const endTime = performance.now();
    const duration = endTime - startTime;
    const appInsightData = {
      id: uuidv4(),
      name: "Proxy Duration Metric",
      duration,
      success: true,
      responseCode: 200,
      properties: {
        source: "frontend",
        type: "PROXY_GRAPHQL",
      },
    };
    appInsights.trackDependencyData(appInsightData);
  } catch (err) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    appInsights.trackDependencyData({
      id: uuidv4(),
      name: "Proxy Duration Metric",
      duration: duration,
      success: false,
      responseCode: 400,
      properties: {
        source: "frontend",
        type: "PROXY_GRAPHQL",
      },
    });
    if (_signal?.aborted) {
      // Check if request is aborted after request fails
      throw new DOMException(abortGraphqlRequestErrorMessage, "AbortError");
    }
    if (err?.response) {
      httpResponse = JSON.stringify({
        body: JSON.stringify(err.response.data),
        headers: err.response.headers,
        status:
          err.response.status +
          " " +
          new StatusCode().getText(err.response.status),
      });
      const parsedResponse = JSON.parse(httpResponse);
      return success(parsedResponse);
    }
    throw new Error(err as string);
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
