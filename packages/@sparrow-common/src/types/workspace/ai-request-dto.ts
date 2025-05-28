import { AiModelProviderEnum, type AIModelVariant } from "./ai-request-base";

// Disabling model specific features that are not supported 
export const disabledModelFeatures = {
  "System Prompt": ['o1', 'o1-mini'], // system prompt is not supported in o1 and o1-mini
  "Configurations": [], // configurations are not supported in 
  "Authorization": [], // Authorization is not supported in 
}

// Model configuration format for different AI model providers.
// This format defines the structure and types of configuration 
// options available for each model variant, and used to generate 
// the configuration form in the UI.
export const configFormat: {
  [modelProvider in AiModelProviderEnum]?: {
    [modelVariant in AIModelVariant]?: {
      [configKey: string]: {
        type: "number" | "boolean";
        displayName: string;
        description: string;
        defaultValue: number | boolean;
        min?: string;
        max?: string;
      };
    };
  };
} = {
  openai: {
    "gpt-4o": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      jsonResponseFormat: {
        type: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses; higher values increase output variability.",
        defaultValue: 1,
      },
      presencePenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Presence Penalty",
        description:
          "Controls the frequency with which the model introduces novel or unrelated topics.",
        defaultValue: 0,
      },
      frequencyPenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Frequency Penalty",
        description:
          "Manages the repetition of terms and phrases within the model's output.",
        defaultValue: 0,
      },
      maxTokens: {
        type: "number",
        min: "-1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "Specifies the maximum length of the model's response in tokens.",
        defaultValue: 1024,
      },
    },
    "gpt-4": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      jsonResponseFormat: {
        type: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses; higher values increase output variability.",
        defaultValue: 1,
      },
      presencePenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Presence Penalty",
        description:
          "Controls the frequency with which the model introduces novel or unrelated topics.",
        defaultValue: 0,
      },
      frequencyPenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Frequency Penalty",
        description:
          "Manages the repetition of terms and phrases within the model's output.",
        defaultValue: 0,
      },
      maxTokens: {
        type: "number",
        min: "-1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "Specifies the maximum length of the model's response in tokens.",
        defaultValue: 1024,
      },
    },
    "gpt-4.1": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      jsonResponseFormat: {
        type: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses; higher values increase output variability.",
        defaultValue: 1,
      },
      presencePenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Presence Penalty",
        description:
          "Controls the frequency with which the model introduces novel or unrelated topics.",
        defaultValue: 0,
      },
      frequencyPenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Frequency Penalty",
        description:
          "Manages the repetition of terms and phrases within the model's output.",
        defaultValue: 0,
      },
      maxTokens: {
        type: "number",
        min: "-1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "Specifies the maximum length of the model's response in tokens.",
        defaultValue: 1024,
      },
    },
    "gpt-4-turbo": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      jsonResponseFormat: {
        type: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses; higher values increase output variability.",
        defaultValue: 1,
      },
      presencePenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Presence Penalty",
        description:
          "Controls the frequency with which the model introduces novel or unrelated topics.",
        defaultValue: 0,
      },
      frequencyPenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Frequency Penalty",
        description:
          "Manages the repetition of terms and phrases within the model's output.",
        defaultValue: 0,
      },
      maxTokens: {
        type: "number",
        min: "-1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "Specifies the maximum length of the model's response in tokens.",
        defaultValue: 1024,
      },
    },
    "gpt-4.5-preview": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      jsonResponseFormat: {
        type: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses; higher values increase output variability.",
        defaultValue: 1,
      },
      presencePenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Presence Penalty",
        description:
          "Controls the frequency with which the model introduces novel or unrelated topics.",
        defaultValue: 0,
      },
      frequencyPenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Frequency Penalty",
        description:
          "Manages the repetition of terms and phrases within the model's output.",
        defaultValue: 0,
      },
      maxTokens: {
        type: "number",
        min: "-1",
        max: "16384",
        displayName: "Max Tokens",
        description:
          "Specifies the maximum length of the model's response in tokens.",
        defaultValue: 1024,
      },
    },
    "gpt-4o-mini": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      jsonResponseFormat: {
        type: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses; higher values increase output variability.",
        defaultValue: 1,
      },
      presencePenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Presence Penalty",
        description:
          "Controls the frequency with which the model introduces novel or unrelated topics.",
        defaultValue: 0,
      },
      frequencyPenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Frequency Penalty",
        description:
          "Manages the repetition of terms and phrases within the model's output.",
        defaultValue: 0,
      },
      maxTokens: {
        type: "number",
        min: "-1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "Specifies the maximum length of the model's response in tokens.",
        defaultValue: 1024,
      },
    },
    "gpt-3.5-turbo": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      jsonResponseFormat: {
        type: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses; higher values increase output variability.",
        defaultValue: 1,
      },
      presencePenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Presence Penalty",
        description:
          "Controls the frequency with which the model introduces novel or unrelated topics.",
        defaultValue: 0,
      },
      frequencyPenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Frequency Penalty",
        description:
          "Manages the repetition of terms and phrases within the model's output.",
        defaultValue: 0,
      },
      maxTokens: {
        type: "number",
        min: "-1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "Specifies the maximum length of the model's response in tokens.",
        defaultValue: 1024,
      },
    },
    "o1": {
      maxTokens: {
        type: "number",
        min: "-1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "Specifies the maximum length of the model's response in tokens.",
        defaultValue: 1024,
      }
    },
    "o1-mini": {
      maxTokens: {
        type: "number",
        min: "-1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "Specifies the maximum length of the model's response in tokens.",
        defaultValue: 1024,
      }
    },
    "o3-mini": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      jsonResponseFormat: {
        type: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
      },
      maxTokens: {
        type: "number",
        min: "-1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "Specifies the maximum length of the model's response in tokens.",
        defaultValue: 1024,
      },
    }
  },

  anthropic: {
    "claude-3-5-sonnet-20241022": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Controls randomness in the response. Higher values make output more random.",
        defaultValue: 0.7,
      },
      maxTokens: {
        type: "number",
        min: "1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate in the response.",
        defaultValue: 1024,
      },
      top_p: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Top P",
        description:
          "Controls the randomness of the LLM response.",
        defaultValue: 0,
      },
    },

    "claude-3-5-haiku-20241022": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Controls randomness in the response. Higher values make output more random.",
        defaultValue: 0.7,
      },
      maxTokens: {
        type: "number",
        min: "1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate in the response.",
        defaultValue: 1024,
      },
      top_p: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Top P",
        description:
          "Controls the randomness of the LLM response.",
        defaultValue: 0,
      },
    },

    "claude-3-opus-20240229": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Controls randomness in the response. Higher values make output more random.",
        defaultValue: 0.7,
      },
      maxTokens: {
        type: "number",
        min: "1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate in the response.",
        defaultValue: 1024,
      },
      top_p: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Top P",
        description:
          "Controls the randomness of the LLM response.",
        defaultValue: 0,
      },
    },

    "claude-3-haiku-20240307": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Controls randomness in the response. Higher values make output more random.",
        defaultValue: 0.7,
      },
      maxTokens: {
        type: "number",
        min: "1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate in the response.",
        defaultValue: 1024,
      },
      top_p: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Top P",
        description:
          "Controls the randomness of the LLM response.",
        defaultValue: 0,
      },
    },

    // "Claude 3 Sonnet"
    "claude-3-5-sonnet-20240620": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Controls randomness in the response. Higher values make output more random.",
        defaultValue: 0.7,
      },
      maxTokens: {
        type: "number",
        min: "1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate in the response.",
        defaultValue: 1024,
      },
      top_p: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Top P",
        description:
          "Controls the randomness of the LLM response.",
        defaultValue: 0,
      },
    },
  },

  google: {
    "gemini-pro": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Controls the randomness of the output. Higher values increase creativity.",
        defaultValue: 0.9,
      },
      maxTokens: {
        type: "number",
        min: "1",
        max: "2048",
        displayName: "Max Output Tokens",
        description:
          "The maximum number of tokens that can be generated in the response.",
        defaultValue: 1024,
      },
    },
  },

  deepseek: {
    "deepseek-chat": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      jsonResponseFormat: {
        type: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses; higher values increase output variability.",
        defaultValue: 1,
      },
      presencePenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Presence Penalty",
        description:
          "Controls the frequency with which the model introduces novel or unrelated topics.",
        defaultValue: 0,
      },
      frequencyPenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Frequency Penalty",
        description:
          "Manages the repetition of terms and phrases within the model's output.",
        defaultValue: 0,
      },
      maxTokens: {
        type: "number",
        min: "-1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "Specifies the maximum length of the model's response in tokens.",
        defaultValue: 1024,
      },
    },
    "deepseek-reasoner": {
      streamResponse: {
        type: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
      },
      jsonResponseFormat: {
        type: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
      },
      temperature: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses; higher values increase output variability.",
        defaultValue: 1,
      },
      presencePenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Presence Penalty",
        description:
          "Controls the frequency with which the model introduces novel or unrelated topics.",
        defaultValue: 0,
      },
      frequencyPenalty: {
        type: "number",
        min: "0",
        max: "1",
        displayName: "Frequency Penalty",
        description:
          "Manages the repetition of terms and phrases within the model's output.",
        defaultValue: 0,
      },
      maxTokens: {
        type: "number",
        min: "-1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "Specifies the maximum length of the model's response in tokens.",
        defaultValue: 1024,
      },
    }
  },
};


// API Key generation instructions for different providers
export const apiKeyInstructions: {
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
    gemini: {
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