import { getAuthHeaders } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import type {
  PromptDto,
  StreamPromptDto,
} from "@sparrow/common/dto/ai-assistant";
import { socketStore } from "../store/ws.store";

/**
 * Service for managing WebSocket connections and communication
 * with the AI Assistant server.
 *
 * This class implements the Singleton pattern to ensure only one WebSocket connection
 * exists throughout the application lifecycle.
 *
 * @example
 * // Correct way to get instance
 * const wsService = AiAssistantWebSocketService.getInstance();
 *
 * // Wrong way - this will throw an error
 * // const wsService = new AiAssistantWebSocketService(); // DON'T do this
 *
 * @class AiAssistantWebSocketService
 * @singleton
 */
export class AiAssistantWebSocketService {
  /**
   * Singleton instance of the AiAssistantWebSocketService.
   * @private
   * @static
   */
  private static instance: AiAssistantWebSocketService;

  // private baseUrl: string = constants.BASE_URL;
  private baseUrl: string = constants.API_URL;
  // private baseUrl: string = "ws://localhost:5000";

  /**
   * WebSocket instance for communication.
   * @private
   */
  private webSocket: WebSocket | null = null;

  /**
   * Map to store event listeners
   * @private
   */
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();

  /**
   * Connection status
   * @private
   */
  private isConnected: boolean = false;

  /**
   * Reconnection timer
   * @private
   */
  private reconnectTimer: NodeJS.Timeout | null = null;

  /**
   * Reconnection attempt count
   * @private
   */
  private reconnectAttempts: number = 0;

  /**
   * Maximum reconnection attempts
   * @private
   */
  private maxReconnectAttempts: number = 100;

  /**
   * Reconnection delay in milliseconds
   * @private
   */
  private reconnectDelay: number = 2000;

  /**
   * Private constructor to prevent direct instantiation.
   * Use {@link AiAssistantWebSocketService.getInstance} instead.
   * @private
   * @throws {Error} If attempting to create a new instance directly
   */
  private constructor() {
    if (AiAssistantWebSocketService.instance) {
      throw new Error(
        "Error: AiAssistantWebSocketService class instantiation failed! Use AiAssistantWebSocketService.getInstance() instead.",
      );
    }
    AiAssistantWebSocketService.instance = this;
    // console.log("AiAssistantWebSocketService instance created!");
    // this.connectWebSocket();
  }

  /**
   * Gets the singleton instance of AiAssistantWebSocketService.
   * This is the only way to access the WebSocket service.
   *
   * @static
   * @returns {AiAssistantWebSocketService} The singleton instance
   *
   * @example
   * const wsService = AiAssistantWebSocketService.getInstance();
   * await wsService.sendPromptMessage(promptData);
   */
  public static getInstance(): AiAssistantWebSocketService {
    if (!AiAssistantWebSocketService.instance) {
      new AiAssistantWebSocketService();
    }
    return AiAssistantWebSocketService.instance;
  }

  /**
   * Connects to the AI Assistant WebSocket server.
   * Initializes the WebSocket connection and sets up event handlers.
   */
  public connectWebSocket = () => {
    // Close existing connection if any
    if (this.webSocket) {
      this.webSocket.close();
    }

    try {
      // Create new WebSocket connection
      this.webSocket = new WebSocket(
        `${this.baseUrl}/ai-assistant`,
        // {
        // transports: ["websocket"],
        // auth: getAuthHeaders(),
        // }
      );

      // Set up event handlers
      this.webSocket.onopen = this.handleOpen;
      this.webSocket.onmessage = this.handleMessage;
      this.webSocket.onerror = this.handleError;
      this.webSocket.onclose = this.handleClose;

      return this.webSocket;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.scheduleReconnect();
      return null;
    }
  };

  private isWsConnected = (): boolean => {
    return this.webSocket?.readyState === WebSocket.OPEN;
  };

  /**
   * Handles WebSocket open event
   * @private
   */
  private handleOpen = (event: Event) => {
    // console.log("WebSocket connected successfully");
    this.isConnected = true;
    this.reconnectAttempts = 0;
    socketStore.set(this.webSocket);

    // Trigger 'connect' event for compatibility with Socket.IO
    this.triggerEvent("connect", {});
  };

  /**
   * Handles WebSocket message event
   * @private
   */
  private handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      // console.log("data received :>> ", data);
      if (data.tab_id) {
        this.triggerEvent(`assistant-response_${data.tab_id}`, data);
      } else {
        this.triggerEvent(`assistant-response`, data);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  /**
   * Handles WebSocket error event
   * @private
   */
  private handleError = (event: Event) => {
    console.error("WebSocket error:", event);
    this.triggerEvent("connect_error", {
      message: "WebSocket connection error",
    });
  };

  /**
   * Handles WebSocket close event
   * @private
   */
  private handleClose = (event: CloseEvent) => {
    // console.log(
    //   `WebSocket closed with code: ${event.code}, reason: ${event.reason}`,
    // );
    this.isConnected = false;
    this.triggerEvent("disconnect", { code: event.code, reason: event.reason });

    // Attempt to reconnect if the connection wasn't closed intentionally
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  };

  /**
   * Schedules a reconnection attempt
   * @private
   */
  private scheduleReconnect = () => {
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      !this.reconnectTimer
    ) {
      this.reconnectTimer = setTimeout(() => {
        // console.log(
        //   `Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`,
        // );
        this.reconnectAttempts++;
        this.connectWebSocket();
        this.reconnectTimer = null;
      }, this.reconnectDelay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `Maximum reconnect attempts (${this.maxReconnectAttempts}) reached`,
      );
    }
  };

  /**
   * Triggers an event and calls all registered callbacks
   * @param eventName - Name of the event to trigger
   * @param data - Data to pass to the callbacks
   * @private
   */
  private triggerEvent = (eventName: string, data: any) => {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for '${eventName}':`, error);
        }
      });
    }
  };

  /**
   * Sends a prompt message to the AI Assistant server via WebSocket.
   *
   * @param prompt - The prompt data to send.
   */
  // public sendPromptMessage = async (
  //   prompt: StreamPromptDto,
  // ): Promise<WebSocket | null> => {
  //   console.log("Inside sendPromptMessage() :>>");

  //   if (!this.webSocket || !this.isConnected) {
  //     console.error("WebSocket not connected, cannot send prompt");
  //     return null;
  //   }

  //   try {
  //     this.webSocket.send(
  //       JSON.stringify({
  //         type: "sendPrompt",
  //         payload: prompt,
  //       }),
  //     );
  //     return this.webSocket;
  //   } catch (error) {
  //     console.error("Error sending prompt message:", error);
  //     return null;
  //   }
  // };

  /**
   * Sends a message to the AI Assistant server via WebSocket.
   *
   * @param tabId - tabId
   * @param threadId - threadId
   * @param userEmail - userEmail
   * @param prompt - prompt
   * @param apiContext - apiContext
   * @returns {boolean} - Whether the message was sent successfully
   */
  public sendMessage = async (
    tabId: string,
    threadId: string,
    userEmail: string,
    prompt: string,
    apiContext: string,
  ): Promise<boolean> => {
    const message = {
      tabId,
      threadId,
      emailId: userEmail,
      userInput: prompt,
      apiData: apiContext,
    };

    if (!this.webSocket || !this.isConnected) {
      console.error("WebSocket not connected, cannot send message");
      return false;
    }

    try {
      this.webSocket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  };


  /**
   * Sends a stop generation signal to the server
   * @param tabId - The tab ID for which to stop generation
   * @returns {boolean} - Whether the signal was sent successfully
   */
  public stopGeneration = async (tabId: string, threadId: string, userEmail: string): Promise<boolean> => {
    if (!this.webSocket || !this.isConnected) {
      console.error("WebSocket not connected, cannot send stop signal");
      return false;
    }

    try {
      
      this.removeListener(`assistant-response_${tabId}`);

      // this.webSocket.send(JSON.stringify({
      //   type: "stopGeneration",
      //   tabId,
      //   threadId,
      //   emailId: userEmail,
      //   userInput: "stopGeneration",
      //   apiData: "",
      // }));

      return true;
    } catch (error) {
      console.error("Error sending stop generation signal:", error);
      return false;
    }
  };

  /**
   * Adds an event listener for a specific event
   * @param eventName - Name of the event to listen for
   * @param callback - Function to call when the event occurs
   */
  public addListener(eventName: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName)?.add(callback);
  }

  /**
   * Removes all listeners for a specific event
   * @param eventName - Name of the event to remove listeners for
   */
  public removeListener(eventName: string): void {
    this.eventListeners.delete(eventName);
  }

  /**
   * Removes a specific listener for a specific event
   * @param eventName - Name of the event
   * @param callback - The callback function to remove
   */
  public removeSpecificListener(
    eventName: string,
    callback: (data: any) => void,
  ): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  public cleanupAllListeners(): void {
    this.eventListeners.clear(); 
  }

  /**
   * Closes the WebSocket connection
   */
  public closeWSConnection(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.webSocket) {
      this.webSocket.close(1000, "Closed by client");
      this.webSocket = null;
    }

    this.isConnected = false;
  }
}
