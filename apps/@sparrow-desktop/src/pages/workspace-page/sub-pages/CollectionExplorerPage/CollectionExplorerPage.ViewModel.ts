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
import { createDeepCopy, Debounce, moveNavigation } from "@sparrow/common/utils";
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

import type {
  CollectionBaseInterface as CollectionDto,
  CollectionItemBaseInterface as CollectionItemsDto,
} from "@sparrow/common/types/workspace/collection-base";
import { type Tab } from "@sparrow/common/types/workspace/tab";
import type { Auth, State } from "@sparrow/common/types/workspace/collection-tab";
import { BehaviorSubject, type Observable } from "rxjs";
import { EnvironmentRepository } from "@app/repositories/environment.repository";
import type { EnvironmentLocalGlobalJoinBaseInterface } from "@sparrow/common/types/workspace/environment-base";
import { EnvironmentService } from "@app/services/environment.service";
import { GuestUserRepository } from "@app/repositories/guest-user.repository";
import { CollectionTabAdapter } from "@app/adapter";

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
        progressiveTab.id
      );
    
    const collection = rxCollection?.toMutableJSON();
    const collectionTab = new CollectionTabAdapter().adapt(progressiveTab.id, collection);
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
    else if (collectionTab.property.collection?.state.collectionAuthNavigation !== progressiveTab.property.collection?.state.collectionAuthNavigation) {
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
   * Debounced method to compare the current collection tab with the server collection.
   */
  private compareCollectionWithServer = new Debounce().debounce(
    this.compareCollectionWithServerDebounced,
    1000,
  );

  public get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

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
        const response = await this.environmentService.updateEnvironment(
          this._tab.getValue().path?.workspaceId as string,
          environmentVariables.global.id,
          payload,
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
        // api response
        const response = await this.environmentService.updateEnvironment(
          this._tab.getValue().path?.workspaceId as string,
          environmentVariables.local.id,
          payload,
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
  }

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
  public handleRename = async (
    _collectionName: string, event = ""
  ) => {
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
  }

  /**
   * Handles updating description of a collection.
   * @param _collectionDescription - the updated description of the collection.
   */
  public handleUpdateDescription = async (
    _collectionDescription: string,
  ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.description = _collectionDescription;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareCollectionWithServer();
    }

  /**
   * Handles saving a collection
   */
  public handleSaveCollection = async ( ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser == true) {
      await this.collectionRepository.updateCollection(
        progressiveTab.id,
        {
          description: progressiveTab.description,
          name: progressiveTab.name,
          auth: progressiveTab.property.collection.auth, 
          selectedAuthType : progressiveTab.property.collection.state.collectionAuthNavigation
        },
      );
      notifications.success(`The ‘${progressiveTab.name}’ collection saved successfully.`);
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;    
      this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      return;
    }
    const response = await this.collectionService.updateCollectionData(
      progressiveTab.id as string,
      progressiveTab.path.workspaceId as string,
      { description: progressiveTab.description, name: progressiveTab.name, auth: progressiveTab.property.collection.auth, 
        selectedAuthType : progressiveTab.property.collection.state.collectionAuthNavigation
       },
    );
    if (response.isSuccessful) {
      this.collectionRepository.updateCollection(
        progressiveTab.id as string,
        response.data.data,
      );
      notifications.success(`The ‘${progressiveTab.name}’ collection saved successfully.`);
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;    
      this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    } else {
      notifications.error("Failed to update description. Please try again.");
    }
    }
  
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
    };
  };

  /**
   *
   * @param collection - Collection in which request is going to be created
   * @returns
   */
  public handleCreateRequest = async (collection: CollectionDocument) => {
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
      moveNavigation("right");
      return;
    } else {
      response =
        await this.collectionService.addRequestInCollection(requestObj);
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
        moveNavigation("right");
        return;
      } else {
        notifications.error(response.message);
      }
    }
  };

  /**
   *
   * @param collection - Collection in which description going to be updated
   * @param newDescription - New description
   */
  // public handleUpdateDescription = async (
  //   collection: CollectionDocument,
  //   newDescription: string,
  // ) => {
  //   let isGuestUser;
  //   isGuestUserActive.subscribe((value) => {
  //     isGuestUser = value;
  //   });
  //   this.updateTab(this.tab.tabId as string, {
  //     persistence: TabPersistenceTypeEnum.PERMANENT,
  //   });
  //   if (isGuestUser == true) {
  //     await this.collectionRepository.updateCollection(
  //       collection.id as string,
  //       {
  //         description: newDescription,
  //       },
  //     );
  //     notifications.success("Description updated successfully.");
  //     return;
  //   }
  //   const response = await this.collectionService.updateCollectionData(
  //     collection.id as string,
  //     collection.workspaceId as string,
  //     { description: newDescription },
  //   );
  //   if (response.isSuccessful) {
  //     this.collectionRepository.updateCollection(
  //       collection.id as string,
  //       response.data.data,
  //     );
  //     const res = {
  //       data: { description: newDescription },
  //     };
  //     await this.collectionRepository.updateCollection(
  //       collection.id as string,
  //       res.data,
  //     );
  //     notifications.success("Description updated successfully.");
  //   } else if (response.message === "Network Error") {
  //     notifications.error(response.message);
  //   } else {
  //     notifications.error("Failed to update description. Please try again.");
  //   }
  // };

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };
}

export default CollectionExplorerPage;
