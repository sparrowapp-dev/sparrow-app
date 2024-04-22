<script lang="ts">
  import { Route } from "svelte-navigator";
  import { Pane, Splitpanes } from "svelte-splitpanes";
  // ---- Store
  import {
    collectionRightPanelWidth,
    collectionLeftPanelWidth,
    collapsibleState,
    userWorkspaceLevelRole,
  } from "$lib/store";
  import type { Writable } from "svelte/store";

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

  import type {
    CollectionDocument,
    EnvironmentDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import type { Observable } from "rxjs";

  const _viewModel = new CollectionsViewModel();

  let currentWorkspace: Observable<WorkspaceDocument> =
    _viewModel.getActiveWorkspace();
  let collectionList: Observable<CollectionDocument[]> =
    _viewModel.getCollectionList();
  let environmentList: Observable<EnvironmentDocument[]> =
    _viewModel.getEnvironmentList();
  const tabList: Writable<NewTab[]> = _viewModel.tabs;
  let loggedUserRoleInWorkspace: WorkspaceRole;
  let removeTab: NewTab;
  let isPopupClosed: boolean = false;
  let saveAsVisibility: boolean = false;
  let loader = false;
  let currentEnvironment: EnvironmentDocument;

  /**
   * Handle close tab functionality in tab bar list
   */
  const closeTab = (id: string, tab: NewTab) => {
    if (
      tab?.property?.request &&
      (!tab?.property?.request?.save?.api ||
        !tab?.property?.request?.save?.description)
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

  const handleClosePopupBackdrop = (flag) => {
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

  /**
   * Handles reloading collections and environment of workspace change
   */
  currentWorkspace
    .subscribe(async (workspace) => {
      currentEnvironment =
        await _viewModel.syncCollectionsWithBackend(workspace);
    })
    .unsubscribe();

  /**
   * Fetch role of user in workspace
   */
  userWorkspaceLevelRole.subscribe((value: any) => {
    if (value) {
      loggedUserRoleInWorkspace = value;
    }
  });
</script>

<Splitpanes
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
      {currentEnvironment}
      onCreateItem={_viewModel.handleCreateItem}
      onDeleteItem={_viewModel.handleDeleteItem}
      onRenameItem={_viewModel.handleRenameItem}
      onImportItem={_viewModel.handleImportItem}
      onOpenRequestOnTab={_viewModel.handleOpenRequestOnTab}
      onBranchSwitch={_viewModel.handleBranchSwitch}
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
    <br />
    <Route>
      <RestExplorer />
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
</style>
