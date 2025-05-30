// ---- Utils
import { createDeepCopy, moveNavigation } from "@sparrow/common/utils";

// ---- DB
import type {
  TabDocument,
  WorkspaceDocument,
} from "../../../../database/database";

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
import { getClientUser } from "src/utils/jwt";
import constants from "src/constants/constants";
import * as Sentry from "@sentry/svelte";
import { AiModelProviderEnum, type modelsConfigType , type AIModelVariant, OpenAIModelEnum } from "@sparrow/common/types/workspace/ai-request-base";
import { configFormat, disabledModelFeatures } from "@sparrow/workspaces/features/ai-request-explorer/constants";

class AiRequestExplorerViewModel {
  // Repository
  private collectionRepository = new CollectionRepository();
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private tabRepository = new TabRepository();
  private guestUserRepository = new GuestUserRepository();

  // Services
  private environmentService = new EnvironmentService();
  private aiAssistentService = new AiAssistantService();
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


  //////////////////////////////////////////////////////////////////////////////
  //                 AI Request Tab Data Update Methods
  //////////////////////////////////////////////////////////////////////////////
  /**
   *
   * @param _path - request path
   */
  private updateRequestPath = async (_path: Path) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.path = _path;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    // this.compareRequestWithServer();
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
    // this.compareRequestWithServer();
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
    // this.compareRequestWithServer();
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
    // this.compareRequestWithServer();

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
    // this.compareRequestWithServer();
  };

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

  /**
   *
   * @param _state - request state
   */
  public updateRequestState = async (_state: StatePartial) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.aiRequest.state = {
      ...progressiveTab.property.aiRequest.state,
      ..._state,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);

    // this.compareRequestWithServer();
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
    // this.compareRequestWithServer();
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

    if(isJsonFormatEnabed) prompt = `${prompt} (Give Response In JSON Format)`;
    
    let formattedConversations: { role: 'user' | 'assistant'; content: string; }[] = []; // Sending the chat history for context
    if (!isChatAutoClearActive) {
      const rawConversations = componentData?.property?.aiRequest?.ai?.conversations || [];
 
      formattedConversations = rawConversations
        .filter(({ status }) => status !== false) // Exclude items with status === false
        .map(({ type, message }) => ({
          role: type === 'Sender' ? 'user' : 'assistant',
          content: isJsonFormatEnabed ?  `${message} (Give Response In JSON Format)` : message,
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
                // console.log("** stream started ** ");
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
