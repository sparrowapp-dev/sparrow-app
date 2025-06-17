export interface PromptDto {
  text: string;
  threadId?: string;
  instructions: string;
  model: string;
}

export interface GenerateUserAndSystemPromptsDto {
  userInput: string;
  emailId: string;
  teamId: string
}

export interface StreamPromptDto {
  text: string;
  tabId: string;
  threadId?: string;
  instructions: string;
}
