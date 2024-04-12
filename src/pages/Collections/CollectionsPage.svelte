<script lang="ts">
  import { Route } from "svelte-navigator";
  import { Pane, Splitpanes } from "svelte-splitpanes";

  import {
    collectionRightPanelWidth,
    collectionLeftPanelWidth,
    collapsibleState,
    tabs,
  } from "$lib/store";

  import RestExplorer from "../RestExplorer/RestExplorer.svelte";
  import TabBar from "$lib/components/collections/tab-bar/TabBar.svelte";
  import { CollectionsViewModel } from "./Collections.ViewModel.old";
  import type { Writable } from "svelte/store";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import type { TabDocument } from "$lib/database/app.database";
  import { CollectionPageViewModel } from "./CollectionPage.ViewModel";
  import { ModalWrapperV1 } from "$lib/components";
  import ClosePopup from "$lib/components/collections/req-res-section/sub-components/close-popup/ClosePopup.svelte";
  import { CollectionListViewModel } from "$lib/components/collections/collections-list/CollectionList.ViewModel";
  const _viewModel = new CollectionsViewModel();
  const tabList: Writable<NewTab[]> = _viewModel.tabs;
  const tabList: Writable<NewTab[]> = _viewModel.tabs;
  const _collectionPageViewModel = new CollectionPageViewModel();

  let removeTab: NewTab;
  let movedTabStartIndex: number;
  let movedTabEndIndex: number;
  let closePopup: boolean = false;
  let saveAsVisibility: boolean = false;
  const closeTab = (id: string, tab: NewTab) => {
    if (
      tab?.property?.request &&
      (!tab?.property?.request?.save?.api ||
        !tab?.property?.request?.save?.description)
    ) {
      if (tab?.source !== "SPEC" || !tab?.activeSync || tab?.isDeleted) {
        removeTab = tab;
        closePopup = true;
      } else {
        _collectionPageViewModel.handleRemoveTab(id);
      }
    } else {
      _collectionPageViewModel.handleRemoveTab(id);
    }
  };
  const handleClosePopupBackdrop = (flag) => {
    closePopup = flag;
  };
  const handleSaveAsBackdrop = (flag) => {
    saveAsVisibility = flag;
  };
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
      handleDropOnStart={_collectionPageViewModel.handleDropOnStart}
      handleDropOnEnd={_collectionPageViewModel.handleDropOnEnd}
      updateCurrentTab={_collectionPageViewModel.handleActiveTab}
    />
    <br />
    <Route>
      <RestExplorer />
    </Route>
  </Pane>
</Splitpanes>

<ModalWrapperV1
  title={"Save Changes"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={closePopup}
  handleModalState={handleClosePopupBackdrop}
>
  <ClosePopup
    onFinish={(_id) => {
      _viewModel.handleRemoveTab(_id);
    }}
    componentData={removeTab}
    {handleSaveAsBackdrop}
    closeCallback={handleClosePopupBackdrop}
    saveApiRequest={_viewModel.saveAPIRequest}
    handleRemoveTab={_viewModel.handleRemoveTab}
  />
</ModalWrapperV1>

<style>
</style>
