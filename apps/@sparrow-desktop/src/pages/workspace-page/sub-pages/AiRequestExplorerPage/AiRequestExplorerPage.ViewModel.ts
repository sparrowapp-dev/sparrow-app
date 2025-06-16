// ---- Utils
import { createDeepCopy, InitAiRequestTab, MarkdownFormatter, moveNavigation, Sleep } from "@sparrow/common/utils";

// ---- DB
import type {
  TabDocument,
  WorkspaceDocument,
  CollectionDocument
} from "../../../../database/database";
import type { CreateDirectoryPostBody } from "@sparrow/common/dto";

// ---- Service
import {
  insertCollection,
  insertCollectionDirectory,
  insertCollectionRequest,
  updateCollectionRequest,
} from "../../../../services/collection";

// ---- Repo
import { TabRepository } from "../../../../repositories/tab.repository";
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import { EnvironmentRepository } from "../../../../repositories/environment.repository";
import { BehaviorSubject, Observable } from "rxjs";
import { EnvironmentService } from "../../../../services/environment.service";

// ---- Events
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import {
  type Auth,
  type Path,
  type KeyValue,
  type RequestTab,
  type StatePartial,
  type Conversation,
  MessageTypeEnum,
} from "@sparrow/common/types/workspace";
import { notifications } from "@sparrow/library/ui";
import { GuestUserRepository } from "../../../../repositories/guest-user.repository";
import { isGuestUserActive } from "@app/store/auth.store";
import { v4 as uuidv4 } from "uuid";
import { AiAssistantService } from "../../../../services/ai-assistant.service";
import { AiAssistantWebSocketService } from "../../../../services/ai-assistant.ws.service";
import { AiRequestExplorerDataStore, type AiRequestExplorerData } from "@sparrow/workspaces/features/ai-request-explorer/store";
import { TabPersistenceTypeEnum } from "@sparrow/common/types/workspace/tab";
import { getClientUser } from "@app/utils/jwt";
import constants from "@app/constants/constants";
import * as Sentry from "@sentry/svelte";
import { AiModelProviderEnum, OpenAIModelEnum, type modelsConfigType } from "@sparrow/common/types/workspace/ai-request-base";
import { configFormat, disabledModelFeatures } from "@sparrow/workspaces/features/ai-request-explorer/constants";
import {
  startLoading,
  stopLoading,
} from "../../../../../../../packages/@sparrow-common/src/store";
import {
  Events,
  ItemType,
} from "@sparrow/common/enums";
import { CollectionService } from "../../../../services/collection.service";
import { CompareArray, Debounce } from "@sparrow/common/utils";
import {
  CollectionItemTypeBaseEnum,
  type CollectionItemBaseInterface,
} from "@sparrow/common/types/workspace/collection-base";
import type { AiRequestCreateUpdateInCollectionPayloadDtoInterface, AiRequestCreateUpdateInFolderPayloadDtoInterface } from "@sparrow/common/types/workspace/ai-request-dto";
import { AiRequestTabAdapter, CollectionTabAdapter } from "@app/adapter";
import { AiRequestRepository } from "../../../../repositories/ai-request.repository";
import { type StatePartial as AiStateParital } from "@sparrow/common/types/workspace/ai-request-tab";
import { AiRequestService } from "../../../../services/ai-request.service";


class AiRequestExplorerViewModel {
  // Repository
  private collectionRepository = new CollectionRepository();
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private guestUserRepository = new GuestUserRepository();
  private aiRequestRepository = new AiRequestRepository();
  private tabRepository = new TabRepository();
  private compareArray = new CompareArray

  // Services
  private environmentService = new EnvironmentService();
  private collectionService = new CollectionService();
  private aiAssistentService = new AiAssistantService();
  private aiRequestService = new AiRequestService();
  private aiAssistentWebSocketService =
    AiAssistantWebSocketService.getInstance();
  private _tab: BehaviorSubject<RequestTab> = new BehaviorSubject({});

  public collectionSubscriber(_collectionId: string) {
    return this.collectionRepository.subscribeCollection(_collectionId);
  }

  public constructor(doc: TabDocument) {
    if (doc?.isActive) {
      setTimeout(async () => {
        const t = createDeepCopy(doc.toMutableJSON());
        delete t.isActive;
        delete t.index;
        t.persistence = TabPersistenceTypeEnum.PERMANENT;
        this.tab = t;
      }, 0);
    }
  }

  public get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

  public get tab(): Observable<RequestTab> {
    return this._tab.asObservable();
  }

  private set tab(value: RequestTab) {
    this._tab.next(value);
  }

  public openCollection = async () => {
    const collectionRx = await this.collectionRepository.readCollection(
      this._tab.getValue().path.collectionId,
    );
    const collectionDoc = collectionRx?.toMutableJSON();
    const collectionTab = new CollectionTabAdapter().adapt(
      this._tab.getValue().path.workspaceId,
      collectionDoc,
    );
    this.tabRepository.createTab(collectionTab);
  };

  /**
 * Compares the current request tab with the server version and updates the saved status accordingly.
 * This method is debounced to reduce the number of server requests.
 * @return A promise that resolves when the comparison is complete.
 */
  private compareRequestWithServerDebounced = async () => {
    let result = true;
    const progressiveTab: RequestTab = createDeepCopy(this._tab.getValue());
    const requestTabAdapter = new AiRequestTabAdapter();
    const unadaptedRequest = requestTabAdapter.unadapt(progressiveTab);
    let requestServer;
    if (progressiveTab.path.folderId) {
      requestServer = await this.collectionRepository.readRequestInFolder(
        progressiveTab.path.collectionId,
        progressiveTab.path.folderId,
        progressiveTab.id,
      );
    } else {
      requestServer =
        await this.collectionRepository.readRequestOrFolderInCollection(
          progressiveTab.path.collectionId,
          progressiveTab.id,
        );
    }

    if (!requestServer) result = false;

    // description
    else if (requestServer.description !== progressiveTab.description) {
      result = false;
    }
    // name
    else if (requestServer.name !== progressiveTab.name) {
      result = false;
    }
    // aiModelProvider
    else if (
      requestServer.aiRequest.aiModelProvider !== progressiveTab.property.aiRequest.aiModelProvider
    ) {
      result = false;
    }
    // aiModelVariant
    else if (
      requestServer.aiRequest.aiModelVariant !== progressiveTab.property.aiRequest.aiModelVariant
    ) {
      result = false;
    }
    // systemPrompt
    else if (
      requestServer.aiRequest.systemPrompt !==
      progressiveTab.property.aiRequest.systemPrompt
    ) {
      result = false;
    } else if (
      requestServer.aiRequest.selectedAuthType !==
      progressiveTab.property.aiRequest.state.aiAuthNavigation
    ) {
      result = false;
    }
    // auth key
    else if (
      requestServer.aiRequest.auth.apiKey.authKey !==
      progressiveTab.property.aiRequest.auth.apiKey.authKey
    ) {
      result = false;
    }
    // auth value
    else if (
      requestServer.aiRequest.auth.apiKey.authValue !==
      progressiveTab.property.aiRequest.auth.apiKey.authValue
    ) {
      result = false;
    }
    // // addTo
    else if (
      requestServer.aiRequest.auth.apiKey.addTo !==
      progressiveTab.property.aiRequest.auth.apiKey.addTo
    ) {
      result = false;
    }
    // username
    else if (
      requestServer.aiRequest.auth.basicAuth.username !==
      progressiveTab.property.aiRequest.auth.basicAuth.username
    ) {
      result = false;
    }
    // password
    else if (
      requestServer.aiRequest.auth.basicAuth.password !==
      progressiveTab.property.aiRequest.auth.basicAuth.password
    ) {
      result = false;
    }
    // bearer tokem
    else if (
      requestServer.aiRequest.auth.bearerToken !==
      progressiveTab.property.aiRequest.auth.bearerToken
    ) {
      result = false;
    }

    // result
    if (result) {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: true,
      });
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
    } else {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: false,
      });
      progressiveTab.isSaved = false;
      this.tab = progressiveTab;
    }
  };

  /**
   * Debounced method to compare the current request tab with the server version.
   */
  private compareRequestWithServer = new Debounce().debounce(
    this.compareRequestWithServerDebounced,
    0,
  );

  public fetchConversations = async () => {
    const componentData = this._tab.getValue();
    const provider = componentData.property.aiRequest.aiModelProvider;
    const providerAuthKey = componentData.property.aiRequest.auth.apiKey.authValue;

    if (!providerAuthKey || !provider) {
      console.error("Failed due to missing provider and authKey before fetching conversations.");
      return;
    }

    try {
      const conversationFetchResult = await this.aiRequestService.fetchConversationsByApiKey(provider, providerAuthKey);
      if (conversationFetchResult.isSuccessful) {
        // Store the fetched conversations in the repository
        const res = await this.aiRequestRepository.addConversation(provider, providerAuthKey, conversationFetchResult.data.data);
        return res;
      } else { console.error("Conversation fetch failed:"); return; }
    } catch (error) {
      console.error("Error while fetching conversations :>> ", error);
    }
  }

  /**
   * Get list of conversations based on specific apikey 
   * @returns :Observable<CollectionDocument[]> - the list of collection from current active workspace
   */
  public getConversationsList = () => {
    const componentData = this._tab.getValue();
    const provider = componentData?.property?.aiRequest?.aiModelProvider;
    const providerAuthKey = componentData?.property?.aiRequest?.auth?.apiKey.authValue;

    if (!provider || !providerAuthKey) {
      console.error("Failed fetching conversations due to missing provider and authKey detials.");
      return;
    }
    const response = this.aiRequestRepository.getConversationsByApiKeyAndProvider(provider, providerAuthKey);
    return response;
  };


  public getFormattedTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  public getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;  // e.g. "2025-06-10"
  };

  public saveConversationHistory = async () => {
    const componentData = this._tab.getValue();
    const user = getClientUser();
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    const provider = componentData?.property?.aiRequest?.aiModelProvider;
    const conversations = componentData?.property?.aiRequest?.ai?.conversations || [];
    const conversationId = componentData?.property?.aiRequest?.ai?.conversationId;
    const conversationTitle = componentData?.property?.aiRequest?.ai?.conversationTitle;
    const providerAuthKey = componentData?.property?.aiRequest?.auth?.apiKey.authValue;

    // if (!conversations.length || !provider || !providerAuthKey) {
    if (!provider || !providerAuthKey) {
      console.error("Missing provider, conversations, or authKey.");
      return;
    }

    try {
      const { inputTokens, outputTokens } = conversations.reduce((acc, item) => {
        if (item.type === "Sender") acc.inputTokens += item.inputTokens || 0;
        if (item.type === "Receiver") acc.outputTokens += item.outputTokens || 0;
        return acc;
      }, { inputTokens: 0, outputTokens: 0 });

      const commonFields = {
        title: conversationTitle,
        inputTokens,
        outputTokens,
        date: this.getLocalDate(),
        time: this.getFormattedTime(),
        conversation: conversations,
        authoredBy: isGuestUser ? "Guest User" : user.name,
        updatedBy: isGuestUser ? "Guest User" : {
          name: user.name,
          email: user.email,
          id: user.id,
        }
      };

      if (!conversationId) {
        const payload = {
          provider,
          apiKey: providerAuthKey,
          data: {
            ...commonFields,
            createdBy: isGuestUser ? "Guest User" : {
              name: user.name,
              email: user.email,
              id: user.id,
            }
          }
        };

        const response = await this.aiRequestService.addNewConversation(payload);
        const newConversationId = response.data.data;
        this.updateAiRequestConversationId(newConversationId);

        if (response.isSuccessful) { await this.fetchConversations(); }
        else { console.error("Failed to save conversation. Please try again. ", response); }
      } else {
        const payload = {
          provider,
          apiKey: providerAuthKey,
          id: conversationId,
          data: {
            ...commonFields,
          }
        };

        const response = await this.aiRequestService.updateConversation(payload);
        if (response.isSuccessful) { await this.fetchConversations(); }
        else { console.error("Something went wrong while updating conversation. ", response); }
      }
    } catch (error) { console.error("Error while saving conversation history :>> ", error); }
  }

  public handleRenameConversationTitle = async (conversationId: string, newConversationTitle: string) => {
    // If conversationId is null, then change title of current tab itself, no need to change in db
    if (!conversationId) {
      await this.updateAiRequestConversationTitle(newConversationTitle);
      return;
    }

    const componentData = this._tab.getValue();
    const user = getClientUser();
    const guestUser = await this.guestUserRepository.findOne({
        name: "guestUser",
    });

    const provider = componentData?.property?.aiRequest?.aiModelProvider;
    const currTabConversationId = componentData?.property?.aiRequest?.ai?.conversationId;
    const providerAuthKey = componentData?.property?.aiRequest?.auth?.apiKey.authValue;

    if (!provider || !providerAuthKey) {
      console.error("Missing provider, conversations, or authKey.");
      return;
    }

    try {
      const payload = {
        provider,
        apiKey: providerAuthKey,
        id: conversationId,
        data: {
          title: newConversationTitle,
          time: this.getFormattedTime(),
          date: this.getLocalDate(),
          authoredBy: guestUser ? "Guest User" : user.name,
          updatedBy: guestUser ? "Guest User" : {
            name: user.name,
            email: user.email,
            id: user.id,
          },

        }
      };

      const response = await this.aiRequestService.updateConversation(payload);

      if (response.isSuccessful) {
        if (conversationId === currTabConversationId) {
          this.updateAiRequestConversationTitle(newConversationTitle);
        }
        await this.fetchConversations(); // Fetch to udpate the states in local db
        notifications.success("Conversation title updated successfully.");
      } else {
        notifications.error("Failed to update conversation title. Please try again.");
      }

    }
    catch (error) {
      console.log("Something went wrong while updating title :>> ", error);
    }
  }

  public handleDeleteConversation = async (conversationId: string, conversationTitle: string) => {
    // If conversationId is null, then change title of current tab itself, no need to change in db
    if (!conversationId) {
      console.error("Failed to delete conversation, due to missing Conversation ID.")
      return;
    }

    const componentData = this._tab.getValue();
    const provider = componentData?.property?.aiRequest?.aiModelProvider;
    const currTabConversationId = componentData?.property?.aiRequest?.ai?.conversationId;
    const providerAuthKey = componentData?.property?.aiRequest?.auth?.apiKey.authValue;

    if (!conversationId || !provider || !providerAuthKey) {
      console.error("Missing provider or authKey.");
      return;
    }

    try {
      const response = await this.aiRequestService.deleteConversation(provider, providerAuthKey, conversationId);

      if (response.isSuccessful) {
        if (conversationId === currTabConversationId) {
          this.handleStartNewConversation();
        }
        await this.fetchConversations(); // Fetch to udpate the states in local db
        notifications.success(`Conversation ${conversationTitle} deleted successfully.`);
      } else {
        notifications.error(`Failed to delete conversation ${conversationTitle}. Please try again.`);
      }

    }
    catch (error) {
      console.error("Something went wrong while deleting the conversation. :>> ", error);
    }
  }


  /**
   *
   * @returns guest user
   */
  public getGuestUser = async () => {
    const response = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    return response?.getLatest().toMutableJSON();
  };

  /**
   * @description - updates request tab name
   * @param _name - new request name
   */
  public updateNameWithCollectionList = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (_name !== progressiveTab.name) {
      progressiveTab.name = _name;
    }
    this.tab = progressiveTab;
  };

  get collection() {
    return this.collectionRepository.getCollection();
  }
  set collection(e) { }

  /**
   *
   * @param collection - collection document
   */
  public addCollection = (collection: object) => {
    this.collectionRepository.addCollection(collection);
  };

  private constructBaseUrl = async (_id: string) => {
    const workspaceData = await this.workspaceRepository.readWorkspace(_id);
    const hubUrl = workspaceData?.team?.hubUrl;

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
  };

  /**
   *
   * @param isGlobalVariable - defines to save local or global
   * @param environmentVariables - pre existing environment data
   * @param newVariableObj - new entry to be extended
   * @returns
   */
  public updateEnvironment = async (
    isGlobalVariable: boolean,
    environmentVariables,
    newVariableObj: KeyValue,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGlobalVariable) {
      // api payload
      let payload = {
        name: environmentVariables.global.name,
        variable: [
          ...environmentVariables.global.variable,
          {
            key: newVariableObj.key,
            value: newVariableObj.value,
            checked: true,
          },
        ],
      };
      // removes blank key value pairs
      payload.variable = [
        ...payload.variable.filter((variable) => {
          return variable.key.length > 0;
        }),
        {
          key: "",
          value: "",
          checked: false,
        },
      ];

      if (isGuestUser === true) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          environmentVariables.global.id,
          payload,
        );

        let currentTab = await this.tabRepository.getTabById(
          environmentVariables.global.id,
        );
        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = payload.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
        return {
          isSuccessful: true,
        };
      }
      const baseUrl = await this.constructBaseUrl(
        this._tab.getValue().path.workspaceId,
      );
      const response = await this.environmentService.updateEnvironment(
        this._tab.getValue().path.workspaceId,
        environmentVariables.global.id,
        payload,
        baseUrl,
      );
      if (response.isSuccessful) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          response.data.data._id,
          response.data.data,
        );

        let currentTab = await this.tabRepository.getTabById(
          response.data.data._id,
        );

        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = response.data.data.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
      } else {
        notifications.error(
          "Failed to add environment variable. Please try again.",
        );
      }
      return response;
    } else {
      // api payload
      const payload = {
        name: environmentVariables.local.name,
        variable: [
          ...environmentVariables.local.variable,
          {
            key: newVariableObj.key,
            value: newVariableObj.value,
            checked: true,
          },
        ],
      };
      // removes blank key value pairs
      payload.variable = [
        ...payload.variable.filter((variable) => {
          return variable.key.length > 0;
        }),
        {
          key: "",
          value: "",
          checked: false,
        },
      ];
      if (isGuestUser) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          environmentVariables.local.id,
          payload,
        );

        let currentTab = await this.tabRepository.getTabById(
          environmentVariables.local.id,
        );

        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = payload.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
        return {
          isSuccessful: true,
        };
      }
      const baseUrl = await this.constructBaseUrl(
        this._tab.getValue().path.workspaceId,
      );
      // api response
      const response = await this.environmentService.updateEnvironment(
        this._tab.getValue().path.workspaceId,
        environmentVariables.local.id,
        payload,
        baseUrl,
      );
      if (response.isSuccessful) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          response.data.data._id,
          response.data.data,
        );

        let currentTab = await this.tabRepository.getTabById(
          response.data.data._id,
        );
        if (currentTab) {
          const currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = response.data.data.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
      } else {
        notifications.error(
          "Failed to add environment variable. Please try again.",
        );
      }
      return response;
    }
  };

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };

  /**
   *
   * @param uuid - workspace id
   * @returns workspace document
   */
  public readWorkspace = (uuid: string): Promise<WorkspaceDocument> => {
    return this.workspaceRepository.readWorkspace(uuid);
  };

  /**
   *
   * @param uuid  - collection id
   * @returns - collection Document
   */
  public readCollection = (uuid: string): Promise<CollectionDocument> => {
    return this.collectionRepository.readCollection(uuid);
  };

  /**
   * Save Request
   * @param saveDescriptionOnly - refers save overall request data or only description as a documentation purpose.
   * @returns save status
   */
  public saveAiRequest = async () => {
    const componentData: RequestTab = this._tab.getValue();
    const { folderId, collectionId, workspaceId } = componentData.path;
    const tabId = componentData?.tabId;
    startLoading(tabId);
    if (!workspaceId || !collectionId) {
      stopLoading(tabId);
      return {
        status: "error",
        message: "request is not a part of any workspace or collection",
      };
    }
    const _collection = await this.readCollection(collectionId);
    let userSource = {};
    if (_collection?.activeSync && componentData?.source === "USER") {
      userSource = {
        currentBranch: _collection?.currentBranch,
        source: "USER",
      };
    }
    const _id = componentData.id;

    const aiRequestTabAdapter = new AiRequestTabAdapter();
    const unadaptedRequest = aiRequestTabAdapter.unadapt(componentData);
    // Save overall api

    const requestMetaData = {
      id: _id,
      name: componentData?.name,
      description: componentData?.description,
      type: ItemType.AI_REQUEST,
    };

    let folderSource;
    let itemSource;
    if (folderId) {
      folderSource = {
        folderId: folderId,
      };
      itemSource = {
        id: folderId,
        type: ItemType.FOLDER,
        items: {
          ...requestMetaData,
          aiRequest: unadaptedRequest,
        },
      };
    } else {
      itemSource = {
        ...requestMetaData,
        aiRequest: unadaptedRequest,
      };
    }

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      const progressiveTab = this._tab.getValue();
      const data = {
        id: progressiveTab.id,
        name: requestMetaData.name,
        description: requestMetaData.description,
        type: "AI_REQUEST",
        aiRequest: unadaptedRequest,
        updatedAt: "",
        updatedBy: "Guest User",
      };

      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      if (!folderId) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          _id,
          data,
        );
      } else {
        this.collectionRepository.updateRequestInFolder(
          collectionId,
          folderId,
          _id,
          data,
        );
      }
      stopLoading(tabId);
      return {
        status: "success",
        message: "",
      };
    }

    const baseUrl = await this.constructBaseUrl(workspaceId);
    const res = await this.collectionService.updateAiRequestInCollection(_id, {
      collectionId: collectionId,
      workspaceId: workspaceId,
      ...folderSource,
      ...userSource,
      items: itemSource,
    } as | AiRequestCreateUpdateInCollectionPayloadDtoInterface | AiRequestCreateUpdateInFolderPayloadDtoInterface, baseUrl);

    if (res.isSuccessful) {
      const progressiveTab = this._tab.getValue();
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      if (!folderId) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          _id,
          res.data.data,
        );
      } else {
        this.collectionRepository.updateRequestInFolder(
          collectionId,
          folderId,
          _id,
          res.data.data,
        );
      }
      stopLoading(tabId);
      return {
        status: "success",
        message: res.message,
      };
    } else {
      stopLoading(tabId);
      return {
        status: "error",
        message: res.message,
      };
    }
  };


  /**
  *
  * @param _workspaceMeta - workspace meta data
  * @param path - request stack path
  * @param tabName - request name
  * @param description - request description
  * @param type - save over all request or description only
  */
  public saveAsRequest = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    path: {
      name: string;
      id: string;
      type: string;
    }[],
    tabName: string,
    description: string,
  ) => {
    const componentData = this._tab.getValue();
    let userSource = {};
    if (path.length > 0) {
      const aiRequestTabAdapter = new AiRequestTabAdapter();
      const unadaptedRequest = aiRequestTabAdapter.unadapt(componentData);
      const req = {
        id: uuidv4(),
        name: tabName,
        description,
        type: ItemType.AI_REQUEST,
        aiRequest: unadaptedRequest,
        source: "USER",
        isDeleted: false,
        createdBy: "Guest User",
        updatedBy: "Guest User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (path[path.length - 1].type === ItemType.COLLECTION) {
        /**
         * handle request at collection level
         */
        const _collection = await this.readCollection(path[path.length - 1].id);
        if (_collection?.activeSync) {
          userSource = {
            currentBranch: _collection?.currentBranch,
            source: "USER",
          };
        }
        let isGuestUser;
        isGuestUserActive.subscribe((value) => {
          isGuestUser = value;
        });

        if (isGuestUser == true) {
          this.addRequestOrFolderInCollection(path[path.length - 1].id, req);
          const expectedPath = {
            folderId: "",
            folderName: "",
            collectionId: path[path.length - 1].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            /**
             * Update existing request
             */
            this.updateRequestName(req.name);
            this.updateRequestDescription(req.description);
            this.updateRequestPath(expectedPath);
            this.updateRequestId(req.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            await this.tabRepository.updateTab(
              progressiveTab.tabId,
              progressiveTab,
            );

          } else {
            /**
             * Create new copy of the existing request
             */
            const initAiRequestTab = new InitAiRequestTab(req.id, "UNTRACKED-");
            initAiRequestTab.updateName(req.name);
            initAiRequestTab.updateDescription(req.description);
            initAiRequestTab.updatePath(expectedPath);
            initAiRequestTab.updateAIModelProvider(req.aiRequest.aiModelProvider);
            initAiRequestTab.updateAIModelVariant(req.aiRequest.aiModelVariant);
            initAiRequestTab.updateAISystemPrompt(req.aiRequest.systemPrompt);
            initAiRequestTab.updateAuth(req.aiRequest.auth);

            this.tabRepository.createTab(initAiRequestTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
          return;
        }
        const baseUrl = await this.constructBaseUrl(_workspaceMeta.id);
        const res = await this.collectionService.addAiRequestInCollection(
          {
            collectionId: path[path.length - 1].id,
            workspaceId: _workspaceMeta.id,
            ...userSource,
            items: {
              name: tabName,
              description,
              type: CollectionItemTypeBaseEnum.AI_REQUEST,
              aiRequest: unadaptedRequest,
            },
          },
          baseUrl,
        );
        if (res.isSuccessful) {
          this.addRequestOrFolderInCollection(
            path[path.length - 1].id,
            res.data.data,
          );
          const expectedPath = {
            folderId: "",
            folderName: "",
            collectionId: path[path.length - 1].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            /**
             * Update existing request
             */
            await this.updateRequestName(res.data.data.name);
            await this.updateRequestDescription(res.data.data.description);
            await this.updateRequestPath(expectedPath);
            await this.updateRequestId(res.data.data.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            await this.tabRepository.updateTab(
              progressiveTab.tabId,
              progressiveTab,
            );

          } else {
            /**
             * Create new copy of the existing request
             */
            const initAiRequestTab = new InitAiRequestTab(
              res.data.data.id,
              "UNTRACKED-",
            );
            initAiRequestTab.updateName(res.data.data.name);
            initAiRequestTab.updateDescription(res.data.data.description);
            initAiRequestTab.updatePath(expectedPath);
            initAiRequestTab.updateAIModelProvider(res.data.data.aiRequest.aiModelProvider);
            initAiRequestTab.updateAIModelVariant(res.data.data.aiRequest.aiModelVariant);
            initAiRequestTab.updateAISystemPrompt(res.data.data.aiRequest.systemPrompt);
            initAiRequestTab.updateAuth(res.data.data.aiRequest.auth);

            this.tabRepository.createTab(initAiRequestTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: res.message,
            data: {
              id: res.data.data.id,
            },
          };
        } else {
          return {
            status: "error",
            message: res.message,
          };
        }
      } else if (path[path.length - 1].type === ItemType.FOLDER) {
        /**
         * handle request at folder level
         */
        const _collection = await this.readCollection(path[0].id);
        if (_collection?.activeSync) {
          userSource = {
            currentBranch: _collection?.currentBranch,
            source: "USER",
          };
        }
        let isGuestUser;
        isGuestUserActive.subscribe((value) => {
          isGuestUser = value;
        });

        if (isGuestUser == true) {
          this.addRequestInFolder(path[0].id, path[path.length - 1].id, req);
          const expectedPath = {
            folderId: path[path.length - 1].id,
            folderName: path[path.length - 1].name,
            collectionId: path[0].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            await this.updateRequestName(req.name);
            await this.updateRequestDescription(req.description);
            await this.updateRequestPath(expectedPath);
            await this.updateRequestId(req.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            await this.tabRepository.updateTab(
              progressiveTab.tabId,
              progressiveTab,
            );

          } else {
            const initAiRequestTab = new InitAiRequestTab(req.id, "UNTRACKED-");
            initAiRequestTab.updateName(req.name);
            initAiRequestTab.updateDescription(req.description);
            initAiRequestTab.updatePath(expectedPath);
            initAiRequestTab.updateAIModelProvider(req.aiRequest.aiModelProvider);
            initAiRequestTab.updateAIModelVariant(req.aiRequest.aiModelVariant);
            initAiRequestTab.updateAISystemPrompt(req.aiRequest.systemPrompt);
            initAiRequestTab.updateAuth(req.aiRequest.auth);
            this.tabRepository.createTab(initAiRequestTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const baseUrl = await this.constructBaseUrl(_workspaceMeta.id);
        const res = await this.collectionService.addAiRequestInCollection(
          {
            collectionId: path[0].id,
            workspaceId: _workspaceMeta.id,
            folderId: path[path.length - 1].id,
            ...userSource,
            items: {
              id: path[path.length - 1].id,
              name: path[path.length - 1].name,
              type: CollectionItemTypeBaseEnum.FOLDER,
              items: {
                name: tabName,
                description,
                type: CollectionItemTypeBaseEnum.AI_REQUEST,
                aiRequest: unadaptedRequest,
              },
            },
          },
          baseUrl,
        );
        if (res.isSuccessful) {
          this.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            res.data.data,
          );
          const expectedPath = {
            folderId: path[path.length - 1].id,
            folderName: path[path.length - 1].name,
            collectionId: path[0].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            this.updateRequestName(res.data.data.name);
            this.updateRequestDescription(res.data.data.description);
            this.updateRequestPath(expectedPath);
            this.updateRequestId(res.data.data.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);

          } else {
            const initAiRequestTab = new InitAiRequestTab(
              res.data.data.id,
              "UNTRACKED-",
            );
            initAiRequestTab.updateName(res.data.data.name);
            initAiRequestTab.updateDescription(res.data.data.description);
            initAiRequestTab.updatePath(expectedPath);
            initAiRequestTab.updateAIModelProvider(res.data.data.aiRequest.aiModelProvider);
            initAiRequestTab.updateAIModelVariant(res.data.data.aiRequest.aiModelVariant);
            initAiRequestTab.updateAISystemPrompt(res.data.data.aiRequest.systemPrompt);
            initAiRequestTab.updateAuth(res.data.data.aiRequest.auth);
            this.tabRepository.createTab(initAiRequestTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: res.message,
            data: {
              id: res.data.data.id,
            },
          };
        } else {
          return {
            status: "error",
            message: res.message,
          };
        }
      }
      // MixpanelEvent(Events.SAVE_API_REQUEST);
    }
  };


  /**
   *
   * @param collectionId - collection id
   * @param items - request or folder item
   */
  public addRequestOrFolderInCollection = (
    collectionId: string,
    items: object,
  ) => {
    this.collectionRepository.addRequestOrFolderInCollection(
      collectionId,
      items,
    );
  };

  /**
   *
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param request - request document
   */
  public addRequestInFolder = (
    collectionId: string,
    folderId: string,
    request: object,
  ): void => {
    this.collectionRepository.addRequestInFolder(
      collectionId,
      folderId,
      request,
    );
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param _collectionId - collection id
   * @param _folderName - folder name
   * @returns - folder status message
   */
  public createFolder = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    _collectionId: string,
    _folderName: string,
  ) => {
    let userSource = {};
    const _collection: CollectionDocument =
      await this.readCollection(_collectionId);
    if (_collection?.activeSync) {
      userSource = {
        currentBranch: _collection?.currentBranch,
        source: "USER",
      };
    }
    const directory: CreateDirectoryPostBody = {
      name: _folderName,
      description: "",
      ...userSource,
    };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser == true) {
      const data = {
        id: uuidv4(),
        name: _folderName,
        description: "",
        type: "FOLDER",
        source: "USER",
        isDeleted: false,
        items: [],
        createdBy: "Guest User",
        updatedBy: "Guest User",
        createdAt: "",
        updatedAt: "",
      };

      const latestRoute = {
        id: data.id,
      };
      return {
        status: "success",
        data: {
          latestRoute,
          collectionId: _collectionId,
          data: data,
          addRequestOrFolderInCollection: this.addRequestOrFolderInCollection,
        },
      };
    }

    const res = await insertCollectionDirectory(
      _workspaceMeta.id,
      _collectionId,
      directory,
    );
    if (res.isSuccessful) {
      const latestRoute = {
        id: res.data.data.id,
      };
      return {
        status: "success",
        data: {
          latestRoute,
          collectionId: _collectionId,
          data: res.data.data,
          addRequestOrFolderInCollection: this.addRequestOrFolderInCollection,
        },
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param _collectionName - collection name
   * @returns - collection status message
   */
  public createCollection = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    _collectionName: string,
  ) => {
    const newCollection = {
      name: _collectionName,
      workspaceId: _workspaceMeta.id,
    };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser == true) {
      const data = {
        _id: uuidv4(),
        name: _collectionName,
        totalRequests: 0,
        createdBy: "Guest User",
        items: [],
        updatedBy: "Guest User",
        // createdAt: new Date().toISOString,
        // updatedAt: new Date().toISOString,
        createdAt: "",
        createdby: "",
      };
      const latestRoute = {
        id: data._id,
      };
      const storage = data;
      const _id = data._id;
      delete storage._id;
      storage.id = _id;
      storage.workspaceId = _workspaceMeta.id;
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: "SaveRequest",
        collectionName: data.name,
        collectionId: data._id,
      });
      return {
        status: "success",
        data: {
          latestRoute,
          storage,
          addCollection: this.addCollection,
        },
      };
    }

    const res = await insertCollection(newCollection);
    if (res.isSuccessful) {
      const latestRoute = {
        id: res.data.data._id,
      };
      const storage = res.data.data;
      const _id = res.data.data._id;
      delete storage._id;
      storage.id = _id;
      storage.workspaceId = _workspaceMeta.id;
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: "SaveRequest",
        collectionName: res.data.data.name,
        collectionId: res.data.data._id,
      });
      return {
        status: "success",
        data: {
          latestRoute,
          storage,
          addCollection: this.addCollection,
        },
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };


  /**
   * Handles collection rename
   * @param collection - collction to rename
   * @param newCollectionName :string - the new name of the collection
   */
  public handleRenameCollection = async (
    workspaceId: string,
    collectionId: string,
    newCollectionName: string,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (newCollectionName) {
      if (isGuestUser == true) {
        let col = await this.collectionRepository.readCollection(collectionId);
        col = col.toMutableJSON();
        col.name = newCollectionName;
        this.collectionRepository.updateCollection(collectionId, col);
        // notifications.success("Collection renamed successfully!");
        return {
          isSuccessful: true,
        };
      }
      const baseUrl = await this.constructBaseUrl(workspaceId);
      const response = await this.collectionService.updateCollectionData(
        collectionId,
        workspaceId,
        { name: newCollectionName },
        baseUrl,
      );
      if (response.isSuccessful) {
        this.collectionRepository.updateCollection(
          collectionId,
          response.data.data,
        );
        // notifications.success("Collection renamed successfully!");
      } else if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error("Failed to rename collection. Please try again.");
      }
      return response;
    }
  };

  /**
   * Handle folder rename
   * @param workspaceId - workspace id of the folder
   * @param collectionId - collection id of the folder
   * @param folderId  - folder id to be targetted
   * @param newFolderName - new folder name
   * @returns
   */
  public handleRenameFolder = async (
    workspaceId: string,
    collectionId: string,
    folderId: string,
    newFolderName: string,
  ) => {
    const collection =
      await this.collectionRepository.readCollection(collectionId);
    const explorer =
      await this.collectionRepository.readRequestOrFolderInCollection(
        collectionId,
        folderId,
      );
    if (newFolderName) {
      let userSource = {};
      if (collection.activeSync && explorer?.source === "USER") {
        userSource = {
          currentBranch: collection.currentBranch
            ? collection.currentBranch
            : collection.primaryBranch,
          source: "USER",
        };
      }
      let isGuestUser;
      isGuestUserActive.subscribe((value) => {
        isGuestUser = value;
      });
      if (isGuestUser === true) {
        const res =
          await this.collectionRepository.readRequestOrFolderInCollection(
            collectionId,
            folderId,
          );
        res.name = newFolderName;

        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          folderId,
          res,
        );
        // notifications.success("Folder renamed successfully!");
        return {
          isSuccessful: true,
        };
      }
      const baseUrl = await this.constructBaseUrl(workspaceId);
      const response = await this.collectionService.updateFolderInCollection(
        workspaceId,
        collectionId,
        folderId,
        {
          ...userSource,
          name: newFolderName,
        },
        baseUrl,
      );
      if (response.isSuccessful) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          folderId,
          response.data.data,
        );
        // notifications.success("Folder renamed successfully!");
      } else {
        notifications.error("Failed to rename folder. Please try again.");
      }
      return response;
    }
  };

  /**
   * Sets environment variables in a given text by replacing placeholders with corresponding values.
   * @param {string} text - The text containing placeholders for environment variables.
   * @param environmentVariables - Array of objects containing key-value pairs for environment variables.
   * @returns {string} The text with placeholders replaced by environment variable values.
   */
  private setEnvironmentVariables = (
    text: string,
    environmentVariables,
  ): string => {
    let updatedText = text;
    environmentVariables.forEach((element) => {
      const regex = new RegExp(`{{(${element.key})}}`, "g");
      updatedText = updatedText.replace(regex, element.value);
    });

    return updatedText;
  };


  //////////////////////////////////////////////////////////////////////////////
  //                 AI Request Tab Data Update Methods
  //////////////////////////////////////////////////////////////////////////////
  /**
   *
   * @param _description - request description
   */
  public updateRequestDescription = async (_description: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.description = _description;
    this.tab = progressiveTab;
    try {
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    } catch (error) {
      notifications.error(
        "Failed to update the documentation. Please try again",
      );
    }
    this.compareRequestWithServer();
  };


  /**
   *
   * @param _path - request path
   */
  private updateRequestPath = async (_path: Path) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.path = _path;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _id - request mongo id
   */
  private updateRequestId = async (_id: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.id = _id;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _name - request name
   */
  public updateRequestName = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.name = _name;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _url - request url
   * @param _effectQueryParams  - flag that effect request query parameter
   */
  public onUpdateAIModel = async (
    _modelProvider: string,
    _modelId: string,
    _effectQueryParams: boolean = true,
  ) => {
    const progressiveTab: RequestTab = createDeepCopy(this._tab.getValue());
    if (_modelId === progressiveTab.property.aiRequest.aiModelVariant) {
      return;
    }
    progressiveTab.property.aiRequest.aiModelProvider = _modelProvider;
    progressiveTab.property.aiRequest.aiModelVariant = _modelId;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();

  };

  /**
   *
   * @param _description - request description
   */
  public updateAiSystemPrompt = async (_description: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.aiRequest.systemPrompt = _description;
    this.tab = progressiveTab;
    try {
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    } catch (error) {
      Sentry.captureException(error);
      notifications.error(
        "Failed to update the documentation. Please try again",
      );
    }
    this.compareRequestWithServer();
  };

  /**
   * Updates the AI prompt in the request property of the current tab.
   *
   * @param  _prompt - The new AI prompt to set.
   * @returns A promise that resolves when the update is complete.
   */
  public updateRequestAIPrompt = async (_prompt: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.aiRequest.ai.prompt = _prompt;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   * Updates the AI thread ID in the request property of the current tab.
   *
   * @param _threadId - The new AI thread ID to set.
   * @returns A promise that resolves when the update is complete.
   */
  public updateRequestAIThread = async (_threadId: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.aiRequest.ai.threadId = _threadId;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  public updateAiRequestConversationId = async (_conversationId: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.aiRequest.ai.conversationId = _conversationId;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  public updateAiRequestConversationTitle = async (_conversationTitle: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.aiRequest.ai.conversationTitle = _conversationTitle;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   * Updates the AI conversations in the request property of the current tab.
   *
   * @param _conversations - The new AI conversations to set.
   * @returns  A promise that resolves when the update is complete.
   */
  public updateRequestAIConversation = async (
    _conversations: Conversation[],
  ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.aiRequest.ai.conversations = _conversations;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  public handleClearConversation = async () => {
    this.updateRequestState({ isChatbotConversationLoading: true });
    await this.updateRequestAIConversation([]);
    await this.saveConversationHistory(); // save conversation in db
    await new Sleep().setTime(2000).exec();
    this.updateRequestState({ isChatbotConversationLoading: false });
    // notifications.success("Chat cleared successfully.")
  }

  public handleStartNewConversation = async () => {
    this.updateRequestState({ isChatbotConversationLoading: true });
    await this.switchConversation("", "New Conversation", []);
    await new Sleep().setTime(2000).exec();
    this.updateRequestState({ isChatbotConversationLoading: false });
    // notifications.success("Created new conversation.");
  }

  public switchConversation = async (_conversationId: string, _conversationTitle: string, _conversations: Conversation[]) => {
    // const componentData = this._tab.getValue();
    // const currTabConversationId = componentData?.property?.aiRequest.ai?.conversationId;
    // if (currTabConversationId === _conversationId) {
    //   return;
    // }
    this.updateRequestState({ isChatbotConversationLoading: true });
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.aiRequest.ai.conversationId = _conversationId;
    progressiveTab.property.aiRequest.ai.conversationTitle = _conversationTitle;
    progressiveTab.property.aiRequest.ai.conversations = _conversations;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    await new Sleep().setTime(2000).exec();
    this.updateRequestState({ isChatbotConversationLoading: false });
    notifications.success(!_conversationId ? `Created new conversation session.` : `Switched to "${_conversationTitle}" conversation!`);
  }

  /**
   *
   * @param _state - request state
   */
  public updateRequestState = async (_state: AiStateParital) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.aiRequest.state = {
      ...progressiveTab.property.aiRequest.state,
      ..._state,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param _auth - request auth
   */
  public updateRequestAuth = async (_auth: Auth) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.aiRequest.auth = {
      ...progressiveTab.property.aiRequest.auth,
      ..._auth,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  // AI WebSocket - Start
  /**
   * Handles socket connection errors with a consistent approach
   * @param componentData - The current component data
   */
  private async handleAIResponseError(
    componentData: RequestTab,
    errorMessage: string,
  ) {
    await this.updateRequestAIConversation([
      ...(componentData?.property?.aiRequest?.ai?.conversations || []),
      {
        message: errorMessage || "Something went wrong. Please try again",
        messageId: uuidv4(),
        type: MessageTypeEnum.RECEIVER,
        isLiked: false,
        isDisliked: false,
        status: false,
      },
    ]);
    await this.updateRequestState({ isChatbotGeneratingResponse: false });
    this.saveConversationHistory();
  }

  /**
   * Appends a new chunk to an existing AI message by its messageId
   * @param messageId - ID of the message to update
   * @param chunk - New chunk to append to the message
   */
  private async updateAIResponseByChunk(messageId: string, chunk: string) {
    const componentData = this._tab.getValue();
    const conversations =
      componentData?.property?.aiRequest.ai?.conversations || [];

    let foundIndex = -1;
    // Find the index of the message we need to update
    for (let i = 0; i < conversations.length; i++) {
      if (conversations[i].messageId === messageId) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      // Create a shallow clone of the conversations array
      const updatedConversations = [...conversations];

      // Update only the specific message by appending the new chunk
      updatedConversations[foundIndex] = {
        ...updatedConversations[foundIndex],
        message: updatedConversations[foundIndex].message + chunk,
      };
      await this.updateRequestAIConversation(updatedConversations);
    } else console.error("chunk not found!");
  }

  public updateAiConfigurations = async (model: AiModelProviderEnum, _configUpdates: modelsConfigType) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.aiRequest.configurations[model] = _configUpdates;
    this.tab = progressiveTab;
    try {
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    } catch (error) {
      Sentry.captureException(error);
      notifications.error(
        "Failed to update the documentation. Please try again",
      );
    }
    // this.compareRequestWithServer();
  };

  /**
   * Generates the AI Response from server with websocket communication protocol
   * @param Prompt - Prompt from the user
   */
  public generateAIResponseWS = async (prompt = "") => {
    await this.updateRequestState({ isChatbotGeneratingResponse: true });
    const componentData = this._tab.getValue();
    const tabId = componentData.tabId;
    const modelProvider = componentData.property.aiRequest.aiModelProvider;
    const modelVariant = componentData.property.aiRequest.aiModelVariant;
    const authKey = componentData.property.aiRequest.auth.apiKey;
    const systemPrompt = componentData.property.aiRequest.systemPrompt;
    const currConfigurations = componentData.property.aiRequest.configurations;
    const isChatAutoClearActive = componentData.property.aiRequest.state.isChatAutoClearActive;
    const isJsonFormatConfigAvailable = configFormat[modelProvider][modelVariant]["jsonResponseFormat"];
    const isJsonFormatEnabed = isJsonFormatConfigAvailable ? (currConfigurations[modelProvider].jsonResponseFormat || false) : false;

    let finalSP = null;
    if (systemPrompt.length) {
      const SPDatas = JSON.parse(systemPrompt);
      if (SPDatas.length) finalSP = SPDatas.map(obj => obj.data.text).join("");
    }

    if (isJsonFormatEnabed) prompt = `${prompt} (Give Response In JSON Format)`;
    let formattedConversations: { role: 'user' | 'assistant'; content: string; }[] = []; // Sending the chat history for context
    if (!isChatAutoClearActive) {
      const rawConversations = componentData?.property?.aiRequest?.ai?.conversations || [];
      formattedConversations = rawConversations
        .filter(({ status }) => status !== false) // Exclude items with status === false
        .map(({ type, message }) => ({
          role: type === 'Sender' ? 'user' : 'assistant',
          content: isJsonFormatEnabed ? `${message} (Give Response In JSON Format)` : message,
        }));
    }

    const modelSpecificConfig: modelsConfigType = {};
    const allowedConfigs = configFormat[modelProvider][modelVariant];
    Object.keys(allowedConfigs).forEach((key) => {
      modelSpecificConfig[key] = currConfigurations[modelProvider][key];
    });

    const userInputConvo = this.aiAssistentWebSocketService.prepareConversation(
      modelProvider,
      prompt,
      finalSP || "Answer my queries.",
      !isChatAutoClearActive,
      formattedConversations
    );

    const aiRequestData = {
      feature: "llm-evaluation",
      userInput: (modelProvider === AiModelProviderEnum.Google || (modelProvider === AiModelProviderEnum.OpenAI && modelVariant === OpenAIModelEnum.GPT_o1_Mini)) ? prompt : userInputConvo,
      authKey: authKey.authValue,
      configs: modelSpecificConfig,
      model: modelProvider || "openai",
      modelVersion: modelVariant || "gpt-3.5-turbo",
      ...(disabledModelFeatures["System Prompt"].includes(modelVariant)
        ? {}
        : { systemPrompt: finalSP || "Answer my queries." }),
      ...(modelProvider === AiModelProviderEnum.Google && {
        conversation: isChatAutoClearActive ? "" : userInputConvo,
      }),
    }

    try {
      let responseMessageId = uuidv4(); // Generate a single message ID for the entire response
      let accumulatedMessage = ""; // Track the accumulated message content
      let messageCreated = false; // Flag to track if we've created the initial message

      const socketResponse = await this.aiAssistentWebSocketService.sendAiRequest(aiRequestData);

      if (!socketResponse) {
        throw new Error("Something went wrong. Please try again");
      }

      // Remove existing listeners to prevent duplicates
      const STREAMING_STATES = {
        START: "start",
        STREAMING: "streaming",
        END: "end",
      };
      const events = [
        `assistant-response`,
        `assistant-response_${componentData.tabId}`,
        `disconnect`,
        `connect_error`,
      ];
      events.forEach((event) =>
        this.aiAssistentWebSocketService.removeListener(event),
      );

      // Unified event handler
      const handleSocketEvent = async (event, response) => {
        switch (event) {
          case "disconnect":
          case "connect_error":
            // After getting response don't listen again for this the same request
            events.forEach((event) =>
              this.aiAssistentWebSocketService.removeListener(event),
            );
            await this.handleAIResponseError(
              componentData,
              "Something went wrong. Please try again",
            );
            break;

          // Listening for "assistant-response" because initial "Limit Reached" msg is coming without tabId
          case `assistant-response`:
          case `assistant-response_${componentData.tabId}`:
            // Handle special error messages
            if (response.event === "error" && response.message) {

              // After getting error response remove all listeners
              events.forEach((event) =>
                this.aiAssistentWebSocketService.removeListener(event),
              );

              let errorMessage: string;

              if (response.message.includes("Limit Reached")) {
                errorMessage = "Oh, snap! You have reached your limit for this month. You can resume using Sparrow AI from the next month. Please share your feedback through the community section.";
              } else if (response.message.includes("Some Issue Occurred")) {
                errorMessage = "Some issue occurred while processing your request, please try again.";
              } else {
                errorMessage = response.message; // Use the actual error message from the response
              }

              await this.updateRequestAIConversation([
                ...(componentData?.property?.aiRequest?.ai?.conversations || []),
                {
                  message: errorMessage,
                  messageId: uuidv4(),
                  type: MessageTypeEnum.RECEIVER,
                  isLiked: false,
                  isDisliked: false,
                  status: false,
                  inputTokens: 0,
                  outputTokens: 0,
                  totalTokens: 0,
                  statusCode: response.statusCode,
                  time: response.timeTaken.replace("ms", ""),
                  modelProvider,
                  modelVariant
                },
              ]);
              await this.updateRequestState({
                isChatbotGeneratingResponse: false,
              });
              await this.saveConversationHistory();

              const newData: AiRequestExplorerData = {
                response: {
                  messageId: "",
                  statusCode: response.statusCode || 400,
                  inputTokens: 0,
                  outputTokens: 0,
                  totalTokens: 0,
                  time: response.timeTaken.replace("ms", ""),
                  modelProvider,
                  modelVariant
                },
              };

              AiRequestExplorerDataStore.update((map) => {
                map.set(tabId, newData);
                return new Map(map); // Return a new Map to trigger reactivity
              });


              return;
            }

            // Handle streaming responses
            if (response.stream_status) {
              const { stream_status, messages, thread_id } = response;

              // Handle thread ID on stream start if not already set
              if (stream_status === STREAMING_STATES.START) {
                const thisTabThreadId =
                  componentData?.property?.aiRequest?.ai?.threadId;
                if (!thisTabThreadId && thread_id) {
                  await this.updateRequestAIThread(thread_id);
                }

                // Create empty message container that will be updated with chunks
                if (!messageCreated) {
                  await this.updateRequestAIConversation([
                    ...(componentData?.property?.aiRequest?.ai?.conversations ||
                      []),
                    {
                      message: "",
                      messageId: responseMessageId,
                      type: MessageTypeEnum.RECEIVER,
                      isLiked: false,
                      isDisliked: false,
                      status: true,
                      modelProvider,
                      modelVariant
                    },
                  ]);
                  messageCreated = true;
                }
              }

              // Handle incoming message chunk
              else if (
                stream_status === STREAMING_STATES.STREAMING &&
                messages
              ) {
                accumulatedMessage += messages;
                await this.updateAIResponseByChunk(responseMessageId, messages); // Append only the new chunk to the existing message
              }

              // Handle end of stream
              else if (stream_status === STREAMING_STATES.END) {

                // Extract response metrics
                const responseMetrics = {
                  statusCode: response.statusCode,
                  inputTokens: response.inputTokens,
                  outputTokens: response.outputTokens,
                  totalTokens: response.totalTokens,
                  time: parseInt(response.timeTaken.replace("ms", ""))
                };

                // Store in AiRequestExplorerDataStore
                const newData: AiRequestExplorerData = {
                  response: {
                    messageId: responseMessageId, // Use the same message ID for consistency
                    ...responseMetrics
                  },
                };

                AiRequestExplorerDataStore.update((map) => {
                  map.set(tabId, newData);
                  return new Map(map); // Return a new Map to trigger reactivity
                });


                // Storing respose metrices in chat converstaion data
                // Update the conversation messages with metrics
                const componentData = this._tab.getValue();
                const conversations = componentData?.property?.aiRequest.ai?.conversations || [];

                // Find indices for both the AI response and the preceding user message
                let aiResponseIndex = -1;

                for (let i = 0; i < conversations.length; i++) {
                  if (conversations[i].messageId === responseMessageId) {
                    aiResponseIndex = i;
                    break;
                  }
                }

                if (aiResponseIndex !== -1) {
                  // Create a shallow clone of the conversations array
                  const updatedConversations = [...conversations];

                  // Update the AI response message with response metrics
                  updatedConversations[aiResponseIndex] = {
                    ...updatedConversations[aiResponseIndex],
                    statusCode: responseMetrics.statusCode,
                    inputTokens: responseMetrics.inputTokens,
                    outputTokens: responseMetrics.outputTokens,
                    totalTokens: responseMetrics.totalTokens,
                    time: responseMetrics.time
                  };

                  // Also update the preceding user message (Sender) if it exists
                  // User message will be the one directly before this AI response
                  if (aiResponseIndex > 0 && updatedConversations[aiResponseIndex - 1].type === MessageTypeEnum.SENDER) {
                    updatedConversations[aiResponseIndex - 1] = {
                      ...updatedConversations[aiResponseIndex - 1],
                      statusCode: responseMetrics.statusCode,
                      inputTokens: responseMetrics.inputTokens,
                      outputTokens: responseMetrics.outputTokens,
                      totalTokens: responseMetrics.inputTokens,
                      time: responseMetrics.time
                    };
                  }

                  // Update the conversation data
                  await this.updateRequestAIConversation(updatedConversations);
                  this.saveConversationHistory();
                }


                // Cleanup listeners as stream is complete
                events.forEach((event) =>
                  this.aiAssistentWebSocketService.removeListener(event),
                );

                // Update state to indicate response generation is complete
                await this.updateRequestState({
                  isChatbotGeneratingResponse: false,
                });
              }
            }
            break;
        }
      };

      // Add new listeners
      events.forEach((event) =>
        this.aiAssistentWebSocketService.addListener(event, (response) =>
          handleSocketEvent(event, response),
        ),
      );
    } catch (error) {
      Sentry.captureException(error);
      console.error("Something went wrong!:", error.message);
      await this.handleAIResponseError(componentData, error.message);
    }
  };

  /**
   * Stops the response generation from the FE and sends stop generate event to server
   *
   */
  public stopGeneratingAIResponse = async () => {
    const componentData = this._tab.getValue();

    // Handling the case where user clicked stop generating just after the "start" stream status
    const conversation =
      componentData?.property?.aiRequest?.ai?.conversations || [];
    if (conversation.length > 0) {
      // Remove last message
      const lastResponse = conversation[conversation.length - 1];
      if (lastResponse.type === "Receiver" && lastResponse?.message === "") {
        conversation.pop();
        await this.updateRequestAIConversation(conversation);
      }
    }

    try {
      // Send stop signal to the server
      await this.aiAssistentWebSocketService.stopGeneration(
        componentData.tabId,
        componentData?.property?.aiRequest?.ai?.threadId || null,
        getClientUser().email,
      );

      await this.updateRequestState({ isChatbotGeneratingResponse: false });

      // Remove all event listeners to prevent further updates
      const events = [
        `assistant-response`,
        `assistant-response_${componentData.tabId}`,
        `disconnect`,
        `connect_error`,
      ];
      events.forEach((event) =>
        this.aiAssistentWebSocketService.removeListener(event),
      );

      // Show error msg in the chat for stop generation
      // this.handleAIResponseError(componentData, "Generation Stopped")
    } catch (error) {
      Sentry.captureException(error);
      console.error("Error stopping AI response generation:", error);
    }
  };

    public updateUserPrompt = async (userInput: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.aiRequest.ai.prompt = userInput;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  }

  public generateAiPrompt = async (
    target: "UserPrompt" | "SystemPrompt",
    prompt = ""
  ): Promise<{
    successStatus: boolean;
    message: string;
    aiGeneratedPrompt: string;
    isLimitReached: boolean;
    target: "UserPrompt" | "SystemPrompt";
  }> => {
    const componentData = this._tab.getValue();
    let workspaceId = componentData.path.workspaceId;
    let workspaceVal = await this.readWorkspace(workspaceId);
    let teamId = workspaceVal.team?.teamId;
    const response = await this.aiAssistentService.generateUserOrSystemPrompts({
      userInput: prompt,
      emailId: getClientUser().email,
      teamId: teamId
    });

    if (response.isSuccessful) {
      if (
        typeof response.data?.data === "string" &&
        response.data.data.includes("Limit Reached")
      ) {
        return {
          successStatus: false,
          message: response.data.message,
          aiGeneratedPrompt: "",
          isLimitReached: true,
          target,
        };
      }

      return {
        successStatus: true,
        message: response.data.message,
        aiGeneratedPrompt: response.data.data,
        isLimitReached: false,
        target,
      };
    }

    return {
      successStatus: false,
      message: response?.data?.message || "Something went wrong. Please try again",
      aiGeneratedPrompt: "",
      isLimitReached: false,
      target,
    };
  };

  public handleInsertAiPrompt = async (target: "UserPrompt" | "SystemPrompt", response: string) => {
    if (target === "UserPrompt") {
      await this.updateUserPrompt(response);
    } else if (target === "SystemPrompt") {
      await this.updateRequestState({ isSaveDescriptionInProgress: true });
      const formatter = new MarkdownFormatter();
      const formattedData = await formatter.FormatData(response);
      const stringifyData = JSON.stringify(formattedData.blocks);
      await this.updateAiSystemPrompt(stringifyData);
      await this.updateRequestState({ isSaveDescriptionInProgress: false });
    }
    return response;
  }

  /**
   * Toggles the like or dislike status of a chat message.
   *
   * @param _messageId - The ID of the message to update.
   * @param  _flag - The flag indicating whether the message is liked (true) or disliked (false).
   */
  public toggleChatMessageLike = (_messageId: string, _flag: boolean) => {
    const componentData = this._tab.getValue();
    const data = componentData?.property?.aiRequest?.ai;
    this.aiAssistentService.updateAiStats(data.threadId, _messageId, _flag);

    // Map through the conversations and update the like or dislike status of the specified message
    const convo = data?.conversations?.map((elem) => {
      if (elem.messageId === _messageId) {
        if (_flag) {
          elem.isLiked = true;
          elem.isDisliked = false;
        } else {
          elem.isLiked = false;
          elem.isDisliked = true;
        }
      }
      return elem;
    });
    this.updateRequestAIConversation(convo);
  };
  // AI WebSocket - End

}

export default AiRequestExplorerViewModel;
