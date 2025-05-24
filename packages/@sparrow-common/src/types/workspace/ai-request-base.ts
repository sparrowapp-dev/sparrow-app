import { CollectionRequestAddToBaseEnum } from "./collection-base";

///////////////////////////////////////////////////////////////
//              AI Request Auth Base Interface
///////////////////////////////////////////////////////////////
export enum AiRequestAuthTypeBaseEnum {
    NO_AUTH = "No Auth",
    API_KEY = "API Key",
    BEARER_TOKEN = "Bearer Token",
    BASIC_AUTH = "Basic Auth",
    INHERIT_AUTH = "Inherit Auth"
}

interface AiRequestBasicAuthBaseInterface {
    username?: string;
    password?: string;
}

interface AiRequestApiKeyBaseInterface {
    authKey: string;
    authValue: string;
    addTo: CollectionRequestAddToBaseEnum;
}

interface AiRequestAuthBaseInterface {
    apiKey?: AiRequestApiKeyBaseInterface;
    basicAuth?: AiRequestBasicAuthBaseInterface;
    bearerToken?: string;
}



///////////////////////////////////////////////////////////////
//              LLM Providers
///////////////////////////////////////////////////////////////
export enum AiModelProviderEnum {
    Anthropic = "anthropic",
    Google = "google",
    OpenAI = "openai",
    DeepSeek = "deepseek",
}

///////////////////////////////////////////////////////////////
//              Per Provider Model Variants
///////////////////////////////////////////////////////////////

// — Anthropic Claude 3 family: Haiku (fast), Sonnet (balanced), Opus (capable)
export enum AnthropicModelEnum {
    Claude3_Haiku = "claude-3-haiku",
    Claude3_Opus = "claude-3-opus",
    Claude3_5_Haiku = "claude-3.5-haiku",
    Claude3_5_Sonnet = "claude-3.5-sonnet",
}

// — Google Gemini family (multimodal, varying size & speed)
export enum GoogleModelEnum {
    Gemini_1_5_Flash = "gemini-1.5-flash",
    Gemini_1_5_Flash_8B = "gemini-1.5-flash-8b",
    Gemini_1_5_Pro = "gemini-1.5-pro",
    Gemini_2_0_Flash = "gemini-2.0-flash",
}

// — OpenAI GPT family
export enum OpenAIModelEnum {
    GPT_4o = "gpt-4o",
    GPT_4o_Mini = "gpt-4o-mini",
    GPT_4_5_Preview = "gpt-4.5-preview",
    GPT_4_Turbo = "gpt-4-turbo",
    GPT_4 = "gpt-4",
    GPT_4_1 = "gpt-4.1",
    GPT_o1 = "o1",
    GPT_o1_Mini = "o1-mini",
    GPT_o3_Mini = "o3-mini",
    GPT_3_5_Turbo = "gpt-3.5-turbo"
}

// — DeepSeek (open‑source) family
export enum DeepSeekModelEnum {
    DeepSeek_V3 = "deepseek-v3",
    R1 = "r1",
}

///////////////////////////////////////////////////////////////
//              AI Models Interface
///////////////////////////////////////////////////////////////
export type AIModelVariant =
    AnthropicModelEnum
    | GoogleModelEnum
    | OpenAIModelEnum
    | DeepSeekModelEnum;

///////////////////////////////////////////////////////////////
//              LLM AI System Prompt Base Interface
///////////////////////////////////////////////////////////////
export type systemPrompt = {
    name: string;
    description: string;
    systemPrompt: string;
    systemPromptId: string;
}

///////////////////////////////////////////////////////////////
//              AI Request Base Interface
///////////////////////////////////////////////////////////////

// - 1) Anthropic (Claude 3 family) Configurations
export interface AnthropicModelsConfig {
    streamResponse?: boolean;
    maxTokens?: number;
    temperature?: number;
    top_p?: number;
}

// - 2) OpenAI (GPT‑3.5, GPT‑4 family) Configurations
export interface OpenAiModelsConfig {
    streamResponse?: boolean;
    jsonResponseFormat?: boolean;
    maxTokens?: number;
    temperature?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}

// - 3) Google (Gemini family) Configurations
export interface GeminiModelsConfig {
    streamResponse?: boolean;
    jsonResponseFormat?: boolean;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
}

// - 4) DeepSeek (DeepSeek family) Configurations
// DeepSeek’s OpenRouter‑compatible endpoint supports the same parameters as OpenAI’s Chat API. In other words:
// (DeepSeek‑Reasoner is a special CoT model that ignores temperature, top_p, etc.
// https://api-docs.deepseek.com/guides/reasoning_model?utm_source=chatgpt.com
export type DeepSeekModelsConfig = OpenAiModelsConfig;

///////////////////////////////////////////////////////////////
//              AI Request Base Interface
///////////////////////////////////////////////////////////////
export type AiConfigurations = {
    openai: OpenAiModelsConfig;
    deepseek: DeepSeekModelsConfig;
    anthropic: AnthropicModelsConfig;
    google: GeminiModelsConfig;
};

///////////////////////////////////////////////////////////////
//              id<->name mapping
///////////////////////////////////////////////////////////////
export enum ModelIdNameMapping {
    openai = "OpenAI",
    anthropic = "Anthropic",
    google = "Google",
    deepseek = "DeepSeek",
}

export enum ModelVariantIdNameMapping {
    "gpt-4o" = "GPT_4o",
    "gpt-4o-mini" = "GPT_4o_Mini",
    "gpt-4.5-preview" = "GPT_4_5_Preview",
    "gpt-4-turbo" = "GPT_4_Turbo",
    "gpt-4" = "GPT_4",
    "gpt-4.1" = "GPT_4_1",
    "o1" = "GPT_o1",
    "o1-mini" = "GPT_o1_Mini",
    "o3-mini" = "GPT_o3_Mini",
    "gpt-3.5-turbo" = "GPT_3_5_Turbo"
}



export const DefaultAiConfigurations = {
    OPENAI: {
        streamResponse: true,
        jsonResponseFormat: false,
        temperature: 1.0,
        presencePenalty: 0,
        frequencyPenalty: 0,
        maxTokens: 68,
    },
    DEEPSEEK: {
        streamResponse: false,
        jsonResponseFormat: false,
        temperature: 1.0,
        presencePenalty: 0,
        frequencyPenalty: 0,
        maxTokens: 1024,
    },
    ANTHROPIC: {
        streamResponse: false,
        maxTokens: 1024,
        temperature: 0.5,
        top_p: 0.75,
    },
    GOOGLE: {
        temperature: 1.0,
        top_p: 0.95,
        presencePenalty: 0,
        frequencyPenalty: 0,
    }
};

