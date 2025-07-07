import constants from "src/constants/constants";
import { makeRequest, getAuthHeaders } from "@app/containers/api/api.common";
import type { AiModelProviderEnum, AIModelVariant } from "@sparrow/common/types/workspace/ai-request-base";
import { ContentTypeEnum } from "@sparrow/common/enums";

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
      `${this.apiUrl}/api/conversation/get-conversation?provider=${aiProvider}&apiKey=${providerKey}${conversationId ? `&id=${conversationId}` : ""
      }`,
      { headers: getAuthHeaders() },
    );

    return response;
  };

  public addNewConversation = async (payload) => {
    const response = await makeRequest("POST", `${this.apiUrl}/api/conversation/insert-conversation`, {
      headers: getAuthHeaders(),
      body: payload,
    });
    return response;
  };


  public updateConversation = async (payload) => {
    const response = await makeRequest("PUT", `${this.apiUrl}/api/conversation/update-conversation`, {
      headers: getAuthHeaders(),
      body: payload,
    });
    return response;
  };

  public deleteConversation = async (aiProvider: AiModelProviderEnum, providerAuthKey: string, conversationId: string) => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/conversation/delete-conversation/${conversationId}?provider=${aiProvider}&apiKey=${providerAuthKey}`,
      { headers: getAuthHeaders() }
    );

    return response;
  };



  public uploadRAGfiles = async (aiProvider: AiModelProviderEnum, providerAuthKey: string, providerModel: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append("docs", file);
    });

    formData.append("model", aiProvider);
    formData.append("authKey", providerAuthKey);
    formData.append("modelVersion", providerModel)
    const contentType: ContentTypeEnum = ContentTypeEnum["multipart/form-data"];

    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/assistant`,
      {
        body: formData,
        headers: {
          ...getAuthHeaders(),
          // "Content-type": contentType // Not setting Content-Type manually for FormData - letting the browser set it with boundary
        },
      }
    );

    return response;
  };


}