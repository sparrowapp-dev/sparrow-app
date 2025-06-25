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
    Claude3_5_Sonnet = "claude-3-5-sonnet-20241022",
    Claude3_5_Haiku = "claude-3-5-haiku-20241022",
    Claude3_Opus = "claude-3-opus-20240229",
    Claude3_Haiku = "claude-3-haiku-20240307",
    Claude3_Sonnet = "claude-3-5-sonnet-20240620",
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
    DeepSeek_V3 = "deepseek-chat",
    R1 = "deepseek-reasoner",
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
    maxTokens?: number;
    top_p?: number;
}

// - 4) DeepSeek (DeepSeek family) Configurations
// DeepSeek’s OpenRouter‑compatible endpoint supports the same parameters as OpenAI’s Chat API. In other words:
// (DeepSeek‑Reasoner is a special CoT model that ignores temperature, top_p, etc.
// https://api-docs.deepseek.com/guides/reasoning_model?utm_source=chatgpt.com
export type DeepSeekModelsConfig = OpenAiModelsConfig;

export type modelsConfigType = AnthropicModelsConfig | OpenAiModelsConfig | GeminiModelsConfig | DeepSeekModelsConfig;

export type AiConfigurations = {
    openai: OpenAiModelsConfig;
    deepseek: DeepSeekModelsConfig;
    anthropic: AnthropicModelsConfig;
    google: GeminiModelsConfig;
};

///////////////////////////////////////////////////////////////
//              AI Request Base Interface
///////////////////////////////////////////////////////////////
export interface AiRequestBaseInterface {
    aiModelProvider: AiModelProviderEnum;
    aiModelVariant: AIModelVariant;
    selectedAuthType: AiRequestAuthBaseInterface;
    auth: AiRequestAuthBaseInterface;
    systemPrompt: systemPrompt;
    configurations: AiConfigurations;
}


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
    // — OpenAI GPT family
    "gpt-4o" = "GPT 4o",
    "gpt-4o-mini" = "GPT 4o Mini",
    "gpt-4.5-preview" = "GPT 4.5 Preview",
    "gpt-4-turbo" = "GPT 4 Turbo",
    "gpt-4" = "GPT 4",
    "gpt-4.1" = "GPT 4.1",
    "o1" = "o1",
    "o1-mini" = "o1 Mini",
    "o3-mini" = "o3 Mini",
    "gpt-3.5-turbo" = "GPT 3.5 Turbo",

    // — Anthropic Claude 3 family
    "claude-3-5-sonnet-20241022" = "Claude 3.5 Sonnet",
    "claude-3-5-haiku-20241022" = "Claude 3.5 Haiku",
    "claude-3-opus-20240229" = "Claude 3 Opus",
    "claude-3-haiku-20240307" = "Claude 3 Haiku",
    "claude-3-5-sonnet-20240620" = "Claude 3 Sonnet",

    // — Deepseek family
    "deepseek-chat" = "DeepSeek V3",
    "deepseek-reasoner" = "DeepSeek R1",

    // — Gemini family
    "gemini-1.5-flash" = "Gemini 1.5 Flash",
    "gemini-1.5-flash-8b" = "Gemini 1.5 Flash 8B",
    "gemini-1.5-pro" = "Gemini 1.5 Pro",
    "gemini-2.0-flash" = "Gemini 2.0 Flash",
}