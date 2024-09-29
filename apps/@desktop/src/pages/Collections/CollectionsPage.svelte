<script lang="ts">
  import { Route } from "svelte-navigator";
  import { Pane, Splitpanes } from "svelte-splitpanes";
  // ---- Store
  import {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelCollapse,
  } from "@sparrow/workspaces/common/stores";

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
  } from "../";
  import {
    TabBar,
    WorkspaceActions,
    ImportCollection,
    ImportCurl,
    WorkspaceDefault,
    SaveAsCollectionItem,
  } from "@sparrow/workspaces/features";
  import { WithModal } from "@sparrow/workspaces/common/hoc";
  import { notifications } from "@sparrow/library/ui";

  // ---- Interface, enum & constants
  import type { NewTab } from "@deprecate/utils/interfaces/request.interface";
  import { WorkspaceRole } from "@deprecate/utils/enums/team.enum";

  // ---- View Model
  import CollectionsViewModel from "./CollectionPage.ViewModel";
  import { EnvironmentViewModel } from "@app/pages/EnvironmentPage/EnvironmentPage.ViewModel";

  // ---- helpers
  import { hasWorkpaceLevelPermission } from "@deprecate/utils/helpers";
  import type { TabDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import { onMount } from "svelte";
  import { ItemType } from "@deprecate/utils/enums";

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
  import WebSocketExplorerPage from "../WebSocketExplorerPage/WebSocketExplorerPage.svelte";
  import {
    TabTypeEnum,
    type RequestTab,
    type Tab,
  } from "@sparrow/common/types/workspace";
  import type { WebSocketTab } from "@sparrow/common/types/workspace/web-socket";
  import EnvironmentExplorerPage from "../EnvironmentExplorer/EnvironmentExplorerPage.svelte";
  import TestFlowExplorerPage from "../TestflowExplorerPage/TestflowExplorerPage.svelte";
  import { TestflowViewModel } from "./Testflow.ViewModel";
  import { version } from "../../../src-tauri/tauri.conf.json";

  const _viewModel = new CollectionsViewModel();

  const _viewModel2 = new EnvironmentViewModel();
  const _viewModel3 = new TestflowViewModel();

  let currentWorkspace: Observable<WorkspaceDocument> =
    _viewModel.getActiveWorkspace();
  let collectionList: Observable<CollectionDocument[]> =
    _viewModel.getCollectionList();

  let removeTab: Tab;
  let isPopupClosed: boolean = false;
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

  let localEnvironment;
  let globalEnvironment;

  let environments = _viewModel2.environments;

  let environmentsValues;
  let currentWOrkspaceValue: Observable<WorkspaceDocument>;

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
        tab?.type === TabTypeEnum.TESTFLOW) &&
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

  const handleClosePopupBackdrop = (flag: boolean) => {
    isPopupClosed = flag;
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
      removeTab.type === TabTypeEnum.TESTFLOW
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
        }
        loader = false;
      }
    } else if (
      removeTab.type === TabTypeEnum.REQUEST ||
      removeTab.type === TabTypeEnum.WEB_SOCKET
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
            notifications.success("API request saved");
          }
        } else if (removeTab.type === TabTypeEnum.WEB_SOCKET) {
          const res = await _viewModel.saveSocket(removeTab);
          if (res) {
            loader = false;
            _viewModel.handleRemoveTab(id);
            isPopupClosed = false;
            notifications.success("WebSocket request saved");
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
  let tabList;
  let activeTab;
  let prevWorkspaceId = "";
  let count = 0;
  const cw = currentWorkspace.subscribe((value) => {
    if (value) {
      if (prevWorkspaceId !== value._id) {
        _viewModel.fetchCollections(value?._id);
        _viewModel2.refreshEnvironment(value?._id);
        _viewModel3.refreshTestflow(value?._id);
        tabList = _viewModel.getTabListWithWorkspaceId(value._id);
        activeTab = _viewModel.getActiveTab(value._id);
      }
      prevWorkspaceId = value._id;
      if (count == 0) {
        let url = window.location.href;
        const params = new URLSearchParams(url.split("?")[1]);
        const isNew = params.get("first");
        if (isNew === "true") _viewModel.createNewTab();
        count = count + 1;
      }
      value.users?.forEach((user) => {
        if (user.id === userId) {
          userRole = user.role as string;
        }
      });
    }
  });

  $: {
    if (splitter && $leftPanelCollapse === true) {
      splitter.style.display = "none";
    }
    if (splitter && $leftPanelCollapse === false) {
      splitter.style.display = "unset";
    }
  }

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
          />
          <div style="flex:1; overflow: hidden;">
            <Route>
              {#if true}
                {#if $activeTab?.type === ItemType.REQUEST}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <RestExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === ItemType.COLLECTION}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <CollectionExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === ItemType.FOLDER}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <FolderExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === ItemType.ENVIRONMENT}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <EnvironmentExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === ItemType.WORKSPACE}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <WorkspaceExplorerPage
                        {collectionList}
                        tab={$activeTab}
                      />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === ItemType.WEB_SOCKET}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <WebSocketExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if $activeTab?.type === ItemType.TESTFLOW}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <TestFlowExplorerPage tab={$activeTab} />
                    </div>
                  </Motion>
                {:else if !$tabList?.length}
                  <Motion {...scaleMotionProps} let:motion>
                    <div class="h-100" use:motion>
                      <WorkspaceDefault
                        {currentWorkspace}
                        {handleCreateEnvironment}
                        onCreateTestflow={_viewModel3.handleCreateTestflow}
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

<WithModal
  isOpen={isPopupClosed}
  onModalStateChanged={handleClosePopupBackdrop}
  onSave={handlePopupSave}
  onCancel={handleClosePopupBackdrop}
  onDiscard={handlePopupDiscard}
  isSaveDisabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
  {loader}
  {isGuestUser}
/>

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
    onCollectionFileUpload={async (currentWorkspaceId, file) => {
      const response = await _viewModel.collectionFileUpload(
        currentWorkspaceId,
        file,
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
      : ""}
    requestUrl={removeTab.type === TabTypeEnum.REQUEST
      ? removeTab.property.request?.url
      : removeTab.type === TabTypeEnum.WEB_SOCKET
      ? removeTab?.property?.websocket?.url
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
    background-color: var(--bg-secondary-500) !important;
    border-left: 5px solid var(--border-secondary-900) !important;
    border-right: 0px solid var(--blackColor) !important;
    border-top: 0 !important;
    border-bottom: 0 !important;
  }
  :global(
      .collection-splitter .splitpanes__splitter:active,
      .collection-splitter .splitpanes__splitter:hover
    ) {
    background-color: var(--bg-primary-200) !important;
  }
</style>
