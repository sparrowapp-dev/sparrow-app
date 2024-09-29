import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import type { PromptDto } from "@deprecate/utils/dto/ai-assistant";

export class AiAssistantService {
  constructor() {}

  private apiUrl: string = constants.API_URL;

  public generateAiResponse = async (_prompt: PromptDto) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/assistant/prompt`,
      {
        body: _prompt,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public updateAiStats = async (
    _threadId: string,
    _messageId: string,
    _isLiked: boolean,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/chatbotstats/feedback`,
      {
        body: {
          threadId: _threadId,
          messageId: _messageId,
          like: _isLiked,
        },
        headers: getAuthHeaders(),
      },
    );

    return response;
  };
}
