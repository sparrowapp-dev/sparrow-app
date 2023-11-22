<script lang="ts">
  import CollectionsList from "$lib/components/collections/collections-list/CollectionList.svelte";
  import RequestResponse from "$lib/components/collections/req-res-section/RequestResponse.svelte";
  import SidebarRight from "$lib/components/collections/req-res-section/SidebarRight.svelte";
  import DefaultTabBar from "$lib/components/collections/req-res-section/sub-components/sub-components-header/DefaultTabBar.svelte";
  import TabBar from "$lib/components/collections/req-res-section/sub-components/sub-components-header/TabBar.svelte";
  import { collapsibleState } from "$lib/store/request-response-section";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Observable } from "rxjs";
  import { CollectionsViewModel } from "./Collections.ViewModel";
  import type { TabDocument } from "$lib/database/app.database";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import MyWorkspace from "$lib/components/workspace/myWorkspace.svelte";

  const _viewModel = new CollectionsViewModel();

  const collectionsMethods: CollectionsMethods = {
    handleActiveTab: _viewModel.handleActiveTab,
    handleCreateTab: _viewModel.handleCreateTab,
    handleRemoveTab: _viewModel.handleRemoveTab,
    extractTabDocument: _viewModel.extractTabDocument,
    updateTab: _viewModel.updateTab,
    updateRequestProperty: _viewModel.updateRequestProperty,
    updateRequestState: _viewModel.updateRequestState,
    updateRequestAuth: _viewModel.updateRequestAuth,
    updateRequestBody: _viewModel.updateRequestBody,
    updateRequestBodyFormData: _viewModel.updateRequestBodyFormData,
  };

  const activeTab: Observable<TabDocument> = _viewModel.activeTab;
  const tabList: Observable<TabDocument[]> = _viewModel.tabs;
</script>

<div class="d-flex">
  <div class="collections__list">
    <CollectionsList />
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
        <p>COLLECTION</p>
      {/if}
    </div>
  </div>
  <SidebarRight />
</div>

<style>
  .collections__tools {
    top: 44px;
    position: fixed;
    right: 0;
    width: calc(100%-352px);
    height: calc(100vh - 44px);
  }
  .tab__content {
    margin-right: 32px;
  }
</style>
