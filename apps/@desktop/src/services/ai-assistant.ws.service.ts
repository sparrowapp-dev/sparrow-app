import { getAuthHeaders } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import type { StreamPromptDto } from "@deprecate/utils/dto/ai-assistant";
import { socketStore } from "../store/ws.store";
import { io } from "socket.io-client";

/**
 * Service for managing WebSocket connections and communication
 * with the AI Assistant server.
 */
export class AiAssistantWebSocketService {
  constructor() {}
  private baseUrl: string = constants.BASE_URL;

  /**
   * Connects to the AI Assistant WebSocket server.
   * Initializes the WebSocket connection using authentication headers
   * and stores the socket instance in the `socketStore`.
   */
  public connectWebSocket = async () => {
    const socket = io(`${this.baseUrl}/ai-assistant`, {
      transports: ["websocket"], // Forces WebSocket transport
      auth: getAuthHeaders(),
    });
    socket.on("connect", () => {});
    socketStore.set(socket);
  };

  /**
   * Sends a prompt message to the AI Assistant server via WebSocket.
   *
   * @param prompt - The prompt data to send.
   */
  public sendPromptMessage = async (prompt: StreamPromptDto) => {
    let socketValue;
    socketStore.subscribe((socket) => {
      if (socket) {
        // Use the socket instance
        socket.emit("sendPrompt", prompt);
        socketValue = socket;
      }
    });
    return socketValue;
  };
}
