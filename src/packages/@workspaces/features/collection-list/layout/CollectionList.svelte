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
  export let activeTabPath;
  export let activeTabId;
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
  import { onDestroy } from "svelte";
  import { DoubleArrowIcon, GithubIcon } from "@library/icons";
  import { WithButton } from "@workspaces/common/hoc";
  import { version } from "../../../../../../src-tauri/tauri.conf.json";
  import { createDeepCopy } from "$lib/utils/helpers";
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

  /* eslint-disable @typescript-eslint/no-explicit-any */
  let collectionFilter: any = [];
  const searchCollectionHelper: (searchText: string, tree: any) => any = (
    searchText,
    tree,
  ) => {
    if (tree.name.toLowerCase().includes(searchText.toLowerCase())) {
      return tree;
    }

    // Recursively search through the tree structure
    if (tree && tree?.items?.length) {
      let response = [];
      for (let j = 0; j < tree.items.length; j++) {
        const res = searchCollectionHelper(searchText, tree.items[j]);
        if (res) {
          response.push(res);
        }
      }
      if (response.length) {
        let item = createDeepCopy(tree);
        item.items = response;
        return item;
      } else {
        return 0;
      }
    }
    return 0;
  };
  const searchCollection: (
    searchText: string,
    collectionData: any[],
  ) => void = (searchText, collectionData) => {
    let response = [];
    for (let i = 0; i < collectionData.length; i++) {
      const res = searchCollectionHelper(searchText, collectionData[i]);
      if (res) {
        response.push(res);
      }
    }
    return response;
  };
  /**
   * Handle searching and filtering
   */
  const handleSearch = () => {
    collectionFilter = searchCollection(searchData, collectionListDocument);
  };
  $: {
    if (collectionList) {
      collectionList.subscribe((value) => {
        collectionListDocument = value;
        collectionFilter = searchCollection(searchData, collectionListDocument);
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
      class="d-flex align-items-center justify-content-center border-0 angleRight w-16 position-absolute {leftPanelController.leftPanelCollapse
        ? 'd-block'
        : 'd-none'}"
      style="left:52px; bottom: 20px; width: 20px; height:20px; z-index: {leftPanelController.leftPanelCollapse
        ? '2'
        : '0'}"
      on:click={() => {
        leftPanelController.leftPanelCollapse =
          !leftPanelController.leftPanelCollapse;
        leftPanelController.handleCollapseCollectionList();
      }}
    >
      <span
        style="transform: rotate(180deg);"
        class="position-relative d-flex align-items-center justify-content-center"
      >
        <DoubleArrowIcon
          height={"10px"}
          width={"10px"}
          color={"var(--text-primary-200)"}
        />
      </span>
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
      class="d-flex justify-content-between align-items-center align-self-stretch ps-3 pe-3 pt-3 d-none"
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
      class="d-flex align-items-center justify-content-between ps-3 pe-3 pt-3 gap-1"
    >
      <div
        style="height:32px; "
        class="inputField w-100 bg-tertiary-400 ps-2 pe-1 gap-2 d-flex align-items-center justify-content-center border-radius-2"
      >
        <SearchIcon />
        <input
          type="search"
          style="font-size: 12px; font-weight: 500;"
          class="inputField searchField border-0 w-100 h-100 bg-tertiary-400"
          placeholder="Search"
          bind:value={searchData}
          on:input={() => {
            handleSearch();
          }}
        />
      </div>
      <div class="d-flex align-items-center justify-content-center">
        <button
          id="filter-btn"
          class="filter-btn btn bg-backgroundDark d-flex align-items-center justify-content-center p-2 d-none
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
        zIndex={600}
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
          class="border-0 p-1 border-radius-2 add-button"
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
        {#if collectionListDocument?.length > 0}
          {#if searchData.length > 0}
            {#if collectionFilter.length > 0}
              <List height={"calc(100vh - 160px)"} classProps={"pb-2 pe-1"}>
                {#each collectionFilter as col}
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
                    {activeTabId}
                  />
                {/each}
              </List>
            {:else}
              <List height={"calc(100vh - 160px)"} classProps={"pb-2 pe-1"}>
                <span class="not-found-text text-fs-12 mx-auto ellipsis"
                  >No results found</span
                >
              </List>
            {/if}
          {:else}
            <List height={"calc(100vh - 160px)"} classProps={"pb-2 pe-1"}>
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
                  {activeTabId}
                />
              {/each}
            </List>
          {/if}
        {:else}
          <EmptyCollection
            {userRoleInWorkspace}
            handleCreateApiRequest={() => onItemCreated("request", {})}
            onImportCollectionPopup={showImportCollectionPopup}
          />
        {/if}
      </div>
      <div class="p-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <GithubIcon />
          <span class="ps-2 text-fs-14"> 120 </span>
        </div>
        <div class="d-flex align-items-center">
          <span class="text-fs-14 text-secondary-200 pe-2">v{version}</span>
          <WithButton
            icon={DoubleArrowIcon}
            onClick={() => {
              leftPanelController.leftPanelCollapse =
                !leftPanelController.leftPanelCollapse;
              leftPanelController.handleCollapseCollectionList();
            }}
            disable={false}
            loader={false}
          />
        </div>
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
  }

  .angleRight:active {
    color: var(--white-color);
    /* background-color: var(--button-pressed); */
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
