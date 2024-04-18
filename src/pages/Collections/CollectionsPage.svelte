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

  // ---- Animation
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "$lib/utils/animations";

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
  import type { TabDocument } from "$lib/database/app.database";
  import type { Observable } from "rxjs";
  import { generateSampleRequest } from "$lib/utils/sample";
  import { onMount } from "svelte";

  const _collectionPageViewModel = new CollectionPageViewModel();
  const tabList: Observable<TabDocument[]> = _collectionPageViewModel.tabs;
  const activeTab: Observable<TabDocument> = _collectionPageViewModel.activeTab;
  let loggedUserRoleInWorkspace: WorkspaceRole;
  let removeTab: NewTab;
  let isPopupClosed: boolean = false;
  let saveAsVisibility: boolean = false;
  let loader = false;

  /**
   * Handle close tab functionality in tab bar list
   */
  const closeTab = (id: string, tab: TabDocument) => {
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

  const handleClosePopupBackdrop = (flag: boolean) => {
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

  // Rerender animation on tab switch
  let isAnimation = true;
  let prevTabid = "";
  activeTab.subscribe((value: TabDocument) => {
    if (value) {
      if (prevTabid !== value.tabId) {
        isAnimation = false;
        setTimeout(() => {
          isAnimation = true;
        }, 10);
      }
      prevTabid = value.tabId;
    }
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
  <Pane
    class="sidebar-left-panel"
    minSize={20}
    size={$collapsibleState ? 0 : $collectionLeftPanelWidth}
  >
    <!-- TODO: Add new collection list component -->
    Collections List
  </Pane>
  <Pane
    class="sidebar-right-panel"
    minSize={60}
    size={$collapsibleState ? 100 : $collectionRightPanelWidth}
  >
    <TabBar
      tabList={$tabList}
      onNewTabRequested={_collectionPageViewModel.createNewTab}
      onTabClosed={closeTab}
      onDropEvent={_collectionPageViewModel.onDropEvent}
      onDragStart={_collectionPageViewModel.handleDropOnStart}
      onDropOver={_collectionPageViewModel.handleDropOnEnd}
      onTabSelected={_collectionPageViewModel.handleActiveTab}
    />
    <Route>
      {#if isAnimation}
        <Motion {...scaleMotionProps} let:motion>
          <div use:motion>
            <RestExplorer />
          </div>
        </Motion>
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
