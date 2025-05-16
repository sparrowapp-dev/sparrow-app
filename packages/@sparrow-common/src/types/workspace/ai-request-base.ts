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
    Anthropic = "Anthropic",
    Google = "Google",
    OpenAI = "openai",
    DeepSeek = "DeepSeek",
}

///////////////////////////////////////////////////////////////
//              Per Provider Model Variants
///////////////////////////////////////////////////////////////

// — Anthropic Claude 3 family: Haiku (fast), Sonnet (balanced), Opus (capable)
export enum AnthropicModelEnum {
    Claude3_Haiku = "claude-3-haiku",
    Claude3_Sonnet = "claude-3-sonnet",
    Claude3_Opus = "claude-3-opus",
    Claude3_5_Haiku = "claude-3.5-haiku",
    Claude3_5_Sonnet = "claude-3.5-sonnet",
}

// — Google Gemini family (multimodal, varying size & speed)
export enum GoogleModelEnum {
    Gemini_Ultra = "gemini-ultra",
    Gemini_1_5_Pro = "gemini-1.5-pro",
    Gemini_1_5_Flash_8b = "gemini-1.5-flash-8b",
    Gemini_Nano = "gemini-nano",
    Gemini_2_5_Pro_Exp = "gemini-2.5-pro-preview",
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
    systemPromptSource: string;
    systemPromptCreatedAt: string;
    systemPromptUpdatedAt: string;
    systemPromptCreatedBy: string;
    systemPromptUpdatedBy: string;
    systemPromptIsDeleted: boolean;
    systemPromptIsActive: boolean;
    systemPromptIsSaved: boolean;
    systemPromptIsDefault: boolean;
}



///////////////////////////////////////////////////////////////
//              AI Request Base Interface
///////////////////////////////////////////////////////////////

// - 1) Anthropic (Claude 3 family) Configurations
export interface AnthropicGenerationConfig {
    max_tokens: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    stop_sequences?: string[];
    stream?: boolean;
    system?: string | Array<{ type: string; text: string }>;
    thinking?: { type: 'enabled'; budget_tokens: number } | { type: 'disabled' };
    tool_choice?:
    | 'auto' | 'any' | 'tool' | 'none'
    | { type: 'function'; function: string };
    tools?: Array<{
        name: string;
        description?: string;
        input_schema: Record<string, any>;
    }>;
    metadata?: { user_id?: string | null };
}

// - 2) OpenAI (GPT‑3.5, GPT‑4 family) Configurations
export interface OpenAIChatConfig {
    model: OpenAIModelEnum;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    n?: number;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    logit_bias?: Record<string, number>;
    logprobs?: number;
    stop?: string | string[];
    stream?: boolean;
    user?: string;
    functions?: Array<{
        name: string;
        description?: string;
        parameters: Record<string, any>;
    }>;
    function_call?: 'auto' | 'none' | { name: string };
    parallel_tool_calls?: boolean;
}

// - 3) Google (Gemini family) Configurations
export interface GeminiGenerationConfig {
    temperature?: number;
    topP?: number;
    topK?: number;
    candidateCount?: number;
    maxOutputTokens?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    stopSequences?: string[];
    seed?: number;
    responseLogprobs?: boolean;
    logprobs?: number;
    audioTimestamp?: boolean;
    responseMimeType?: string;
    responseSchema?: Record<string, any>;
}

// - 4) DeepSeek (DeepSeek family) Configurations

// DeepSeek’s OpenRouter‑compatible endpoint supports the same parameters as OpenAI’s Chat API. In other words:
// (DeepSeek‑Reasoner is a special CoT model that ignores temperature, top_p, etc.
// https://api-docs.deepseek.com/guides/reasoning_model?utm_source=chatgpt.com
export type DeepSeekConfig = OpenAIChatConfig;

///////////////////////////////////////////////////////////////
//              AI Request Base Interface
///////////////////////////////////////////////////////////////
// 2) Make a union of all configs
export type AIConfig =
    AnthropicGenerationConfig
    | OpenAIChatConfig
    | GeminiGenerationConfig
    | DeepSeekConfig;


///////////////////////////////////////////////////////////////
//              AI Request Base Interface
///////////////////////////////////////////////////////////////
export interface HttpRequestBaseInterface {
    AIModelProvider: AiModelProviderEnum;
    AIModelVariant: AIModelVariant;
    selectedAuthType: AiRequestAuthBaseInterface;
    auth: AiRequestAuthBaseInterface;
    systemPrompt: systemPrompt;
    aiConfigurations: AIConfig;
}




