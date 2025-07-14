import { getAuthHeaders } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import type {
  PromptDto,
  StreamPromptDto,
} from "@sparrow/common/dto/ai-assistant";
import { socketStore } from "../store/ws.store";
import * as Sentry from "@sentry/svelte";
import { AiModelProviderEnum, type AIModelVariant, type modelsConfigType, type PromptFileAttachment } from "@sparrow/common/types/workspace/ai-request-base";

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

  private baseUrl: string = constants.VITE_WEB_SPARROW_AI_WEBSOCKET_URL;

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
      ) {
        return true;
      }

      // Clean up any existing connection
      this.cleanup();

      // Create new WebSocket connection
      // ToDo: Need to add autentication to avoid absure of ai socket url
      this.webSocket = new WebSocket(
        this.baseUrl,
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
  public isWsConnected = (): boolean => {
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
          `Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts
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
      if (
        this.webSocket.readyState === WebSocket.OPEN ||
        this.webSocket.readyState === WebSocket.CONNECTING
      ) {
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
    teamId,
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
      teamId,
      feature: "sparrow-ai",
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
    model: AiModelProviderEnum;
    modelVersion: AIModelVariant;
    authKey: string;
    systemPrompt?: string;
    userInput: { role: 'user' | 'assistant' | 'system'; content: string; }[] | string;
    conversation?: string,
    configs: modelsConfigType;
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

  public prepareConversation = (
    modelProvider: AiModelProviderEnum,
    userPrompt: string,
    systemPrompt: string,
    isContextOn: boolean,
    // conversations: { role: 'user' | 'assistant' | 'system'; content: string; }[],
    conversations: any[],
    isJsonFormatEnabled: boolean = false,
    attachedFiles: PromptFileAttachment[]
  ) => {

    switch (modelProvider) {
      case AiModelProviderEnum.OpenAI:
        return this.prepareOpenAIConversation(isContextOn, userPrompt, systemPrompt, conversations, isJsonFormatEnabled, attachedFiles);
      case AiModelProviderEnum.DeepSeek:
        return this.prepareDeepSeekConversation(isContextOn, userPrompt, systemPrompt, conversations, isJsonFormatEnabled);
      case AiModelProviderEnum.Anthropic:
        return this.prepareAnthropicConversation(isContextOn, userPrompt, systemPrompt, conversations, isJsonFormatEnabled, attachedFiles);
      case AiModelProviderEnum.Google:
        return this.prepareGeminiConversation(isContextOn, userPrompt, systemPrompt, conversations, isJsonFormatEnabled);
      default:
        console.error("Unsupported model provider:", modelProvider);
        return;
    }

  }

  private formatConversations = (rawConversations: any[], isJsonFormatEnabled: boolean): { role: 'user' | 'assistant'; content: string; }[] => {
    return rawConversations
      .filter(({ status }) => status !== false) // Exclude error messsages
      .map(({ type, message }) => ({
        role: type === 'Sender' ? 'user' : 'assistant',
        content: isJsonFormatEnabled ? `${message} (Give Response In JSON Format)` : message,
      }));
  }

  /////////////////////////////////////////////////////////////////////////////
  //                      OpenAI Conversation Formatting
  /////////////////////////////////////////////////////////////////////////////
  private prepareOpenAIConversation = (isContextOn: boolean, userPrompt: string, systemPrompt: string, conversations: { role: 'user' | 'assistant' | 'system'; content: string; }[], isJsonFormatEnabled: boolean, currentAttachedFiles: PromptFileAttachment[]) => {
    const systemPromptContext = { role: 'system', content: systemPrompt };
    if (isContextOn && conversations.length > 0) {
      const formattedConversations = this.formatOpenAIConversations(conversations, isJsonFormatEnabled);
      return [systemPromptContext, ...formattedConversations];
    }
    // When context is off, only include system prompt and current user message
    const currentUserMessage = this.createOpenAIUserMessage(userPrompt, currentAttachedFiles, isJsonFormatEnabled);
    return [systemPromptContext, currentUserMessage];
  }

  private createOpenAIUserMessage = (userPrompt: string, attachedFiles: any[] = [], isJsonFormatEnabled: boolean) => {
    const content: any[] = [];

    // Add files first if they exist
    if (attachedFiles && attachedFiles.length > 0) {
      attachedFiles.forEach(file => {
        content.push({
          type: "file",
          file: {
            file_id: file.fileId
          }
        });
      });
    }

    // Add text content
    // const textContent = isJsonFormatEnabled ? `${userPrompt} (Give Response In JSON Format)` : userPrompt;
    content.push({
      type: "text",
      // text: textContent
      text: userPrompt
    });

    return {
      role: "user",
      content: content
    };
  }

  private formatOpenAIConversations = (rawConversations: any[], isJsonFormatEnabled: boolean): any[] => {
    return rawConversations
      .filter(({ status }) => status !== false) // Exclude error messages
      .map(({ type, message, attachedFiles }) => {
        const role = type === 'Sender' ? 'user' : 'assistant';

        if (role === 'user' && attachedFiles && attachedFiles.length > 0) {
          // User message with files
          const content: any[] = [];

          // Add files first
          attachedFiles.forEach((file: any) => {
            content.push({
              type: "file",
              file: {
                file_id: file.fileId
              }
            });
          });

          // Add text content
          const textContent = isJsonFormatEnabled ? `${message} (Give Response In JSON Format)` : message;
          content.push({
            type: "text",
            text: textContent
          });

          return {
            role: role,
            content: content
          };
        } else {
          // Assistant message or user message without files (simple text)
          const textContent = isJsonFormatEnabled && role === 'user' ? `${message} (Give Response In JSON Format)` : message;
          return {
            role: role,
            content: textContent
          };
        }
      });
  }


  /////////////////////////////////////////////////////////////////////////////
  //                      Anthropic Conversation Formatting
  /////////////////////////////////////////////////////////////////////////////
  private prepareAnthropicConversation = (isContextOn: boolean, userPrompt: string, systemPrompt: string, conversations: { role: 'user' | 'assistant' | 'system'; content: string; }[], isJsonFormatEnabled: boolean, attachedFiles: PromptFileAttachment[]) => {
    const systemPromptContext = { role: 'user', content: `${systemPrompt} + ${userPrompt}` };

    if (isContextOn && conversations.length > 0) {
      const formattedConversations = this.formatAnthropicConversations(conversations, isJsonFormatEnabled);
      return [systemPromptContext, ...formattedConversations];
    }

    // When context is off, check if there are files
    if (attachedFiles && attachedFiles.length > 0) {
      const currentUserMessage = this.createAnthropicUserMessage(systemPrompt, userPrompt, attachedFiles);
      return [currentUserMessage];
    }

    return [systemPromptContext];  // If context is off and no files
  }

  private createAnthropicUserMessage = (systemPrompt: string, userPrompt: string, attachedFiles: PromptFileAttachment[]) => {
    const content: any[] = [];

    // Add combined system + user prompt
    content.push({
      type: "text",
      text: `${systemPrompt} + ${userPrompt}`
    });

    // Add files
    attachedFiles.forEach(file => {
      content.push({
        type: "text",
        source: {
          type: "file",
          file_id: file.fileId
        }
      });
    });

    return {
      role: "user",
      content: content
    };
  }

  private formatAnthropicConversations = (rawConversations: any[], isJsonFormatEnabled: boolean): any[] => {
    return rawConversations
      .filter(({ status }) => status !== false)
      .map(({ type, message, attachedFiles }) => {
        const role = type === 'Sender' ? 'user' : 'assistant';

        if (role === 'user' && attachedFiles && attachedFiles.length > 0) {
          // User message with files
          const content: any[] = [];

          // Add text content first
          const textContent = isJsonFormatEnabled ? `${message} (Give Response In JSON Format)` : message;
          content.push({
            type: "text",
            text: textContent
          });

          // Add files
          attachedFiles.forEach((file: any) => {
            content.push({
              type: "text",
              source: {
                type: "file",
                file_id: file.fileId
              }
            });
          });

          return {
            role: role,
            content: content
          };
        } else {
          // Assistant message or user message without files
          const textContent = isJsonFormatEnabled && role === 'user' ? `${message} (Give Response In JSON Format)` : message;
          return {
            role: role,
            content: textContent
          };
        }
      });
  }


  /////////////////////////////////////////////////////////////////////////////
  //                      DeepSeek Conversation Formatting
  /////////////////////////////////////////////////////////////////////////////
  private prepareDeepSeekConversation = (isContextOn: boolean, userPrompt: string, systemPrompt: string, conversations: { role: 'user' | 'assistant' | 'system'; content: string; }[], isJsonFormatEnabled: boolean) => {
    const systemPromptContext = { role: 'system', content: systemPrompt };
    if (isContextOn && conversations.length > 0) {
      const formattedConversations = this.formatConversations(conversations, isJsonFormatEnabled);
      return [systemPromptContext, ...formattedConversations]; // If context is on, prepend the system prompt to the conversation
    }
    return [systemPromptContext, { "role": "user", "content": userPrompt }]; // If context is off, return the conversation as is
  }


  /////////////////////////////////////////////////////////////////////////////
  //                      Gemini Conversation Formatting
  /////////////////////////////////////////////////////////////////////////////
  private prepareGeminiConversation = (isContextOn: boolean, userPrompt: string, systemPrompt: string, conversations: { role: 'user' | 'assistant' | 'system'; content: string; }[], isJsonFormatEnabled: boolean) => {
    if (isContextOn && conversations.length > 0) {
      const formattedConversations = this.formatConversations(conversations, isJsonFormatEnabled);

      // Convert conversations to Gemini format
      const geminiConversations = formattedConversations.map(conv => {
        if (conv.role === 'user') {
          return {
            role: 'user',
            parts: [{ text: conv.content }]
          };
        } else if (conv.role === 'assistant') {
          return {
            role: 'model',
            parts: [{ text: conv.content }]
          };
        }
        // Skip system messages as they're handled separately in Gemini
        return null;
      }).filter(conv => conv !== null);

      // Add current user prompt to the conversation
      geminiConversations.push({
        role: 'user',
        parts: [{ text: userPrompt }]
      });

      // Return as JSON string as expected by the API
      return JSON.stringify(geminiConversations);
    } else {
      // For non-conversational or when context is off, return empty string
      // The userInput will be sent separately
      return "";
    }
  }


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
  public stopGeneration = async (
    tabId: string,
    threadId: string,
    userEmail: string,
  ): Promise<boolean> => {
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
