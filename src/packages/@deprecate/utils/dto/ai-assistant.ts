export interface PromptDto {
  text: string;
  threadId?: string;
  instructions: string;
}

export interface StreamPromptDto {
  text: string;
  tabId: string;
  threadId?: string;
  instructions: string;
}
