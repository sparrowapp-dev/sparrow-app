import { getAuthHeaders, makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
import type { PromptDto } from "$lib/utils/dto/ai-assistant";

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
}
