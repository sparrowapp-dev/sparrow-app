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
  import RestExplorer from "../RestExplorer/RestExplorer.svelte";
  import TabBar from "$lib/components/collections/tab-bar/TabBar.svelte";
  import {
    CollectionList,
    ImportCollection,
    ImportCurl,
  } from "@workspaces/features";
  import CloseConfirmationPopup from "$lib/components/popup/CloseConfirmationPopup.svelte";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";

  // ---- Interface, enum & constants
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import type { WorkspaceRole } from "$lib/utils/enums/team.enum";
  import { workspaceLevelPermissions } from "$lib/utils/constants/permissions.constant";

  // ---- View Model
  import CollectionsViewModel from "./CollectionPage.ViewModel";

  // ---- helpers
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import type { TabDocument } from "$lib/database/app.database";
  import type { Observable } from "rxjs";
  import { onMount } from "svelte";
  import { ItemType } from "$lib/utils/enums";

  import type {
    CollectionDocument,
    EnvironmentDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";

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
  let currentEnvironment: Observable<EnvironmentDocument>;
  let splitter: any;

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
    console.log("on savee");
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
      saveAsVisibility = true;
    }
  };

  const handleCollapseCollectionList = () => {
    leftPanelCollapse.set(!$leftPanelCollapse);
    splitter.style.display = $leftPanelCollapse ? "none" : "unset";
  };

  /**
   * Handles reloading collections and environment of workspace change
   */
  currentWorkspace
    .subscribe(async (workspace) => {
      currentEnvironment =
        await _viewModel.syncCollectionsWithBackend(workspace);
    })
    .unsubscribe();

  // Rerender animation on tab switch
  let isAnimation = true;
  let prevTabId: string = "";
  let tabPath: Path;
  activeTab.subscribe((value: TabDocument) => {
    if (value) {
      if (prevTabId !== value.tabId) {
        tabPath = value.path;
        tabPath["requestId"] = value.id;
        isAnimation = false;
        setTimeout(() => {
          isAnimation = true;
        }, 10);
      }
      prevTabId = value.tabId;
    } else tabPath = {};
  });

  onMount(() => {
    splitter = document.querySelector(
      ".splitter-sidebar .splitpanes__splitter",
    ).style.width = "1px";
    let url = window.location.href;
    const params = new URLSearchParams(url.split("?")[1]);
    const isNew = params.get("first");
    if (isNew) _viewModel.createNewTab();
  });
</script>

<Splitpanes
  class="splitter-sidebar"
  on:resize={(e) => {
    leftPanelWidth.set(e.detail[0].size);
    rightPanelWidth.set(e.detail[1].size);
  }}
>
  <Pane size={$leftPanelCollapse ? 0 : $leftPanelWidth} minSize={20}>
    <CollectionList
      {collectionList}
      {environmentList}
      {currentEnvironment}
      {currentWorkspace}
      leftPanelController={{
        leftPanelCollapse: $leftPanelCollapse,
        handleCollapseCollectionList,
      }}
      userRoleInWorkspace={_viewModel.getUserRoleInWorspace()}
      activeTabPath={tabPath}
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
  <Pane size={$leftPanelCollapse ? 100 : $rightPanelWidth} minSize={60}>
    <TabBar
      tabList={$tabList}
      onNewTabRequested={_viewModel.createNewTab}
      onTabClosed={closeTab}
      onDropEvent={_viewModel.onDropEvent}
      onDragStart={_viewModel.handleDropOnStart}
      onDropOver={_viewModel.handleDropOnEnd}
      onTabSelected={_viewModel.handleActiveTab}
    />
    <Route>
      {#if isAnimation}
        {#if $activeTab && $activeTab?.type === ItemType.REQUEST}
          <Motion {...scaleMotionProps} let:motion>
            <div use:motion>
              <RestExplorer tab={$activeTab} />
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

<style>
  :global(.splitter-sidebar.splitpanes) {
    width: calc(100vw - 72px) !important;
  }
  :global(.splitpanes__splitter) {
    width: 1px;
  }
</style>
