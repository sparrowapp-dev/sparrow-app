import {
    RequestMethodEnum,
    type Auth,
    type KeyValueChecked,
    type StatePartial,
} from "@sparrow/common/types/workspace";
import {
    TabTypeEnum,
    type Tab,
    type Path,
    TabPersistenceTypeEnum,
} from "@sparrow/common/types/workspace/tab";
import { v4 as uuidv4 } from "uuid";
import { CollectionRequestAddToBaseEnum } from "../types/workspace/collection-base";
import { AiRequestAuthTypeBaseEnum, AiModelProviderEnum, OpenAIModelEnum, type AIModelVariant } from "../types/workspace/ai-request-base";
import { AiRequestSectionEnum } from "../types/workspace/ai-request-tab";
class InitAiRequestTab {
    private _tab: Tab;
    /**
     *
     * @param _id - Request mongo id
     * @param _workspaceId - Workspace Id to which Request belongs to
     */
    constructor(_id: string, _workspaceId: string) {
        this._tab = {
            id: _id,
            tabId: uuidv4(),
            name: "New AI Request",
            type: TabTypeEnum.AI_REQUEST,
            persistence: TabPersistenceTypeEnum.PERMANENT,
            description: "[]",
            source: "USER",
            isDeleted: false,
            activeSync: false,
            property: {
                aiRequest: {
                    aiModelProvider: "",
                    aiModelVariant: "",
                    systemPrompt: "",
                    auth: {
                        bearerToken: "",
                        basicAuth: {
                            username: "",
                            password: "",
                        },
                        apiKey: {
                            authKey: "",
                            authValue: "",
                            addTo: CollectionRequestAddToBaseEnum.HEADER, // ToDo (remove while pushing): This "addTo" needs to removed, because api key handling is done from backend so on frontend no need to decided headers or params
                        },
                    },
                    configurations: {
                        openai: {
                            streamResponse: true,
                            jsonResponseFormat: false,
                            temperature: 0.5,
                            presencePenalty: 0.5,
                            frequencyPenalty: 0.5,
                            maxTokens: -1,
                        },
                        deepseek: {
                            streamResponse: true,
                            jsonResponseFormat: false,
                            temperature: 0.5,
                            presencePenalty: 0.5,
                            frequencyPenalty: 0.5,
                            maxTokens: -1,
                        },
                        anthropic: {
                            streamResponse: true,
                            maxTokens: -1,
                            temperature: 0.5,
                            top_p: 0.95,
                        },
                        google: {
                            streamResponse: true,
                            jsonResponseFormat: false,
                            temperature: 0.5,
                            maxTokens: -1,
                            top_p: 0.95,
                        },
                    },
                    ai: {
                        prompt: "",
                        conversations: [],
                        conversationId: "",
                        lastActiveChatBackup: [],
                        isoldChatPreviewActive: false,
                        conversationTitle: "New Conversation",
                    },
                    state: {
                        aiAuthNavigation: AiRequestAuthTypeBaseEnum.API_KEY,
                        aiNavigation: AiRequestSectionEnum.SYSTEM_PROMPT,
                        aiLeftSplitterWidthPercentage: 50,
                        aiRightSplitterWidthPercentage: 50,
                        isAiSendRequestInProgress: false,
                        isSaveDescriptionInProgress: false,
                        isSaveRequestInProgress: false,
                        isChatbotActive: true,
                        isChatAutoClearActive: false,
                        isChatbotSuggestionsActive: true,
                        isChatbotGeneratingResponse: false,
                        isChatbotConversationLoading: false,
                        isConversationHistoryPanelOpen: false,
                        isConversationHistoryLoading: false,
                        selectedRequestAuthProfileId: ""
                    },
                },
            },
            path: {
                workspaceId: _workspaceId,
                collectionId: "",
                folderId: "",
            },
            isSaved: true,
            index: 0,
            isActive: true,
            timestamp: new Date().toString(),
        };
        if (!_id || !_workspaceId) {
            console.error("invalid id or workspace id on create new tab request!");
        }
    }
    public getValue(): Tab {
        return this._tab;
    }
    public updateId(_id: string) {
        this._tab.id = _id;
    }
    public updateTabType(type: TabPersistenceTypeEnum) {
        this._tab.persistence = type;
    }
    public updateName(_name: string) {
        this._tab.name = _name;
    }
    public updateDescription(_description: string) {
        this._tab.description = _description;
    }
    public updatePath(_path: Path) {
        this._tab.path = _path;
    }

    // change these ???
    public updateAIModelProvider(_modalProviderName: AiModelProviderEnum) {
        if (_modalProviderName && this._tab.property.aiRequest) {
            this._tab.property.aiRequest.aiModelProvider = _modalProviderName;
        }
    }
    public updateAIModelVariant(_modalVariantName: AIModelVariant) {
        if (_modalVariantName && this._tab.property.aiRequest) {
            this._tab.property.aiRequest.aiModelVariant = _modalVariantName;
        }
    }
    public updateAISystemPrompt(_systemPrompt: string) {
        if (_systemPrompt && this._tab.property.aiRequest) {
            this._tab.property.aiRequest.systemPrompt = _systemPrompt;
        }
    }
    // ToDo: Method to update AI modal configurations
    // public updateAIConfigurations(_configurations) {
    //     if (_configurations && this._tab.property.aiRequest) {
    //         this._tab.property.aiRequest.configurations = _configurations;
    //     }
    // }
    public updateAuth(_auth: Auth) {
        if (_auth && this._tab.property.aiRequest) {
            this._tab.property.aiRequest.auth = _auth;
        }
    }
    public updateIsSave(_isSave: boolean) {
        this._tab.isSaved = _isSave;
    }
    public updateState(_state: StatePartial) {
        if (this._tab.property.aiRequest) {
            this._tab.property.aiRequest.state = {
                ...this._tab.property.aiRequest.state,
                ..._state,
            };
        }
    }
    public updateChatbotState(_isActive: boolean) {
        if (this._tab.property.aiRequest?.state) {
            this._tab.property.aiRequest.state.isChatbotActive = _isActive;
        }
    }
}

export { InitAiRequestTab };
