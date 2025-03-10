<script lang="ts">
  import { Route } from "svelte-navigator";
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { userValidationStore } from "@app/store/deviceSync.store";

  // ---- Store
  import {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelCollapse,
  } from "@sparrow/workspaces/stores";

  // ---- Animation
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "@app/constants";

  import { onDestroy } from "svelte";
  // ---- Components
  import {
    RestExplorerPage,
    CollectionExplorerPage,
    FolderExplorerPage,
    WorkspaceExplorerPage,
  } from "..";
  import {
    TabBar,
    WorkspaceActions,
    ImportCollection,
    ImportCurl,
    WorkspaceDefault,
    SaveAsCollectionItem,
  } from "@sparrow/workspaces/features";
  import { WithModal } from "@sparrow/workspaces/hoc";
  import { notifications } from "@sparrow/library/ui";

  // ---- Interface, enum & constants
  import { WorkspaceRole } from "@sparrow/common/enums/team.enum";

  // ---- View Model
  import CollectionsViewModel from "./CollectionPage.ViewModel";
  import { EnvironmentViewModel } from "@app/pages/workspace-page/EnvironmentPage.ViewModel";

  // ---- helpers
  import { hasWorkpaceLevelPermission } from "@sparrow/common/utils";
  import type { TabDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import { onMount } from "svelte";

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
  import { version } from "../../../src-tauri/tauri.conf.json";
  import { Button } from "@sparrow/library/ui";
  import { isUserFirstSignUp } from "@app/store/user.store";
  import { WelcomeLogo } from "@sparrow/common/images";
  import { WelcomePopup } from "@sparrow/workspaces/features";
  import SocketIoExplorerPage from "./sub-pages/SocketIoExplorerPage/SocketIoExplorerPage.svelte";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
  import GraphqlExplorerPage from "./sub-pages/GraphqlExplorerPage/GraphqlExplorerPage.svelte";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";

  import { open } from "@tauri-apps/plugin-shell";
  import constants from "@app/constants/constants";
  import RestExplorerSavedPage from "./sub-pages/RestExplorerSavedPage/RestExplorerSavedPage.svelte";
  import { remove } from "@tauri-apps/plugin-fs";
  import { Checkbox } from "@sparrow/library/forms";

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
  // Tab Controls Properties - end

  let isImportCollectionPopup: boolean = false;
  let isImportCurlPopup: boolean = false;
  let loader = false;
  let splitter: HTMLElement | null;
  let isExposeSaveAsRequest: boolean = false;
  let isAppVersionVisible = true;
  let isGuestUser = false;
  let userId = "";
  let userRole = "";

  let isExpandCollection = false;
  let isExpandEnvironment = false;
  let isExpandTestflow = false;
  let isFirstCollectionExpand = false;

  let localEnvironment;
  let globalEnvironment;

  let environments = _viewModel2.environments;

  let environmentsValues;
  let currentWOrkspaceValue: Observable<WorkspaceDocument>;
  const externalSparrowGithub = constants.SPARROW_GITHUB;

  environments.subscribe((value) => {
    if (value) {
      environmentsValues = value;
    }
  });

  currentWorkspace.subscribe((value) => {
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

  let onCreateEnvironment = _viewModel2.onCreateEnvironment;

  async function handleCreateEnvironment() {
    if (!isExpandEnvironment) {
      isExpandEnvironment = !isExpandEnvironment;
    }

    await onCreateEnvironment(localEnvironment);
    scrollList("bottom");
  }

  isGuestUserActive.subscribe((value) => {
    isGuestUser = value;
  });

  user.subscribe((value) => {
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
  const closeTab = (id: string, tab: Tab) => {
    if (
      (tab?.type === TabTypeEnum.REQUEST ||
        tab?.type === TabTypeEnum.WEB_SOCKET ||
        tab?.type === TabTypeEnum.ENVIRONMENT ||
        tab?.type === TabTypeEnum.TESTFLOW ||
        tab?.type === TabTypeEnum.SOCKET_IO ||
        tab?.type === TabTypeEnum.SAVED_REQUEST ||
        tab?.type === TabTypeEnum.COLLECTION ||
        tab?.type === TabTypeEnum.GRAPHQL) &&
      !tab?.isSaved
    ) {
      if (tab?.source !== "SPEC" || !tab?.activeSync || tab?.isDeleted) {
        removeTab = tab;
        isPopupClosed = true;
      } else {
        _viewModel.handleRemoveTab(id);
      }
    } else {
      _viewModel.handleRemoveTab(id);
    }
  };

  // Methods for Tab Controls - start
  const forceCloseExceptCurrentOne = (tabList: Tab[], currentTabId: string) => {
    tabsToForceClose = tabList;
    tabIdWhoRecivedForceClose = currentTabId;
    noOfNotSavedTabsWhileForClose = 0;
    tabList?.forEach((tab: Tab) => {
      if (tab.id !== currentTabId) {
        if (
          (tab?.type === TabTypeEnum.REQUEST ||
            tab?.type === TabTypeEnum.WEB_SOCKET ||
            tab?.type === TabTypeEnum.SOCKET_IO ||
            tab?.type === TabTypeEnum.GRAPHQL) &&
          !tab?.isSaved
        ) {
          noOfNotSavedTabsWhileForClose += 1;
        }
      }
    });
    if (noOfNotSavedTabsWhileForClose > 0) {
      if (isUserDontWantForceClosePopup) {
        forceCloseTab(tabList, currentTabId);
        isForceCloseTabPopupOpen = false;
        noOfNotSavedTabsWhileForClose = 0;
        return;
      }
      isForceCloseTabPopupOpen = true;
    } else forceCloseTab(tabList, currentTabId);
  };
  const forceCloseTab = async (tabList: Tab[], currentTabId: string) => {
    for (const tab of tabList) {
      if (tab.id !== currentTabId) {
        await forceCloseTabsAsync(tab.id, tab);
      }
    }
  };
  const forceCloseTabsAsync = async (id: string, tab: Tab) => {
    return new Promise((resolve) => {
      removeTab = tab;
      setTimeout(() => {
        // Simulating a delay similar to waiting for a save action
        _viewModel.handleRemoveTab(id);
        resolve(0);
      }, 300);
    });
  };
  /**
   * The closeTabSequentially() method works well incase we want to bulk close the tabs
   * one by one. This function can also replace the above closeTab() function (will do so).
   * So same function can be used for single tab close and multiple tab close.
   */
  const closeTabSequentially = async (id: string, tab: Tab) => {
    if (
      (tab?.type === TabTypeEnum.REQUEST ||
        tab?.type === TabTypeEnum.WEB_SOCKET ||
        tab?.type === TabTypeEnum.ENVIRONMENT ||
        tab?.type === TabTypeEnum.TESTFLOW ||
        tab?.type === TabTypeEnum.SOCKET_IO ||
        tab?.type === TabTypeEnum.GRAPHQL) &&
      !tab?.isSaved
    ) {
      if (tab?.source !== "SPEC" || !tab?.activeSync || tab?.isDeleted) {
        console.log("save ssss*****");
        removeTab = tab;
        isPopupClosed = true;
        // Wait for the save popup to be handled before continuing
        await new Promise<void>((resolve) => {
          const checkIfPopupClosed = setInterval(() => {
            if (!isPopupClosed) {
              clearInterval(checkIfPopupClosed);
              resolve();
            }
          }, 300);
        });
        return;
      }
    }
    // Common delayed tab removal logic
    removeTab = tab;
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        _viewModel.handleRemoveTab(id);
        resolve();
      }, 300);
    });
  };
  const closeTabExceptCurrentOne = async (
    tabList: Tab[],
    currentTabId: string,
  ) => {
    for (let tab of tabList) {
      if (tab.id !== currentTabId) {
        // Wait for closeTab to finish before moving to the next tab
        await closeTabSequentially(tab.id, tab);
      }
    }
  };
  const handleTabDuplication = (tabId: string) => {
    _viewModel.createDuplicateTabByTabId(tabId);
  };
  // Methods for Tab Controls - start

  const handleClosePopupBackdrop = (flag: boolean) => {
    isPopupClosed = flag;
  };

  const handleForceClosePopupBackdrop = (flag: boolean) => {
    isForceCloseTabPopupOpen = flag;
  };

  const handlePopupDiscard = () => {
    _viewModel.handleRemoveTab(removeTab.id);
    isPopupClosed = false;
  };

  /**
   * Handle save functionality on close confirmation popup
   */
  const handlePopupSave = async () => {
    if (
      removeTab.type === TabTypeEnum.ENVIRONMENT ||
      removeTab.type === TabTypeEnum.TESTFLOW ||
      removeTab.type === TabTypeEnum.COLLECTION
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
        }
        loader = false;
      }
    } else if (
      removeTab.type === TabTypeEnum.REQUEST ||
      removeTab.type === TabTypeEnum.WEB_SOCKET ||
      removeTab.type === TabTypeEnum.SOCKET_IO ||
      removeTab.type === TabTypeEnum.SAVED_REQUEST ||
      removeTab.type === TabTypeEnum.GRAPHQL
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
        } else if (removeTab.type === TabTypeEnum.SAVED_REQUEST) {
          const res = await _viewModel.saveSavedRequest(removeTab);
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

  let isAccessDeniedModalOpen = false;

  // Add userValidation state
  let userValidation = {
    isValid: true,
    checked: false,
  };
  const cw = currentWorkspace.subscribe(async (value) => {
    if (value) {
      if (prevWorkspaceId !== value._id) {
        Promise.all([
          _viewModel.fetchCollections(value?._id),
          _viewModel2.refreshEnvironment(value?._id),
          _viewModel3.refreshTestflow(value?._id),
          ,
        ]).then(
          ([
            fetchCollectionsResult,
            refreshEnvironmentResult,
            refreshTestflowResult,
          ]) => {
            // Handle the results of each API call here

            const collectionTabsToBeDeleted =
              fetchCollectionsResult?.collectionItemTabsToBeDeleted || [];
            const environmentTabsToBeDeleted =
              refreshEnvironmentResult?.environmentTabsToBeDeleted || [];
            const testflowTabsToBeDeleted =
              refreshTestflowResult?.testflowTabsToBeDeleted || [];
            const totalTabsToBeDeleted: string[] = [
              ...collectionTabsToBeDeleted,
              ...environmentTabsToBeDeleted,
              ...testflowTabsToBeDeleted,
            ];
            _viewModel.deleteTabsWithTabIdInAWorkspace(
              value?._id,
              totalTabsToBeDeleted,
            );
            const userHasAccess = value.users?.some(
              (user) => user.id === userId,
            );
          },
        );

        userValidationStore.subscribe((validation) => {
          if (!validation.isValid) {
            isAccessDeniedModalOpen = true;
            isWelcomePopupOpen = false;
          }
        });
        tabList = _viewModel.getTabListWithWorkspaceId(value._id);
        activeTab = _viewModel.getActiveTab(value._id);
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
  isUserFirstSignUp.subscribe((value) => {
    if (value) {
      isWelcomePopupOpen = value;
      isExpandCollection = value;
      isExpandEnvironment = value;
      isFirstCollectionExpand = value;
    }
  });

  onDestroy(() => {
    cw.unsubscribe();
  });
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
          {collectionList}
          {navigateToGithub}
          {currentWorkspace}
          {isAppVersionVisible}
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
          onCreateTestflow={_viewModel3.handleCreateTestflow}
          testflows={_viewModel3.testflows}
          onDeleteTestflow={_viewModel3.handleDeleteTestflow}
          onUpdateTestflow={_viewModel3.handleUpdateTestflow}
          onOpenTestflow={_viewModel3.handleOpenTestflow}
          bind:isExpandCollection
          bind:isExpandEnvironment
          bind:isExpandTestflow
          bind:isFirstCollectionExpand
          appVersion={version}
        />
      </Pane>
      <Pane
        size={$leftPanelCollapse ? 100 : $rightPanelWidth}
        minSize={60}
        class="bg-secondary-800-important"
      >
        <section class="d-flex flex-column h-100">
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
            onClickCloseOtherTabs={closeTabExceptCurrentOne}
            onClickForceCloseTabs={forceCloseExceptCurrentOne}
            onClickDuplicateTab={handleTabDuplication}
          />
          <div style="flex:1; overflow: hidden;">
            <Route>
              {#if true}
                {#if $activeTab?.type === TabTypeEnum.REQUEST}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <RestExplorerPage bind:isTourGuideOpen tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === TabTypeEnum.COLLECTION}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <CollectionExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === TabTypeEnum.FOLDER}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <FolderExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === TabTypeEnum.ENVIRONMENT}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <EnvironmentExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === TabTypeEnum.WORKSPACE}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <WorkspaceExplorerPage
                        {collectionList}
                        tab={$activeTab}
                      />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === TabTypeEnum.WEB_SOCKET}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <WebSocketExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === TabTypeEnum.TESTFLOW}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <TestFlowExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === TabTypeEnum.SOCKET_IO}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <SocketIoExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === TabTypeEnum.GRAPHQL}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <GraphqlExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === TabTypeEnum.SAVED_REQUEST}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <RestExplorerSavedPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if !$tabList?.length}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <WorkspaceDefault
                        {currentWorkspace}
                        {handleCreateEnvironment}
                        onCreateTestflow={() => {
                          _viewModel3.handleCreateTestflow();
                          isExpandTestflow = true;
                        }}
                        bind:isExpandCollection
                        showImportCollectionPopup={() =>
                          (isImportCollectionPopup = true)}
                        onItemCreated={_viewModel.handleCreateItem}
                        {isGuestUser}
                        {userRole}
                      />
                    </div>
                  </Motion>
                {/if}
              {/if}
            </Route>
          </div>
        </section>
      </Pane>
    </Splitpanes>
  </div>
</Motion>

<!-- Force Close Popup -->
<!-- {#if isForceCloseTabPopupOpen} -->
<Modal
  title={"Force Close!"}
  type={"dark"}
  zIndex={1000}
  isOpen={isForceCloseTabPopupOpen}
  width={"40%"}
  handleModalState={handleForceClosePopupBackdrop}
>
  <div class="d-flex row gap-4" style="width: 552px;">
    <div class="d-flex row">
      <!-- <div class="force-close-popup-title">
        <h4>Force Close!</h4>
      </div> -->
      <div class="popup-desc" style="margin-top: 15px;">
        <p style="margin: 0">
          <span style="color: white;"
            >{noOfNotSavedTabsWhileForClose} Tabs
          </span> have unsaved changes. Force closing will discard your edits, and
          you won’t be able to recover them. Are you sure you want to proceed?
        </p>
      </div>
    </div>

    <div class="d-flex align-items-center gap-2 popup-desc">
      <Checkbox
        size={"large"}
        bind:checked={isUserDontWantForceClosePopup}
        on:input={() => {
          isUserDontWantForceClosePopup = !isUserDontWantForceClosePopup;
        }}
        disabled={false}
      />
      <p style="margin: 0;">I understand, don't show this agian.</p>
    </div>
    <!-- <div class="d-flex justify-content-end gap-2"> -->
    <div
      class="d-flex gap-2"
      style="display: flex; width: max-content; margin-left: auto; margin-right: 15px; margin-bottom: 0px;"
    >
      <Button
        title="Don't Close"
        size="medium"
        type="secondary"
        onClick={() => {
          "click dont save";
          handleForceClosePopupBackdrop(false);
        }}
      ></Button>
      <Button
        title="Force Close"
        size="medium"
        type="danger"
        onClick={() => {
          "click dont save";
          forceCloseTab(tabsToForceClose, tabIdWhoRecivedForceClose);
          isForceCloseTabPopupOpen = false;
          noOfNotSavedTabsWhileForClose = 0;
        }}
      ></Button>
    </div>
  </div>
</Modal>
<!-- {/if} -->

<!-- Save Changes for API Popup -- New -->
<Modal
  title={"Unsaved Changes!"}
  type={"dark"}
  zIndex={1000}
  isOpen={isPopupClosed}
  width={"38.5%"}
  handleModalState={handleClosePopupBackdrop}
>
  <div class="d-flex row gap-2" style="width: 530px;">
    <div class="d-flex row gap-2" style="width: 600px; height: 65px;">
      <!-- <div class="force-close-popup-title">
        <h4>Unsaved Changes!</h4>
      </div> -->
      <div class="popup-desc" style="font-weight: 400; margin-top: 15px; ">
        <p style="margin: 0px; ">
          Do you want to save changes in this tab “<span style="color: white;">
            {!removeTab ? "Untitled" : removeTab.name}</span
          >”? Changes will be lost in case you choose not to save.
        </p>
      </div>
    </div>

    <div
      class="d-flex gap-2"
      style="display: flex; width: max-content; margin-left: auto; margin-right: 30px; margin-bottom: 10px;"
    >
      <Button
        title="Don't Save"
        size="medium"
        type="secondary"
        customWidth="95px"
        onClick={() => {
          handlePopupDiscard();
        }}
      ></Button>
      <Button
        title="Save"
        size="medium"
        type="primary"
        customWidth="95px"
        disable={userRole === WorkspaceRole.WORKSPACE_VIEWER}
        onClick={() => {
          handlePopupSave();
        }}
      ></Button>
    </div>
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
    onClickExplore={() => {
      isUserFirstSignUp.set(false);
      isWelcomePopupOpen = false;
    }}
    onClickTour={() => {
      isUserFirstSignUp.set(false);
      isTourGuideOpen = true;
      isWelcomePopupOpen = false;
    }}
  />
</Modal>
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
        You don't seem to have access to this resourse. Please check if you are
        using the right account.
      </p>
    </div>
  </Modal>
{/if}

<svelte:window on:keydown={handleKeyPress} />
<!-- <ImportCollection
    {collectionList}
    workspaceId={$currentWorkspace._id}
    closeImportCollectionPopup={() => (isImportCollectionPopup = false)}
    onItemCreated={async (entityType, args) => {
      const response = await _viewModel.handleCreateItem(entityType, args);
      if (response.isSuccessful) {
        setTimeout(() => {
          scrollList("bottom");
        }, 1000);
      }
    }}
    onItemImported={async (entityType, args) => {
      await _viewModel.handleImportItem(entityType, args);
      scrollList("bottom");
    }}
    onImportDataChange={_viewModel.handleImportDataChange}
    onUploadFile={_viewModel.uploadFormFile}
    onExtractGitBranch={_viewModel.extractGitBranch}
  /> -->
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
    onClick={() => {
      isImportCollectionPopup = false;
    }}
    {collectionList}
    onItemCreated={async (entityType, args) => {
      const response = await _viewModel.handleCreateItem(entityType, args);
      if (response.isSuccessful) {
        setTimeout(() => {
          scrollList("bottom");
          isExpandCollection = true;
        }, 1000);
      }
    }}
    currentWorkspaceId={$currentWorkspace?._id}
    onImportJSONObject={async (currentWorkspaceId, importJSON, contentType) => {
      const response = await _viewModel.importJSONObject(
        currentWorkspaceId,
        importJSON,
        contentType,
      );
      if (response.isSuccessful) {
        setTimeout(() => {
          scrollList("bottom");
        }, 1000);
      }
      return response;
    }}
    onCollectionFileUpload={async (currentWorkspaceId, file, type) => {
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
    onValidateLocalHostUrl={_viewModel.validateLocalHostURL}
    onValidateDeployedURL={_viewModel.validateDeployedURL}
    onValidateDeployedURLInput={_viewModel.validateURLInput}
    onValidateLocalHostURLInput={_viewModel.validateURLInput}
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
      } else if (removeTab.type === TabTypeEnum.GRAPHQL) {
        const res = await _viewModel.saveAsGraphql(
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
    }}
    onCreateFolder={_viewModel.createFolderFromSaveAs}
    onCreateCollection={_viewModel.createCollectionFromSaveAs}
    onRenameCollection={_viewModel.handleSaveAsRenameCollection}
    onRenameFolder={_viewModel.handleSaveAsRenameFolder}
  />
</Modal>

<style>
  :global(.collection-splitter .splitpanes__splitter) {
    width: 6px !important;
    height: auto !important;

    background-color: var(--bg-ds-surface-900) !important;
    border-left: 5px solid var(--bg-ds-surface-700) !important;
    border-right: 0px solid var(--bg-ds-surface-900) !important;
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

  .force-close-popup-title {
    font-family: "Inter", sans-serif;
    font-weight: 600;
    font-size: 20px;
    color: #ffffff;
  }
  .popup-desc {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 15px;
    color: #cccccc;
  }
  .save-popup {
    font-weight: 400;
  }
</style>
