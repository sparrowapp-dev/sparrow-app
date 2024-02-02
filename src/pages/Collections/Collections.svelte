<script lang="ts">
  import CollectionsList from "$lib/components/collections/collections-list/CollectionList.svelte";
  import RequestResponse from "$lib/components/collections/req-res-section/RequestResponse.svelte";
  import DefaultTabBar from "$lib/components/collections/req-res-section/sub-components/sub-components-header/DefaultTabBar.svelte";
  import TabBar from "$lib/components/collections/req-res-section/sub-components/sub-components-header/TabBar.svelte";
  import { collapsibleState } from "$lib/store/request-response-section";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { CollectionsViewModel } from "./Collections.ViewModel";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import MyWorkspace from "$lib/components/workspace/workspace-tab/myWorkspace.svelte";
  import { CollectionListViewModel } from "$lib/components/collections/collections-list/CollectionList.ViewModel";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { v4 as uuidv4 } from "uuid";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import type { Writable } from "svelte/store";
  import MyCollection from "$lib/components/collections/collection-tab/MyCollection.svelte";
  import MyFolder from "$lib/components/collections/folder-tab/MyFolder.svelte";
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { onDestroy, onMount } from "svelte";
  import type { WorkspaceDocument } from "$lib/database/app.database";
  import type { Observable } from "rxjs";
  import { environmentType } from "$lib/utils/enums/environment.enum";
  import { ActiveSideBarTabReposistory } from "$lib/repositories/active-sidebar-tab.repository";
  let runAnimation: boolean = false;
  const _viewModel = new CollectionsViewModel();
  const _collectionListViewModel = new CollectionListViewModel();
  const _activeSidebarTabViewModel = new ActiveSideBarTabReposistory();
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
    deleteCollection: _viewModel.deleteCollection,
    updateCollectionName: _viewModel.updateCollectionName,
    updateFolderName: _viewModel.updateFolderName,
    deleteRequestOrFolderInCollection:
      _viewModel.deleteRequestOrFolderInCollection,
    getCollectionList: _viewModel.getCollectionList,
    getActiveWorkspace: _viewModel.getActiveWorkspace,
    addRequestInFolder: _viewModel.addRequestInFolder,
    updateRequestInFolder: _viewModel.updateRequestInFolder,
    readRequestInFolder: _viewModel.readRequestInFolder,
    updateRequestInFolderCollection: _viewModel.updateRequestInFolderCollection,

    addRequestOrFolderInCollection: _viewModel.addRequestOrFolderInCollection,
    updateRequestOrFolderInCollection:
      _viewModel.updateRequestOrFolderInCollection,
    readRequestOrFolderInCollection: _viewModel.readRequestOrFolderInCollection,
    readCollection: _viewModel.readCollection,
    getNoOfApisandFolders: _viewModel.getNoOfApisandFolders,
    addCollection: _viewModel.addCollection,
    updateCollection: _viewModel.updateCollection,
    deleteRequestInFolderCollection: _viewModel.deleteRequestInFolderCollection,
    deleteRequestInFolder: _viewModel.deleteRequestInFolder,
    removeMultipleTabs: _viewModel.removeMultipleTabs,
    setRequestSave: _viewModel.setRequestSave,
    deleteCollectioninWorkspace: _viewModel.deleteCollectioninWorkspace,

    initActiveEnvironmentToWorkspace:
      _viewModel.initActiveEnvironmentToWorkspace,
    currentEnvironment: _viewModel.currentEnvironment,
    updateEnvironment: _viewModel.updateEnvironment,
    getGlobalEnvironment: _viewModel.getGlobalEnvironment,
  };

  const activeTab = _viewModel.activeTab;
  const tabList: Writable<NewTab[]> = _viewModel.tabs;
  const environments = _viewModel.environments;
  const handleKeyPress = (event) => {
    if (event.ctrlKey && event.code === "KeyN") {
      collectionsMethods.handleCreateTab(
        generateSampleRequest("UNTRACKED-" + uuidv4(), new Date().toString()),
      );
      moveNavigation("right");
    }
  };

  const collapseCollectionPanel = collapsibleState;
  const activeWorkspace: Observable<WorkspaceDocument> =
    _viewModel.getActiveWorkspace();
  let environmentVariables = [];
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      const activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        const environmentId = activeWorkspaceRxDoc.get("environmentId");
        if (environments) {
          const env = $environments;
          if (env?.length > 0) {
            const filteredEnv = env.filter((elem) => {
              if (
                elem.type === environmentType.GLOBAL ||
                elem.id === environmentId
              ) {
                return true;
              }
            });
            if (filteredEnv?.length > 0) {
              environmentVariables.length = 0;
              filteredEnv.forEach((elem) => {
                const temp = elem.toMutableJSON();
                temp.variable.forEach((variable) => {
                  if (variable.key && variable.checked) {
                    environmentVariables.push({
                      key: variable.key,
                      value: variable.value,
                      type: temp.type === environmentType.GLOBAL ? "G" : "E",
                      environment: temp.name,
                    });
                  }
                });
              });
            }
          }
        }
      }
    },
  );

  const onTabsSwitched = () => {
    _viewModel.syncTabWithStore();
  };
  const changeAnimation = () => {
    runAnimation = true;
  };

  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<Motion {...scaleMotionProps} let:motion>
  <div class="d-flex collection" use:motion>
    <div class="collections__list">
      <CollectionsList
        {runAnimation}
        {changeAnimation}
        activeTabId={$activeTab?.id}
        activePath={$activeTab?.path}
        environments={$environments}
        {collectionsMethods}
      />
    </div>
    <div
      style="width: {$collapseCollectionPanel
        ? 'calc(100vw - 72px)'
        : 'calc(100vw - 352px)'};"
      class="collections__tools bg-backgroundColor {$collapseCollectionPanel &&
      runAnimation
        ? 'sidebar-collapse'
        : runAnimation && 'sidebar-expand'}"
    >
      <div class="tab__bar">
        <TabBar
          tabList={$tabList}
          _tabId={$activeTab?.id}
          {collectionsMethods}
          {onTabsSwitched}
        />
      </div>
      <div class="tab__content d-flex">
        <div class="w-100">
          {#if $tabList && $tabList.length == 0}
            <DefaultTabBar {collectionsMethods} />
          {:else if $activeTab && $activeTab.type === ItemType.REQUEST}
            <RequestResponse
              {activeTab}
              {collectionsMethods}
              environmentVariables={environmentVariables.reverse()}
            />
          {:else if $activeTab && $activeTab.type === ItemType.WORKSPACE}
            <MyWorkspace
              {activeTab}
              {collectionsMethods}
              {_collectionListViewModel}
            />
          {:else if $activeTab && $activeTab.type === ItemType.FOLDER}
            <MyFolder
              {collectionsMethods}
              {activeTab}
              {_collectionListViewModel}
            />
          {:else if $activeTab && $activeTab.type === ItemType.COLLECTION}
            <MyCollection
              {collectionsMethods}
              {activeTab}
              {_collectionListViewModel}
            />
          {/if}
        </div>
      </div>
    </div>
  </div>
</Motion>
<svelte:window on:keydown={handleKeyPress} />

<style>
  .collections__tools {
    height: calc(100vh - 44px);
  }
  @keyframes increaseWidth {
    0% {
      width: calc(100vw - 352px);
    }

    100% {
      width: calc(100vw - 72px);
    }
  }
  @keyframes decreaseWidth {
    0% {
      width: calc(100vw - 72px);
    }
    100% {
      width: calc(100vw - 352px);
    }
  }
  .sidebar-expand {
    width: calc(100vw - 352px);
    animation: decreaseWidth 0.3s;
  }
  .sidebar-collapse {
    width: calc(100vw - 72px);
    animation: increaseWidth 0.3s;
  }
</style>
