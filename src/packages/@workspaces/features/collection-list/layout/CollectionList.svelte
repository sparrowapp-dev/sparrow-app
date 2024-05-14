<script lang="ts">
  export let collectionList: Observable<CollectionDocument[]>;
  export let showImportCollectionPopup: () => void;
  export let showImportCurlPopup: () => void;
  export let onItemCreated: (entityType: string, args: any) => void;
  export let onItemDeleted: (entityType: string, args: any) => void;
  export let onItemRenamed: (entityType: string, args: any) => void;
  export let onItemOpened: (entityType: string, args: any) => void;
  export let onSearchCollection: (
    collection: CollectionDocument[],
    searchData: string,
  ) => {
    filteredCollection: CollectionDocument[];
    filteredFile: RequestType[];
    filteredFolder: Folder[];
  };
  export let onBranchSwitched: (collection: CollectionDocument) => void;
  export let onRefetchCollection: (
    workspaceId: string,
    collection: CollectionDocument,
  ) => void;
  export let activeTabPath: Path;
  export let userRoleInWorkspace: WorkspaceRole;
  export let currentWorkspace: Observable<WorkspaceDocument>;
  export let leftPanelController: {
    leftPanelCollapse: boolean;
    handleCollapseCollectionList: () => void;
  };

  import {
    Collection,
    EmptyCollection,
    SearchTree,
  } from "@workspaces/features/collection-list/components";

  import doubleangleLeft from "$lib/assets/doubleangleLeft.svg";
  import doubleangleRight from "$lib/assets/doubleangleRight.svg";
  import SearchIcon from "$lib/assets/search.svelte";
  import FilterIcon from "$lib/assets/filter.svelte";
  import plusIcon from "$lib/assets/plus-white.svg";
  import CreateRequest from "$lib/assets/create_request.svg";
  import CreateCollection from "$lib/assets/collections-faded.svg";

  import { WorkspaceRole } from "$lib/utils/enums";
  import FilterDropDown from "$lib/components/dropdown/FilterDropDown.svelte";
  import { Dropdown } from "@common/components";
  import List from "$lib/components/list/List.svelte";
  import type { Observable } from "rxjs";
  import type {
    CollectionDocument,
    EnvironmentDocument,
    TabDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import type {
    Folder,
    Path,
    Request as RequestType,
  } from "$lib/utils/interfaces/request.interface";
  import {
    selectMethodsStore,
    selectedMethodsCollectionStore,
  } from "$lib/store";
  import { onDestroy, onMount } from "svelte";
  let runAnimation: boolean = true;
  let showfilterDropdown: boolean = false;
  let collectionListDocument: CollectionDocument[];
  let searchData: string = "";
  let filteredSelectedMethodsCollection: any = [];
  let filteredCollection: CollectionDocument[] = [];
  let filteredFolder: Folder[] = [];
  let filteredFile: RequestType[] = [];
  let selectedApiMethods: string[] = [];
  let addButtonMenu: boolean = false;

  const selectedMethodsCollectionUnsubscribe =
    selectedMethodsCollectionStore.subscribe((value) => {
      if (value) {
        filteredSelectedMethodsCollection = value;
      }
    });

  const selectedMethodUnsubscibe = selectMethodsStore.subscribe((value) => {
    if (value && value.length > 0) {
      selectedApiMethods = value;
    }
  });

  /**
   * Handle searching and filtering
   */
  const handleSearch = () => {
    let filteredData = onSearchCollection(collectionListDocument, searchData);
    filteredCollection = filteredData.filteredCollection ?? [];
    filteredFolder = filteredData.filteredFolder ?? [];
    filteredFile = filteredData.filteredFile ?? [];
  };
  $: {
    if (collectionList) {
      collectionList.subscribe((value) => {
        collectionListDocument = value;
      });
    }
  }

  onDestroy(() => {
    selectedMethodUnsubscibe();
    selectedMethodsCollectionUnsubscribe();
  });
</script>

{#if leftPanelController.leftPanelCollapse}
  <div>
    <button
      class="border-0 pb-5 angleRight w-16 position-absolute {leftPanelController.leftPanelCollapse
        ? 'd-block'
        : 'd-none'}"
      style="left:54px; top: 95px; width: 16px; height:92px; z-index: {leftPanelController.leftPanelCollapse
        ? '2'
        : '0'}"
      on:click={() => {
        leftPanelController.leftPanelCollapse =
          !leftPanelController.leftPanelCollapse;
        leftPanelController.handleCollapseCollectionList();
      }}
    >
      <img src={doubleangleRight} alt="Expand" class="mb-4 mt-2" />
      <div
        style="transform: rotate(270deg); font-size: 10px; color: var(--sparrow-text-color)"
        class="mt-3 ml-2"
      >
        Collections
      </div>
    </button>
  </div>
{/if}
{#if !leftPanelController.leftPanelCollapse}
  <div
    style="overflow-x: auto; overflow-y: auto"
    class={`sidebar ${
      leftPanelController.leftPanelCollapse
        ? runAnimation && "decrease-width"
        : runAnimation && " increase-width"
    } d-flex flex-column bg-secondary-900 scroll`}
  >
    <div
      class="d-flex justify-content-between align-items-center align-self-stretch ps-3 pe-3 pt-3"
    >
      <p class="mb-0 text-whiteColor ellipsis text-fs-16">
        {$currentWorkspace?.name || ""}
      </p>
      <button
        class=" border-0 rounded px-2 angleButton"
        on:click={() => {
          leftPanelController.leftPanelCollapse =
            !leftPanelController.leftPanelCollapse;
          leftPanelController.handleCollapseCollectionList();
        }}
        id="doubleAngleButton"
      >
        <img src={doubleangleLeft} alt="" class="filter-green" />
      </button>
    </div>
    <div
      class="d-flex align-items-center justify-content-between ps-3 pe-3 pt-3 gap-2"
    >
      <div
        style="height:32px; "
        class="inputField w-100 bg-backgroundDark ps-2 pe-1 gap-2 d-flex align-items-center justify-content-center rounded"
      >
        <SearchIcon />
        <input
          type="search"
          style="font-size: 12px; font-weight: 500;"
          class="inputField searchField border-0 w-100 h-100 bg-backgroundDark"
          placeholder="Search APIs in {$currentWorkspace?.name || ''}"
          bind:value={searchData}
          on:input={() => {
            handleSearch();
          }}
        />
      </div>
      <div class="d-flex align-items-center justify-content-center">
        <button
          id="filter-btn"
          class="filter-btn btn bg-backgroundDark d-flex align-items-center justify-content-center p-2
          {showfilterDropdown ? 'filter-active' : ''}"
          style="width: 32px; height:32px; position:relative"
          on:click={() => (showfilterDropdown = !showfilterDropdown)}
        >
          <FilterIcon width={300} height={30} color="gray" />
          {#if showfilterDropdown}
            <span
              class="position-absolute"
              style="right:4px; top:5px; height:4px; width:4px; background-color:#FF7878; border-radius: 50%;"
            />
          {/if}
        </button>
      </div>
      <!--  
        New dropdown button for adding new api, collection and import Curl
      -->
      <Dropdown
        buttonId="addButton"
        bind:isMenuOpen={addButtonMenu}
        options={[
          {
            name: "Add New API",
            icon: CreateRequest,
            onclick: () => onItemCreated("request", {}),
          },
          // {
          //   name: "Add Curl API",
          //   icon: CreateRequest,
          //   onclick: showImportCurlPopup,
          // },
          {
            name: "Add Collection",
            icon: CreateCollection,
            onclick: showImportCollectionPopup,
          },
        ]}
      >
        <button
          id="addButton"
          class="border-0 p-1 rounded add-button"
          on:click={() => {
            addButtonMenu = !addButtonMenu;
          }}
        >
          <img src={plusIcon} alt="" />
        </button>
      </Dropdown>
    </div>
    <div
      class="d-flex flex-column collections-list"
      style="overflow:hidden; margin-top:5px;"
    >
      <div class="d-flex flex-column justify-content-center px-3 pt-2">
        {#if false}
          <div class="spinner">
            <Spinner size={`32px`} />
          </div>
        {:else}
          {#if showfilterDropdown}
            <FilterDropDown {handleSearch} />
          {/if}
          {#if searchData.length > 0}
            <List
              height={"calc(100vh - 180px)"}
              classProps={"pb-2 pe-2"}
              overflowX="hidden"
            >
              {#if filteredFile.length > 0}
                {#each filteredFile as exp}
                  <SearchTree
                    workspaceId={exp.workspaceId}
                    {onItemOpened}
                    explorer={exp}
                    explorerData={exp.tree}
                    {searchData}
                  />
                {/each}
              {/if}
              {#if filteredFolder.length > 0}
                {#each filteredFolder as exp}
                  <SearchTree
                    workspaceId={exp.workspaceId}
                    {onItemOpened}
                    explorer={exp}
                    explorerData={exp.tree}
                    {searchData}
                  />
                {/each}
              {/if}
              {#if filteredCollection.length > 0}
                {#each filteredCollection as exp}
                  <SearchTree
                    workspaceId={exp.workspaceId}
                    {onItemOpened}
                    explorer={exp}
                    explorerData={exp.tree}
                    {searchData}
                  />
                {/each}
              {/if}
            </List>
          {:else if selectedApiMethods.length > 0}
            <List
              height={"calc(100vh - 180px)"}
              minHeight={"180px"}
              classProps={"pb-2 pe-2"}
              overflowX="hidden"
            >
              {#each filteredSelectedMethodsCollection as col}
                <Collection
                  {onItemCreated}
                  {onItemDeleted}
                  {onItemRenamed}
                  {onItemOpened}
                  {onBranchSwitched}
                  {onRefetchCollection}
                  {userRoleInWorkspace}
                  {activeTabPath}
                  collection={col._data}
                />
              {/each}
            </List>
          {:else if collectionListDocument && collectionListDocument.length > 0}
            <List
              height={"calc(100vh - 180px)"}
              minHeight={"180px"}
              classProps={"pb-2 pe-2"}
              overflowX="hidden"
            >
              {#if collectionListDocument}
                {#each collectionListDocument as col}
                  <Collection
                    {onItemCreated}
                    {onItemDeleted}
                    {onItemRenamed}
                    {onItemOpened}
                    {onBranchSwitched}
                    {onRefetchCollection}
                    {userRoleInWorkspace}
                    {activeTabPath}
                    collection={col}
                  />
                {/each}
              {/if}
            </List>
          {:else}
            <EmptyCollection
              {userRoleInWorkspace}
              handleCreateApiRequest={() => onItemCreated("request", {})}
              onImportCollectionPopup={showImportCollectionPopup}
            />
          {/if}
        {/if}
        {#if searchData !== "" && !filteredCollection.length && !filteredFolder.length && !filteredFile.length}
          <span class="not-found-text mx-auto ellipsis">No results found</span>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .add-button {
    background-color: var(--dropdown-button);
  }

  .add-button:hover {
    background-color: var(--dropdown-hover);
  }

  .view-active {
    filter: invert(98%) sepia(99%) saturate(24%) hue-rotate(160deg)
      brightness(107%) contrast(100%);
  }

  .view-active:hover {
    filter: invert(100%) sepia(100%) saturate(14%) hue-rotate(212deg)
      brightness(104%) contrast(104%);
  }

  .angleRight {
    background-color: var(--blackColor);
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
  .angleRight:hover {
    color: var(--blackColor);
    font-weight: 600;
    background-color: var(--workspace-hover-color);
  }

  .angleRight:active {
    color: var(--white-color);
    background-color: var(--button-pressed);
  }
  .angleButton {
    background-color: var(--background-color);
    cursor: pointer;
  }

  .angleButton:hover {
    background-color: var(--workspace-hover-color);
  }

  .angleButton:active {
    background-color: var(--button-pressed);
  }
  .sidebar {
    height: calc(100vh - 44px);
    overflow-y: auto;
  }
  .inputField {
    outline: none;
    border: 1px solid transparent;
  }
  .inputField:hover {
    border: 1px solid var(--workspace-hover-color);
  }
  /* 
  @keyframes increaseWidth {
    0% {
      width: 0;
    }

    100% {
      width: 280px;
    }
  }
  @keyframes decreaseWidth {
    0% {
      width: 280px;
    }
    100% {
      width: 0px;
    }
  } */

  .decrease-width {
    animation: decreaseWidth 0.3s;
    /* width: 0; */
    /* max-width: 280px; */
  }
  .increase-width {
    animation: increaseWidth 0.3s;
    /* max-width: 280px; */
  }
  .spinner {
    width: 100%;
    height: 70vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .searchField {
  }
  .filter-btn {
    /* border: 1px solid var(--border-color) !important; */
  }
  .filter-active {
    background-color: var(--send-button) !important;
  }
</style>
