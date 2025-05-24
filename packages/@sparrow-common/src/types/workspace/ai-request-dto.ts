export const configFormat = {
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
    "claude-3-opus": {
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
    },
    "claude-3-sonnet": {
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
      temperature: {
        type: "number",
        min: "0",
        max: "2",
        displayName: "Temperature",
        description:
          "Controls randomness in the response generation.",
        defaultValue: 1,
      },
      maxTokens: {
        type: "number",
        min: "1",
        max: "4096",
        displayName: "Max Tokens",
        description:
          "Maximum number of tokens to generate in the response.",
        defaultValue: 1024,
      },
    },
  },
};


// const sharedParams = {
//   streamResponse: {
//     type: "boolean",
//     displayName: "Stream Response",
//     description: "Enables real-time output of the model's generated content.",
//     defaultValue: true,
//   },
//   temperature: {
//     type: "number",
//     min: "0",
//     max: "2",
//     displayName: "Temperature",
//     description: "Controls the randomness of output. Higher values increase creativity.",
//     defaultValue: 1,
//   },
//   maxTokens: (max: number) => ({
//     type: "number",
//     min: "1",
//     max: String(max),
//     displayName: "Max Tokens",
//     description: "Maximum number of tokens to generate in the response.",
//     defaultValue: 1024,
//   }),
// };



// const openAICommonParams = {
//   streamResponse: sharedParams.streamResponse,
//   responseFormat: {
//     type: "boolean",
//     displayName: "Response Format (JSON)",
//     description: "Forces the model to adhere strictly to JSON formatting.",
//     defaultValue: false,
//   },
//   temperature: sharedParams.temperature,
//   presencePenalty: {
//     type: "number",
//     min: "-2",
//     max: "2",
//     displayName: "Presence Penalty",
//     description: "Controls introduction of new/unrelated topics.",
//     defaultValue: 0,
//   },
//   frequencyPenalty: {
//     type: "number",
//     min: "-2",
//     max: "2",
//     displayName: "Frequency Penalty",
//     description: "Controls repetition of terms in output.",
//     defaultValue: 0,
//   },
// };




// export const configFormat = {
//   openai: {
//     "gpt-4": {
//       ...openAICommonParams,
//       maxTokens: sharedParams.maxTokens(8192),
//     },
//     "gpt-4o": {
//       ...openAICommonParams,
//       maxTokens: sharedParams.maxTokens(4096),
//     },
//   },
//   anthropic: {
//     "claude-3-opus": {
//       streamResponse: sharedParams.streamResponse,
//       temperature: {
//         ...sharedParams.temperature,
//         max: "1",
//         defaultValue: 0.7,
//       },
//       maxTokens: sharedParams.maxTokens(4096),
//     },
//     "claude-3-sonnet": {
//       streamResponse: sharedParams.streamResponse,
//       temperature: {
//         ...sharedParams.temperature,
//         max: "1",
//         defaultValue: 0.7,
//       },
//       maxTokens: sharedParams.maxTokens(4096),
//     },
//   },
//   google: {
//     "gemini-pro": {
//       streamResponse: sharedParams.streamResponse,
//       temperature: {
//         ...sharedParams.temperature,
//         max: "1",
//         defaultValue: 0.9,
//       },
//       maxTokens: {
//         ...sharedParams.maxTokens(2048),
//         displayName: "Max Output Tokens",
//       },
//     },
//   },
//   deepseek: {
//     "deepseek-r1": {
//       streamResponse: sharedParams.streamResponse,
//       temperature: sharedParams.temperature,
//       maxTokens: sharedParams.maxTokens(4096),
//     },
//   },
// };
