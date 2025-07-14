<script lang="ts">
  import { Route } from "svelte-navigator";
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { userValidationStore } from "@app/store/deviceSync.store";
  import { captureEvent } from "@app/utils/posthog/posthogConfig";
  // ---- Store
  import {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelCollapse,
    updateActiveSyncStates,
  } from "@sparrow/workspaces/stores";

  // ---- Animation
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "@app/constants";

  import { onDestroy, tick } from "svelte";
  // ---- Components
  import {
    RestExplorerPage,
    CollectionExplorerPage,
    FolderExplorerPage,
    WorkspaceExplorerPage,
    AiRequestExplorerPage,
  } from "..";
  import {
    TabBar,
    WorkspaceActions,
    ImportCollection,
    ImportCurl,
    WorkspaceDefault,
    SaveAsCollectionItem,
    WorkspaceTourGuide,
  } from "@sparrow/workspaces/features";
  import { WithModal } from "@sparrow/workspaces/hoc";
  import { notifications, Tooltip } from "@sparrow/library/ui";
  import { DownloadApp } from "@sparrow/common/features";

  // ---- Interface, enum & constants
  import { TeamRole, WorkspaceRole } from "@sparrow/common/enums/team.enum";

  // ---- View Model
  import CollectionsViewModel from "./CollectionPage.ViewModel";
  import { EnvironmentViewModel } from "@app/pages/workspace-page/EnvironmentPage.ViewModel";

  // ---- helpers
  import type { TabDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import { onMount } from "svelte";
  import { ItemType } from "@sparrow/common/enums";

  import type {
    CollectionDocument,
    EnvironmentDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import type { GithubRepoDocType } from "../../models/github-repo.model";
  import { Modal } from "@sparrow/library/ui";
  import { isGuestUserActive } from "@app/store/auth.store";
  import { pagesMotion } from "../../constants";
  import { user } from "@app/store/auth.store";
  import WebSocketExplorerPage from "./sub-pages/WebSocketExplorerPage/WebSocketExplorerPage.svelte";
  import { TabTypeEnum } from "@sparrow/common/types/workspace/tab";
  import { type Tab } from "@sparrow/common/types/workspace/tab";
  import EnvironmentExplorerPage from "./sub-pages/EnvironmentExplorer/EnvironmentExplorerPage.svelte";
  import TestFlowExplorerPage from "./sub-pages/TestflowExplorerPage/TestflowExplorerPage.svelte";
  import { TestflowViewModel } from "./Testflow.ViewModel";
  // import { version } from "../../../src-tauri/tauri.conf.json";
  import { Button } from "@sparrow/library/ui";
  import { isUserFirstSignUp } from "@app/store/user.store";
  import { WelcomeLogo } from "@sparrow/common/images";
  import { WelcomePopup } from "@sparrow/workspaces/features";
  import SocketIoExplorerPage from "./sub-pages/SocketIoExplorerPage/SocketIoExplorerPage.svelte";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
  import GraphqlExplorerPage from "./sub-pages/GraphqlExplorerPage/GraphqlExplorerPage.svelte";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";
  import constants from "src/constants/constants";
  import {
    isExpandCollection,
    isExpandEnvironment,
    isExpandTestflow,
  } from "@sparrow/workspaces/stores";
  import {
    defaultCurrentStep,
    isDefaultTourGuideOpen,
    isDefaultTourGuideClose,
  } from "@sparrow/workspaces/stores";
  import RestExplorerSavedPage from "./sub-pages/RestExplorerSavedPage/RestExplorerSavedPage.svelte";
  import { writable } from "svelte/store";

  import { Checkbox } from "@sparrow/library/forms";
  import * as Sentry from "@sentry/svelte";
  import { Spinner } from "@sparrow/library/ui";
  import { OpenRegular } from "@sparrow/library/icons";
  import RestExplorerMockPage from "./sub-pages/RestExplorerMockPage/RestExplorerMockPage.svelte";
  import MockHistoryExplorerPage from "./sub-pages/MockHistroyExplorerPage/MockHistoryExplorerPage.svelte";
  import HubExplorerPage from "./sub-pages/HubExplorerPage/HubExplorerPage.svelte";
  import { PlanUpgradeModal } from "@sparrow/common/components";
  import { planInfoByRole, planContentDisable } from "@sparrow/common/utils";
  import { ResponseMessage } from "@sparrow/common/enums";
  import { shouldRunThrottled } from "@sparrow/common/store";
  const _viewModel = new CollectionsViewModel();

  const _viewModel2 = new EnvironmentViewModel();
  const _viewModel3 = new TestflowViewModel();

  let currentWorkspace: Observable<WorkspaceDocument> =
    _viewModel.getActiveWorkspace();
  let collectionList: Observable<CollectionDocument[]> =
    _viewModel.getCollectionList();

  let removeTab: Tab;
  let isPopupClosed: boolean = false;

  // Tab Controls Properties - st
  let isForceCloseTabPopupOpen: boolean = false;
  let tabsToForceClose: Tab[] = [];
  let tabIdWhoRecivedForceClose: string;
  let noOfNotSavedTabsWhileForClose = 0;
  let isUserDontWantForceClosePopup: boolean = false;
  // Tab Controls Properties - st

  let isImportCollectionPopup: boolean = false;
  let isImportCurlPopup: boolean = false;
  let loader = false;
  let splitter: HTMLElement | null;
  let isExposeSaveAsRequest: boolean = false;
  let isAppVersionVisible = true;
  let isGuestUser = false;
  let userId = "";
  let userRole = "";
  let teamDetails: any;

  // let isExpandEnvironment = false;
  // let isExpandTestflow = false;
  let isFirstCollectionExpand = false;

  let localEnvironment;
  let globalEnvironment;
  // let hasSetInitialEnvironment = false;

  let environments = _viewModel2.environments;
  let totalCollectionCount = writable(0);
  let totalTeamCount = 0;

  let environmentsValues;
  let currentWOrkspaceValue: Observable<WorkspaceDocument>;
  const externalSparrowGithub = constants.SPARROW_GITHUB;

  const environmentSubscriber = environments.subscribe((value) => {
    if (value) {
      environmentsValues = value;
    }
  });

  const currentWorkspaceSubscriber = currentWorkspace.subscribe((value) => {
    if (value) {
      currentWOrkspaceValue = value;
    }
  });

  const navigateToGithub = async () => {
    await open(externalSparrowGithub);
  };

  const mapEnvironmentToWorkspace = (_env, _workspaceId) => {
    if (_env && _workspaceId) {
      localEnvironment = [];
      globalEnvironment = [];
      environmentsValues
        .filter((element) => {
          return element.workspaceId === _workspaceId;
        })
        .forEach((element) => {
          const _element = element.toMutableJSON();
          if (_element.type === "GLOBAL") {
            globalEnvironment.push(_element);
          } else if (_element.type === "LOCAL") {
            localEnvironment.push(_element);
          }
        });
    }
  };

  $: {
    if (environmentsValues || currentWOrkspaceValue?._id) {
      mapEnvironmentToWorkspace(environmentsValues, currentWOrkspaceValue?._id);
    }
  }

  // Rolling back the changes for auto select environment - Require Fix
  ///////////////////////////////////////////////////////
  // Auto select environment for the first time - st
  //////////////////////////////////////////////////////
  // $: {
  //   // Set the first environment by default from the list if no env. already set.
  //   if (!hasSetInitialEnvironment && localEnvironment?.length > 0) {
  //     setInitialEnvironment();
  //   }
  // }

  // // Function to handle default environment selection
  // async function setInitialEnvironment() {
  //   if (hasSetInitialEnvironment) return;
  //   const currActiveEnv = currentWOrkspaceValue.environmentId;
  //   if (!currActiveEnv)
  //     await _viewModel2.onSelectEnvironment(localEnvironment[0]);
  //   hasSetInitialEnvironment = true;
  // }
  // // Auto select environment for the first time - End

  let onCreateEnvironment = _viewModel2.onCreateEnvironment;

  async function handleCreateEnvironment() {
    if (!$isExpandEnvironment) {
      isExpandEnvironment.update((value) => !value);
    }

    await onCreateEnvironment(localEnvironment);
    scrollList("bottom");
  }

  const isGuestUserSubscriber = isGuestUserActive.subscribe((value) => {
    isGuestUser = value;
  });

  const userSubscriber = user.subscribe((value) => {
    userId = value?._id;
  });

  /**
   * @description - handles different key press
   * @param event - keyboard events
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.code === "KeyN") {
      _viewModel.createNewTab();
    }
  };

  /**
   * Handle close tab functionality in tab bar list
   */
  const closeTab = async (id: string, tab: Tab) => {
    if (userRole === WorkspaceRole.WORKSPACE_VIEWER) {
      _viewModel.handleRemoveTab(id);
      return;
    }
    if (
      (tab?.type === TabTypeEnum.REQUEST ||
        tab?.type === TabTypeEnum.WEB_SOCKET ||
        tab?.type === TabTypeEnum.ENVIRONMENT ||
        tab?.type === TabTypeEnum.TESTFLOW ||
        tab?.type === TabTypeEnum.SOCKET_IO ||
        tab?.type === TabTypeEnum.SAVED_REQUEST ||
        tab?.type === TabTypeEnum.MOCK_REQUEST ||
        tab?.type === TabTypeEnum.AI_REQUEST ||
        tab?.type === TabTypeEnum.COLLECTION ||
        tab?.type === TabTypeEnum.FOLDER ||
        tab?.type === TabTypeEnum.WORKSPACE ||
        tab?.type === TabTypeEnum.GRAPHQL) &&
      !tab?.isSaved
    ) {
      if (tab?.source !== "SPEC" || !tab?.activeSync || tab?.isDeleted) {
        removeTab = tab;
        isPopupClosed = true;

        // Wait for the popup to close before proceeding (check for user input)
        await new Promise<void>((resolve) => {
          const checkIfPopupClosed = setInterval(() => {
            if (!isPopupClosed) {
              clearInterval(checkIfPopupClosed);
              resolve();
            }
          }, 300);
        });

        return;
      } else {
        _viewModel.handleRemoveTab(id);
        return;
      }
    } else {
      _viewModel.handleRemoveTab(id);
    }
  };
  const softCloseTabs = async (currentTabId: string) => {
    const savedTabs = [];
    const unSavedTabs = [];
    for (const tab of $tabList) {
      if (tab.id !== currentTabId) {
        if (tab.isSaved) savedTabs.push(tab.tabId);
        else unSavedTabs.push(tab);
      }
    }

    const wsId = currentWOrkspaceValue._id;
    if (userRole === WorkspaceRole.WORKSPACE_VIEWER) {
      forceCloseTabs(currentTabId);
      return;
    }
    _viewModel.deleteTabsWithTabIdInAWorkspace(wsId, savedTabs);
    for (let tab of unSavedTabs) {
      // Wait for user confirmation before moving to the next tab
      await closeTab(tab.id, tab);
    }
  };
  // Methods for Tab Controls - start
  const tabsForceCloseInitiator = (currentTabId: string) => {
    // For viewer role, directly force close without popup
    if (userRole === WorkspaceRole.WORKSPACE_VIEWER) {
      forceCloseTabs(currentTabId);
      return;
    }

    tabsToForceClose = $tabList;
    tabIdWhoRecivedForceClose = currentTabId;

    noOfNotSavedTabsWhileForClose = 0;
    $tabList?.forEach((tab: Tab) => {
      if (tab.id !== currentTabId) {
        if (!tab?.isSaved) {
          noOfNotSavedTabsWhileForClose += 1;
        }
      }
    });

    if (noOfNotSavedTabsWhileForClose > 0) {
      if (isUserDontWantForceClosePopup) {
        forceCloseTabs(currentTabId);
        isForceCloseTabPopupOpen = false;
        noOfNotSavedTabsWhileForClose = 0;
        return;
      }
      isForceCloseTabPopupOpen = true;
    } else forceCloseTabs(currentTabId);
  };
  const forceCloseTabs = async (currentTabId: string) => {
    const tabsToClose = [];
    for (const tab of $tabList) {
      if (tab.id !== currentTabId) tabsToClose.push(tab.tabId);
    }
    const wsId = currentWOrkspaceValue._id;
    _viewModel.deleteTabsWithTabIdInAWorkspace(wsId, tabsToClose);
  };

  const handleTabDuplication = (tabId: string) => {
    _viewModel.createDuplicateTabByTabId(tabId);
  };
  // Methods for Tab Controls - End

  const handleClosePopupBackdrop = (flag: boolean) => {
    isPopupClosed = flag;
  };

  const handlePopupDiscard = () => {
    _viewModel.handleRemoveTab(removeTab.id);
    isPopupClosed = false;
  };

  const handleForceClosePopupBackdrop = (flag: boolean) => {
    isForceCloseTabPopupOpen = flag;
  };

  /**
   * Handle save functionality on close confirmation popup
   */

  const handlecollection_document_response = ({
    event_name,
  }: {
    event_name: string;
  }) => {
    captureEvent("document_response", {
      component: "CollectionsPage",
      button_text: event_name,
      destination: event_name,
    });
  };

  const handlePopupSave = async () => {
    if (
      removeTab.type === TabTypeEnum.ENVIRONMENT ||
      removeTab.type === TabTypeEnum.TESTFLOW ||
      removeTab.type === TabTypeEnum.COLLECTION ||
      removeTab.type === TabTypeEnum.WORKSPACE
    ) {
      if (removeTab?.path.workspaceId) {
        const id = removeTab?.id;
        loader = true;
        if (removeTab.type === TabTypeEnum.ENVIRONMENT) {
          const res = await _viewModel2.saveEnvironment(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
          }
        } else if (removeTab.type === TabTypeEnum.TESTFLOW) {
          const res = await _viewModel3.saveTestflow(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
          }
        } else if (removeTab.type === TabTypeEnum.COLLECTION) {
          const res = await _viewModel.saveCollection(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
          }
        } else if (removeTab.type === TabTypeEnum.WORKSPACE) {
          const res = await _viewModel.saveWorkspace(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
          }
        }
        loader = false;
      }
    } else if (
      removeTab.type === TabTypeEnum.REQUEST ||
      removeTab.type === TabTypeEnum.WEB_SOCKET ||
      removeTab.type === TabTypeEnum.SOCKET_IO ||
      removeTab.type === TabTypeEnum.SAVED_REQUEST ||
      removeTab.type === TabTypeEnum.MOCK_REQUEST ||
      removeTab.type === TabTypeEnum.AI_REQUEST ||
      removeTab.type === TabTypeEnum.GRAPHQL ||
      removeTab.type === TabTypeEnum.FOLDER
    ) {
      if (removeTab?.path.collectionId && removeTab?.path.workspaceId) {
        const id = removeTab?.id;
        loader = true;

        if (removeTab.type === TabTypeEnum.REQUEST) {
          const res = await _viewModel.saveAPIRequest(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
            notifications.success("API request saved successfully.");
          }
        } else if (removeTab.type === TabTypeEnum.MOCK_REQUEST) {
          const res = await _viewModel.saveMockAPIRequest(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
            notifications.success("Mock Request saved successfully.");
          }
        } else if (removeTab.type === TabTypeEnum.AI_REQUEST) {
          const res = await _viewModel.saveAiRequest(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
            notifications.success("AI Request saved successfully.");
          }
        } else if (removeTab.type === TabTypeEnum.SAVED_REQUEST) {
          const res = await _viewModel.saveSavedRequest(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
          }
        } else if (removeTab.type === TabTypeEnum.FOLDER) {
          const res = await _viewModel.saveFolder(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
          }
        } else if (removeTab.type === TabTypeEnum.WEB_SOCKET) {
          const res = await _viewModel.saveSocket(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
            notifications.success("WebSocket request saved successfully.");
          }
        } else if (removeTab.type === TabTypeEnum.SOCKET_IO) {
          const res = await _viewModel.saveSocketIo(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
            notifications.success(
              `${SocketIORequestDefaultAliasBaseEnum.NAME} request saved successfully.`,
            );
          }
        } else if (removeTab.type === TabTypeEnum.GRAPHQL) {
          const res = await _viewModel.saveGraphql(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
            notifications.success(
              `${GraphqlRequestDefaultAliasBaseEnum.NAME} request saved successfully.`,
            );
          }
        }
        loader = false;
      } else {
        isPopupClosed = false;
        isExposeSaveAsRequest = true;
      }
    }
  };

  const handleCollapseCollectionList = () => {
    leftPanelCollapse.set(!$leftPanelCollapse);
  };

  let scrollList;

  let githubRepoData: GithubRepoDocType;
  onMount(async () => {
    let githubRepo = await _viewModel.getGithubRepo();
    githubRepoData = githubRepo?.getLatest().toMutableJSON();
    splitter = document.querySelector(
      ".collection-splitter .splitpanes__splitter",
    );

    await _viewModel.fetchGithubRepo();
    githubRepo = await _viewModel.getGithubRepo();
    githubRepoData = githubRepo?.getLatest().toMutableJSON();
    //Disabling the version feature switch as it was just for testing purpose, can be used for implementation example
    // const feature = await _viewModel.getFeatureStatus({ name: "appVersion" });
    // if (feature) {
    //   isAppVersionVisible = feature.getLatest().toMutableJSON().isEnabled;
    // }
  });

  /**
   * Refreshing collection whenever workspace switches
   */
  let tabList: Observable<TabDocument[]> | undefined;
  let activeTab: Observable<TabDocument | null> | undefined;
  let prevWorkspaceId = "";
  let count = 0;

  let autoRefreshEnable: boolean = true;
  let refreshLoad: boolean = false;

  let isAccessDeniedModalOpen = false;
  let isSyncReplaceModalOpen = false;
  let isSyncModalOpen = false;
  let isCollectionSyncing = false;
  let isReplaceCollectionModalOpen = false;

  // Add userValidation state
  let userValidation = {
    isValid: true,
    checked: false,
  };

  // handle all the refresh api calls
  const handleRefreshApicalls = async (workspaceId: string) => {
    try {
      const [
        fetchCollectionsResult,
        refreshEnvironmentResult,
        refreshTestflowResult,
      ] = await Promise.all([
        _viewModel.fetchCollections(workspaceId),
        _viewModel2.refreshEnvironment(workspaceId),
        _viewModel3.refreshTestflow(workspaceId),
      ]);
      await tick();
      const collectionTabsToBeDeleted =
        fetchCollectionsResult?.collectionItemTabsToBeDeleted || [];
      const environmentTabsToBeDeleted =
        refreshEnvironmentResult?.environmentTabsToBeDeleted || [];
      const testflowTabsToBeDeleted =
        refreshTestflowResult?.testflowTabsToBeDeleted || [];

      const totalTabsToBeDeleted = [
        ...collectionTabsToBeDeleted,
        ...environmentTabsToBeDeleted,
        ...testflowTabsToBeDeleted,
      ];
      _viewModel.deleteTabsWithTabIdInAWorkspace(
        workspaceId,
        totalTabsToBeDeleted,
      );
      refreshLoad = false;
    } catch (error) {
      refreshLoad = false;
    }
  };

  const handleLimits = async () => {
    if ($currentWorkspace?._data?.team?.teamId) {
      const data = await _viewModel.userPlanLimits(
        $currentWorkspace?._data?.team?.teamId,
      );
      userLimits = data;
    }
  };

  let isInitialDataLoading = true;

  const userValidationStoreSubscriber = userValidationStore.subscribe(
    (validation) => {
      if (!validation.isValid) {
        isAccessDeniedModalOpen = true;
        isWelcomePopupOpen = false;
      }
    },
  );

  const cw = currentWorkspace.subscribe(async (value) => {
    if (value) {
      if (prevWorkspaceId !== value._id) {
        isInitialDataLoading = true;
        activeTab = undefined;

        if (value?._id && shouldRunThrottled(value?._id)) {
          handleRefreshApicalls(value?._id);
        } else {
          console.error(`Throttled for ${value?._id}`);
        }

        teamDetails = {
          teamId: value?._data?.team?.teamId || "",
          teamName: value?._data?.team?.teamName || "",
          teamOwnerEmail: value?._data?.users[0]?.email,
        };
        if (teamDetails.teamId) {
          handleLimits();
        }
        tabList = _viewModel.getTabListWithWorkspaceId(value._id);
        activeTab = _viewModel.getActiveTab(value._id);
        totalTeamCount = value._data?.users?.length || 0;

        isInitialDataLoading = false;
      }
      prevWorkspaceId = value._id;
      if (count == 0) {
        let url = window.location.href;
        const params = new URLSearchParams(url.split("?")[1]);
        const isNew = params.get("first");
        if (isNew === "true") _viewModel.createNewTabWithData();
        count = count + 1;
      }
      value.users?.forEach((user) => {
        if (user.id === userId) {
          userRole = user.role as string;
        }
      });
    }
  });

  const handleAccessDeniedClose = () => {
    isAccessDeniedModalOpen = false;
    // Optionally reset the validation state
    userValidationStore.set({ isValid: true, checked: false });
  };
  $: {
    if (splitter && $leftPanelCollapse === true) {
      splitter.style.display = "none";
    }
    if (splitter && $leftPanelCollapse === false) {
      splitter.style.display = "unset";
    }
  }

  let isWelcomePopupOpen = false;
  let isTourGuideOpen = false;

  const isUserFirstSignUpSubscriber = isUserFirstSignUp.subscribe((value) => {
    if (value) {
      isWelcomePopupOpen = value;
      isExpandCollection.set(value);
      isExpandEnvironment.set(value);
      isFirstCollectionExpand = value;
    }
  });

  onDestroy(() => {
    cw.unsubscribe();
    userValidationStoreSubscriber();
    environmentSubscriber.unsubscribe();
    currentWorkspaceSubscriber.unsubscribe();
    isGuestUserSubscriber();
    userSubscriber();
    collectionListSubscriber.unsubscribe();
    isUserFirstSignUpSubscriber();
  });

  let isLaunchAppModalOpen = false;

  const launchSparrowWebApp = () => {
    let appDetected = false;

    // Handle when window loses focus (app opens)
    const handleBlur = () => {
      appDetected = true;
      window.removeEventListener("blur", handleBlur);
      clearTimeout(detectAppTimeout);
    };

    window.addEventListener("blur", handleBlur);

    // Try to open the app
    _viewModel.setupRedirect();

    // Check if app opened after a short delay
    const detectAppTimeout = setTimeout(() => {
      window.removeEventListener("blur", handleBlur);

      // Only show popup if app wasn't detected
      if (!appDetected) {
        isLaunchAppModalOpen = true;
      }
    }, 500);
  };
  let tourGuideCollectionId;
  const collectionListSubscriber = collectionList.subscribe((collections) => {
    let count = 0;
    collections.forEach((collection, index) => {
      const collectionData = collection.toMutableJSON();
      if (index === 0) {
        tourGuideCollectionId = collectionData.id;
      }
      count += collectionData.items.length || 0;
    });
    totalCollectionCount.set(count);
  });

  let refreshInterval: NodeJS.Timeout | null = null;

  //main handle function which performs refresh workspace API calls and This will refresh the workspace only if the user count is great than one.
  const handleRefreshWorkspace = () => {
    if (!currentWorkspace) return;
    refreshLoad = true;
    if (totalTeamCount > 1) {
      handleRefreshApicalls($currentWorkspace?._id);
    }
  };

  // It will autorefresh the handle function of refresh in 2 minutes interval Time.
  const startAutoRefresh = (): void => {
    if (!autoRefreshEnable) {
      return;
    }
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    refreshInterval = setInterval(
      () => {
        handleRefreshWorkspace();
      },
      2 * 60 * 1000,
    );
  };

  const refreshWorkspace = (): void => {
    handleRefreshWorkspace();
    startAutoRefresh();
  };

  onMount(() => {
    startAutoRefresh();
  });

  const truncateTabName = (name: string, maxLength = 15) => {
    if (!name) return "Untitled";
    return name.length > maxLength
      ? `${name.substring(0, maxLength)}...`
      : name;
  };

  let activeSyncChanges = {
    addedCount: 0,
    deletedCount: 0,
    modifiedCount: 0,
    percentChange: 0,
    added: [],
    deleted: [],
    modified: [],
    name: "",
    collectionId: "",
  };
  let isSyncChangesAvailable = false;
  const handleSyncCollection = async (collectionId: string) => {
    activeSyncChanges = await _viewModel.handleCompareCollection(collectionId);
    if (activeSyncChanges?.percentChange > 75) {
      isSyncReplaceModalOpen = true;
      updateActiveSyncStates(collectionId, {
        isChangesAvailable: true,
        isloading: false,
      });
    } else if (activeSyncChanges?.percentChange > 25) {
      isSyncModalOpen = true;
      updateActiveSyncStates(collectionId, {
        isChangesAvailable: true,
        isloading: false,
      });
    } else if (activeSyncChanges?.percentChange > 0) {
      updateActiveSyncStates(collectionId, {
        isChangesAvailable: false,
        isloading: true,
      });
      await _viewModel.syncCollection(collectionId);
      updateActiveSyncStates(collectionId, {
        isChangesAvailable: false,
        isloading: false,
      });
    } else {
      updateActiveSyncStates(collectionId, {
        isChangesAvailable: false,
        isloading: true,
      });
      await _viewModel.syncCollection(collectionId);
      updateActiveSyncStates(collectionId, {
        isChangesAvailable: false,
        isloading: false,
      });
    }
  };

  let mockCollectionUrl: string;
  let isMockURLModelOpen: boolean;
  const handleMockCollectionModel = (url: string) => {
    mockCollectionUrl = url;
    isMockURLModelOpen = true;
  };

  let createMockCollection = false;
  let currentCollectionId: string;
  let currentWorkspaceId: string;
  let isCreateMockCollectionPopup: boolean;
  const handleCreateMockCollectionModel = (
    collectionId: string,
    workspaceId: string,
  ) => {
    currentCollectionId = collectionId;
    currentWorkspaceId = workspaceId;
    isCreateMockCollectionPopup = true;
  };
  let userLimits: any;
  let upgradePlanModel: boolean = false;
  let isActiveSyncPlanModalOpen = false;
  let planContent: any;
  let planContentNonActive: any;
  let currentTestflow: number = 3;

  const handleCreateTestflowCheck = async () => {
    currentTestflow = await _viewModel3.currentTestflowCount(
      $currentWorkspace?._id,
    );
    const response = await _viewModel3.handleCreateTestflow();
    handleLimits();
    if (response?.data?.message === ResponseMessage.PLAN_LIMIT_MESSAGE) {
      upgradePlanModel = true;
    }
  };

  const handleRequestOwner = async () => {
    if ($currentWorkspace?._data?.team?.teamId) {
      await _viewModel.requestToUpgradePlan(
        $currentWorkspace?._data?.team?.teamId,
      );
      upgradePlanModel = false;
    }
  };

  const handleRedirectToAdminPanel = async () => {
    if ($currentWorkspace?._data?.team?.teamId) {
      await _viewModel.handleRedirectToAdminPanel(
        $currentWorkspace?._data?.team?.teamId,
      );
      upgradePlanModel = false;
    }
  };

  $: {
    handleLimits();
    if (userRole) {
      planContent = planInfoByRole(userRole);
      planContentNonActive = planContentDisable();
    }
  }
</script>

<Motion {...pagesMotion} let:motion>
  <div class="h-100" use:motion>
    <Splitpanes
      class="collection-splitter h-100"
      style="width: calc(100vw - 54px)"
      on:resize={(e) => {
        leftPanelWidth.set(e.detail[0].size);
        rightPanelWidth.set(e.detail[1].size);
      }}
    >
      <Pane
        size={$leftPanelCollapse ? 0 : $leftPanelWidth}
        minSize={20}
        class="bg-secondary-900-important"
      >
        <WorkspaceActions
          bind:scrollList
          bind:userRole
          userCount={totalTeamCount}
          {refreshWorkspace}
          {refreshLoad}
          {collectionList}
          {currentWorkspace}
          {navigateToGithub}
          {isAppVersionVisible}
          {launchSparrowWebApp}
          {isGuestUser}
          leftPanelController={{
            leftPanelCollapse: $leftPanelCollapse,
            handleCollapseCollectionList,
          }}
          githubRepo={githubRepoData}
          userRoleInWorkspace={() => {
            return WorkspaceRole.WORKSPACE_ADMIN;
          }}
          activeTabPath={$activeTab?.path}
          activeTabId={$activeTab?.id}
          activeTabType={$activeTab?.type}
          showImportCollectionPopup={() => (isImportCollectionPopup = true)}
          showImportCurlPopup={() => (isImportCurlPopup = true)}
          onItemCreated={_viewModel.handleCreateItem}
          onItemDeleted={_viewModel.handleDeleteItem}
          onItemRenamed={_viewModel.handleRenameItem}
          onItemOpened={_viewModel.handleOpenItem}
          onBranchSwitched={_viewModel.handleBranchSwitch}
          onRefetchCollection={_viewModel.handleRefetchCollection}
          onSearchCollection={_viewModel.handleSearchCollection}
          environments={_viewModel2.environments}
          onCreateEnvironment={_viewModel2.onCreateEnvironment}
          onOpenGlobalEnvironment={_viewModel2.onOpenGlobalEnvironment}
          onDeleteEnvironment={_viewModel2.onDeleteEnvironment}
          onUpdateEnvironment={_viewModel2.onUpdateEnvironment}
          onOpenEnvironment={_viewModel2.onOpenEnvironment}
          onSelectEnvironment={_viewModel2.onSelectEnvironment}
          onCreateTestflow={handleCreateTestflowCheck}
          testflows={_viewModel3.testflows}
          onDeleteTestflow={_viewModel3.handleDeleteTestflow}
          onUpdateTestflow={_viewModel3.handleUpdateTestflow}
          onOpenTestflow={_viewModel3.handleOpenTestflow}
          bind:isFirstCollectionExpand
          appVersion={"version"}
          isWebApp={true}
          onCompareCollection={_viewModel.handleCompareCollection}
          onSyncCollection={handleSyncCollection}
          onUpdateRunningState={_viewModel.handleMockCollectionState}
          onOpenWorkspace={_viewModel.handleOpenWorkspace}
          onCreateMockCollection={handleCreateMockCollectionModel}
        />
      </Pane>
      <Pane
        size={$leftPanelCollapse ? 100 : $rightPanelWidth}
        minSize={60}
        class="bg-secondary-800-important"
      >
        <section
          class="d-flex flex-column h-100"
          style="background-color:var(--bg-ds-surface-900)"
        >
          {#if isInitialDataLoading}
            <div class="h-100 d-flex align-items-center justify-content-center">
              <Spinner size={"32px"} />
            </div>
          {:else}
            <TabBar
              tabList={$tabList}
              {isGuestUser}
              onNewTabRequested={_viewModel.createNewTab}
              onTabClosed={closeTab}
              onDropEvent={_viewModel.onDropEvent}
              onDragStart={_viewModel.handleDropOnStart}
              onDropOver={_viewModel.handleDropOnEnd}
              onTabSelected={_viewModel.handleActiveTab}
              onChangeViewInRequest={_viewModel.handleOnChangeViewInRequest}
              onFetchCollectionGuide={_viewModel.fetchCollectionGuide}
              onUpdateCollectionGuide={_viewModel.updateCollectionGuide}
              onDoubleClick={_viewModel.handleTabTypeChange}
              onClickCloseOtherTabs={softCloseTabs}
              onClickForceCloseTabs={tabsForceCloseInitiator}
              onClickDuplicateTab={handleTabDuplication}
              {userRole}
            />
            <div style="flex:1; overflow: hidden;">
              <Route>
                {#if true}
                  {#if $activeTab?.type === ItemType.REQUEST}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <RestExplorerPage
                          bind:isTourGuideOpen
                          tab={$activeTab}
                        />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === ItemType.AI_REQUEST}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <AiRequestExplorerPage tab={$activeTab} />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === ItemType.COLLECTION}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <CollectionExplorerPage
                          tab={$activeTab}
                          onSyncCollection={handleSyncCollection}
                          onMockCollectionModelOpen={handleMockCollectionModel}
                        />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === ItemType.FOLDER}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <FolderExplorerPage tab={$activeTab} />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === ItemType.ENVIRONMENT}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <EnvironmentExplorerPage tab={$activeTab} />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === ItemType.WORKSPACE}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <WorkspaceExplorerPage
                          {collectionList}
                          tab={$activeTab}
                          {teamDetails}
                        />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === ItemType.WEB_SOCKET}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <WebSocketExplorerPage tab={$activeTab} />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === ItemType.TESTFLOW}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <TestFlowExplorerPage
                          tab={$activeTab}
                          {teamDetails}
                          bind:upgradePlanModel
                        />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === ItemType.SOCKET_IO}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <SocketIoExplorerPage tab={$activeTab} />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === TabTypeEnum.SAVED_REQUEST}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <RestExplorerSavedPage tab={$activeTab} />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === ItemType.GRAPHQL}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <GraphqlExplorerPage tab={$activeTab} />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === TabTypeEnum.MOCK_REQUEST}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <RestExplorerMockPage
                          bind:isTourGuideOpen
                          tab={$activeTab}
                        />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === TabTypeEnum.MOCK_HISTORY}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <MockHistoryExplorerPage tab={$activeTab} />
                      </div>
                    </Motion>
                  {:else if $activeTab?.type === TabTypeEnum.HUB}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <HubExplorerPage tab={$activeTab} />
                      </div>
                    </Motion>
                  {:else if !$tabList?.length}
                    <Motion {...scaleMotionProps} let:motion>
                      <div class="h-100">
                        <WorkspaceDefault
                          {currentWorkspace}
                          {handleCreateEnvironment}
                          onCreateTestflow={() => {
                            handleCreateTestflowCheck();
                            isExpandTestflow.set(true);
                          }}
                          showImportCollectionPopup={() =>
                            (isImportCollectionPopup = true)}
                          onItemCreated={_viewModel.handleCreateItem}
                          {isGuestUser}
                          {userRole}
                          isWebApp={true}
                        />
                      </div>
                    </Motion>
                  {/if}
                {/if}
              </Route>
            </div>
          {/if}
        </section>
      </Pane>
    </Splitpanes>
  </div>
</Motion>

<!-- Force Close Popup -->
<!-- {#if isForceCloseTabPopupOpen} -->
<Modal
  title={"Force Close!"}
  type={"danger"}
  zIndex={1000}
  isOpen={isForceCloseTabPopupOpen}
  width={"35%"}
  handleModalState={handleForceClosePopupBackdrop}
>
  <div class="text-lightGray mb-1 sparrow-fs-14">
    <p>
      <span class="text-whiteColor fw-bold"
        >{noOfNotSavedTabsWhileForClose} Tabs
      </span>
      have unsaved changes. Force closing will discard your edits, and you won’t
      be able to recover them. Are you sure you want to proceed?
    </p>
  </div>

  <div class="d-flex align-items-center gap-1 sparrow-fs-14 mb-3">
    <Checkbox
      size={"large"}
      bind:checked={isUserDontWantForceClosePopup}
      on:input={() => {
        isUserDontWantForceClosePopup = !isUserDontWantForceClosePopup;
      }}
      disabled={false}
    />
    <p class="m-0">I understand, don't show this again.</p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
  >
    <Button
      title="Don't Close"
      textStyleProp={"font-size: var(--base-text)"}
      type={"secondary"}
      onClick={() => {
        "click dont save";
        handleForceClosePopupBackdrop(false);
      }}
    ></Button>
    <Button
      title="Force Close"
      textStyleProp={"font-size: var(--base-text)"}
      type={"danger"}
      onClick={() => {
        "click dont save";
        forceCloseTabs(tabIdWhoRecivedForceClose);
        isForceCloseTabPopupOpen = false;
        noOfNotSavedTabsWhileForClose = 0;
      }}
    ></Button>
  </div>
</Modal>
<!-- {/if} -->

<!-- Save Changes for API Popup -- New -->
<Modal
  title={"Unsaved Changes!"}
  type={"dark"}
  zIndex={1000}
  isOpen={isPopupClosed}
  width={"35%"}
  handleModalState={() => handleClosePopupBackdrop(false)}
>
  <div class="mt-2 mb-4">
    <p class="lightGray text-fs-14" style="color: lightGray;">
      Do you want to save changes in this tab “<span
        class="text-whiteColor fw-bold"
      >
        {!removeTab ? "Untitled" : truncateTabName(removeTab.name, 25)}</span
      >”? Changes will be lost in case you choose not to save.
    </p>
  </div>

  <div class="d-flex justify-content-end gap-2">
    <Button
      title={"Don't Save"}
      textClassProp={"fs-6"}
      size={"medium"}
      customWidth={"95px"}
      type={"secondary"}
      onClick={() => {
        handlePopupDiscard();
      }}
    ></Button>
    <Button
      title={"Save"}
      size={"medium"}
      textClassProp={"fs-6"}
      type={"primary"}
      customWidth={"95px"}
      disable={userRole === WorkspaceRole.WORKSPACE_VIEWER}
      onClick={() => {
        handlecollection_document_response({
          event_name: "Response Doc Saved!",
        });
        handlePopupSave();
      }}
    ></Button>
  </div>
</Modal>

<Modal
  title={""}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isWelcomePopupOpen}
  handleModalState={() => {
    isUserFirstSignUp.set(false);
    isWelcomePopupOpen = false;
  }}
>
  <WelcomePopup
    loader={$totalCollectionCount > 0 ? false : true}
    onClickExplore={() => {
      isUserFirstSignUp.set(false);
      isWelcomePopupOpen = false;
      isDefaultTourGuideClose.set(true);
    }}
    onClickTour={() => {
      isUserFirstSignUp.set(false);
      isWelcomePopupOpen = false;
      defaultCurrentStep.set(1);
      isDefaultTourGuideOpen.set(true);
    }}
    {tourGuideCollectionId}
  />
</Modal>
<WorkspaceTourGuide />
{#if isAccessDeniedModalOpen}
  <Modal
    title="Access Denied"
    type="dark"
    width="50%"
    zIndex={1000}
    isOpen={isAccessDeniedModalOpen}
    handleModalState={handleAccessDeniedClose}
  >
    <div class="py-4">
      <p class=" mb-4">
        You don't seem to have access to this resource. Please check if you are
        using the right account.
      </p>
    </div>
  </Modal>
{/if}

<svelte:window on:keydown={handleKeyPress} />

<Modal
  title={"New Collection"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isImportCollectionPopup}
  handleModalState={(flag = false) => {
    isImportCollectionPopup = flag;
  }}
>
  <ImportCollection
    onCloseModal={() => {
      isImportCollectionPopup = false;
    }}
    {collectionList}
    onItemCreated={async (entityType, args) => {
      const response = await _viewModel.handleCreateItem(entityType, args);
      if (response.isSuccessful) {
        setTimeout(() => {
          scrollList("bottom");
          isExpandCollection.set(true);
        }, 1000);
      }
    }}
    currentWorkspaceId={$currentWorkspace?._id}
    onImportOapiText={async (
      currentWorkspaceId,
      importJSON,
      contentType,
      activeSyncEnabled,
      importData,
    ) => {
      const response = await _viewModel.importJSONObject(
        currentWorkspaceId,
        importJSON,
        contentType,
        activeSyncEnabled,
        importData,
      );
      if (response.isSuccessful) {
        setTimeout(() => {
          scrollList("bottom");
        }, 1000);
      }
      return response;
    }}
    onImportOapiFile={async (currentWorkspaceId, file, type) => {
      const response = await _viewModel.collectionFileUpload(
        currentWorkspaceId,
        file,
        type,
      );
      if (response.isSuccessful) {
        setTimeout(() => {
          scrollList("bottom");
        }, 1000);
      }
      return response;
    }}
    onImportCollectionURL={async (
      currentWorkspaceId,
      requestBody,
      activeSync,
    ) => {
      const response = await _viewModel.importCollectionURL(
        currentWorkspaceId,
        requestBody,
        activeSync,
      );
      if (response.isSuccessful) {
        setTimeout(() => {
          scrollList("bottom");
        }, 1000);
      }
      return response;
    }}
    onGetOapiTextFromURL={_viewModel.getOapiJsonFromURL}
    onValidateOapiText={_viewModel.validateOapiDataSyntax}
    onValidateOapiFile={_viewModel.validateOapiFileSyntax}
    isActiveSyncRequired={userLimits?.activeSync?.active || false}
    bind:isActiveSyncPlanModalOpen
  />
</Modal>

<!-- {#if isImportCurlPopup} -->
<Modal
  title={"Import cURL"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isImportCurlPopup}
  handleModalState={(flag = false) => {
    isImportCurlPopup = flag;
  }}
>
  <ImportCurl
    workspaceId={$currentWorkspace._id}
    onClosePopup={() => (isImportCurlPopup = false)}
    onItemImported={_viewModel.handleImportItem}
    onValidateCurl={_viewModel.handleValidateCurl}
  />
</Modal>
<!-- {/if} -->

<Modal
  title={"Save Request"}
  type={"dark"}
  width={"55%"}
  zIndex={10000}
  isOpen={isExposeSaveAsRequest}
  handleModalState={(flag = false) => {
    isExposeSaveAsRequest = flag;
  }}
>
  <SaveAsCollectionItem
    onClick={(flag = false) => {
      isExposeSaveAsRequest = flag;
    }}
    requestMethod={removeTab.type === TabTypeEnum.REQUEST
      ? removeTab.property.request?.method
      : removeTab.type === TabTypeEnum.WEB_SOCKET
        ? TabTypeEnum.WEB_SOCKET
        : removeTab.type === TabTypeEnum.SOCKET_IO
          ? TabTypeEnum.SOCKET_IO
          : removeTab.type === TabTypeEnum.GRAPHQL
            ? TabTypeEnum.GRAPHQL
            : ""}
    requestUrl={removeTab.type === TabTypeEnum.REQUEST
      ? removeTab.property.request?.url
      : removeTab.type === TabTypeEnum.WEB_SOCKET
        ? removeTab?.property?.websocket?.url
        : removeTab.type === TabTypeEnum.SOCKET_IO
          ? removeTab?.property?.socketio?.url
          : removeTab.type === TabTypeEnum.GRAPHQL
            ? removeTab?.property?.graphql?.url
            : ""}
    requestName={removeTab.name}
    requestDescription={removeTab.description}
    requestPath={removeTab.path}
    collections={$collectionList}
    readWorkspace={_viewModel.readWorkspace}
    onSave={async (_workspaceMeta, path, tabName, description, type) => {
      if (removeTab.type === TabTypeEnum.REQUEST) {
        const res = await _viewModel.saveAsRequest(
          _workspaceMeta,
          path,
          tabName,
          description,
          removeTab,
        );
        if (res?.status === "success") {
          _viewModel.handleRemoveTab(removeTab.id);
        }
        return res;
      } else if (removeTab.type === TabTypeEnum.SOCKET_IO) {
        const res = await _viewModel.saveAsSocketIo(
          _workspaceMeta,
          path,
          tabName,
          description,
          removeTab,
        );
        if (res?.status === "success") {
          _viewModel.handleRemoveTab(removeTab.id);
        }
        return res;
      } else if (removeTab.type === TabTypeEnum.WEB_SOCKET) {
        const res = await _viewModel.saveAsSocket(
          _workspaceMeta,
          path,
          tabName,
          description,
          removeTab,
        );
        if (res?.status === "success") {
          _viewModel.handleRemoveTab(removeTab.id);
        }
        return res;
      }
      // else if (removeTab.type === TabTypeEnum.SOCKET_IO) {
      //   const res = await _viewModel.saveAsSocketIo(
      //     _workspaceMeta,
      //     path,
      //     tabName,
      //     description,
      //     removeTab,
      //   );
      //   if (res?.status === "success") {
      //     _viewModel.handleRemoveTab(removeTab.id);
      //   }
      //   return res;
      // } else if (removeTab.type === TabTypeEnum.GRAPHQL) {
      //   const res = await _viewModel.saveAsGraphql(
      //     _workspaceMeta,
      //     path,
      //     tabName,
      //     description,
      //     removeTab,
      //   );
      //   if (res?.status === "success") {
      //     _viewModel.handleRemoveTab(removeTab.id);
      //   }
      //   return res;
      // }
    }}
    onCreateFolder={_viewModel.createFolderFromSaveAs}
    onCreateCollection={_viewModel.createCollectionFromSaveAs}
    onRenameCollection={_viewModel.handleSaveAsRenameCollection}
    onRenameFolder={_viewModel.handleSaveAsRenameFolder}
  />
</Modal>

<!-- Download the Desktop app -->
<Modal
  title=""
  type="dark"
  width="45%"
  zIndex={1000}
  isOpen={isLaunchAppModalOpen}
  handleModalState={() => {
    isLaunchAppModalOpen = false;
  }}
>
  <DownloadApp
    onInstallRedirect={() => {
      window.open(constants.MARKETING_URL, "_blank");
    }}
    onGithubRedirect={() => {
      window.open(constants.SPARROW_GITHUB, "_blank");
    }}
    onDocsRedirect={() => {
      window.open(constants.INTRO_DOCS_URL, "_blank");
    }}
  />
</Modal>

<Modal
  title={"Sync Collection"}
  zIndex={1000}
  isOpen={isSyncModalOpen}
  width={"35%"}
  handleModalState={() => {
    isSyncModalOpen = false;
  }}
>
  <div class="mt-2 mb-4">
    <p
      class="text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium"
      style="color: var(--text-ds-neutral-100);"
    >
      The <span style="font-weight: 600; color: var(--text-ds-neutral-50);"
        >'{activeSyncChanges?.name}'</span
      > collection has been updated in Swagger.
    </p>
  </div>
  <div class="mt-2 mb-4">
    <p
      class="text-ds-font-size-14 text-ds-line-height-120 text-ds-font-weight-medium"
      style="color: var(--text-ds-neutral-100);"
    >
      <span
        class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-primary-300);"
        >{activeSyncChanges.addedCount}</span
      > New Requests Added
    </p>
    <p
      class="text-ds-font-size-14 text-ds-line-height-120 text-ds-font-weight-medium"
      style="color: var(--text-ds-neutral-100);"
    >
      <span
        class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-primary-300);"
        >{activeSyncChanges.modifiedCount}</span
      > Requests Modified
    </p>
    <p
      class="text-ds-font-size-14 text-ds-line-height-120 text-ds-font-weight-medium"
      style="color: var(--text-ds-neutral-100);"
    >
      <span
        class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-primary-300);"
        >{activeSyncChanges.deletedCount}</span
      > Request Deleted
    </p>
  </div>
  <div class="mt-2 mb-4">
    <p
      class="text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium"
      style="color: var(--text-ds-neutral-100);"
    >
      Would you like to sync your collection with these changes?
    </p>
  </div>

  <div class="d-flex justify-content-end gap-2">
    <Button
      title={"Cancel"}
      textClassProp={"fs-6"}
      size={"medium"}
      customWidth={"95px"}
      type={"secondary"}
      onClick={() => {
        isSyncModalOpen = false;
      }}
    ></Button>
    <Button
      title={"Sync Now"}
      size={"medium"}
      textClassProp={"fs-6"}
      loader={isCollectionSyncing}
      disable={isCollectionSyncing}
      type={"primary"}
      customWidth={"95px"}
      onClick={async () => {
        isCollectionSyncing = true;
        updateActiveSyncStates(activeSyncChanges.collectionId, {
          isChangesAvailable: false,
          isloading: true,
        });
        await _viewModel.syncCollection(activeSyncChanges.collectionId);
        updateActiveSyncStates(activeSyncChanges.collectionId, {
          isChangesAvailable: false,
          isloading: false,
        });
        isCollectionSyncing = false;
        isSyncModalOpen = false;
      }}
    ></Button>
  </div>
</Modal>

<Modal
  title={"Sync Collection"}
  zIndex={1000}
  isOpen={isSyncReplaceModalOpen}
  width={"35%"}
  handleModalState={() => {
    isSyncReplaceModalOpen = false;
  }}
>
  <div class="mt-2 mb-4">
    <p
      class="text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium"
      style="color: var(--text-ds-neutral-100);"
    >
      The <span style="font-weight: 600; color: var(--text-ds-neutral-50);"
        >'{activeSyncChanges?.name}'</span
      > collection has been significantly updated in Swagger, with over 75% of its
      requests changed.
    </p>
  </div>
  <div class="mt-2 mb-4">
    <p
      class="text-ds-font-size-14 text-ds-line-height-120 text-ds-font-weight-medium"
      style="color: var(--text-ds-neutral-100);"
    >
      <span
        class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-primary-300);"
        >{activeSyncChanges.addedCount}</span
      > New Requests Added
    </p>
    <p
      class="text-ds-font-size-14 text-ds-line-height-120 text-ds-font-weight-medium"
      style="color: var(--text-ds-neutral-100);"
    >
      <span
        class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-primary-300);"
        >{activeSyncChanges.modifiedCount}</span
      > Requests Modified
    </p>
    <p
      class="text-ds-font-size-14 text-ds-line-height-120 text-ds-font-weight-medium"
      style="color: var(--text-ds-neutral-100);"
    >
      <span
        class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-primary-300);"
        >{activeSyncChanges.deletedCount}</span
      > Request Deleted
    </p>
  </div>
  <div class="mt-2 mb-4">
    <p
      class="text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium"
      style="color: var(--text-ds-neutral-100);"
    >
      Would you like to replace the existing collection or import as a new?
    </p>
  </div>

  <div class="d-flex gap-2" style="justify-content: space-between;">
    <Button
      title={"Cancel"}
      textClassProp={"fs-6"}
      size={"medium"}
      customWidth={"95px"}
      type={"teritiary-regular"}
      onClick={() => {
        isSyncReplaceModalOpen = false;
      }}
    ></Button>
    <div class="d-flex gap-2">
      <Button
        title={"Replace Collection"}
        textClassProp={"fs-6"}
        loader={isCollectionSyncing}
        disable={isCollectionSyncing}
        size={"medium"}
        type={"secondary"}
        onClick={async () => {
          isSyncReplaceModalOpen = false;
          isReplaceCollectionModalOpen = true;
        }}
      ></Button>
      <Button
        title={"Import as New"}
        size={"medium"}
        textClassProp={"fs-6"}
        type={"primary"}
        onClick={async () => {
          isImportCollectionPopup = true;
          isSyncReplaceModalOpen = false;
        }}
      ></Button>
    </div>
  </div>
</Modal>

<Modal
  title={"Replace Existing Collection"}
  zIndex={1000}
  isOpen={isReplaceCollectionModalOpen}
  width={"35%"}
  handleModalState={() => {
    isReplaceCollectionModalOpen = false;
  }}
>
  <div class="mt-2 mb-4">
    <p
      class="text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium"
      style="color: var(--text-ds-neutral-100);"
    >
      This will overwrite your current collection with the latest version. Any
      additional changes that you made in the collection will be overwritten.
      Are you sure you want to continue?
    </p>
  </div>
  <div class="d-flex justify-content-end gap-2">
    <Button
      title={"Cancel"}
      textClassProp={"fs-6"}
      size={"medium"}
      customWidth={"95px"}
      type={"secondary"}
      onClick={() => {
        isReplaceCollectionModalOpen = false;
      }}
    ></Button>
    <Button
      title={"Replace Collection"}
      size={"medium"}
      loader={isCollectionSyncing}
      disable={isCollectionSyncing}
      textClassProp={"fs-6"}
      type={"primary"}
      customWidth={"155px"}
      onClick={async () => {
        isCollectionSyncing = true;
        updateActiveSyncStates(activeSyncChanges.collectionId, {
          isChangesAvailable: false,
          isloading: true,
        });
        await _viewModel.replaceCollection(activeSyncChanges.collectionId);
        updateActiveSyncStates(activeSyncChanges.collectionId, {
          isChangesAvailable: false,
          isloading: false,
        });
        isCollectionSyncing = false;
        isReplaceCollectionModalOpen = false;
      }}
    ></Button>
  </div>
</Modal>

<Modal
  title={"How to use Mock URL?"}
  zIndex={1000}
  isOpen={isMockURLModelOpen}
  width={"35%"}
  handleModalState={() => {
    isMockURLModelOpen = false;
  }}
>
  <div class="d-flex flex-column gap-3 mt-3 mb-2">
    <div class="d-flex gap-1" style="width: 100%;">
      <p class="text-ds-font-size-14" style="margin-bottom: 0px;">1.</p>
      <div>
        <p class="text-ds-font-size-14" style="margin-bottom: 0px;">
          Copy the Mock URL
        </p>
        <p
          class="text-ds-font-size-12 mt-1"
          style="color:var(--text-ds-neutral-300); margin-bottom: 0px;"
        >
          Click "Copy" to copy your unique mock base URL.
        </p>
      </div>
    </div>
    <div class="d-flex gap-1">
      <p class="text-ds-font-size-14" style="margin-bottom: 0px;">2.</p>
      <div>
        <p class="text-ds-font-size-14" style="margin-bottom: 0px;">
          Use it in Request
        </p>
        <p
          class="text-ds-font-size-12 mt-1"
          style="color:var(--text-ds-neutral-300); margin-bottom: 0px;"
        >
          Open request in this collection, paste the base URL in the request
          field, followed by the endpoints (if any). For example,
        </p>
        <div
          class="d-flex justify-content-start align-items-start px-2 py-1 text-ds-font-size-12 mt-1"
          style="
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
    gap: 16px;
    width: fit-content;
  "
        >
          <span class="d-inline-block text-truncate" style="max-width: 380px;">
            GET {mockCollectionUrl}/users
          </span>
        </div>
      </div>
    </div>
    <div class="d-flex gap-1" style="width: 100%;">
      <p class="text-ds-font-size-14" style="margin-bottom: 0px;">3.</p>
      <div>
        <p class="text-ds-font-size-14" style="margin-bottom: 0px;">
          Need more details?
        </p>
        <Tooltip title={"Coming Soon"} placement={"top-center"}>
          <Button
            size="small"
            customWidth={"220px"}
            type={"link-primary"}
            title="Learn how mock collection works"
            disable={true}
            onClick={() => {}}
            endIcon={OpenRegular}
          />
        </Tooltip>
      </div>
    </div>
  </div>
</Modal>

<Modal
  title={"Create Mock Collection"}
  width={"36%"}
  zIndex={1000}
  isOpen={isCreateMockCollectionPopup}
  handleModalState={() => (isCreateMockCollectionPopup = false)}
>
  <div class="text-lightGray mb-4 mt-2">
    <p
      class="text-ds-font-size-14 text-ds-line-height-120 text-ds-font-weight-medium"
    >
      The mock collection only supports REST API requests. Requests using
      GraphQL, WebSocket, or other request types will be excluded.
      <br />
      Do you want to continue?
    </p>
  </div>
  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
  >
    <Button
      disable={createMockCollection}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"secondary"}
      loader={false}
      onClick={() => {
        isCreateMockCollectionPopup = false;
      }}
    />

    <Button
      disable={createMockCollection}
      title={"Yes, Continue"}
      textStyleProp={"font-size: var(--base-text)"}
      loaderSize={18}
      type={"primary"}
      loader={createMockCollection}
      onClick={async () => {
        createMockCollection = true;
        await _viewModel.handleCreateMockCollectionFromExisting(
          currentCollectionId,
          currentWorkspaceId,
        );
        createMockCollection = false;
        isCreateMockCollectionPopup = false;
      }}
    />
  </div>
</Modal>
<PlanUpgradeModal
  bind:isOpen={upgradePlanModel}
  title={planContent?.title}
  description={planContent?.description}
  planType="Testflow"
  planLimitValue={userLimits?.testflowPerWorkspace?.value || 3}
  currentPlanValue={currentTestflow}
  isOwner={userRole === TeamRole.TEAM_OWNER || userRole === TeamRole.TEAM_ADMIN
    ? true
    : false}
  handleContactSales={_viewModel.handleContactSales}
  handleSubmitButton={userRole === TeamRole.TEAM_OWNER ||
  userRole === TeamRole.TEAM_ADMIN
    ? handleRedirectToAdminPanel
    : handleRequestOwner}
  userName={teamDetails?.teamName}
  userEmail={teamDetails?.teamOwnerEmail}
  submitButtonName={planContent?.buttonName}
/>

<PlanUpgradeModal
  bind:isOpen={isActiveSyncPlanModalOpen}
  title={planContent?.title}
  description={planContentNonActive?.description}
  planType="Active Sync"
  activePlan={"disabled"}
  isOwner={userRole === TeamRole.TEAM_OWNER || userRole === TeamRole.TEAM_ADMIN
    ? true
    : false}
  handleContactSales={_viewModel.handleContactSales}
  handleSubmitButton={userRole === TeamRole.TEAM_OWNER ||
  userRole === TeamRole.TEAM_ADMIN
    ? handleRedirectToAdminPanel
    : handleRequestOwner}
  userName={teamDetails?.teamName}
  userEmail={teamDetails?.teamOwnerEmail}
  submitButtonName={planContent?.buttonName}
/>

<style>
  :global(.collection-splitter .splitpanes__splitter) {
    width: 6px !important;
    height: auto !important;
    background-color: var(--bg-ds-surface-900) !important;
    border-left: 5px solid var(--border-ds-surface-700) !important;
    border-right: 0px solid var(--border-ds-surface-900) !important;
    border-top: 0 !important;
    border-bottom: 0 !important;
  }
  :global(
    .collection-splitter .splitpanes__splitter:active,
    .collection-splitter .splitpanes__splitter:hover
  ) {
    background-color: var(--bg-ds-primary-300) !important;
  }
  .gradient-text {
    font-size: 18;
    font-weight: 500;
    display: inline-block;
    background: linear-gradient(270deg, #6147ff 2.55%, #1193f0 31.48%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .save-popup {
    font-weight: 400;
  }
</style>
