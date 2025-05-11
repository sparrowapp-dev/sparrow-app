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
import { LLM_AI_Request_Auth_Type_Base_Enum } from "../types/workspace/llm-ai-request-base";
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
            name: "New LLM Request",
            type: TabTypeEnum.LLM_REQUEST,
            persistence: TabPersistenceTypeEnum.PERMANENT,
            description: "[]",
            source: "USER",
            isDeleted: false,
            activeSync: false,
            property: {
                llm_ai_request: {
                    ai_model: "",
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
                            addTo: CollectionRequestAddToBaseEnum.HEADER,
                        },
                    },
                    ai: {
                        prompt: "",
                        conversations: [],
                        threadId: "",
                    },
                    response: {
                        headers: [],
                        status: "",
                        body: "",
                        time: 0,
                        size: 0,
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
    public updateAIModel(_url: string) {
        if (_url && this._tab.property.request) {
            this._tab.property.request.url = _url;
        }
    }
    public updateAIModelVariant(_method: RequestMethodEnum) {
        if (_method && this._tab.property.request) {
            this._tab.property.request.method = _method;
        }
    }
    public updateAuth(_auth: Auth) {
        if (_auth && this._tab.property.request) {
            this._tab.property.request.auth = _auth;
        }
    }
    public updateAIConfigurations(_headers: KeyValueChecked[]) {
        if (_headers && this._tab.property.request) {
            this._tab.property.request.headers = _headers;
        }
    }

    public updateIsSave(_isSave: boolean) {
        this._tab.isSaved = _isSave;
    }
    public updateState(_state: StatePartial) {
        if (this._tab.property.request) {
            this._tab.property.request.state = {
                ...this._tab.property.request.state,
                ..._state,
            };
        }
    }
    public updateChatbotState(_isActive: boolean) {
        if (this._tab.property.request?.state) {
            this._tab.property.request.state.isChatbotActive = _isActive;
        }
    }
}

export { InitLLMAIRequestTab };
