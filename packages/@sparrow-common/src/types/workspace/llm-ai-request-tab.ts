import {
    LLM_AI_Request_Auth_Type_Base_Enum,
    LLMProviderEnum,
    type AIConfig,
    type AIModelVariant

} from "./llm-ai-request-base";
import { CollectionRequestAddToBaseEnum } from "./collection-base";



///////////////////////////////////////////////////////////////////
//                   LLM AI Request Interface
///////////////////////////////////////////////////////////////////
export enum LLM_AI_RequestSectionEnum {
    SYSTEM_PROMPT = "System Prompt",
    AUTHORIZATION = "Authorization",
    AI_MODAL_CONFIGURATIONS = "Configurations",
}

export enum MessageTypeEnum {
    SENDER = "Sender",
    RECEIVER = "Receiver",
}


export enum UntrackedItemsEnum {
    UNTRACKED = "UNTRACKED-",
}




////////////////////////////////////////////////////////////////
//            Managing LLM AI Request Tab State
////////////////////////////////////////////////////////////////
export interface LLM_AI_AuthNavigationWrapper {
    LLM_AI_AuthNavigation: LLM_AI_Request_Auth_Type_Base_Enum;
}

export interface LLM_AI_NavigationWrapper {
    LLM_AI_Navigation: LLM_AI_RequestSectionEnum;
}

export interface LLM_AI_LeftSplitterWidthPercentageWrapper {
    LLM_AI_LeftSplitterWidthPercentage: number;
}

export interface LLM_AI_RightSplitterWidthPercentageWrapper {
    LLM_AI_RightSplitterWidthPercentage: number;
}

export interface Is_LLM_AI_SendRequestInProgressWrapper {
    is_LLM_ai_SendRequestInProgress: boolean;
}

export interface IsSaveDescriptionInProgressWrapper {
    isSaveDescriptionInProgress: boolean;
}

export interface IsSaveRequestInProgressWrapper {
    isSaveRequestInProgress: boolean;
}

export interface IsChatbotActive {
    isChatbotActive: boolean;
}

export interface IsChatbotSuggestionsActive {
    isChatbotSuggestionsActive: boolean;
}

export interface IsChatbotGeneratingResponse {
    isChatbotGeneratingResponse: boolean;
}

export interface UsernameWrapper {
    username: string;
}
export interface PasswordWrapper {
    password: string;
}
export interface AuthKeyWrapper {
    authKey: string;
}
export interface AuthValueWrapper {
    authValue: string;
}
export interface AddtoWrapper {
    addTo: CollectionRequestAddToBaseEnum;
}
export interface BearerTokenWrapper {
    bearerToken: string;
}

export interface AIModelProviderWrapper {
    AI_Model_Provider: LLMProviderEnum;
}

export interface AIModelVariantWrapper {
    AI_Model_Variant: AIModelVariant;
}

export interface AISystemPromptWrapper {
    SystemPrompt: string;
}

export interface AIConfigurationsWrapper {
    Configurations: AIConfig;
}

export interface ResponseStatusWrapper {
    status: string;
}
export interface ResponseBodyWrapper {
    body: string;
}
export interface ResponseTimeWrapper {
    time: number;
}
export interface ResponseSizeWrapper {
    size: number;
}

export interface StateWrapper {
    state: State;
}

export interface PromptWrapper {
    prompt: string;
}

export interface TypeWrapper {
    type: MessageTypeEnum;
}
export interface MessageIdWrapper {
    messageId: string;
}
export interface MessageWrapper {
    message: string;
}
export interface IsLikedWrapper {
    isLiked: boolean;
}
export interface IsDislikedWrapper {
    isDisliked: boolean;
}
export interface StatusWrapper {
    status: boolean;
}

export interface Conversation
    extends TypeWrapper,
    MessageIdWrapper,
    MessageWrapper,
    IsLikedWrapper,
    IsDislikedWrapper,
    StatusWrapper { }

export interface ConversationsWrapper {
    conversations: Conversation[];
}
export interface ThreadIdWrapper {
    threadId: string;
}

export interface Ai
    extends PromptWrapper,
    ConversationsWrapper,
    ThreadIdWrapper { }
export interface AiWrapper {
    ai: Ai;
}

export interface BasicAuth extends UsernameWrapper, PasswordWrapper { }
export interface BasicAuthWrapper {
    basicAuth: BasicAuth;
}
export interface ApiKey
    extends AuthKeyWrapper,
    AuthValueWrapper,
    AddtoWrapper { }
export interface ApiKeyWrapper {
    apiKey: ApiKey;
}
export interface Auth
    extends BearerTokenWrapper,
    BasicAuthWrapper,
    ApiKeyWrapper { }
export interface AuthWrapper {
    auth: Auth;
}

export interface LLM_AI_RequestWrapper {
    llm_ai_request: LLM_AI_Request;
}

export interface LLM_AI_Request
    extends
    AIModelProviderWrapper,
    AIModelVariantWrapper,
    AISystemPromptWrapper,
    AIConfigurationsWrapper,
    StateWrapper,
    AuthWrapper,
    AiWrapper { }


export interface State
    extends
    LLM_AI_AuthNavigationWrapper,
    LLM_AI_NavigationWrapper,
    LLM_AI_LeftSplitterWidthPercentageWrapper,
    LLM_AI_RightSplitterWidthPercentageWrapper,
    Is_LLM_AI_SendRequestInProgressWrapper,
    IsSaveDescriptionInProgressWrapper,
    IsSaveRequestInProgressWrapper,
    IsChatbotActive,
    IsChatbotSuggestionsActive,
    IsChatbotGeneratingResponse { }

export interface StatePartial
    extends
    Partial<LLM_AI_AuthNavigationWrapper>,
    Partial<LLM_AI_NavigationWrapper>,
    Partial<LLM_AI_LeftSplitterWidthPercentageWrapper>,
    Partial<LLM_AI_RightSplitterWidthPercentageWrapper>,
    Partial<Is_LLM_AI_SendRequestInProgressWrapper>,
    Partial<IsSaveDescriptionInProgressWrapper>,
    Partial<IsSaveRequestInProgressWrapper>,
    Partial<IsChatbotActive>,
    Partial<IsChatbotSuggestionsActive>,
    Partial<IsChatbotGeneratingResponse> { }
