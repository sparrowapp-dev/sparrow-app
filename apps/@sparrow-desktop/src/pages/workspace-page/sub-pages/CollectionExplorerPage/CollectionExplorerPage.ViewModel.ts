// Repositories
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { TabRepository } from "../../../../repositories/tab.repository";

// Servises
import { CollectionService } from "../../../../services/collection.service";

// Types
import type {
  CollectionDocument,
  TabDocument,
} from "../../../../database/database";

// Notification
import { notifications } from "@sparrow/library/ui";

// Utils
import {
  createDeepCopy,
  Debounce,
  InitFolderTab,
  InitMockRequestTab,
  InitWebSocketTab,
  scrollToTab,
  InitAiRequestTab,
} from "@sparrow/common/utils";
import {
  ItemType,
  ResponseStatusCode,
  UntrackedItems,
} from "@sparrow/common/enums";
import { invoke } from "@tauri-apps/api/core";
import { v4 as uuidv4 } from "uuid";

// Stores
import { InitRequestTab } from "@sparrow/common/utils";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import { isGuestUserActive } from "@app/store/auth.store";

import {
  CollectionItemTypeBaseEnum,
  CollectionTypeBaseEnum,
  type CollectionArgsBaseInterface,
  type CollectionAuthProifleBaseInterface as AuthProfileDto,
  type CollectionBaseInterface as CollectionDto,
  type CollectionItemBaseInterface as CollectionItemsDto,
} from "@sparrow/common/types/workspace/collection-base";
import {
  TabPersistenceTypeEnum,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import type {
  Auth,
  State,
} from "@sparrow/common/types/workspace/collection-tab";
import { BehaviorSubject, type Observable } from "rxjs";
import { EnvironmentRepository } from "@app/repositories/environment.repository";
import type { EnvironmentLocalGlobalJoinBaseInterface } from "@sparrow/common/types/workspace/environment-base";
import { EnvironmentService } from "@app/services/environment.service";
import { GuestUserRepository } from "@app/repositories/guest-user.repository";
import { CollectionTabAdapter } from "@app/adapter";
import type { HttpRequestBaseInterface } from "@sparrow/common/types/workspace/http-request-base";
import type { SocketIORequestCreateUpdateInCollectionPayloadDtoInterface } from "@sparrow/common/types/workspace/socket-io-request-dto";
import { InitTab } from "@sparrow/common/factory";
import type { GraphqlRequestCreateUpdateInCollectionPayloadDtoInterface } from "@sparrow/common/types/workspace/graphql-request-dto";
import constants from "@app/constants/constants";
import * as Sentry from "@sentry/svelte";
import { MockHistoryTabAdapter } from "@app/adapter/mock-history-tab";
import type { AiRequestBaseInterface } from "@sparrow/common/types/workspace/ai-request-base";

class CollectionExplorerPage {
  // Private Repositories
  private collectionRepository = new CollectionRepository();
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private environmentService = new EnvironmentService();
  private guestUserRepository = new GuestUserRepository();

  // Private Services
  private collectionService = new CollectionService();

  // Private Variables
  private _tab: BehaviorSubject<Tab> = new BehaviorSubject({});

  constructor(_tab: TabDocument) {
    const t = createDeepCopy(_tab.toMutableJSON());
    delete t.isActive;
    delete t.index;
    this.tab = t;
  }

  public get tab(): Observable<Tab> {
    return this._tab.asObservable();
  }

  public set tab(value: Tab) {
    this._tab.next(value);
  }

  /**
   *
   * @param collectionId - id of collection to fetch
   * @returns return collection
   */
  public getCollection = async (collectionId: string) => {
    return await this.collectionRepository.readCollection(collectionId);
  };

  /**
   *
   * @returns Observable collection list
   */
  public getCollectionList = async () => {
    return await this.collectionRepository.getCollection();
  };

  /**
   * Compares the current collection tab with the server collection and updates the saved status accordingly.
   * This method is debounced to reduce the number of server requests.
   * @return A promise that resolves when the comparison is complete.
   */
  private compareCollectionWithServerDebounced = async () => {
    let result = true;
    const progressiveTab = createDeepCopy(this._tab.getValue());

    const rxCollection = await this.collectionRepository.readCollection(
      progressiveTab.id,
    );

    const collection = rxCollection?.toMutableJSON();
    const collectionTab = new CollectionTabAdapter().adapt(
      progressiveTab.id,
      collection,
    );
    if (!collection) result = false;
    // description
    else if (collectionTab.description !== progressiveTab.description) {
      result = false;
    }
    // name
    else if (collectionTab.name !== progressiveTab.name) {
      result = false;
    }
    // auth navigation
    else if (
      collectionTab.property.collection?.state.collectionAuthNavigation !==
      progressiveTab.property.collection?.state.collectionAuthNavigation
    ) {
      result = false;
    }
    // auth key
    else if (
      collectionTab.property.collection?.auth.apiKey.authKey !==
      progressiveTab.property.collection.auth.apiKey.authKey
    ) {
      result = false;
    }
    // auth value
    else if (
      collectionTab.property.collection?.auth?.apiKey?.authValue !==
      progressiveTab.property.collection.auth.apiKey.authValue
    ) {
      result = false;
    }
    // addTo
    else if (
      collectionTab.property.collection?.auth?.apiKey?.addTo !==
      progressiveTab.property.collection.auth.apiKey.addTo
    ) {
      result = false;
    }
    // username
    else if (
      collectionTab.property.collection?.auth?.basicAuth?.username !==
      progressiveTab.property.collection.auth.basicAuth.username
    ) {
      result = false;
    }
    // password
    else if (
      collectionTab.property.collection?.auth?.basicAuth?.password !==
      progressiveTab.property.collection.auth.basicAuth.password
    ) {
      result = false;
    }
    // bearer tokem
    else if (
      collectionTab.property.collection?.auth?.bearerToken !==
      progressiveTab.property.collection.auth.bearerToken
    ) {
      result = false;
    }
    // result
    if (result) {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: true,
        persistence: TabPersistenceTypeEnum.PERMANENT,
      });
      progressiveTab.isSaved = true;
      progressiveTab.persistence = TabPersistenceTypeEnum.PERMANENT;
      this.tab = progressiveTab;
    } else {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: false,
        persistence: TabPersistenceTypeEnum.PERMANENT,
      });
      progressiveTab.isSaved = false;
      progressiveTab.persistence = TabPersistenceTypeEnum.PERMANENT;
      this.tab = progressiveTab;
    }
  };

  /**
   * Debounced method to compare the current collection tab with the server collection.
   */
  private compareCollectionWithServer = new Debounce().debounce(
    this.compareCollectionWithServerDebounced,
    0,
  );

  public get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

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
    environmentVariables: EnvironmentLocalGlobalJoinBaseInterface,
    newVariableObj: { key: string; value: string },
  ) => {
    // const isGuestUser = await this.getGuestUserState();
    const response = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = response?.getLatest().toMutableJSON().isGuestUser;
    if (isGlobalVariable) {
      // api payload
      const payload = {
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

        const currentTab = await this.tabRepository.getTabById(
          environmentVariables.global.id,
        );
        if (currentTab) {
          const currentTabId = currentTab.tabId;
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
        this._tab.getValue().path?.workspaceId as string,
      );

      const response = await this.environmentService.updateEnvironment(
        this._tab.getValue().path?.workspaceId as string,
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

        const currentTab = await this.tabRepository.getTabById(
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

        const currentTab = await this.tabRepository.getTabById(
          environmentVariables.local.id,
        );

        if (currentTab) {
          const currentTabId = currentTab.tabId;
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
        this._tab.getValue().path?.workspaceId as string,
      );
      // api response
      const response = await this.environmentService.updateEnvironment(
        this._tab.getValue().path?.workspaceId as string,
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

        const currentTab = await this.tabRepository.getTabById(
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
   * Updates collection auth
   * @param _auth - collection auth
   */
  public updateCollectionAuth = async (_auth: Auth) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.collection.auth = {
      ...progressiveTab.property.collection.auth,
      ..._auth,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareCollectionWithServer();
  };

  /**
   * Updates collection state
   * @param _state - collection state
   */
  public updateCollectionState = async (_state: Partial<State>) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.collection.state = {
      ...progressiveTab.property.collection.state,
      ..._state,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareCollectionWithServer();
  };

  /**
   * Updates collection tab name
   * @param _name - updated collection name
   */
  public updateNameWithCollectionList = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (_name !== progressiveTab.name) {
      progressiveTab.name = _name;
    }
    this.tab = progressiveTab;
  };

  /**
   * Handles renaming a collection
   * @param newCollectionName - the new name of the collection
   * @param event - blur or input
   */
  public handleRename = async (_collectionName: string, event = "") => {
    const progressiveTab = createDeepCopy(this._tab.getValue());

    // Trim the name to handle cases with only spaces
    const trimmedName = _collectionName.trim();

    if (event === "blur" && trimmedName === "") {
      const collectionRx = await this.collectionRepository.readCollection(
        progressiveTab.id,
      );
      const collectionDoc = collectionRx?.toMutableJSON();
      progressiveTab.name = collectionDoc?.name;
    } else if (event === "") {
      progressiveTab.name = _collectionName;
    }
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareCollectionWithServer();
  };

  /**
   * Handles updating description of a collection.
   * @param _collectionDescription - the updated description of the collection.
   */
  public handleUpdateDescription = async (_collectionDescription: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.description = _collectionDescription;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareCollectionWithServer();
  };

  /**
   * Handles saving a collection
   */
  public handleSaveCollection = async () => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser == true) {
      await this.collectionRepository.updateCollection(progressiveTab.id, {
        description: progressiveTab.description,
        name: progressiveTab.name,
        auth: progressiveTab.property.collection.auth,
        selectedAuthType:
          progressiveTab.property.collection.state.collectionAuthNavigation,
      });
      notifications.success(
        `The ‘${progressiveTab.name}’ collection saved successfully.`,
      );
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      return;
    }
    const baseUrl = await this.constructBaseUrl(
      progressiveTab.path.workspaceId,
    );
    const response = await this.collectionService.updateCollectionData(
      progressiveTab.id as string,
      progressiveTab.path.workspaceId as string,
      {
        description: progressiveTab.description,
        name: progressiveTab.name,
        auth: progressiveTab.property.collection.auth,
        selectedAuthType:
          progressiveTab.property.collection.state.collectionAuthNavigation,
      },
      baseUrl,
    );
    const isMockCollection =
      response.data.data?.collectionType === CollectionTypeBaseEnum.MOCK;
    if (response.isSuccessful) {
      this.collectionRepository.updateCollection(
        progressiveTab.id as string,
        response.data.data,
      );
      const successMessage = isMockCollection
        ? `'${progressiveTab.name}' mock collection saved successfully.`
        : `The '${progressiveTab.name}' collection saved successfully.`;

      notifications.success(successMessage);
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    } else {
      const errorMessage = isMockCollection
        ? `Failed to save mock collection. Please try again.`
        : `Failed to update description. Please try again.`;
      notifications.error(errorMessage);
    }
  };

  /**
   *
   * @param collection - Collection in which branch is going to change
   * @param newBranch - New branch to be changed
   */
  public handleBranchChanged = async (
    collection: CollectionDocument,
    newBranch: string,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      return;
    }
    const response = await this.collectionService.switchCollectionBranch(
      collection.id as string,
      newBranch,
    );
    if (response.isSuccessful) {
      this.collectionRepository.updateCollection(collection?.id as string, {
        currentBranch: newBranch,
        items: response.data.data.items,
      });
    } else {
      this.collectionRepository.updateCollection(collection?.id as string, {
        currentBranch: newBranch,
        items: [],
      });
    }
    await this.tabRepository.clearTabs();
    notifications.success("Branch switched successfully.");
  };

  /**
   *
   * @param collection Collection going to be refetched
   * @returns
   */
  public handleRefetchCollection = async (collection: CollectionDocument) => {
    const errMessage = `Failed to sync the collection. Local reposisitory branch is not set to ${collection?.currentBranch}.`;

    try {
      const activeResponse = await invoke("get_git_active_branch", {
        path: collection?.localRepositoryPath,
      });
      if (activeResponse) {
        const currentBranch: string = activeResponse;
        if (collection?.currentBranch) {
          if (currentBranch !== collection?.currentBranch) {
            notifications.error(errMessage);
            return;
          }
        } else {
          if (currentBranch !== collection?.primaryBranch) {
            notifications.error(errMessage);
            return;
          }
        }
      } else {
        notifications.error(errMessage);
        return;
      }
    } catch (e) {
      notifications.error(errMessage);
      return;
    }
    const responseJSON =
      await this.collectionService.validateImportCollectionURL(
        collection.activeSyncUrl,
      );
    if (responseJSON?.data?.status === ResponseStatusCode.OK) {
      let isGuestUser;
      isGuestUserActive.subscribe((value) => {
        isGuestUser = value;
      });
      if (isGuestUser === true) {
        return;
      }
      const response = await this.collectionService.importCollection(
        collection.workspaceId as string,
        {
          url: collection.activeSyncUrl as string,
          urlData: {
            data: JSON.parse(responseJSON.data.response),
            headers: responseJSON.data.headers,
          },
          primaryBranch: collection?.primaryBranch as string,
          currentBranch: collection?.currentBranch
            ? (collection?.currentBranch as string)
            : (collection?.primaryBranch as string),
        },
        collection.activeSync,
      );

      if (response.isSuccessful) {
        this.collectionRepository.updateCollection(
          collection.id as string,
          response.data.data.collection,
        );
        notifications.success("Collection synced successfully.");
      } else {
        notifications.error("Failed to sync the collection. Please try again.");
      }

      notifications.error(
        `Unable to detect ${collection?.activeSyncUrl?.replace("-json", "")}.`,
      );
    }
  };

  /**
   *
   * @param collection - Collection going to be synced
   * @returns
   */
  public handleSyncCollection = async (collection: CollectionDocument) => {
    const errMessage = `Failed to sync the collection. Local reposisitory branch is not set to ${collection?.currentBranch}.`;
    try {
      const activeResponse = await invoke("get_git_active_branch", {
        path: collection?.localRepositoryPath,
      });
      if (activeResponse) {
        const currentBranch = activeResponse;
        if (collection?.currentBranch) {
          if (currentBranch !== collection?.currentBranch) {
            notifications.error(errMessage);
            return false;
          }
        } else {
          if (currentBranch !== collection?.primaryBranch) {
            notifications.error(errMessage);
            return false;
          }
        }
      } else {
        notifications.error(errMessage);
        return false;
      }
    } catch (e) {
      notifications.error(errMessage);
      return false;
    }
    const responseJSON =
      await this.collectionService.validateImportCollectionURL(
        collection.activeSyncUrl,
      );
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      return;
    }
    if (responseJSON?.data?.status === ResponseStatusCode.OK) {
      const response = await this.collectionService.importCollection(
        collection.workspaceId as string,
        {
          url: collection?.activeSyncUrl as string,
          urlData: {
            data: JSON.parse(responseJSON.data.response),
            headers: responseJSON.data.headers,
          },
          primaryBranch: collection?.primaryBranch as string,
          currentBranch: collection?.currentBranch as string,
        },
        collection.activeSync,
      );

      if (response.isSuccessful) {
        await this.collectionRepository.updateCollection(
          collection?.id as string,
          response.data.data.collection,
        );
        notifications.success("Collection synced successfully.");
        return true;
      } else {
        notifications.error("Failed to sync the collection. Please try again.");
        return false;
      }
    } else {
      notifications.error(
        `Unable to detect ${collection?.activeSyncUrl?.replace("-json", "")}.`,
      );
      return false;
    }
  };

  /**
   *
   * @param collection Collection in which folder and request will be counted
   * @returns isSynced, totalRequests, totalFolders, lastUpdated
   */
  public getLastUpdatedAndCount = async (collection: CollectionDto) => {
    const isSynced = false;
    const monthNamesAbbreviated = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const lastUpdated: string = `${
      monthNamesAbbreviated[new Date(collection?.updatedAt).getMonth()]
    } ${new Date(collection?.updatedAt).getDate()}, ${new Date(
      collection?.updatedAt,
    ).getFullYear()}`;
    let totalRequests = 0;
    let totalFolders = 0;
    let totalWebSocket = 0;
    let totalSocketIo = 0;
    let totalGraphQl = 0;
    let totalMockRequests = 0;
    let totalAiRequests = 0;

    if (collection?.items) {
      collection?.items.forEach((collectionItem: CollectionItemsDto) => {
        if (collectionItem.type === ItemType.REQUEST) {
          totalRequests++;
        } else if (collectionItem.type === ItemType.WEB_SOCKET) {
          totalWebSocket++;
        } else if (collectionItem.type === ItemType.SOCKET_IO) {
          totalSocketIo++;
        } else if (collectionItem.type === ItemType.GRAPHQL) {
          totalGraphQl++;
        } else if (collectionItem.type === ItemType.MOCK_REQUEST) {
          totalMockRequests++;
        } else if (collectionItem.type === ItemType.AI_REQUEST) {
          totalAiRequests++;
        } else if (collectionItem.type === ItemType.FOLDER) {
          totalFolders++;
          if (collectionItem?.items)
            collectionItem.items.forEach((item: CollectionItemsDto) => {
              if (item.type === ItemType.REQUEST) {
                totalRequests++;
              } else if (item.type === ItemType.WEB_SOCKET) {
                totalWebSocket++;
              } else if (item.type === ItemType.SOCKET_IO) {
                totalSocketIo++;
              } else if (item.type === ItemType.GRAPHQL) {
                totalGraphQl++;
              } else if (item.type === ItemType.MOCK_REQUEST) {
                totalMockRequests++;
              } else if (item.type === ItemType.AI_REQUEST) {
                totalAiRequests++;
              }
            });
        }
      });
    }
    // let isGuestUser;
    // isGuestUserActive.subscribe((value) => {
    //   isGuestUser = value;
    // });

    // active sync endpoint currently not in use
    // if (isGuestUser === true) {
    //   return {
    //     isSynced,
    //     totalFolders,
    //     totalRequests,
    //     lastUpdated,
    //   };
    // }
    // const response = await this.collectionService.switchCollectionBranch(
    //   collection?.id,
    //   collection?.currentBranch,
    // );

    // if (response && response.isSuccessful) {
    //   isSynced = true;
    // } else {
    //   isSynced = false;
    // }
    return {
      isSynced,
      totalRequests,
      totalSocketIo,
      totalWebSocket,
      totalGraphQl,
      totalFolders,
      lastUpdated,
      totalMockRequests,
      totalAiRequests,
    };
  };

  /**
   *
   * @param collection - Collection in which request is going to be created
   * @returns
   */
  public handleCreateRequest = async (collection: CollectionDocument) => {
    console.log("create request in explorrer page", collection);
    // const request = generateSampleRequest(
    //   UntrackedItems.UNTRACKED + uuidv4(),
    //   new Date().toString(),
    // );
    const initRequestTab = new InitRequestTab(
      UntrackedItems.UNTRACKED + uuidv4(),
      collection.workspaceId,
    );

    let userSource = {};
    if (collection?.activeSync) {
      userSource = {
        currentBranch: collection?.currentBranch
          ? collection?.currentBranch
          : collection?.primaryBranch,
        source: "USER",
      };
    }
    const requestObj = {
      collectionId: collection.id,
      workspaceId: collection.workspaceId,
      ...userSource,
      items: {
        name: initRequestTab.getValue().name,
        type: initRequestTab.getValue().type,
        description: "",
        request: {
          method: initRequestTab.getValue().property?.request?.method,
        },
      },
    };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    let response;
    if (isGuestUser == true) {
      const res = {
        id: uuidv4(),
        name: "API Request Name",
        type: "REQUEST",
        description: "",
        source: "USER",
        isDeleted: false,
        createdBy: "Guest User",
        updatedBy: "Guest User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        request: {
          method: "GET",
        },
      };
      this.collectionRepository.addRequestOrFolderInCollection(
        collection.id as string,
        res,
      );

      // request.id = res.id;
      // request.path.workspaceId = collection.workspaceId;
      // request.path.collectionId = collection.id;
      // request.property.request.save.api = true;
      // request.property.request.save.description = true;

      initRequestTab.updateId(res.id);
      initRequestTab.updatePath({
        workspaceId: collection.workspaceId as string,
        collectionId: collection.id as string,
        folderId: "",
      });
      initRequestTab.updateIsSave(true);
      this.tabRepository.createTab(initRequestTab.getValue());
      scrollToTab("");
      return;
    } else {
      const baseUrl = await this.constructBaseUrl(collection.workspaceId);
      response = await this.collectionService.addRequestInCollection(
        requestObj,
        baseUrl,
      );
      if (response.isSuccessful && response.data.data) {
        const res = response.data.data;
        this.collectionRepository.addRequestOrFolderInCollection(
          collection.id as string,
          res,
        );

        // request.id = res.id;
        // request.path.workspaceId = collection.workspaceId;
        // request.path.collectionId = collection.id;
        // request.property.request.save.api = true;
        // request.property.request.save.description = true;

        initRequestTab.updateId(res.id);
        initRequestTab.updatePath({
          workspaceId: collection.workspaceId as string,
          collectionId: collection.id as string,
          folderId: "",
        });
        initRequestTab.updateIsSave(true);
        // this.handleOpenRequest(
        //   collection.workspaceId,
        //   collection,
        //   {
        //     id: "",
        //     name: "",
        //   },
        //   request,
        // );
        this.tabRepository.createTab(initRequestTab.getValue());
        scrollToTab("");
        return;
      } else {
        notifications.error(response.message);
      }
    }
  };

  /**
   * Handles creating unique name for new collection, folder or request
   * @param list :any[] - list of collection, folder or request
   * @param type :string - type of element of list, i.e. collection, folder, request
   * @param name :string - name of new element
   * @returns :string - new proposed name of new collection, folder or request
   */
  private getNextName = (
    list: { type: string; name: string }[],
    type: string,
    name: string,
  ) => {
    const isNameAvailable: (proposedName: string) => boolean = (
      proposedName,
    ) => {
      return list.some((element) => {
        return element.type === type && element.name === proposedName;
      });
    };

    if (!isNameAvailable(name)) {
      return name;
    }

    for (let i = 2; i < list.length + 10; i++) {
      const proposedName: string = `${name} ${i}`;
      if (!isNameAvailable(proposedName)) {
        return proposedName;
      }
    }
  };

  /**
   * Handle creating a new request in a collection
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which new request is going to be created
   * @returns :void
   */
  private handleCreateRequestInCollection = async (
    workspaceId: string,
    collection: CollectionDto,
  ) => {
    const request = new InitRequestTab(
      UntrackedItems.UNTRACKED + uuidv4(),
      workspaceId,
    );

    let userSource = {};
    if (collection?.activeSync) {
      userSource = {
        currentBranch: collection?.currentBranch
          ? collection?.currentBranch
          : collection?.primaryBranch,
        source: "USER",
      };
    }
    const requestObj = {
      collectionId: collection.id,
      workspaceId: workspaceId,
      ...userSource,
      items: {
        name: request.getValue().name,
        type: request.getValue().type,
        description: "",
        request: {
          method: request?.getValue().property?.request?.method,
        } as HttpRequestBaseInterface,
      },
    };
    await this.collectionRepository.addRequestOrFolderInCollection(
      collection.id,
      {
        ...requestObj.items,
        id: request.getValue().id,
      },
    );
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      const res =
        await this.collectionRepository.readRequestOrFolderInCollection(
          requestObj.collectionId,
          request.getValue().id,
        );
      if (res) {
        res.id = uuidv4();
      }
      await this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        request.getValue().id,
        res,
      );

      request.updateId(res?.id as string);
      request.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: "",
      });
      request.updateIsSave(true);
      await this.tabRepository.createTab(request.getValue());
      scrollToTab("");
      return;
    }
    const baseUrl = await this.constructBaseUrl(workspaceId);
    const response = await this.collectionService.addRequestInCollection(
      requestObj,
      baseUrl,
    );
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;

      this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        request.getValue().id,
        res,
      );
      request.updateId(res.id);
      request.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: "",
      });
      request.updateIsSave(true);
      this.tabRepository.createTab(request.getValue());
      scrollToTab("");
      return;
    } else {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        collection.id,
        request.getValue().id,
      );
      notifications.error(response.message);
    }
  };

  /**
   * Handle creating a new mock request in a collection
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which new request is going to be created
   * @returns :void
   */
  private handleCreateMockRequestInCollection = async (
    workspaceId: string,
    collection: CollectionDto,
  ) => {
    const request = new InitMockRequestTab(
      UntrackedItems.UNTRACKED + uuidv4(),
      workspaceId,
    );

    let userSource = {};
    if (collection?.activeSync) {
      userSource = {
        currentBranch: collection?.currentBranch
          ? collection?.currentBranch
          : collection?.primaryBranch,
        source: "USER",
      };
    }
    const requestObj = {
      collectionId: collection.id,
      workspaceId: workspaceId,
      ...userSource,
      items: {
        name: request.getValue().name,
        type: request.getValue().type,
        description: "",
        mockRequest: {
          method: request?.getValue().property?.mockRequest?.method,
          url: "",
        } as HttpRequestBaseInterface,
      },
    };
    await this.collectionRepository.addRequestOrFolderInCollection(
      collection.id,
      {
        ...requestObj.items,
        id: request.getValue().id,
      },
    );
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      const res =
        await this.collectionRepository.readRequestOrFolderInCollection(
          requestObj.collectionId,
          request.getValue().id,
        );
      if (res) {
        res.id = uuidv4();
      }
      await this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        request.getValue().id,
        res,
      );

      request.updateId(res?.id as string);
      request.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: "",
      });
      request.updateIsSave(true);
      await this.tabRepository.createTab(request.getValue());
      scrollToTab("");
      return;
    }
    const baseUrl = await this.constructBaseUrl(workspaceId);
    const response = await this.collectionService.addMockRequestInCollection(
      requestObj,
      baseUrl,
    );
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;

      this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        request.getValue().id,
        res,
      );
      request.updateId(res.id);
      request.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: "",
      });
      request.updateIsSave(true);
      if ((collection.collectionType = CollectionTypeBaseEnum.MOCK)) {
        request.updateLabel(CollectionTypeBaseEnum.MOCK);
      }
      // request.updateUrl(collection?.mockCollectionUrl);
      this.tabRepository.createTab(request.getValue());
      scrollToTab("");
      return;
    } else {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        collection.id,
        request.getValue().id,
      );
      notifications.error(response.message);
    }
  };

  /**
   * Handle creating a new AI request in a collection
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which new request is going to be created
   * @returns :void
   */
  private handleCreateAiRequestInCollection = async (
    workspaceId: string,
    collection: CollectionDto,
  ) => {
    const aiRequest = new InitAiRequestTab(
      UntrackedItems.UNTRACKED + uuidv4(),
      workspaceId,
    );

    let userSource = {};
    if (collection?.activeSync) {
      userSource = {
        currentBranch: collection?.currentBranch
          ? collection?.currentBranch
          : collection?.primaryBranch,
        source: "USER",
      };
    }
    const aiRequestObj = {
      collectionId: collection.id,
      workspaceId: workspaceId,
      ...userSource,
      items: {
        name: aiRequest.getValue().name,
        type: aiRequest.getValue().type,
        description: "",
        aiRequest: {
          aiModelProvider:
            aiRequest?.getValue().property?.aiRequest?.aiModelProvider,
          aiModelVariant:
            aiRequest?.getValue().property?.aiRequest?.aiModelVariant,
        } as AiRequestBaseInterface,
      },
    };
    await this.collectionRepository.addRequestOrFolderInCollection(
      collection.id,
      {
        ...aiRequestObj.items,
        id: aiRequest.getValue().id,
      },
    );
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      const res =
        await this.collectionRepository.readRequestOrFolderInCollection(
          aiRequestObj.collectionId,
          aiRequest.getValue().id,
        );
      if (res) {
        res.id = uuidv4();
      }
      await this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        aiRequest.getValue().id,
        res,
      );

      aiRequest.updateId(res?.id as string);
      aiRequest.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: "",
      });
      aiRequest.updateIsSave(true);
      await this.tabRepository.createTab(aiRequest.getValue());
      scrollToTab("");
      return;
    }
    const baseUrl = await this.constructBaseUrl(workspaceId);
    const response = await this.collectionService.addAiRequestInCollection(
      aiRequestObj,
      baseUrl,
    );
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;

      this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        aiRequest.getValue().id,
        res,
      );
      aiRequest.updateId(res.id);
      aiRequest.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: "",
      });
      aiRequest.updateIsSave(true);
      this.tabRepository.createTab(aiRequest.getValue());
      scrollToTab("");
      return;
    } else {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        collection.id,
        aiRequest.getValue().id,
      );
      notifications.error(response.message);
    }
  };

  /**
   * Handles creating a new folder in a collection
   * @param workspaceId :string
   * @param collection :CollectionDocument - the collection in which new folder is going to be created
   * @returns :void
   */
  public handleCreateFolderInCollection = async (
    workspaceId: string,
    collection: CollectionDto,
  ): Promise<void> => {
    // Generate a new folder object with a unique ID, name, description, type, and an empty items array
    const folder = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: this.getNextName(collection.items, ItemType.FOLDER, "New Folder"),
      description: "",
      type: ItemType.FOLDER,
      items: [],
    };
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    // Determine the user source based on collection's active synchronization
    let userSource = {};
    if (collection?.activeSync) {
      userSource = {
        currentBranch: collection?.currentBranch
          ? collection?.currentBranch
          : collection?.primaryBranch,
        source: "USER",
      };
    }
    // Add the new folder to the collection locally
    await this.collectionRepository.addRequestOrFolderInCollection(
      collection.id,
      folder,
    );

    if (isGuestUser === true) {
      const data = {
        id: uuidv4(),
        name: this.getNextName(
          collection.items,
          ItemType.FOLDER,
          "New Folder",
        ) as string,
        description: "",
        type: ItemType.FOLDER,
        items: [],
      };

      const path = {
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: data.id,
      };

      const sampleFolder = new InitFolderTab(data.id, collection.workspaceId);

      sampleFolder.updateName(data.name);
      sampleFolder.updatePath(path);
      sampleFolder.updateIsSave(true);

      this.tabRepository.createTab(sampleFolder.getValue());
      scrollToTab("");

      // Update the locally added folder with server response
      const folderObj = data;
      await this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        folder.id,
        folderObj,
      );
      return;
    }

    const baseUrl = await this.constructBaseUrl(workspaceId);
    // Add the folder in the collection on the Database
    const response = await this.collectionService.addFolderInCollection(
      workspaceId,
      collection.id,
      {
        ...userSource,
        name: folder.name,
        description: folder.description,
      },
      baseUrl,
    );

    // Update UI elements and handle navigation on success
    if (response.isSuccessful) {
      const path = {
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: response.data.data.id,
        folderName: response.data.data.name,
      };

      const sampleFolder = new InitFolderTab(
        response.data.data.id,
        collection.workspaceId,
      );

      sampleFolder.updateName(response.data.data.name);
      sampleFolder.updatePath(path);
      sampleFolder.updateIsSave(true);
      if (collection?.collectionType === CollectionTypeBaseEnum.MOCK) {
        sampleFolder.updateLabel(CollectionTypeBaseEnum.MOCK);
      }

      this.tabRepository.createTab(sampleFolder.getValue());
      scrollToTab("");

      // Update the locally added folder with server response
      const folderObj = response.data.data;
      await this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id,
        folder.id,
        folderObj,
      );
    } else {
      // Show error notification and clean up by deleting the folder locally on failure.
      notifications.error("Failed to create folder. Please try again.");
      this.collectionRepository.deleteRequestOrFolderInCollection(
        collection.id,
        folder.id,
      );
    }
  };

  /**
   * Handle creating a new web socket in a collection
   * @param workspaceId
   * @param collection - the collection in which new web socket is going to be created
   */
  private handleCreateWebSocketInCollection = async (
    workspaceId: string,
    collection: CollectionDto,
  ) => {
    const websocket = new InitWebSocketTab(
      UntrackedItems.UNTRACKED + uuidv4(),
      workspaceId,
    );

    let userSource = {};
    if (collection?.activeSync) {
      userSource = {
        currentBranch: collection?.currentBranch
          ? collection?.currentBranch
          : collection?.primaryBranch,
        source: "USER",
      };
    }
    const websocketObj = {
      collectionId: collection.id,
      workspaceId: workspaceId,
      ...userSource,
      items: {
        name: websocket.getValue().name,
        type: websocket.getValue().type,
        description: "",
        websocket: {},
      },
    };
    await this.collectionRepository.addRequestOrFolderInCollection(
      collection.id as string,
      {
        ...websocketObj.items,
        id: websocket.getValue().id,
      },
    );
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      const res =
        await this.collectionRepository.readRequestOrFolderInCollection(
          websocketObj.collectionId as string,
          websocket.getValue().id,
        );
      if (res) {
        res.id = uuidv4();
      }
      await this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id as string,
        websocket.getValue().id,
        res,
      );

      websocket.updateId(res?.id as string);
      websocket.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: "",
      });
      websocket.updateIsSave(true);
      await this.tabRepository.createTab(websocket.getValue());
      scrollToTab("");
      return;
    }
    const baseUrl = await this.constructBaseUrl(workspaceId);
    const response = await this.collectionService.addSocketInCollection(
      websocketObj,
      baseUrl,
    );
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;

      this.collectionRepository.updateRequestOrFolderInCollection(
        collection.id as string,
        websocket.getValue().id,
        res,
      );

      websocket.updateId(res.id);
      websocket.updatePath({
        workspaceId: workspaceId,
        collectionId: collection.id,
        folderId: "",
      });
      websocket.updateIsSave(true);

      this.tabRepository.createTab(websocket.getValue());
      scrollToTab("");
      return;
    } else {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        collection.id,
        websocket.getValue().id,
      );
      notifications.error(response.message);
    }
  };

  /**
   * Handle creating a new socket io in a collection
   * @param _workspaceId - workspace id
   * @param _collection - the collection in which new socket io is going to be created
   */
  private handleCreateSocketIoInCollection = async (
    _workspaceId: string,
    _collection: CollectionDto,
  ) => {
    const socketIoTab = new InitTab().socketIo(uuidv4(), _workspaceId);
    const socketIoOfCollectionPayload: SocketIORequestCreateUpdateInCollectionPayloadDtoInterface =
      {
        collectionId: _collection.id,
        workspaceId: _workspaceId,
        currentBranch: _collection.activeSync
          ? _collection.currentBranch
          : undefined,
        source: _collection.activeSync ? "USER" : undefined,
        items: {
          name: socketIoTab.getValue().name,
          type: CollectionItemTypeBaseEnum.SOCKETIO,
          description: "",
          socketio: {},
        },
      };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      await this.collectionRepository.addRequestOrFolderInCollection(
        _collection.id as string,
        {
          ...socketIoOfCollectionPayload.items,
          id: socketIoTab.getValue().id,
        },
      );
      socketIoTab.updatePath({
        workspaceId: _workspaceId,
        collectionId: _collection.id,
        folderId: "",
      });
      socketIoTab.updateIsSave(true);
      await this.tabRepository.createTab(socketIoTab.getValue());
      scrollToTab("");
      return;
    }

    const baseUrl = await this.constructBaseUrl(_workspaceId);
    const response = await this.collectionService.addSocketIoInCollection(
      socketIoOfCollectionPayload,
      baseUrl,
    );
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;

      await this.collectionRepository.addRequestOrFolderInCollection(
        _collection.id as string,
        {
          ...res,
        },
      );

      socketIoTab.updateId(res.id as string);
      socketIoTab.updatePath({
        workspaceId: _workspaceId,
        collectionId: _collection.id,
        folderId: "",
      });
      socketIoTab.updateIsSave(true);

      this.tabRepository.createTab(socketIoTab.getValue());
      scrollToTab("");
      return;
    } else {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        _collection.id,
        socketIoTab.getValue().id,
      );
      notifications.error(response.message);
    }
  };

  /**
   * Handle creating a new graphql in a collection
   * @param _workspaceId - workspace id
   * @param _collection - the collection in which new graphql is going to be created
   */
  private handleCreateGraphqlInCollection = async (
    _workspaceId: string,
    _collection: CollectionDto,
  ) => {
    const graphqlTab = new InitTab().graphQl(uuidv4(), _workspaceId);
    const graphqlOfCollectionPayload: GraphqlRequestCreateUpdateInCollectionPayloadDtoInterface =
      {
        collectionId: _collection.id,
        workspaceId: _workspaceId,
        currentBranch: _collection.activeSync
          ? _collection.currentBranch
          : undefined,
        source: _collection.activeSync ? "USER" : undefined,
        items: {
          name: graphqlTab.getValue().name,
          type: CollectionItemTypeBaseEnum.GRAPHQL,
          description: "",
          graphql: {},
        },
      };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser === true) {
      await this.collectionRepository.addRequestOrFolderInCollection(
        _collection.id as string,
        {
          ...graphqlOfCollectionPayload.items,
          id: graphqlTab.getValue().id,
        },
      );
      graphqlTab.updatePath({
        workspaceId: _workspaceId,
        collectionId: _collection.id,
        folderId: "",
      });
      graphqlTab.updateIsSave(true);
      await this.tabRepository.createTab(graphqlTab.getValue());
      scrollToTab("");
      return;
    }

    const baseUrl = await this.constructBaseUrl(_workspaceId);
    const response = await this.collectionService.addGraphqlInCollection(
      graphqlOfCollectionPayload,
      baseUrl,
    );
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;

      await this.collectionRepository.addRequestOrFolderInCollection(
        _collection.id as string,
        {
          ...res,
        },
      );

      graphqlTab.updateId(res.id as string);
      graphqlTab.updatePath({
        workspaceId: _workspaceId,
        collectionId: _collection.id,
        folderId: "",
      });
      graphqlTab.updateIsSave(true);

      this.tabRepository.createTab(graphqlTab.getValue());
      scrollToTab("");

      return;
    } else {
      this.collectionRepository.deleteRequestOrFolderInCollection(
        _collection.id,
        graphqlTab.getValue().id,
      );
      notifications.error(response.message);
    }
  };

  public handleOpenMockHistory = (
    workspaceId: string,
    collection: CollectionDto,
  ) => {
    const mockHistroyTab = new MockHistoryTabAdapter().adapt(
      workspaceId,
      collection.id,
    );
    this.tabRepository.createTab(mockHistroyTab);
    scrollToTab("");
  };

  /**
   * Handle control of creating items
   * @param entityType :string - type of entity, collection, folder or request
   * @param args :object - arguments depending on entity type
   */
  public handleCreateItem = async (
    entityType: string,
    args: CollectionArgsBaseInterface,
  ) => {
    let response;
    switch (entityType) {
      case "folder":
        await this.handleCreateFolderInCollection(
          args.collection.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "requestCollection":
        await this.handleCreateRequestInCollection(
          args.collection.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "requestMockCollection":
        await this.handleCreateMockRequestInCollection(
          args.collection.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "websocketCollection":
        await this.handleCreateWebSocketInCollection(
          args.collection.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "socketioCollection":
        await this.handleCreateSocketIoInCollection(
          args.collection.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "graphqlCollection":
        await this.handleCreateGraphqlInCollection(
          args.collection.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "mockHistory":
        this.handleOpenMockHistory(
          args.collection.workspaceId,
          args.collection as CollectionDto,
        );
        break;
      case "aiRequestCollection":
        await this.handleCreateAiRequestInCollection(
          args.collection.workspaceId,
          args.collection as CollectionDto,
        );
        break;
    }
    return response;
  };

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };

  public handleMockCollectionState = async (
    collectionId: string,
    workspaceId: string,
    request: any,
  ) => {
    const baseUrl = await this.constructBaseUrl(workspaceId);
    const response =
      await this.collectionService.updateMockCollectionRunningStatus(
        collectionId,
        workspaceId,

        request,
        baseUrl,
      );
    if (response.isSuccessful) {
      await this.collectionRepository.updateCollection(
        collectionId,
        response.data.data,
      );
    } else if (response.message === "Network Error") {
      notifications.error(response.message);
    } else {
      notifications.error("Failed to update running state. Please try again.");
    }
  };

  /**
   * Handle creating a new auth profile in a collection
   * @param collection :CollectionDocument - the collection in which new request is going to be created
   * @param authProfilePayload :AuthProfilePayload Object
   * @returns :void
   */
  public handleCreateAuthProfile = async (
    _collection: CollectionDto,
    _authProfilePayload: AuthProfileDto,
  ) => {
    _authProfilePayload.authId = UntrackedItems.UNTRACKED + uuidv4();
    let userSource = {};
    if (_collection?.activeSync) {
      userSource = {
        currentBranch: _collection?.currentBranch
          ? _collection?.currentBranch
          : _collection?.primaryBranch,
        source: "USER",
      };
    }

    if (!_collection?.authProfiles.length) {
      _authProfilePayload.defaultKey = true;
    }

    const authProfileObj = {
      collectionId: _collection.id,
      workspaceId: _collection.workspaceId,
      ...userSource,
      authProfiles: [
        {
          ..._authProfilePayload,
        },
      ],
    };

    await this.collectionRepository.addAuthProfile(_collection.id as string, {
      ...authProfileObj.authProfiles[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser) {
      try {
        const res =
          await this.collectionRepository.readAuthProfilesInCollection(
            authProfileObj.collectionId as string,
            _authProfilePayload.authId,
          );

        if (res) res.authId = uuidv4();

        await this.collectionRepository.updateAuthProfile(
          _collection.id as string,
          res.authId,
          res,
        );

        notifications.success("Auth profile created successfully.");
        return { ...res, isSuccessful: true };
      } catch (error) {
        console.error("Error while handling guest auth profile:", error);
        return error;
      }
    }

    const baseUrl = await this.constructBaseUrl(_collection.workspaceId);
    const response = await this.collectionService.addAuthProfile(
      baseUrl,
      authProfileObj,
    );
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      await this.collectionRepository.updateAuthProfile(
        _collection.id as string,
        _authProfilePayload.authId,
        res,
      );
      notifications.success("Auth profile created successfully.");
    } else {
      await this.collectionRepository.deleteAuthProfile(
        _collection.id,
        _authProfilePayload.authId,
      );
      console.error(response.message);
      notifications.error("Failed to create authentication profile.");
    }

    return response;
  };

  /**
   * Handle updating existing auth profile in a collection
   * @param collection :CollectionDocument - the collection in which new request is going to be created
   * @param authId :authId for which update has to be done
   * @param authProfilePayload :AuthProfilePayload Object
   * @returns :void
   */
  public handleUpdateAuthProfile = async (
    _collection: CollectionDto,
    _authProfileId: string,
    _updatedAuthProfilePayload: AuthProfileDto,
    _isRequestForDefaultKey: boolean,
  ) => {
    let userSource = {};
    if (_collection?.activeSync) {
      userSource = {
        currentBranch: _collection?.currentBranch
          ? _collection?.currentBranch
          : _collection?.primaryBranch,
        source: "USER",
      };
    }

    const updatedAuthProfileObj = {
      collectionId: _collection.id,
      workspaceId: _collection.workspaceId,
      ...userSource,
      ..._updatedAuthProfilePayload,
    };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser) {
      try {
        const res =
          await this.collectionRepository.readAuthProfilesInCollection(
            updatedAuthProfileObj.collectionId as string,
            updatedAuthProfileObj.authId,
          );

        await this.collectionRepository.updateAuthProfile(
          _collection.id as string,
          _authProfileId,
          {
            ..._updatedAuthProfilePayload,
            updatedAt: new Date().toISOString(),
          },
        );

        // Don't show success notification if it's a defaultKey update request
        if (!_isRequestForDefaultKey) {
          notifications.success("Auth profile updated successfully.");
        }

        return { ...res, isSuccessful: true };
      } catch (error) {
        console.error("Error while updating guest auth profile:", error);
        return error;
      }
    }

    // For non-guest users, implement optimistic update for auth profile
    let previousAuthProfiles = null;
    let previousDefaultAuthProfile = null;

    try {
      // Store previous state for potential rollback
      const collectionData = await this.collectionRepository.readCollection(
        _collection.id,
      );
      previousAuthProfiles = [...collectionData.authProfiles]; // Deep copy of current state

      // Find the currently selected default auth profile
      previousDefaultAuthProfile = previousAuthProfiles.find(
        (profile) => profile.defaultKey === true,
      );

      // Apply optimistic update immediately (UI will reflect changes instantly)
      await this.collectionRepository.updateAuthProfile(
        _collection.id as string,
        _authProfileId,
        {
          ..._updatedAuthProfilePayload,
          updatedAt: new Date().toISOString(),
        },
      );

      // update auth profile in background
      const baseUrl = await this.constructBaseUrl(_collection.workspaceId);
      const response = await this.collectionService.updateAuthProfile(
        baseUrl,
        _authProfileId,
        updatedAuthProfileObj,
      );

      if (response.isSuccessful) {
        // update with server response to ensure consistency
        const res = response.data.data;
        await this.collectionRepository.updateAuthProfile(
          _collection.id as string,
          _authProfileId,
          res,
        );

        // Don't show success notification if it's a defaultKey update request
        if (!_isRequestForDefaultKey) {
          notifications.success("Auth profile updated successfully.");
        }
      } else {
        // update failed from server - revert to previous state
        console.error(response.message);

        if (previousAuthProfiles) {
          // Revert the currently updated profile to its original state
          const originalProfile = previousAuthProfiles.find(
            (profile) => profile.authId === _authProfileId,
          );
          if (originalProfile) {
            await this.collectionRepository.updateAuthProfile(
              _collection.id as string,
              _authProfileId,
              originalProfile,
            );
          }

          // If this was a defaultKey update, restore the previous default if there was one
          if (
            _isRequestForDefaultKey &&
            previousDefaultAuthProfile &&
            previousDefaultAuthProfile.authId !== _authProfileId
          ) {
            await this.collectionRepository.updateAuthProfile(
              _collection.id as string,
              previousDefaultAuthProfile.authId,
              { ...previousDefaultAuthProfile, defaultKey: true },
            );
          }
        }

        notifications.error("Failed to update authentication profile.");
      }

      return response;
    } catch (error) {
      // Unexpected error - revert to previous state
      console.error("Unexpected error during auth profile update:", error);

      if (previousAuthProfiles) {
        try {
          // Revert the currently updated profile to its original state
          const originalProfile = previousAuthProfiles.find(
            (profile) => profile.authId === _authProfileId,
          );
          if (originalProfile) {
            await this.collectionRepository.updateAuthProfile(
              _collection.id as string,
              _authProfileId,
              originalProfile,
            );
          }

          // If this was a defaultKey update, restore the previous default if there was one
          if (
            _isRequestForDefaultKey &&
            previousDefaultAuthProfile &&
            previousDefaultAuthProfile.authId !== _authProfileId
          ) {
            await this.collectionRepository.updateAuthProfile(
              _collection.id as string,
              previousDefaultAuthProfile.authId,
              { ...previousDefaultAuthProfile, defaultKey: true },
            );
          }
        } catch (revertError) {
          console.error("Failed to revert auth profile state:", revertError);
        }
      }

      notifications.error("Failed to update authentication profile.");
      return { isSuccessful: false, message: error.message };
    }
  };

  /**
   * Handle deleting auth profile in a collection
   * @param collection :CollectionDocument - the collection in which new request is going to be created
   * @param authId :authId of auth profile which needs to be deleted
   * @param authProfilePayload :AuthProfilePayload Object
   * @returns :void
   */
  public handleDeleteAuthProfile = async (
    collection: CollectionDto,
    authId: string,
  ) => {
    let userSource = {};
    if (collection.activeSync) {
      userSource = {
        currentBranch: collection.currentBranch,
      };
    }

    const authProfileObj = {
      collectionId: collection.id,
      workspaceId: collection.workspaceId,
      ...userSource,
      authId: authId,
    };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser) {
      try {
        await this.collectionRepository.deleteAuthProfile(
          collection.id,
          authId,
        );

        notifications.success("Authentication profile deleted successfully.");
        return;
      } catch (error) {
        console.error("Error while deleting guest auth profile:", error);
        // notifications.error("Failed to delete auth profile. Please try again.");
        return;
      }
    }

    const baseUrl = await this.constructBaseUrl(collection.workspaceId);
    const response = await this.collectionService.deleteAuthProfile(
      baseUrl,
      authId,
      authProfileObj,
    );

    if (response.isSuccessful) {
      await this.collectionRepository.deleteAuthProfile(collection.id, authId);
      notifications.success("Authentication profile deleted successfully.");
    } else {
      console.error(response.message);
      notifications.error("Failed to delete authentication profile.");
    }
    return response;
  };
}

export default CollectionExplorerPage;
