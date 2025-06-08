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

  // public addOrUpdateConversation = async (aiProvider: AiModelProviderEnum, providerKey: string, conversationId: string, conversations: string) => {
  //   const payload = {
  //     id: conversationId,
  //     provider: aiProvider,
  //     apiKey: providerKey,
  //     data: [
  //       {
  //         title: "New Conversation 01",
  //         inputTokens: 12,
  //         outputTokens: 14,
  //         date: "2025-06-08",
  //         time: "10:51",
  //         authoredBy: "Anish Kmr",
  //         conversation: conversations,
  //       }
  //     ]
  //   }
  //   const response = await makeRequest(
  //     "POST",
  //     `${this.apiUrl}/api/assistant/update-conversation`,
  //     {
  //       headers: getAuthHeaders(),
  //       body: payload,
  //     },
  //   );

  //   return response;
  // }

  public addNewConversation = async (
    aiProvider: AiModelProviderEnum,
    providerKey: string,
    conversations: string
  ) => {
    const payload = {
      provider: aiProvider,
      apiKey: providerKey,
      data: [
        {
          title: "New Conversation 01",
          inputTokens: 12,
          outputTokens: 14,
          date: "2025-06-08",
          time: "10:51",
          authoredBy: "Anish Kmr",
          conversation: conversations,
        }
      ]
    };

    const response = await makeRequest("POST", `${this.apiUrl}/api/assistant/insert-conversation`, {
      headers: getAuthHeaders(),
      body: payload,
    });

    return response;
  };


  public updateConversation = async (
    aiProvider: AiModelProviderEnum,
    providerKey: string,
    conversationId: string,
    conversations: string
  ) => {
    const payload = {
      id: conversationId,
      provider: aiProvider,
      apiKey: providerKey,
      data: [
        {
          title: "New Conversation 01",
          inputTokens: 12,
          outputTokens: 14,
          date: "2025-06-08",
          time: "10:51",
          authoredBy: "Anish Kmr",
          conversation: conversations,
        }
      ]
    };

    const response = await makeRequest("POST", `${this.apiUrl}/api/assistant/update-conversation`, {
      headers: getAuthHeaders(),
      body: payload,
    });

    return response;
  };



}