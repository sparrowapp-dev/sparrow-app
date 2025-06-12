
import { configFormat } from "./AiModelConfigurations";


export const modelCodeTemplates = {
  openai: {
    "curl": {
      environment: "none",
      language: "Curl",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["openai"][model];

        let configParams = [];

        // Iterate through all properties in configFormat
        Object.keys(availableConfig).forEach(key => {

          // For common for all provider 
          if (key === 'jsonResponseFormat') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const responseFormat = value ? '"json_object"' : '"text"';
            configParams.push(`  "response_format": {
  "type": ${responseFormat}
  }`);
          } else if (key === 'temperature') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  "temperature": ${value}`);
          } else if (key === 'maxTokens') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const maxTokens = value === -1 ? 10000 : value;
            configParams.push(`  "max_completion_tokens": ${maxTokens}`);
          } else if (key === 'frequencyPenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  "frequency_penalty": ${value}`);
          } else if (key === 'presencePenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  "presence_penalty": ${value}`);
          } else if (key === 'streamResponse') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  streamResponse=${value ? 'true' : 'false'}`);
          }

          // For specifically Anthropic & Gemini Family
          // else if (key === 'top_p') {
          //   const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
          //   configParams.push(`  "top_p": ${value}`);
          // }
        });

        return `curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
  "model": "${model}",
  "messages": [],
  ${configParams.join(',\n')}
  }'`;
      }
    },
    "python": {
      environment: "Python",
      language: "python",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["openai"][model];

        let configParams = [];

        // Iterate through all properties in configFormat
        Object.keys(availableConfig).forEach(key => {
          if (key === 'jsonResponseFormat') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const responseFormat = value ? '"json_object"' : '"text"';
            configParams.push(`  response_format={
  "type": ${responseFormat}
  }`);
          } else if (key === 'temperature') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  temperature=${value}`);
          } else if (key === 'maxTokens') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const maxTokens = value === -1 ? 10000 : value;
            configParams.push(`  max_completion_tokens=${maxTokens}`);
          } else if (key === 'frequencyPenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  frequency_penalty=${value}`);
          } else if (key === 'presencePenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  presence_penalty=${value}`);
          } else if (key === 'streamResponse') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  streamResponse=${value ? 'true' : 'false'}`);
          }

          // For specifically Anthropic & Gemini Family
          // else if (key === 'top_p') {
          //   const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
          //   configParams.push(`  "top_p": ${value}`);
          // }
        });

        return `from openai import OpenAI
  client = OpenAI(api_key="${apiKey}")
  
  response = client.chat.completions.create(
  model="${model}",
  messages=[],
  ${configParams.join(',\n')},
  top_p=1
  )`;
      }
    },
    "nodejs": {
      environment: "nodejs",
      language: "JavaScript",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["openai"][model];

        let configParams = [];

        // Iterate through all properties in configFormat
        Object.keys(availableConfig).forEach(key => {
          if (key === 'jsonResponseFormat') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const responseFormat = value ? '"json_object"' : '"text"';
            configParams.push(`  response_format: {
  "type": ${responseFormat}
  }`);
          } else if (key === 'temperature') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  temperature: ${value}`);
          } else if (key === 'maxTokens') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const maxTokens = value === -1 ? 10000 : value;
            configParams.push(`  max_completion_tokens: ${maxTokens}`);
          } else if (key === 'frequencyPenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  frequency_penalty: ${value}`);
          } else if (key === 'presencePenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  presence_penalty: ${value}`);
          } else if (key === 'streamResponse') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  streamResponse=${value ? 'true' : 'false'}`);
          }

          // For specifically Anthropic & Gemini Family
          // else if (key === 'top_p') {
          //   const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
          //   configParams.push(`  "top_p": ${value}`);
          // }
        });

        return `import OpenAI from "openai";
  
  const openai = new OpenAI({
  apiKey: "${apiKey}",
  });
  
  const response = await openai.chat.completions.create({
  model: "${model}",
  messages: [],
  ${configParams.join(',\n')},
  });`;
      }
    },
    "json": {
      environment: "none",
      language: "JSON",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["openai"][model];

        let configParams = [];

        // Iterate through all properties in configFormat
        Object.keys(availableConfig).forEach(key => {
          if (key === 'jsonResponseFormat') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const responseFormat = value ? '"json_object"' : '"text"';
            configParams.push(`  "response_format": {
  "type": ${responseFormat}
  }`);
          } else if (key === 'temperature') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  "temperature": ${value}`);
          } else if (key === 'maxTokens') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const maxTokens = value === -1 ? 10000 : value;
            configParams.push(`  "max_completion_tokens": ${maxTokens}`);
          } else if (key === 'frequencyPenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  "frequency_penalty": ${value}`);
          } else if (key === 'presencePenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  "presence_penalty": ${value}`);
          } else if (key === 'streamResponse') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  "stream": ${value ? 'true' : 'false'}`);
          }
        });

        return `{
  "model": "${model}",
  "messages": [],
  ${configParams.join(',\n')},
  }`;
      }
    }
  }
}
