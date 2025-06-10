import constants from "src/constants/constants";
import { makeRequest, getAuthHeaders } from "@app/containers/api/api.common";
import type { AiModelProviderEnum } from "@sparrow/common/types/workspace/ai-request-base";

export class AiRequestService {
  private apiUrl: string = constants.API_URL;

  constructor() { }


  /**
   * Fetches conversations for a given AI provider and API key.
   * Optionally filters by conversationId if provided.
   *
   * @param aiProvider - The AI provider (e.g., openai, deepseek).
   * @param providerKey - The API key associated with the provider.
   * @param conversationId - (Optional) The ID of a specific conversation to fetch.
   * @returns A Promise resolving to the conversation response.
   */
  public fetchConversationsByApiKey = async (aiProvider: AiModelProviderEnum, providerKey: string, conversationId: string = "") => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/assistant/get-conversation?provider=${aiProvider}&apiKey=${providerKey}${conversationId ? `&id=${conversationId}` : ""
      }`,
      { headers: getAuthHeaders() },
    );

    return response;
  };

  public addNewConversation = async (payload) => {
    const response = await makeRequest("POST", `${this.apiUrl}/api/assistant/insert-conversation`, {
      headers: getAuthHeaders(),
      body: payload,
    });
    return response;
  };


  public updateConversation = async (payload) => {
    const response = await makeRequest("POST", `${this.apiUrl}/api/assistant/update-conversation`, {
      headers: getAuthHeaders(),
      body: payload,
    });
    return response;
  };

  public deleteConversation = async (aiProvider: AiModelProviderEnum, providerAuthKey: string, conversationId: string) => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/assistant/delete-conversation?provider=${aiProvider}&apiKey=${providerAuthKey}&id=${conversationId}`,
      { headers: getAuthHeaders() }
    );

    return response;
  };




}