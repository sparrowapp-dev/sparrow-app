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

  // ---- Interface, enum & constants
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import type { WorkspaceRole } from "$lib/utils/enums/team.enum";
  import { workspaceLevelPermissions } from "$lib/utils/constants/permissions.constant";

  // ---- View Model
  import { CollectionPageViewModel } from "./CollectionPage.ViewModel";

  // ---- helpers
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";

  const _collectionPageViewModel = new CollectionPageViewModel();
  const tabList: Writable<NewTab[]> = _collectionPageViewModel.tabs;
  let loggedUserRoleInWorkspace: WorkspaceRole;
  let removeTab: NewTab;
  let isPopupClosed: boolean = false;
  let saveAsVisibility: boolean = false;
  let loader = false;

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
        _collectionPageViewModel.handleRemoveTab(id);
      }
    } else {
      _collectionPageViewModel.handleRemoveTab(id);
    }
  };

  const handleClosePopupBackdrop = (flag) => {
    isPopupClosed = flag;
  };

  const handlePopupDiscard = () => {
    _collectionPageViewModel.handleRemoveTab(removeTab.id);
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
      const res = await _collectionPageViewModel.saveAPIRequest(removeTab);
      if (res) {
        loader = false;
        _collectionPageViewModel.handleRemoveTab(id);
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
</script>

<Splitpanes
  on:resize={(e) => {
    collectionLeftPanelWidth.set(e.detail[0].size);
    collectionRightPanelWidth.set(e.detail[1].size);
  }}
>
  <Pane size={$collapsibleState ? 0 : $collectionLeftPanelWidth}>
    <!-- TODO: Add new collection list component -->
    Collections List</Pane
  >
  <Pane size={$collapsibleState ? 100 : $collectionRightPanelWidth}>
    <TabBar
      bind:tabList={$tabList}
      onNewTabRequested={_collectionPageViewModel.createNewTab}
      onTabClosed={closeTab}
      onDropEvent={_collectionPageViewModel.onDropEvent}
      onDragStart={_collectionPageViewModel.handleDropOnStart}
      onDropOver={_collectionPageViewModel.handleDropOnEnd}
      onTabSelected={_collectionPageViewModel.handleActiveTab}
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
