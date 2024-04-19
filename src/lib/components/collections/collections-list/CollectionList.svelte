<script lang="ts">
  export let collectionList: Observable<CollectionDocument[]>;
  export let environmentList: Observable<EnvironmentDocument[]>;
  export let onCreateCollection: () => void;
  export let onCreateRequestInCollection: (
    collection: CollectionDocument,
  ) => void;
  export let onCreateFolderInCollection: (
    collection: CollectionDocument,
  ) => void;
  export let onCreateRequestInFolder: (
    collection: CollectionDocument,
    explorer: any,
  ) => void;
  export let onDeleteCollection: (
    collection: CollectionDocument,
    deletedIds: [string] | [],
  ) => void;
  export let onDeleteFolder: (
    collection: CollectionDocument,
    explorer: any,
    requestIds: [string],
  ) => void;
  export let onDeleteRequest: (
    collection: CollectionDocument,
    request: any,
    folder: any,
  ) => Promise<boolean>;
  export let onRenameCollection: (
    collection: CollectionDocument,
    newCollectionName: string,
  ) => void;
  export let onRenameFolder: (
    collection: CollectionDocument,
    explorer: any,
    newFolderName: string,
  ) => void;
  export let onRenameRequest: (
    collection: CollectionDocument,
    folder: any,
    request: any,
    newRequestName: string,
  ) => void;
  export let onCreateApiRequest: () => void;
  export let onImportCollection: (
    importData: any,
    currentBranch: string,
    getBranchList: [any],
    uploadCollection: any,
    validations: {
      activeSync: boolean;
      isRepositoryPath: boolean;
      isRepositoryPathTouched: boolean;
      isRepositoryBranchTouched: boolean;
      importType: "file" | "text";
      isTextEmpty: boolean;
      isValidClientJSON: boolean;
      isValidServerJSON: boolean;
      isValidClientXML: boolean;
      isValidServerXML: boolean;
      isValidClientDeployedURL: boolean;
      isValidServerDeployedURL: boolean;
      isValidClientURL: boolean;
      isValidServerURL: boolean;
      repositoryBranch: string;
      repositoryPath: string;
    },
  ) => void;
  export let onSearchCollection: (
    collection: CollectionDocument[],
    searchData: string,
  ) => {
    filteredCollection: any;
    filteredFile: any;
    filteredFolder: any;
  };
  export let onOpenRequestOnTab: (request: any, path: Path) => void;
  export let onBranchSwitch: (collection: CollectionDocument) => void;
  export let onInputDataChange: (importData: string) => Promise<{
    isValidClientURL: boolean;
    isValidClientJSON: boolean;
    isValidClientXML: boolean;
    isValidServerURL: boolean;
    isValidServerJSON: boolean;
    isValidServerXML: boolean;
    isValidClientDeployedURL: boolean;
    isValidServerDeployedURL: boolean;
    isimportDataLoading: boolean;
  }>;
  export let onUploadFile: () => Promise<
    | undefined
    | {
        repositoryPath: string;
        currentBranch: string;
        repositoryBranch: string;
        getBranchList: any;
        isRepositoryPath: boolean;
      }
  >;
  export let onExtractGitBranch: (filePath: string) => Promise<
    | undefined
    | {
        repositoryPath: string;
        currentBranch: string;
        repositoryBranch: string;
        getBranchList: any;
        isRepositoryPath: boolean;
      }
  >;
  export let onRefetchCollection: (collection: CollectionDocument) => void;
  export let getActiveTab: () => Writable<{}>;
  export let getUserRoleInWorkspace: () => WorkspaceRole;
  export let onImportCurl: (curl: string) => void;
  export let currentWorkspace: Observable<WorkspaceDocument>;

  import doubleangleLeft from "$lib/assets/doubleangleLeft.svg";
  import doubleangleRight from "$lib/assets/doubleangleRight.svg";
  import SearchIcon from "$lib/assets/search.svelte";
  import FilterIcon from "$lib/assets/filter.svelte";
  import plusIcon from "$lib/assets/plus.svg";

  import { WorkspaceRole } from "$lib/utils/enums";
  import Collection from "./collection/Collection.svelte";
  import FilterDropDown from "$lib/components/dropdown/FilterDropDown.svelte";
  import RequestDropdown from "$lib/components/dropdown/RequestDropdown.svelte";
  import Select from "$lib/components/inputs/select/Select.svelte";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import ImportCollection from "./import-collection/ImportCollection.svelte";
  import ImportCurl from "./import-curl/ImportCurl.svelte";
  import List from "$lib/components/list/List.svelte";
  import EmptyCollection from "./empty-collection/EmptyCollection.svelte";
  import type { Observable } from "rxjs";
  import type {
    CollectionDocument,
    EnvironmentDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import type { Writable } from "svelte/store";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import {
    selectMethodsStore,
    selectedMethodsCollectionStore,
  } from "$lib/store";
  import { onDestroy } from "svelte";
  import SearchTree from "./searchTree/SearchTree.svelte";
  let collapsExpandToggle: boolean = false;
  let isImportCollectionPopup: boolean = false;
  let isImportCurlPopup: boolean = false;
  let runAnimation: boolean = true;
  let showfilterDropdown: boolean = false;
  let currentEnvironment: string = "";
  let collectionListDocument: CollectionDocument[];
  let searchData: string = "";
  let filteredSelectedMethodsCollection: any = [];
  let filteredCollection: CollectionDocument[] = [];
  let filteredFolder: any = [];
  let filteredFile: any = [];
  let selectedApiMethods: any = [];

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

  const handleAddButton = (id: string) => {
    if (id === "collection") {
      isImportCollectionPopup = !isImportCollectionPopup;
    } else if (id === "importcURL") {
      isImportCurlPopup = !isImportCurlPopup;
    } else if (id === "apiRequest") {
      onCreateApiRequest();
    }
  };

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

{#if collapsExpandToggle}
  <div>
    <button
      class="border-0 pb-5 angleRight w-16 position-absolute {collapsExpandToggle
        ? 'd-block'
        : 'd-none'}"
      style="left:72px; top: 95px; width: 16px; height:92px; z-index: {collapsExpandToggle
        ? '2'
        : '0'}"
      on:click={() => {
        collapsExpandToggle = !collapsExpandToggle;
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
{#if !collapsExpandToggle}
  <div
    style="overflow-x: auto; overflow-y: auto"
    class={`sidebar ${
      collapsExpandToggle
        ? runAnimation && "decrease-width"
        : runAnimation && " increase-width"
    } d-flex flex-column bg-backgroundColor scroll`}
  >
    <div
      class="d-flex justify-content-between align-items-center align-self-stretch ps-3 pe-3 pt-3"
    >
      <p class="mb-0 text-whiteColor ellipsis" style="font-size: 18px;">
        {$currentWorkspace?.name || ""}
      </p>
      <button
        class=" border-0 rounded px-2 angleButton"
        on:click={() => {
          collapsExpandToggle = !collapsExpandToggle;
        }}
        id="doubleAngleButton"
      >
        <img src={doubleangleLeft} alt="" class="filter-green" />
      </button>
    </div>
    <div class="px-3 pt-2">
      <Select
        id="none"
        titleId={"none"}
        data={[
          {
            name: "none",
            id: "none",
            color: "light",
            default: false,
            hide: false,
          },
        ].concat(
          $environmentList
            ? $environmentList.map((env) => {
                return {
                  name: env?.name,
                  id: env?.id,
                  color: "light",
                  default: false,
                  hide: false,
                };
              })
            : [],
        )}
        onclick={(env) => (currentEnvironment = env)}
        headerTheme="transparent"
        borderType="none"
        borderActiveType="bottom"
        borderRounded={false}
        bodyTheme="dark"
      />
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
      <div>
        <Dropdown
          dropdownId={"collectionDropdown"}
          dropDownType={{ type: "img", title: plusIcon }}
          staticCustomStyles={[
            {
              id: "collectionDropdown-options-container",
              styleKey: "minWidth",
              styleValue: "160px",
            },
          ]}
          data={[
            {
              name: "Collection",
              id: "collection",
              dynamicClasses: "text-whiteColor",
            },
            {
              name: "API Request",
              id: "apiRequest",
              dynamicClasses: "text-whiteColor mt-1",
            },
            {
              name: "Import via cURL",
              id: "importcURL",
              dynamicClasses: "text-whiteColor mt-1",
            },
          ]}
          onclick={handleAddButton}
          staticClasses={[
            {
              id: "collectionDropdown-img",
              classToAdd: ["btn", "bg-backgroundDark", "p-1", "rounded"],
            },
            {
              id: "collectionDropdown-options-container",
              classToAdd: ["end-0", "mt-1"],
            },
          ]}
        ></Dropdown>
      </div>
    </div>
    <div
      class="d-flex flex-column collections-list"
      style="overflow:hidden; margin-top:5px;"
    >
      <div class="d-flex flex-column justify-content-center">
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
              classProps={"p-3"}
              overflowX="hidden"
            >
              {#if filteredFile.length > 0}
                {#each filteredFile as exp}
                  <SearchTree
                    explorer={exp}
                    explorerData={exp.tree}
                    {searchData}
                  />
                {/each}
              {/if}
              {#if filteredFolder.length > 0}
                {#each filteredFolder as exp}
                  <SearchTree
                    explorer={exp}
                    explorerData={exp.tree}
                    {searchData}
                  />
                {/each}
              {/if}
              {#if filteredCollection.length > 0}
                {#each filteredCollection as exp}
                  <SearchTree
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
              classProps={"p-3"}
              overflowX="hidden"
            >
              {#each filteredSelectedMethodsCollection as col}
                <Collection
                  {onCreateRequestInCollection}
                  {onCreateFolderInCollection}
                  {onCreateRequestInFolder}
                  {onDeleteCollection}
                  {onDeleteFolder}
                  {onDeleteRequest}
                  {onRenameCollection}
                  {onRenameFolder}
                  {onRenameRequest}
                  {onBranchSwitch}
                  {onOpenRequestOnTab}
                  {onRefetchCollection}
                  {getUserRoleInWorkspace}
                  {getActiveTab}
                  collection={col._data}
                />
              {/each}
            </List>
          {:else if collectionListDocument && collectionListDocument.length > 0}
            <List
              height={"calc(100vh - 180px)"}
              minHeight={"180px"}
              classProps={"p-3"}
              overflowX="hidden"
            >
              {#if collectionListDocument}
                {#each collectionListDocument as col}
                  <Collection
                    {onCreateRequestInCollection}
                    {onCreateFolderInCollection}
                    {onCreateRequestInFolder}
                    {onDeleteCollection}
                    {onDeleteFolder}
                    {onDeleteRequest}
                    {onRenameCollection}
                    {onRenameFolder}
                    {onRenameRequest}
                    {onBranchSwitch}
                    {onOpenRequestOnTab}
                    {onRefetchCollection}
                    {getUserRoleInWorkspace}
                    {getActiveTab}
                    collection={col}
                  />
                {/each}
              {/if}
            </List>
          {:else}
            <EmptyCollection
              {getUserRoleInWorkspace}
              handleCreateApiRequest={onCreateApiRequest}
              onImportCollectionPopup={() => handleAddButton("collection")}
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
{#if isImportCollectionPopup}
  <ImportCollection
    onImportCollectionPopup={() => handleAddButton("collection")}
    {onCreateCollection}
    {onImportCollection}
    {onInputDataChange}
    {onUploadFile}
    {onExtractGitBranch}
  />
{/if}
{#if isImportCurlPopup}
  <!-- <ImportCurl onClick={handleImportCurlPopup} {collectionsMethods} /> -->
  <ImportCurl
    onClosePopup={() => handleAddButton("importcURL")}
    {onImportCurl}
  />
{/if}

<style>
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
