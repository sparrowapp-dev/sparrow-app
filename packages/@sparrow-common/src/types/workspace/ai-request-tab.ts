import {
    AiRequestAuthTypeBaseEnum,
    AiModelProviderEnum,
    type AIModelVariant,
    type AiConfigurations,
    type PromptFileAttachment
} from "./ai-request-base";
import { CollectionRequestAddToBaseEnum } from "./collection-base";

///////////////////////////////////////////////////////////////////
//                   AI Request Interface
///////////////////////////////////////////////////////////////////
export enum AiRequestSectionEnum {
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
//            Managing AI Request Tab State
////////////////////////////////////////////////////////////////
export interface AiAuthNavigationWrapper {
    aiAuthNavigation: AiRequestAuthTypeBaseEnum;
}

export interface AiNavigationWrapper {
    aiNavigation: AiRequestSectionEnum;
}

export interface AiAuthProfileNavigationWrapper {
    selectedRequestAuthProfileId: string;
}

export interface AiLeftSplitterWidthPercentageWrapper {
    aiLeftSplitterWidthPercentage: number;
}

export interface AiRightSplitterWidthPercentageWrapper {
    aiRightSplitterWidthPercentage: number;
}

export interface IsAiSendRequestInProgressWrapper {
    isAiSendRequestInProgress: boolean;
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

export interface IsChatbotPromptBoxActiveWrapper {
    isChatbotPromptBoxActive: boolean;
}

export interface IsChatAutoClearActive {
    isChatAutoClearActive: boolean;
}

export interface IsChatbotConversationLoading {
    isChatbotConversationLoading: boolean;
}
export interface IsConversationHistoryPanelOpen {
    isConversationHistoryPanelOpen: boolean;
}

export interface IsConversationHistoryLoading {
    isConversationHistoryLoading: boolean;
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

export interface AiModelProviderWrapper {
    aiModelProvider: AiModelProviderEnum;
}

export interface AiModelVariantWrapper {
    aiModelVariant: AIModelVariant;
}

export interface AiSystemPromptWrapper {
    systemPrompt: string;
}

export interface AiConfigurationsWrapper {
    configurations: AiConfigurations;
}

export interface ResponseStatusWrapper {
    status: string;
}
export interface ResponseTimeWrapper {
    time: number;
}
export interface ResponseSizeWrapper {
    size: number;
}
export interface ResponseTokenCountWrapper {
    tokenCount: number;
}

export interface AiResponseInfo extends
    ResponseStatusWrapper, ResponseTimeWrapper, ResponseSizeWrapper, ResponseTokenCountWrapper, AiModelVariantWrapper { }


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

export interface FileAttachmentsWrapper {
    fileAttachments: PromptFileAttachment[]
}

export interface Conversation
    extends TypeWrapper,
    MessageIdWrapper,
    MessageWrapper,
    IsLikedWrapper,
    IsDislikedWrapper,
    StatusWrapper, FileAttachmentsWrapper { }

export interface ConversationsWrapper {
    conversations: Conversation[];
}
export interface LastActiveConversationBackupWrapper {
    lastActiveChatBackup: Conversation[];
}
export interface ConversationIdWrapper {
    conversationId: string;
}

export interface ConversationTitleWrapper {
    conversationTitle: string;
}

export interface IsoldChatPreviewActiveWrapper {
    isoldChatPreviewActive: boolean
}

export interface Ai
    extends PromptWrapper,
    ConversationsWrapper,
    ConversationIdWrapper,
    LastActiveConversationBackupWrapper,
    IsoldChatPreviewActiveWrapper,
    ConversationTitleWrapper { }
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

export interface AiRequestWrapper {
    aiRequest: AiRequestType;
}

export interface AiRequestType
    extends
    AiModelProviderWrapper,
    AiModelVariantWrapper,
    AiSystemPromptWrapper,
    AiConfigurationsWrapper,
    StateWrapper,
    AuthWrapper,
    AiWrapper { }


export interface State
    extends
    AiAuthNavigationWrapper,
    AiNavigationWrapper,
    AiLeftSplitterWidthPercentageWrapper,
    AiRightSplitterWidthPercentageWrapper,
    IsAiSendRequestInProgressWrapper,
    IsSaveDescriptionInProgressWrapper,
    IsSaveRequestInProgressWrapper,
    IsChatbotActive,
    IsChatAutoClearActive,
    IsChatbotSuggestionsActive,
    IsChatbotGeneratingResponse,
    IsChatbotConversationLoading,
    IsConversationHistoryPanelOpen,
    IsConversationHistoryLoading,
    IsChatbotPromptBoxActiveWrapper,
    AiAuthProfileNavigationWrapper { }

export interface StatePartial
    extends
    Partial<AiAuthNavigationWrapper>,
    Partial<AiNavigationWrapper>,
    Partial<AiLeftSplitterWidthPercentageWrapper>,
    Partial<AiRightSplitterWidthPercentageWrapper>,
    Partial<IsAiSendRequestInProgressWrapper>,
    Partial<IsSaveDescriptionInProgressWrapper>,
    Partial<IsSaveRequestInProgressWrapper>,
    Partial<IsChatbotActive>,
    Partial<IsChatAutoClearActive>,
    Partial<IsChatbotSuggestionsActive>,
    Partial<IsChatbotGeneratingResponse>,
    Partial<IsChatbotConversationLoading>,
    Partial<IsConversationHistoryPanelOpen>,
    Partial<IsConversationHistoryLoading>,
    Partial<IsChatbotPromptBoxActiveWrapper>,
    Partial<AiAuthProfileNavigationWrapper> { }
