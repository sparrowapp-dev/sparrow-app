import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import type {
  PromptDto,
  GenerateUserAndSystemPromptsDto,
  GenerateMockDataRequestDto,
  fixTestScriptRequestDto,
  GenerateTestCasesRequestDto,
} from "@sparrow/common/dto/ai-assistant";
import { getSelfhostUrls } from "@app/utils/jwt";

export class AiAssistantService {
  constructor() {
     const [selfhostBackendUrl] = getSelfhostUrls();
    if (selfhostBackendUrl) {
      this.apiUrl = selfhostBackendUrl;
    }
    else{
      this.apiUrl = constants.API_URL;
    }
  }

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

  public generateUserOrSystemPrompts = async (
    _prompt: GenerateUserAndSystemPromptsDto,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/assistant/generate-prompt`,
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

  public gereateMockData = async (data: GenerateMockDataRequestDto) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/assistant/generate-mock-data`,
      {
        body: data,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public fixTestScript = async (data: fixTestScriptRequestDto) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/assistant/fix-test-script`,
      {
        body: data,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public generateTestCases = async (data: GenerateTestCasesRequestDto) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/assistant/generate-test-cases`,
      {
        body: data,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
