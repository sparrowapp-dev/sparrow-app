
import { configFormat } from "./AiModelConfigurations";


export const modelCodeTemplates = {
  // OpenAI Family
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
            configParams.push(`    response_format={
      "type": ${responseFormat}
    }`);
          } else if (key === 'temperature') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`    temperature=${value}`);
          } else if (key === 'maxTokens') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const maxTokens = value === -1 ? 10000 : value;
            configParams.push(`    max_completion_tokens=${maxTokens}`);
          } else if (key === 'frequencyPenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`    frequency_penalty=${value}`);
          } else if (key === 'presencePenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`    presence_penalty=${value}`);
          } else if (key === 'streamResponse') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`streamResponse=${value ? 'true' : 'false'}`);
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
)
`;
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
            configParams.push(`streamResponse=${value ? 'true' : 'false'}`);
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
            configParams.push(`"streamResponse": ${value ? 'true' : 'false'}`);
          }
        });

        return `{
  "model": "${model}",
  "messages": [],
  ${configParams.join(',\n')},
}`;
      }
    }
  },

  // DeepSeek Family
  deepseek: {
    "curl": {
      environment: "none",
      language: "Curl",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["deepseek"][model];

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
            configParams.push(`  stream=${value ? 'true' : 'false'}`);
          }

          // For specifically Anthropic & Gemini Family
          // else if (key === 'top_p') {
          //   const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
          //   configParams.push(`  "top_p": ${value}`);
          // }
        });

        return `curl https://api.deepseek.com/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
  "model": "${model}",
  "messages": [{"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}],
  ${configParams.join(',\n')}
}'`;
      }
    },
    "python": {
      environment: "Python",
      language: "python",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["deepseek"][model];

        let configParams = [];

        // Iterate through all properties in configFormat
        Object.keys(availableConfig).forEach(key => {
          if (key === 'jsonResponseFormat') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const responseFormat = value ? '"json_object"' : '"text"';
            configParams.push(`    response_format={
      "type": ${responseFormat}
    }`);
          } else if (key === 'temperature') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`    temperature=${value}`);
          } else if (key === 'maxTokens') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const maxTokens = value === -1 ? 10000 : value;
            configParams.push(`    max_completion_tokens=${maxTokens}`);
          } else if (key === 'frequencyPenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`    frequency_penalty=${value}`);
          } else if (key === 'presencePenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`    presence_penalty=${value}`);
          } else if (key === 'streamResponse') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`stream=${value ? 'true' : 'false'}`);
          }

          // For specifically Anthropic & Gemini Family
          // else if (key === 'top_p') {
          //   const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
          //   configParams.push(`  "top_p": ${value}`);
          // }
        });

        return `from openai import OpenAI

client = OpenAI(api_key="${apiKey}", base_url="https://api.deepseek.com")

response = client.chat.completions.create(
    model="${model}",
    messages=[{"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello"}],
    ${configParams.join(',\n')},
    top_p=1
)
`;
      }
    },
    "nodejs": {
      environment: "nodejs",
      language: "JavaScript",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["deepseek"][model];

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
            configParams.push(`streamResponse=${value ? 'true' : 'false'}`);
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
  baseURL: 'https://api.deepseek.com'
});

async function main () {
  const completion = await openai.chat.completions.create({
    model: "${model}",
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    ${configParams.join(',\n')},
  });

  console.log(completion.choices[0].message.content);
};

main();`;
      }
    },
    "json": {
      environment: "none",
      language: "JSON",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["deepseek"][model];

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
            configParams.push(`"streamResponse": ${value ? 'true' : 'false'}`);
          }
        });

        return `{
  "model": "${model}",
  "messages": [],
  ${configParams.join(',\n')},
}`;
      }
    }
  },
  
  
  // DeepSeek Family
  anthropic: {
    "curl": {
      environment: "none",
      language: "Curl",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["anthropic"][model];

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
            configParams.push(`  stream=${value ? 'true' : 'false'}`);
          }

          // For specifically Anthropic & Gemini Family
          else if (key === 'top_p') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  "top_p": ${value}`);
          }
        });

        return `curl https://api.anthropic.com/v1/messages \  
  --header "x-api-key: ${apiKey}" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data \
  '{
    "model": ${model},
    "messages": [
      {"role": "user", "content": "Hello, world"}
    ],
    ${configParams.join(',\n')}
  }'
`;
      }
    },
    "python": {
      environment: "Python",
      language: "python",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["anthropic"][model];

        let configParams = [];

        // Iterate through all properties in configFormat
        Object.keys(availableConfig).forEach(key => {
          if (key === 'jsonResponseFormat') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const responseFormat = value ? '"json_object"' : '"text"';
            configParams.push(`    response_format={
      "type": ${responseFormat}
    }`);
          } else if (key === 'temperature') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`    temperature=${value}`);
          } else if (key === 'maxTokens') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const maxTokens = value === -1 ? 10000 : value;
            configParams.push(`    max_completion_tokens=${maxTokens}`);
          } else if (key === 'frequencyPenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`    frequency_penalty=${value}`);
          } else if (key === 'presencePenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`    presence_penalty=${value}`);
          } else if (key === 'streamResponse') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`stream=${value ? 'true' : 'false'}`);
          }

          // For specifically Anthropic & Gemini Family
          else if (key === 'top_p') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  "top_p": ${value}`);
          }
        });

        return `import anthropic

client = anthropic.Anthropic(
    # defaults to os.environ.get("${apiKey}")
    api_key="${apiKey}",
)
message = client.messages.create(
    model="${model}",
    messages=[
        {"role": "user", "content": "Hello, Claude"}
    ],
    ${configParams.join(',\n')}
)
print(message.content)
`;
      }
    },
    "nodejs": {
      environment: "nodejs",
      language: "JavaScript",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["anthropic"][model];

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
            configParams.push(`streamResponse=${value ? 'true' : 'false'}`);
          }

          // For specifically Anthropic & Gemini Family
          else if (key === 'top_p') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  top_p: ${value}`);
          }
        });

        return `import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: '${apiKey}', // defaults to process.env["ANTHROPIC_API_KEY"]
});

const msg = await anthropic.messages.create({
  model: "${model}",
  messages: [{ role: "user", content: "Hello, Claude" }],
  ${configParams.join(',\n')}
});

console.log(msg);
`;
      }
    },
    "json": {
      environment: "none",
      language: "JSON",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["anthropic"][model];

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
            configParams.push(`"streamResponse": ${value ? 'true' : 'false'}`);
          }
        });

        return `{
  "model": "${model}",
  "messages": [],
  ${configParams.join(',\n')},
}`;
      }
    }
  },
  
  google: {
    "curl": {
      environment: "none",
      language: "Curl",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["google"][model];

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
            configParams.push(`  stream=${value ? 'true' : 'false'}`);
          }

          // For specifically Anthropic & Gemini Family
          else if (key === 'top_p') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  "top_p": ${value}`);
          }
        });

        return `curl "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Explain how AI works in a few words"
          }
        ]
      }
    ]
  }'`;
      }
    },
    "python": {
      environment: "Python",
      language: "python",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["google"][model];

        let configParams = [];

        // Iterate through all properties in configFormat
        Object.keys(availableConfig).forEach(key => {
          if (key === 'jsonResponseFormat') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const responseFormat = value ? '"json_object"' : '"text"';
            configParams.push(`    response_format={
      "type": ${responseFormat}
    }`);
          } else if (key === 'temperature') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`    temperature=${value}`);
          } else if (key === 'maxTokens') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            const maxTokens = value === -1 ? 10000 : value;
            configParams.push(`    max_completion_tokens=${maxTokens}`);
          } else if (key === 'frequencyPenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`    frequency_penalty=${value}`);
          } else if (key === 'presencePenalty') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`    presence_penalty=${value}`);
          } else if (key === 'streamResponse') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`stream=${value ? 'true' : 'false'}`);
          }

          // For specifically Anthropic & Gemini Family
          else if (key === 'top_p') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  "top_p": ${value}`);
          }
        });

        return `from google import genai

client = genai.Client(api_key="${apiKey}")

response = client.models.generate_content(
    model="${model}", contents="Explain how AI works in a few words"
)
print(response.text)
`;
      }
    },
    "nodejs": {
      environment: "nodejs",
      language: "JavaScript",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["google"][model];

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
            configParams.push(`streamResponse=${value ? 'true' : 'false'}`);
          }

          // For specifically Anthropic & Gemini Family
          else if (key === 'top_p') {
            const value = config[key] !== undefined ? config[key] : availableConfig[key].defaultValue;
            configParams.push(`  "top_p": ${value}`);
          }
        });

        return `import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "${apiKey}" });

async function main() {
  const response = await ai.models.generateContent({
    model: "${model}",
    contents: "Explain how AI works in a few words",
    ${configParams.join(',\n')},
  });
  console.log(response.text);
}

main();
`;
      }
    },
    "json": {
      environment: "none",
      language: "JSON",
      code_template: function (model, apiKey, configuration) {
        const config = configuration || {};
        const availableConfig = configFormat["google"][model];

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
            configParams.push(`"streamResponse": ${value ? 'true' : 'false'}`);
          }
        });

        return `{
  "model": "${model}",
  "messages": [],
  ${configParams.join(',\n')},
}`;
      }
    }
  },


}
