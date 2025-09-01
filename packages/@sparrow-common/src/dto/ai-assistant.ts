import type {
  RequestDatasetEnum,
  RequestDataTypeEnum,
  RequestSectionEnum,
} from "../types/workspace/http-request-tab";

export interface PromptDto {
  text: string;
  threadId?: string;
  instructions: string;
  model: string;
}

export interface GenerateUserAndSystemPromptsDto {
  userInput: string;
  emailId: string;
  teamId: string;
}

export interface StreamPromptDto {
  text: string;
  tabId: string;
  threadId?: string;
  instructions: string;
}
export interface GenerateMockDataRequestDto {
  text: string;
  requestType: RequestSectionEnum;
  properties?: {
    type: RequestDatasetEnum;
    lang: RequestDataTypeEnum;
  };
}
