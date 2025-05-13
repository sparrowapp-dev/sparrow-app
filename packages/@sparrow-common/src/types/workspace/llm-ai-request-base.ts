import { CollectionRequestAddToBaseEnum } from "./collection-base";




///////////////////////////////////////////////////////////////
//              LLM AI Request Auth Base Interface
///////////////////////////////////////////////////////////////
export enum LLM_AI_Request_Auth_Type_Base_Enum {
    NO_AUTH = "No Auth",
    API_KEY = "API Key",
    BEARER_TOKEN = "Bearer Token",
    BASIC_AUTH = "Basic Auth",
    INHERIT_AUTH = "Inherit Auth"
}

interface LLM_AI_Request_Basic_Auth_Base_Interface {
    username?: string;
    password?: string;
}

interface LLM_AI_Request_Api_Key_Base_Interface {
    authKey: string;
    authValue: string;
    addTo: CollectionRequestAddToBaseEnum;
}

interface LLM_AI_Request_Auth_Base_Interface {
    apiKey?: LLM_AI_Request_Api_Key_Base_Interface;
    basicAuth?: LLM_AI_Request_Basic_Auth_Base_Interface;
    bearerToken?: string;
}



///////////////////////////////////////////////////////////////
//              LLM Providers
///////////////////////////////////////////////////////////////
export enum LLMProviderEnum {
    Anthropic = "Anthropic",
    Google = "Google",
    OpenAI = "OpenAI",
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
    GPT4 = "gpt-4",
    GPT4O = "gpt-4o",
    GPT4_Turbo = "gpt-4-turbo",
    GPT4O_Mini = "gpt-4o-mini",
    GPT3_5_Turbo = "gpt-3.5-turbo",
    Text_Davinci_003 = "text-davinci-003",
}

// — DeepSeek (open‑source) family
export enum DeepSeekModelEnum {
    DeepSeek_V3 = "deepseek-v3",
    R1 = "r1",
}

///////////////////////////////////////////////////////////////
//              LLM AI Models Interface
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
//              LLM AI Request Base Interface
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
//              LLM AI Request Base Interface
///////////////////////////////////////////////////////////////
// 2) Make a union of all configs
export type AIConfig =
    AnthropicGenerationConfig
    | OpenAIChatConfig
    | GeminiGenerationConfig
    | DeepSeekConfig;


///////////////////////////////////////////////////////////////
//              LLM AI Request Base Interface
///////////////////////////////////////////////////////////////
export interface HttpRequestBaseInterface {
    AI_Model_Provider: LLMProviderEnum;
    AI_Model_Variant: AIModelVariant;
    selectedAuthType: LLM_AI_Request_Auth_Base_Interface;
    auth: LLM_AI_Request_Auth_Base_Interface;
    systemPrompt: systemPrompt;
    ai_configurations: AIConfig;
}




