import { getAuthHeaders } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import type {
  PromptDto,
  StreamPromptDto,
} from "@sparrow/common/dto/ai-assistant";
import { socketStore } from "../store/ws.store";
import * as Sentry from "@sentry/svelte";

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

  private baseUrl: string = constants.SPARROW_AI_WEBSOCKET_URL;

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
  private _isConnected: boolean = false;

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


  /////////////////////////////////////////////////////////////////////////////////////////////////
  //                         **** Connection Management Methods ****
  /////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Connects to the AI Assistant WebSocket server.
   * Initializes the WebSocket connection and sets up event handlers.
   */
  public connectWebSocket = () => {

    try {

      // If already connected or connecting, no need to create a new connection
      if (
        this.webSocket && 
        (this.webSocket.readyState === WebSocket.OPEN || 
        this.webSocket.readyState === WebSocket.CONNECTING)
      ) { return true; }

      // Clean up any existing connection
      this.cleanup();

      // Create new WebSocket connection
      // ToDo: Need to add autentication to avoid absure of ai socket url
      this.webSocket = new WebSocket(this.baseUrl,
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

  /**
   * Returns the current connection status 
   * @returns {boolean} - Whether the WebSocket is currently connected or not
   */
  private isWsConnected = (): boolean => {
    return this.webSocket?.readyState === WebSocket.OPEN;
  };

  /**
   * Handles WebSocket open event
   * @private
   */
  private handleOpen = (event: Event) => {
    this._isConnected = true;
    this.reconnectAttempts = 0;
    socketStore.set(this.webSocket);

    // Trigger 'connect' event for compatibility with Socket.IO
    this.triggerEvent("connect", {});
  };

  /**
   * Handles WebSocket close event
   * @private
   */
  private handleClose = (event: CloseEvent) => {
    
    this._isConnected = false;
    this.triggerEvent("disconnect", { code: event.code, reason: event.reason });

    // Attempt to reconnect if the connection wasn't closed intentionally
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  };

  /**
   * Handles WebSocket error event
   * @private
   */
  private handleError = (event: Event) => {
    this.triggerEvent("connect_error", {
      message: "WebSocket connection error",
    });
  };

  /**
   * Handles WebSocket message event
   * @private
   */
  private handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (data.tab_id) {
        this.triggerEvent(`assistant-response_${data.tab_id}`, data);
      } else {
        this.triggerEvent(`assistant-response`, data);
      }
    } catch (error) {
      console.error("Error in parsing response:", error);
    }
  };

  /**
   * Schedules a reconnection attempt
   * @private
   */
  private scheduleReconnect = () => {

    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      !this.reconnectTimer
    ) {
      this.reconnectTimer = setTimeout(() => {
        // Adding this console info, to debug in deployed environments
        console.debug(
          `Attempting to reconnect (${this.reconnectAttempts + 1}/${
            this.maxReconnectAttempts
          })...`,
        );
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
   * Closes the WebSocket connection and cleans up resources
   */
  public closeWSConnection(): void {
    this.cleanup();
    this._isConnected = false;
  }
    
  /**
   * Cleans up all resources used by the service
   * @private
   */
  private cleanup(): void {
    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Close WebSocket if it exists
    if (this.webSocket) {
      // Remove event handlers to avoid memory leaks and redundant calls on disconnection
      this.webSocket.onopen = null;
      this.webSocket.onmessage = null;
      this.webSocket.onerror = null;
      this.webSocket.onclose = null;
      
      // Close the connection if it's not already closed
      if (this.webSocket.readyState === WebSocket.OPEN || 
          this.webSocket.readyState === WebSocket.CONNECTING) {
        this.webSocket.close(1000, "Closed by client");
      }
      
      this.webSocket = null;
    }
  }
  


  /////////////////////////////////////////////////////////////////////////////////////////////////
  //                         **** Service Application Methods ****
  /////////////////////////////////////////////////////////////////////////////////////////////////
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
    conversation,
    model,
    activity,
  ): Promise<boolean> => {
    const message = {
      tabId,
      threadId,
      emailId: userEmail,
      userInput: prompt,
      apiData: apiContext,
      conversation,
      model,
      activity,
      "feature": "sparrow-ai"
    };

    if (!this.webSocket || !this.isWsConnected()) {
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

  public sendAiRequest = async (data: {
    model: string;
    modelVersion: string;
    authKey: string;
    systemPrompt: string;
    userInput: string;
    configs: {
      streamResponse: boolean;
      jsonResponseFormat: boolean;
      temperature: number;
      presencePenalty: number;
      frequencePenalty: number;
      maxTokens: number;
    }

  }): Promise<boolean> => {

    if (!this.webSocket || !this.isWsConnected()) {
      console.error("WebSocket not connected, cannot send message");
      return false;
    }

    const { configs, ...rest } = data;
    const message = { ...rest, ...configs }; // spread configs at root level

    try {
      this.webSocket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
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
   * Sends a stop generation signal to the server
   * @param tabId - The tab ID for which to stop generation
   * @returns {boolean} - Whether the signal was sent successfully
   */
  public stopGeneration = async (tabId: string, threadId: string, userEmail: string): Promise<boolean> => {
    if (!this.webSocket || !this.isWsConnected()) {
      console.error("WebSocket not connected, cannot send stop signal");
      return false;
    }

    try {
      
      this.removeListener(`assistant-response_${tabId}`);
      
    // Server is not handling stop generation event, so disabling it now will add it later.
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
      Sentry.captureException(error);
      console.error("Error sending stop generation signal:", error);
      return false;
    }
  };

    
}
