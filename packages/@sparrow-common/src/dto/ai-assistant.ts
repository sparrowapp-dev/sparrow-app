export interface PromptDto {
  text: string;
  threadId?: string;
  instructions: string;
}

export interface GenerateUserAndSystemPromptsDto {
  userInput: string;
  emailId?: string;
}

export interface StreamPromptDto {
  text: string;
  tabId: string;
  threadId?: string;
  instructions: string;
}
