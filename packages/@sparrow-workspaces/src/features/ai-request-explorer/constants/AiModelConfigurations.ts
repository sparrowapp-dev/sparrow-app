import { AiModelProviderEnum, type AIModelVariant} from "@sparrow/common/types/workspace/ai-request-base";

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
  [modelProvider in AiModelProviderEnum]: {
    [modelVariant in AIModelVariant]?: {
      [configKey: string]: {
        dataType: "int" | "float" | "boolean";
        displayName: string;
        description: string;
        defaultValue: number | boolean;
        min?: number;
        max?: number;
        hidden: boolean,
        disabled: boolean
      };
    };
  };
} = {
  openai: {
    "gpt-4o": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      presencePenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Presence Penalty",
        description:
          "Reduces the likelihood of the LLM mentioning new topics that haven't appeared in the conversation. Higher values discourage introducing new topics, maintaining coherence.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      frequencyPenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Frequency Penalty",
        description:
          "Discourages the LLM from repeating the same words or phrases frequently. Higher values promote diversity in word choice, reducing redundancy.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate. -1 means no limit.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
    },
    "gpt-4": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      presencePenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Presence Penalty",
        description:
          "Reduces the likelihood of the LLM mentioning new topics that haven't appeared in the conversation. Higher values discourage introducing new topics, maintaining coherence.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      frequencyPenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Frequency Penalty",
        description:
          "Discourages the LLM from repeating the same words or phrases frequently. Higher values promote diversity in word choice, reducing redundancy.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate. -1 means no limit.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
    },
    "gpt-4.1": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      presencePenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Presence Penalty",
        description:
          "Reduces the likelihood of the LLM mentioning new topics that haven't appeared in the conversation. Higher values discourage introducing new topics, maintaining coherence.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      frequencyPenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Frequency Penalty",
        description:
          "Discourages the LLM from repeating the same words or phrases frequently. Higher values promote diversity in word choice, reducing redundancy.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate. -1 means no limit.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
    },
    "gpt-4-turbo": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      presencePenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Presence Penalty",
        description:
          "Reduces the likelihood of the LLM mentioning new topics that haven't appeared in the conversation. Higher values discourage introducing new topics, maintaining coherence.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      frequencyPenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Frequency Penalty",
        description:
          "Discourages the LLM from repeating the same words or phrases frequently. Higher values promote diversity in word choice, reducing redundancy.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate. -1 means no limit.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
    },
    "gpt-4.5-preview": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      presencePenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Presence Penalty",
        description:
          "Reduces the likelihood of the LLM mentioning new topics that haven't appeared in the conversation. Higher values discourage introducing new topics, maintaining coherence.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      frequencyPenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Frequency Penalty",
        description:
          "Discourages the LLM from repeating the same words or phrases frequently. Higher values promote diversity in word choice, reducing redundancy.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 16384,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate. -1 means no limit.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
    },
    "gpt-4o-mini": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      presencePenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Presence Penalty",
        description:
          "Reduces the likelihood of the LLM mentioning new topics that haven't appeared in the conversation. Higher values discourage introducing new topics, maintaining coherence.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      frequencyPenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Frequency Penalty",
        description:
          "Discourages the LLM from repeating the same words or phrases frequently. Higher values promote diversity in word choice, reducing redundancy.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate. -1 means no limit.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
    },
    "gpt-3.5-turbo": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      presencePenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Presence Penalty",
        description:
          "Reduces the likelihood of the LLM mentioning new topics that haven't appeared in the conversation. Higher values discourage introducing new topics, maintaining coherence.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      frequencyPenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Frequency Penalty",
        description:
          "Discourages the LLM from repeating the same words or phrases frequently. Higher values promote diversity in word choice, reducing redundancy.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate. -1 means no limit.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
    },
    "o1": {
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate. -1 means no limit.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      }
    },
    "o1-mini": {
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate. -1 means no limit.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      }
    },
    "o3-mini": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate. -1 means no limit.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
    }
  },

  anthropic: {
    "claude-3-5-sonnet-20241022": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate in the response.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
      top_p: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Top P",
        description:
          "Controls the randomness of the LLM response.",
        defaultValue: 0.95,
        disabled: false,
        hidden: false,
      },
    },

    "claude-3-5-haiku-20241022": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate in the response.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
      top_p: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Top P",
        description:
          "Controls the randomness of the LLM response.",
        defaultValue: 0.95,
        disabled: false,
        hidden: false,
      },
    },

    "claude-3-opus-20240229": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate in the response.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
      top_p: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Top P",
        description:
          "Controls the randomness of the LLM response.",
        defaultValue: 0.95,
        disabled: false,
        hidden: false,
      },
    },

    "claude-3-haiku-20240307": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate in the response.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
      top_p: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Top P",
        description:
          "Controls the randomness of the LLM response.",
        defaultValue: 0.95,
        disabled: false,
        hidden: false,
      },
    },

    // "Claude 3 Sonnet"
    "claude-3-5-sonnet-20240620": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate in the response.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
      top_p: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Top P",
        description:
          "Controls the randomness of the LLM response.",
        defaultValue: 0.95,
        disabled: false,
        hidden: false,
      },
    },
  },

  google: {
    "gemini-1.5-flash": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 2048,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens that can be generated in the response.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
      top_p: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Top P",
        description:
          "Controls the randomness of the model's response.",
        defaultValue: 0.95,
        disabled: false,
        hidden: false,
      },
    },
    "gemini-1.5-flash-8b": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 2048,
        displayName: "Max Output Tokens",
        description:
          "The maximum number of tokens that can be generated in the response.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
      top_p: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Top P",
        description:
          "Controls the randomness of the model's response.",
        defaultValue: 0.95,
        disabled: false,
        hidden: false,
      },
    },
    "gemini-1.5-pro": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 2048,
        displayName: "Max Output Tokens",
        description:
          "The maximum number of tokens that can be generated in the response.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
      top_p: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Top P",
        description:
          "Controls the randomness of the model's response.",
        defaultValue: 0.95,
        disabled: false,
        hidden: false,
      },
      
    },
    "gemini-2.0-flash": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 2048,
        displayName: "Max Output Tokens",
        description:
          "The maximum number of tokens that can be generated in the response.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
      top_p: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Top P",
        description:
          "Controls the randomness of the model's response.",
        defaultValue: 0.95,
        disabled: false,
        hidden: false,
      },
      
    },
  },

  deepseek: {
    "deepseek-chat": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      presencePenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Presence Penalty",
        description:
          "Reduces the likelihood of the LLM mentioning new topics that haven't appeared in the conversation. Higher values discourage introducing new topics, maintaining coherence.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      frequencyPenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Frequency Penalty",
        description:
          "Discourages the LLM from repeating the same words or phrases frequently. Higher values promote diversity in word choice, reducing redundancy.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate. -1 means no limit.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
    },
    "deepseek-reasoner": {
      streamResponse: {
        dataType: "boolean",
        displayName: "Stream Response",
        description: "Enables real-time output of the model's generated content.",
        defaultValue: true,
        disabled: false,
        hidden: false,
      },
      jsonResponseFormat: {
        dataType: "boolean",
        displayName: "Response Format (JSON)",
        description:
          "Forces the model to adhere strictly to JSON formatting in its output.",
        defaultValue: false,
        disabled: false,
        hidden: false,
      },
      temperature: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Temperature",
        description:
          "Adjusts the creativity level of the model's responses, Higher values increase creativity and variability, while lower values make responses more focused and deterministic.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      presencePenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Presence Penalty",
        description:
          "Reduces the likelihood of the LLM mentioning new topics that haven't appeared in the conversation. Higher values discourage introducing new topics, maintaining coherence.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      frequencyPenalty: {
        dataType: "float",
        min: 0,
        max: 1,
        displayName: "Frequency Penalty",
        description:
          "Discourages the LLM from repeating the same words or phrases frequently. Higher values promote diversity in word choice, reducing redundancy.",
        defaultValue: 0.5,
        disabled: false,
        hidden: false,
      },
      maxTokens: {
        dataType: "int",
        min: -1,
        max: 4096,
        displayName: "Max Tokens",
        description:
          "The maximum number of tokens to generate. -1 means no limit.",
        defaultValue: -1,
        disabled: false,
        hidden: false,
      },
    }
  },
};