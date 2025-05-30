import { AiModelProviderEnum } from "@sparrow/common/types/workspace/ai-request-base";

// API Key generation instructions for different providers
export const ApiKeyInstructions: {
  [K in AiModelProviderEnum]: {
    heading: string;
    instructions: {
      text: string;
      bold?: string;
      suffix?: string;
      link?: {
        url: string;
        text: string;
      };
    }[];
  };
} = {
    openai: {
      heading: "OpenAI API Key",
      instructions: [
        {
          text: "Go to ",
          link: {
            url: "https://platform.openai.com/api-keys",
            text: "OpenAI API Keys page",
          },
        },
        {
          text: "Click on ",
          bold: "Create new secret key",
          suffix: ".",
        },
        {
          text: "Copy the key and paste it below.",
        },
      ],
    },
    anthropic: {
      heading: "Anthropic API Key",
      instructions: [
        {
          text: "Log in to the ",
          link: {
            url: "https://console.anthropic.com/",
            text: "Console",
          },
        },
        {
          text: "Navigate to the API Keys section within Account Settings",
        },
        {
          text: "Click the Create Key button on the top right",
        },
        {
          text: 'Give the key a descriptive name (e.g., "My_First_Claude_App")',
        },
        {
          text: "Click Create Key.",
        },
      ],
    },
    google: {
      heading: "Google Gemini API Key",
      instructions: [
        {
          text: "Go to ",
          link: {
            url: "https://aistudio.google.com/app/apikey",
            text: "Google AI Studio",
          },
        },
        {
          text: "Click on Create API Key",
        },
        {
          text: "Select your Google Cloud project or create a new one",
        },
        {
          text: "Copy the generated API key and paste it below",
        },
      ],
    },
    deepseek: {
      heading: "DeepSeek API Key",
      instructions: [
        {
          text: "Go to ",
          link: {
            url: "https://platform.deepseek.com/api_keys",
            text: "DeepSeek API Keys page",
          },
        },
        {
          text: "Sign in to your DeepSeek account",
        },
        {
          text: "Click on Create new API key",
        },
        {
          text: "Give your key a descriptive name",
        },
        {
          text: "Copy the generated key and paste it below",
        },
      ],
    },
};