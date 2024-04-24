<script lang="ts">
  import { Route } from "svelte-navigator";
  import { Pane, Splitpanes } from "svelte-splitpanes";
  // ---- Store
  import {
    collectionRightPanelWidth,
    collectionLeftPanelWidth,
    collapsibleState,
    userWorkspaceLevelRole,
    user,
  } from "$lib/store";

  // ---- Animation
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "$lib/utils/animations";

  // ---- Components
  import RestExplorer from "../RestExplorer/RestExplorer.svelte";
  import TabBar from "$lib/components/collections/tab-bar/TabBar.svelte";
  import CloseConfirmationPopup from "$lib/components/popup/CloseConfirmationPopup.svelte";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import CollectionList from "$lib/components/collections/collections-list/CollectionList.svelte";

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
  import { generateSampleRequest } from "$lib/utils/sample";
  import { onMount } from "svelte";
  import { ItemType } from "$lib/utils/enums";
  import { DashboardViewModel } from "../Dashboard/Dashboard.ViewModel.old";

  import type {
    CollectionDocument,
    EnvironmentDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import type { Observable } from "rxjs";

  const _viewModel = new CollectionsViewModel();
  _viewModel.syncCollectionsWithBackend();

  let currentWorkspace: Observable<WorkspaceDocument> =
    _viewModel.getActiveWorkspace();
  let collectionList: Observable<CollectionDocument[]> =
    _viewModel.getCollectionList();
  let environmentList: Observable<EnvironmentDocument[]> =
    _viewModel.getEnvironmentList();
  const tabList: Writable<NewTab[]> = _viewModel.tabs;
  const tabList: Observable<TabDocument[]> = _viewModel.tabs;
  const activeTab: Observable<TabDocument> = _viewModel.activeTab;
  let loggedUserRoleInWorkspace: WorkspaceRole;
  let removeTab: NewTab;
  let isPopupClosed: boolean = false;
  let saveAsVisibility: boolean = false;
  let loader = false;

  // TODO: Shift this to other place for getting Teams and Workspaces
  let n = new DashboardViewModel();
  user.subscribe(async (value) => {
    await n.refreshTeams(value._id);
    await n.refreshWorkspaces(value._id);
  });

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

  userWorkspaceLevelRole.subscribe((value: WorkspaceRole) => {
    if (value) {
      loggedUserRoleInWorkspace = value;
    }
  });

  // Rerender animation on tab switch
  let isAnimation = true;
  let prevTabId = "";
  let tab: TabDocument | {};
  activeTab.subscribe((value: TabDocument) => {
    if (value) {
      if (prevTabId !== value.tabId) {
        tab = value;
        isAnimation = false;
        setTimeout(() => {
          isAnimation = true;
        }, 10);
      }
      prevTabId = value.tabId;
    }
    // else tab = {};
  });

  let splitter;
  onMount(() => {
    splitter = document.querySelector(
      ".splitter-sidebar .splitpanes__splitter",
    );
    splitter.style.width = "1px";

    let url = window.location.href;
    const params = new URLSearchParams(url.split("?")[1]);
    const isNew = params.get("first");
    if (isNew) _collectionPageViewModel.createNewTab();
  });

  $: {
    if (splitter && $collapsibleState === true) {
      splitter.style.display = "none";
    }
    if (splitter && $collapsibleState === false) {
      splitter.style.display = "unset";
    }
  }
</script>

<Splitpanes
  class="splitter-sidebar"
  on:resize={(e) => {
    collectionLeftPanelWidth.set(e.detail[0].size);
    collectionRightPanelWidth.set(e.detail[1].size);
  }}
>
  <Pane size={$collapsibleState ? 0 : $collectionLeftPanelWidth}>
    <!-- TODO: Add new collection list component -->
    <CollectionList
      {collectionList}
      {environmentList}
      onCreateCollection={_viewModel.handleCreateCollection}
      onCreateApiRequest={_viewModel.handleCreateApiRequest}
      onCreateRequestInCollection={_viewModel.handleCreateRequestInCollection}
      onCreateRequestInFolder={_viewModel.handleCreateRequestInFolder}
      onCreateFolderInCollection={_viewModel.handleCreateFolderInCollection}
      onDeleteCollection={_viewModel.handleDeleteCollection}
      onDeleteFolder={_viewModel.handleDeleteFolder}
      onDeleteRequest={_viewModel.handleDeleteRequest}
      onRenameCollection={_viewModel.handleRenameCollection}
      onRenameFolder={_viewModel.handleRenameFolder}
      onRenameRequest={_viewModel.handleRenameRequest}
      onOpenRequestOnTab={_viewModel.handleOpenRequestOnTab}
      onBranchSwitch={_viewModel.handleBranchSwitch}
      onImportCurl={_viewModel.handleImportCurl}
      onImportCollection={_viewModel.handleImportCollection}
      onInputDataChange={_viewModel.handleInputDataChange}
      onUploadFile={_viewModel.uploadFormFile}
      onExtractGitBranch={_viewModel.extractGitBranch}
      onRefetchCollection={_viewModel.handleRefetchCollection}
      onSearchCollection={_viewModel.handleSearchCollection}
      getActiveTab={_viewModel.getActiveTab}
      getUserRoleInWorkspace={_viewModel.getUserRoleInWorspace}
      {currentWorkspace}
    />
  </Pane>
  <Pane size={$collapsibleState ? 100 : $collectionRightPanelWidth}>
    <TabBar
      bind:tabList={$tabList}
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
    loggedUserRoleInWorkspace,
    workspaceLevelPermissions.SAVE_REQUEST,
  )}
  {loader}
/>

<style>
  :global(.splitter-sidebar.splitpanes) {
    width: calc(100vw - 72px) !important;
  }
</style>
