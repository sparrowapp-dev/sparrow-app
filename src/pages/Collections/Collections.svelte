<script lang="ts">
  import CollectionsList from "$lib/components/collections/collections-list/CollectionList.svelte";
  import RequestResponse from "$lib/components/collections/req-res-section/RequestResponse.svelte";
  import SidebarRight from "$lib/components/collections/req-res-section/SidebarRight.svelte";
  import DefaultTabBar from "$lib/components/collections/req-res-section/sub-components/sub-components-header/DefaultTabBar.svelte";
  import TabBar from "$lib/components/collections/req-res-section/sub-components/sub-components-header/TabBar.svelte";
  import { collapsibleState } from "$lib/store/request-response-section";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { CollectionsViewModel } from "./Collections.ViewModel";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import MyWorkspace from "$lib/components/workspace/myWorkspace.svelte";
  import { CollectionListViewModel } from "$lib/components/collections/collections-list/CollectionList.ViewModel";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { v4 as uuidv4 } from "uuid";
  import { moveNavigation } from "$lib/utils/helpers/navigation";

  import type { Observable } from "rxjs";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import type { Writable } from "svelte/store";
  import MyCollection from "$lib/components/collections/collection-tab/MyCollection.svelte";

  const _viewModel = new CollectionsViewModel();
  const _collectionListViewModel = new CollectionListViewModel();

  const collectionsMethods: CollectionsMethods = {
    handleActiveTab: _viewModel.handleActiveTab,
    handleCreateTab: _viewModel.handleCreateTab,
    handleRemoveTab: _viewModel.handleRemoveTab,
    updateTab: _viewModel.updateTab,
    updateRequestProperty: _viewModel.updateRequestProperty,
    updateRequestState: _viewModel.updateRequestState,
    updateRequestAuth: _viewModel.updateRequestAuth,
    updateRequestBody: _viewModel.updateRequestBody,
    updateRequestBodyFormData: _viewModel.updateRequestBodyFormData,
    getCollectionDocument: _collectionListViewModel.getCollectionDocument,
    createCollection: _collectionListViewModel.createCollection,
    bulkInsert: _collectionListViewModel.bulkInsert,
    getAllCollections: _collectionListViewModel.getAllCollections,
    addRequestaddFolder: _collectionListViewModel.addRequest,
    addFolder: _collectionListViewModel.addFolder,
    deleteCollectionData: _viewModel.deleteCollectionData,
    updateCollectionName: _viewModel.updateCollectionName,
    updateFolderName: _viewModel.updateFolderName,
    deleteFolder: _viewModel.deleteFolder,
    getCollectionList: _viewModel.getCollectionList,
    getActiveWorkspace: _viewModel.getActiveWorkspace,
    addRequestInFolder: _viewModel.addRequestInFolder,
    updateRequestInFolder: _viewModel.updateRequestInFolder,
    updateRequestInFolderCollection: _viewModel.updateRequestInFolderCollection,

    addRequestOrFolderInCollection: _viewModel.addRequestOrFolderInCollection,
    updateRequestOrFolderInCollection:
      _viewModel.updateRequestOrFolderInCollection,
    addCollection: _viewModel.addCollection,
    updateCollection: _viewModel.updateCollection,
    deleteRequestInFolderCollection: _viewModel.deleteRequestInFolderCollection,
    deleteRequestInCollection: _viewModel.deleteRequestInCollection,
  };

  const activeTab = _viewModel.activeTab;
  const tabList: Writable<NewTab[]> = _viewModel.tabs;

  const handleKeyPress = (event) => {
    if (event.ctrlKey && event.code === "KeyN") {
      collectionsMethods.handleCreateTab(
        generateSampleRequest("UNTRACKED-" + uuidv4(), new Date().toString()),
      );
      moveNavigation("right");
    }
  };
</script>

<div class="d-flex collection">
  <div class="collections__list">
    <CollectionsList {collectionsMethods} />
  </div>
  <div
    class="collections__tools bg-backgroundColor"
    style="left:{$collapsibleState ? '72px' : '352px'}"
  >
    <div class="tab__bar">
      <TabBar tabList={$tabList} {collectionsMethods} />
    </div>
    <div class="tab__content">
      {#if $tabList && $tabList.length == 0}
        <DefaultTabBar {collectionsMethods} />
      {:else if $activeTab && $activeTab.type === ItemType.REQUEST}
        <RequestResponse {activeTab} {collectionsMethods} />
      {:else if $activeTab && $activeTab.type === ItemType.WORKSPACE}
        <MyWorkspace />
      {:else if $activeTab && $activeTab.type === ItemType.FOLDER}
        <p>FOLDER</p>
      {:else if $activeTab && $activeTab.type === ItemType.COLLECTION}
        <MyCollection {collectionsMethods} {activeTab} />
      {/if}
    </div>
    <SidebarRight />
  </div>
</div>
<svelte:window on:keydown={handleKeyPress} />

<style>
  .collections__tools {
    top: 44px;
    position: fixed;
    right: 0;
    left: 0;
    width: calc(100%-352px);
    height: calc(100vh - 44px);
    z-index: -1;
  }
  .tab__content {
    margin-right: 32px;
  }
</style>
