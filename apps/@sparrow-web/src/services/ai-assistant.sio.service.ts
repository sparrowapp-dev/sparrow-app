import { getAuthHeaders } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import type {
  PromptDto,
  StreamPromptDto,
} from "@sparrow/common/dto/ai-assistant";
import { socketStore } from "../store/ws.store";
import { io, Socket } from "socket.io-client";

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
  private baseUrl: string = "http://localhost:9002";

  /**
   * Socket.IO instance for WebSocket communication.
   * @private
   */
  private socketIOService: Socket | null = null;

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
    console.log("AiAssistantWebSocketService instance created!");
    this.connectWebSocket();
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
   * Initializes the WebSocket connection using authentication headers
   * and stores the socket instance in the `socketStore`.
   */
  private connectWebSocket = () => {
    this.socketIOService = io(`${this.baseUrl}`, {
      path: "/ai-assistant",
      transports: ["websocket"], // Forces WebSocket transport
      // auth: getAuthHeaders(),
    });

    // Add event listeners for troubleshooting
    this.socketIOService.on("connect", () => {
      socketStore.set(this.socketIOService);
      console.log("Socket connected successfully");
    });

    this.socketIOService.on("connect_error", (err) => {
      socketStore.set(this.socketIOService);
      console.log("Connection Error:", err.message);
    });

    socketStore.subscribe((socket) => {
      console.log("Socket State :>> ", socket);
    });
    // socketStore.set(socket);
    return this.socketIOService;
  };

  /**
   * Sends a prompt message to the AI Assistant server via WebSocket.
   *
   * @param prompt - The prompt data to send.
   */
  public sendPromptMessage = async (prompt: StreamPromptDto) => {
    console.log("Inside sendPromptMessage() :>>");
    let socketValue;
    socketStore.subscribe((socket) => {
      if (socket) {
        // Use the socket instance
        console.log("Inside sendPromptMessage() subscribe :>> ");
        socket.emit("sendPrompt", prompt);
        socketValue = socket;
      }
    });
    return socketValue;
  };

  /**
   * Sends a prompt message to the AI Assistant server via WebSocket.
   *
   * @param tabId - tabId
   * @param threadId - threadId
   * @param userEmail - userEmail
   * @param prompt - promt
   * @param apiData - apiData
   */
  public sendMessage = async (
    tabId: string,
    threadId: string,
    userEmail: string,
    prompt: string,
    apiContext: string,
  ) => {
    const message = {
      tabId,
      threadId,
      emailId: userEmail,
      userInput: prompt,
      apiData: apiContext,
    };
    let socketValue;
    console.log("Inside sendMessage(): ");

    if (this.socketIOService && this.socketIOService.connected) {
      this.socketIOService.emit("sendMessage", message);
      console.log("Sending Message To AI :>> ");
      return true;
    } else {
      console.error("Socket not connected, cannot send message");
      return false;
    }

    return false;
  };

  public addListener(eventName: string, callback: (data: any) => void) {
    if (!this.socketIOService) return;
    this.socketIOService.on(eventName, callback);
  }

  public removeListener(eventName: string) {
    if (!this.socketIOService) return;
    this.socketIOService.off(eventName);
  }
}
