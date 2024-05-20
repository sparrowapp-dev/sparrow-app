<script lang="ts">
  import { Route } from "svelte-navigator";
  import { Pane, Splitpanes } from "svelte-splitpanes";
  // ---- Store
  import {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelCollapse,
  } from "@workspaces/common/stores";

  // ---- Animation
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "$lib/utils/animations";

  // ---- Components
  import {
    RestExplorerPage,
    CollectionExplorerPage,
    FolderExplorerPage,
  } from "../";
  import {
    TabBar,
    CollectionList,
    ImportCollection,
    ImportCurl,
  } from "@workspaces/features";
  import CloseConfirmationPopup from "$lib/components/popup/CloseConfirmationPopup.svelte";
  import { notifications } from "@library/ui/toast/Toast";

  // ---- Interface, enum & constants
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import type { WorkspaceRole } from "$lib/utils/enums/team.enum";
  import { workspaceLevelPermissions } from "$lib/utils/constants/permissions.constant";

  // ---- View Model
  import CollectionsViewModel from "./CollectionPage.ViewModel";

  // ---- helpers
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import type { TabDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import { onMount } from "svelte";
  import { ItemType } from "$lib/utils/enums";

  import type {
    CollectionDocument,
    EnvironmentDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import type { GithubRepoDocType } from "@app/models/github-repo.model";
  import ModalWrapperV1 from "@library/ui/modal/Modal.svelte";
  import SaveAsRequest from "@workspaces/features/save-as-request/layout/SaveAsRequest.svelte";

  const _viewModel = new CollectionsViewModel();

  let currentWorkspace: Observable<WorkspaceDocument> =
    _viewModel.getActiveWorkspace();
  let collectionList: Observable<CollectionDocument[]> =
    _viewModel.getCollectionList();
  let environmentList: Observable<EnvironmentDocument[]> =
    _viewModel.getEnvironmentList();
  const tabList: Observable<TabDocument[]> = _viewModel.tabs;
  const activeTab: Observable<TabDocument> = _viewModel.getActiveTab();

  let removeTab: NewTab;
  let isPopupClosed: boolean = false;
  let isImportCollectionPopup: boolean = false;
  let isImportCurlPopup: boolean = false;
  let loader = false;
  let splitter: HTMLElement | null;
  let isExposeSaveAsRequest: boolean = false;

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
  const closeTab = (id: string, tab: TabDocument) => {
    if (tab?.property?.request && !tab?.isSaved) {
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
    if (removeTab?.path.collectionId && removeTab?.path.workspaceId) {
      const id = removeTab?.id;
      loader = true;
      const res = await _viewModel.saveAPIRequest(removeTab);
      if (res) {
        loader = false;
        _viewModel.handleRemoveTab(id);
        isPopupClosed = false;
        notifications.success("API request saved");
      }
      loader = false;
    } else {
      isPopupClosed = false;
      isExposeSaveAsRequest = true;
    }
  };

  const handleCollapseCollectionList = () => {
    leftPanelCollapse.set(!$leftPanelCollapse);
  };

  // Rerender animation on tab switch
  let prevTabId: string = "";
  let tabPath: Path;
  activeTab.subscribe((value: TabDocument) => {
    if (value) {
      if (prevTabId !== value.tabId) {
        tabPath = value.path;
        tabPath["requestId"] = value.id;
      }
      prevTabId = value.tabId;
    } else tabPath = {};
  });

  let githubRepoData: GithubRepoDocType;
  onMount(async () => {
    let githubRepo = await _viewModel.getGithubRepo();
    githubRepoData = githubRepo?.getLatest().toMutableJSON();
    splitter = document.querySelector(
      ".collection-splitter .splitpanes__splitter",
    );
    let url = window.location.href;
    const params = new URLSearchParams(url.split("?")[1]);
    const isNew = params.get("first");
    if (isNew) _viewModel.createNewTab();
    await _viewModel.fetchGithubRepo();
    githubRepo = await _viewModel.getGithubRepo();
    githubRepoData = githubRepo?.getLatest().toMutableJSON();
  });

  $: {
    if (splitter && $leftPanelCollapse === true) {
      splitter.style.display = "none";
    }
    if (splitter && $leftPanelCollapse === false) {
      splitter.style.display = "unset";
    }
    if (currentWorkspace) {
      _viewModel.fetchCollections($currentWorkspace?._id);
    }
  }
</script>

<Splitpanes
  class="collection-splitter"
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
    <CollectionList
      {collectionList}
      {currentWorkspace}
      leftPanelController={{
        leftPanelCollapse: $leftPanelCollapse,
        handleCollapseCollectionList,
      }}
      githubRepo={githubRepoData}
      userRoleInWorkspace={_viewModel.getUserRoleInWorspace()}
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
    />
  </Pane>
  <Pane
    size={$leftPanelCollapse ? 100 : $rightPanelWidth}
    minSize={60}
    class="bg-secondary-800-important"
  >
    <TabBar
      tabList={$tabList}
      onNewTabRequested={_viewModel.createNewTab}
      onTabClosed={closeTab}
      onDropEvent={_viewModel.onDropEvent}
      onDragStart={_viewModel.handleDropOnStart}
      onDropOver={_viewModel.handleDropOnEnd}
      onTabSelected={_viewModel.handleActiveTab}
      onChangeViewInRequest={_viewModel.handleOnChangeViewInRequest}
    />
    <Route>
      {#if true}
        {#if $activeTab?.type === ItemType.REQUEST}
          <Motion {...scaleMotionProps} let:motion>
            <div use:motion>
              <RestExplorerPage tab={$activeTab} />
            </div>
          </Motion>
        {:else if $activeTab?.type === ItemType.COLLECTION}
          <Motion {...scaleMotionProps} let:motion>
            <div use:motion>
              <CollectionExplorerPage tab={$activeTab} />
            </div>
          </Motion>
        {:else if $activeTab?.type === ItemType.FOLDER}
          <Motion {...scaleMotionProps} let:motion>
            <div use:motion>
              <FolderExplorerPage tab={$activeTab} />
            </div>
          </Motion>
        {/if}
      {/if}
    </Route>
  </Pane>
</Splitpanes>

<CloseConfirmationPopup
  isOpen={isPopupClosed}
  onModalStateChanged={handleClosePopupBackdrop}
  onSave={handlePopupSave}
  onCancel={handleClosePopupBackdrop}
  onDiscard={handlePopupDiscard}
  isSaveDisabled={!hasWorkpaceLevelPermission(
    _viewModel.getUserRoleInWorspace(),
    workspaceLevelPermissions.SAVE_REQUEST,
  )}
  {loader}
/>

<svelte:window on:keydown={handleKeyPress} />
{#if isImportCollectionPopup}
  <ImportCollection
    {collectionList}
    workspaceId={$currentWorkspace._id}
    closeImportCollectionPopup={() => (isImportCollectionPopup = false)}
    onItemCreated={_viewModel.handleCreateItem}
    onItemImported={_viewModel.handleImportItem}
    onImportDataChange={_viewModel.handleImportDataChange}
    onUploadFile={_viewModel.uploadFormFile}
    onExtractGitBranch={_viewModel.extractGitBranch}
  />
{/if}

{#if isImportCurlPopup}
  <ImportCurl
    workspaceId={$currentWorkspace._id}
    onClosePopup={() => (isImportCurlPopup = false)}
    onItemImported={_viewModel.handleImportItem}
  />
{/if}

<ModalWrapperV1
  title={"Save Request"}
  type={"dark"}
  width={"55%"}
  zIndex={10000}
  isOpen={isExposeSaveAsRequest}
  handleModalState={(flag = false) => {
    isExposeSaveAsRequest = flag;
  }}
>
  <SaveAsRequest
    onClick={(flag = false) => {
      isExposeSaveAsRequest = flag;
    }}
    requestMethod={removeTab.property.request?.method}
    requestUrl={removeTab.property.request?.url}
    requestName={removeTab.name}
    requestDescription={removeTab.description}
    requestPath={removeTab.path}
    collections={$collectionList}
    readWorkspace={_viewModel.readWorkspace}
    onSaveAsRequest={async (
      _workspaceMeta,
      path,
      tabName,
      description,
      type,
    ) => {
      const res = await _viewModel.saveAsRequest(
        _workspaceMeta,
        path,
        tabName,
        description,
        type,
        removeTab,
      );
      if (res.status === "success") {
        _viewModel.handleRemoveTab(removeTab.id);
      }
      return res;
    }}
    onCreateFolder={_viewModel.createFolderFromSaveAs}
    onCreateCollection={_viewModel.createCollectionFromSaveAs}
  />
</ModalWrapperV1>

<style>
  :global(.collection-splitter .splitpanes__splitter) {
    width: 10.5px !important;
    height: 100% !important;
    background-color: var(--bg-secondary-500) !important;
    border-left: 5px solid var(--border-secondary-900) !important;
    border-right: 5px solid var(--border-secondary-800) !important;
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
