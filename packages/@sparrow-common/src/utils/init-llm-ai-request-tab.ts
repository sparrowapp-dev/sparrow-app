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
import { LLM_AI_Request_Auth_Type_Base_Enum, LLMProviderEnum, OpenAIModelEnum, type AIModelVariant } from "../types/workspace/llm-ai-request-base";
import { LLM_AI_RequestSectionEnum } from "../types/workspace/llm-ai-request-tab";
class InitLLMAIRequestTab {
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
            type: TabTypeEnum.LLM_REQUEST,
            persistence: TabPersistenceTypeEnum.PERMANENT,
            description: "[]",
            source: "USER",
            isDeleted: false,
            activeSync: false,
            property: {
                llm_ai_request: {
                    // AI_Model_Provider: LLMProviderEnum.OpenAI,
                    AI_Model_Provider: 'openai',
                    AI_Model_Variant: OpenAIModelEnum.GPT_4o,
                    SystemPrompt: "",
                    Configurations: {},
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
                    ai: {
                        prompt: "",
                        conversations: [],
                        threadId: "",
                    },
                    state: {
                        LLM_AI_AuthNavigation: LLM_AI_Request_Auth_Type_Base_Enum.NO_AUTH,
                        LLM_AI_Navigation: LLM_AI_RequestSectionEnum.SYSTEM_PROMPT,
                        LLM_AI_LeftSplitterWidthPercentage: 50,
                        LLM_AI_RightSplitterWidthPercentage: 50,
                        is_LLM_ai_SendRequestInProgress: false,
                        isSaveDescriptionInProgress: false,
                        isSaveRequestInProgress: false,
                        isChatbotActive: true,
                        isChatbotSuggestionsActive: true,
                        isChatbotGeneratingResponse: false,
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
    public updateAIModelProvider(_modalProviderName: LLMProviderEnum) {
        if (_modalProviderName && this._tab.property.llm_ai_request) {
            this._tab.property.llm_ai_request.AI_Model_Provider = _modalProviderName;
        }
    }
    public updateAIModelVariant(_modalVariantName: AIModelVariant) {
        if (_modalVariantName && this._tab.property.llm_ai_request) {
            this._tab.property.llm_ai_request.AI_Model_Variant = _modalVariantName;
        }
    }
    public updateAuth(_auth: Auth) {
        if (_auth && this._tab.property.llm_ai_request) {
            this._tab.property.llm_ai_request.auth = _auth;
        }
    }

    // ToDo: Method to update AI modal configurations
    // public updateAIConfigurations(_headers: KeyValueChecked[]) {
    //     if (_headers && this._tab.property.llm_ai_request) {
    //         this._tab.property.llm_ai_request.Configurations = _headers;
    //     }
    // }

    public updateIsSave(_isSave: boolean) {
        this._tab.isSaved = _isSave;
    }
    public updateState(_state: StatePartial) {
        if (this._tab.property.llm_ai_request) {
            this._tab.property.llm_ai_request.state = {
                ...this._tab.property.llm_ai_request.state,
                ..._state,
            };
        }
    }
    public updateChatbotState(_isActive: boolean) {
        if (this._tab.property.llm_ai_request?.state) {
            this._tab.property.llm_ai_request.state.isChatbotActive = _isActive;
        }
    }
}

export { InitLLMAIRequestTab };
