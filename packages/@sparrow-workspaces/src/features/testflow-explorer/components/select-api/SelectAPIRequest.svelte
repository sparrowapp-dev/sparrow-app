<script lang="ts">
  import { getMethodStyle } from "@sparrow/common/utils";
  import type { CollectionDocument } from "@app/database/database";
  import {
    CollectionIcon,
    ChevronUpRegular,
    FolderRegular,
  } from "@sparrow/library/icons";
  import type { Observable } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  import { ChevronDownRegular } from "@sparrow/library/icons";
  import { ChevronLeftRegular } from "@sparrow/library/icons";
  import { StackRegular } from "@sparrow/library/icons";
  import {
    currentStep,
    isTestFlowTourGuideOpen,
  } from "../../../../stores/guide.tour";
  import { Button, Dropdown, Tooltip } from "@sparrow/library/ui";
  export let name;
  export let method;
  export let collections: any = [];
  export let updateNode;
  export let collectionData: Observable<CollectionDocument[]>;

  let arrayData = collections;
  let selectedRequest = null;
  let isOpen = false;
  let previousItem;
  let selectedCollection;
  let selectedFolder;
  let selectedItem = "COLLECTION";
  let ignoreClickOutside = false;
  let selectApiName = name;
  let inputRef: any;
  let allApis: any = [];
  let filteredApis = [];
  let previousValue: string = "";
  let itemIdToCollectionIdMap = new Map();

  const initializeMap = (collections: any) => {
    itemIdToCollectionIdMap.clear();

    collections.forEach(function mapItems(collection: any) {
      if (collection.items && collection.items.length > 0) {
        collection.items.forEach(function mapNestedItems(item: any) {
          if (item.id) {
            itemIdToCollectionIdMap.set(item.id, collection.id);
          }
          if (item.items && item.items.length > 0) {
            item.items.forEach(mapNestedItems);
          }
        });
      }
    });
  };

  const handleSelectApi = (data) => {
    if (data?.totalRequests !== undefined) {
      selectedCollection = data;
      selectedItem = "COLLECTION";
      arrayData = data.items;
      previousItem = data;
      selectApiName = "";
    }
    if (data?.type === "FOLDER") {
      selectedFolder = data;
      selectedItem = "FOLDER";
      arrayData = data.items;
      previousItem = data;
      selectApiName = "";
    }
    if (data?.type === "REQUEST") {
      selectedItem = "REQUEST";
      isOpen = false;
      selectedRequest = data;
      if (previousItem?.type === "FOLDER") {
        const currentCollectionId = findCollectionIdForItem(data.id);
        updateNode(
          data.name,
          data.id,
          currentCollectionId,
          data.request.method,
          previousItem.id,
        );
        if ((data.name = name)) {
          selectApiName = name;
        }
      } else {
        const currentCollectionId = findCollectionIdForItem(data.id);
        updateNode(
          data.name,
          data.id,
          currentCollectionId,
          data.request.method,
        );
        selectApiName = data.name;
      }
      arrayData = collections;
      selectedCollection = null;
      selectedFolder = null;
    }
  };
  let dropdownRef: HTMLElement;

  const handleClickOutside = (event: MouseEvent) => {
    if (
      !ignoreClickOutside &&
      dropdownRef &&
      !dropdownRef.contains(event.target as Node)
    ) {
      if ($currentStep == 5 && $isTestFlowTourGuideOpen) {
        isOpen = true;
      } else {
        isOpen = false;
      }
      arrayData = collections;
      selectedCollection = null;
      selectedFolder = null;
      selectApiName = name;
    }
    ignoreClickOutside = false;
  };

  $: {
    if ($currentStep == 5 && $isTestFlowTourGuideOpen) {
      isOpen = true;
    } else {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  const dummyCollection = [
    {
      id: "6716111fd15536c0e193a107",
      name: "Sample API",
      totalRequests: 1,
      workspaceId: 123,
      createdAt: "2024-10-21T08:30:23.512Z",
      createdBy: "User",
      updatedAt: "2024-10-21T08:30:29.567Z",
      updatedBy: {
        id: "6711ff0dd51b907d98952bb2",
        name: "User",
      },
      items: [
        {
          id: "7c135cc4-9c98-4d67-9062-76965fb6d52c",
          name: "Sample API",
          description: "",
          type: "REQUEST",
          request: {
            method: "GET",
            url: "https://sample-api.com/",
            body: {},
            headers: [],
            queryParams: [],
          },
        },
      ],
    },
  ];

  let showSampleApi = false;

  $: {
    if (($currentStep >= 4 || $currentStep <= 6) && $isTestFlowTourGuideOpen) {
      showSampleApi = true;
    } else {
      showSampleApi = false;
    }
  }
  let options = [
    {
      name: "collection",
      icon: CollectionIcon,
      color: "var(--bg-ds-neutral-300)",
      onclick: () => {
        handleSelectApi("SomeData");
      },
    },
  ];

  const truncateName = (
    name: string,
    charLimit: number,
    isFolder: boolean = false,
  ) => {
    if (isFolder) {
      return name.length > charLimit ? name.substring(0, 4) + "..." : name;
    }
    return name.length > charLimit + 2
      ? name.substring(0, charLimit) + "..."
      : name;
  };

  // Function to divide all the apis of it.
  const handleSearchApis = () => {
    let apis: any[] = [];
    for (let i = 0; i < collections.length; i++) {
      if (collections[i]?._data) {
        apis.push(collections[i]._data);
      }
      if (collections[i]?._data?.items?.length) {
        for (let item of collections[i]._data.items) {
          apis.push(item);
          if (item?.items?.length) {
            apis = [...apis, ...item.items];
          }
        }
      }
    }
    return apis;
  };

  collectionData.subscribe((value) => {
    if (value) {
      collections = value;
      allApis = handleSearchApis();
      filteredApis = allApis;
      initializeMap(collections);
    }
  });

  const handleBlur = () => {
    if (selectApiName.trim() === "") {
      selectApiName = previousValue;
    }
  };

  const findCollectionIdForItem = (itemId: string) => {
    return itemIdToCollectionIdMap.get(itemId) || null;
  };

  // Function to search and filter APIs
  const searchApis = () => {
    isOpen = true;
    filteredApis = allApis.filter((api: any) =>
      api.name.toLowerCase().includes(selectApiName.toLowerCase()),
    );
  };

  const clearSearch = () => {
    selectApiName = "";
    inputRef?.focus();
  };

  $: if (name) {
    selectApiName = name;
  }

  const toggleDropdown = () => {
    isOpen = !isOpen;
    setTimeout(() => {
      if (inputRef) {
        inputRef.focus();
      }
    }, 0);
  };
</script>

<div class="dropdown" bind:this={dropdownRef}>
  <div
    class="dropdown-header d-flex justify-content-between align-items-center mx-auto {isOpen
      ? 'active'
      : ''}"
    tabindex="0"
    on:click={toggleDropdown}
  >
    <div class="d-flex align-items-center input-container">
      {#if name && method}
        <span
          class="request-icon text-{getMethodStyle(method)}"
          style="font-size: 9px; font-weight: 600; text-align: center; margin-right:5px;"
        >
          {method === "DELETE" ? "DEL" : method}
        </span>
      {/if}
      <input
        type="text"
        placeholder="Select API Request"
        bind:value={selectApiName}
        bind:this={inputRef}
        class="select-api-input"
        style="outline: none;"
        on:input={searchApis}
        on:blur={handleBlur}
      />
    </div>
    <div on:click|stopPropagation={toggleDropdown}>
      <Button
        type="teritiary-regular"
        startIcon={isOpen ? ChevronUpRegular : ChevronDownRegular}
        size="small"
      />
    </div>
  </div>
  <div
    class="dropdown-options"
    style="overflow:auto; display: {isOpen
      ? 'block'
      : 'none'}; position:absolute"
  >
    {#if !selectApiName}
      {#if selectedCollection}
        <div class="d-flex ellipsis back-header px-1">
          <Tooltip title={"Back"} placement={"top-center"} size="medium">
            <Button
              size="extra-small"
              type="teritiary-regular"
              startIcon={ChevronLeftRegular}
              onClick={() => {
                if (selectedFolder) {
                  arrayData = selectedCollection.items;
                  selectedFolder = null;
                } else if (selectedCollection) {
                  arrayData = collections;
                  selectedCollection = null;
                  ignoreClickOutside = true;
                }
              }}
            />
          </Tooltip>
          <div
            class="d-flex"
            style="margin-left: 2px; align-items:center; margin-right:2px;"
          >
            <StackRegular size={"16px"} color={"var(--icon-ds-neutral-50)"} />
            <p
              class="ellipsis label-text"
              style="margin-left: 4px; margin-bottom:0px"
            >
              {truncateName(selectedCollection.name, 12)}
            </p>
          </div>
          {#if selectedFolder}
            <p style="margin-bottom: 0px; margin-top:4px;">
              <span class="ms-1"></span>/
            </p>
            <div
              class="d-flex"
              style="margin-left: 2px; align-items:center; margin-right:3px;"
            >
              <FolderRegular size={"16px"} />
              <p
                class="ellipsis label-text"
                style="margin-left: 4px; margin-bottom:0px;"
              >
                {truncateName(selectedFolder.name, 6, true)}
              </p>
            </div>
          {/if}
        </div>
      {/if}
      <div class="scrollable-list">
        {#if showSampleApi}
          {#each dummyCollection as data}
            {#if data?.type === "REQUEST" || !data?.type || data?.type === "FOLDER"}
              <div
                class="d-flex align-items-center dropdown-single-option px-2 py-1 gap-1"
                on:click|stopPropagation={() => {
                  handleSelectApi(data);
                }}
              >
                <div
                  style="margin-left: 5px;"
                  class="d-flex align-items-center justify-content-center"
                >
                  {#if data?.type === "REQUEST"}
                    <span class="text-{getMethodStyle(data?.request?.method)}">
                      <span
                        class={"request-icon"}
                        style="font-size: 10px; font-weight: 500;"
                        >{data?.request?.method || ""}</span
                      >
                    </span>
                  {:else if data?.type === "FOLDER"}
                    <FolderRegular size={"16px"} />
                  {:else}
                    <StackRegular />
                  {/if}
                </div>
                <p class="options-txt ellipsis label-text">
                  {data.name}
                </p>
              </div>
            {/if}
          {/each}
        {:else if arrayData?.filter((data) => {
          if (data?.type === "REQUEST" || !data?.type || data?.type === "FOLDER") return true;
          return false;
        })?.length > 0}
          {#each arrayData as data}
            {#if data?.type === "REQUEST" || !data?.type || data?.type === "FOLDER"}
              <div
                class="d-flex align-items-center dropdown-single-option x-2 py-1 gap-1"
                on:click|stopPropagation={() => {
                  handleSelectApi(data);
                }}
              >
                <div
                  style="margin-left: 5px;min-width: 28px;"
                  class="d-flex align-items-center justify-content-center"
                >
                  {#if data?.type === "REQUEST"}
                    <span class="text-{getMethodStyle(data?.request?.method)}">
                      <span
                        class={"request-icon"}
                        style="font-size: 9px; font-weight: 600;"
                        >{data?.request?.method === "DELETE"
                          ? "DEL"
                          : data?.request?.method || ""}</span
                      >
                    </span>
                  {:else if data?.type === "FOLDER"}
                    <FolderRegular size={"16px"} />
                  {:else}
                    <StackRegular />
                  {/if}
                </div>
                <p class="options-txt ellipsis label-text">
                  {data.name}
                </p>
              </div>
            {/if}
          {/each}
        {:else}
          <div
            style="align-items:center; justify-content:center;"
            class="d-flex"
          >
            <p style="margin: 0px;" class="search-notfound-text">
              No results found.
            </p>
          </div>
        {/if}
      </div>
    {:else if filteredApis.length > 0}
      <div class="scrollable-list">
        {#each filteredApis as api}
          {#if api?.type === "REQUEST" || api?.items}
            <div
              class="d-flex align-items-center dropdown-single-option px-2 py-1 gap-1"
              style="gap: 6px;"
              on:click|stopPropagation={() => {
                handleSelectApi(api);
              }}
            >
              {#if api?.request?.method}
                <span
                  class="text-{getMethodStyle(
                    api?.request?.method,
                  )} text-center"
                >
                  <span
                    class={"request-icon"}
                    style="font-size: 9px; font-weight: 600;"
                    >{api?.request?.method === "DELETE"
                      ? "DEL"
                      : api?.request?.method || ""}</span
                  >
                </span>
              {:else}
                <StackRegular
                  size={"16px"}
                  color={"var(--icon-ds-neutral-50)"}
                />
              {/if}
              <span class="select-txt">{truncateName(api.name, 21)}</span>
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <div style="align-items:center; justify-content:center;" class="d-flex">
        <p style="margin: 0px;" class="search-notfound-text">
          No results found.
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .dropdown-header {
    background-color: var(--bg-ds-surface-400);
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 8px;
    padding-right: 4px;
    border-radius: 4px;
    width: 206px;
    height: 36px;
    cursor: pointer;
    border: none;
  }
  .dropdown-header:hover {
    outline: 1px solid var(--border-ds-neutral-300);
  }
  .dropdown-header.active {
    outline: 1px solid var(--border-ds-primary-300);
  }
  .dropdown-header:focus-visible {
    outline: 2px solid var(--border-ds-primary-300);
  }
  .dropdown-header p {
    margin: 0;
  }
  .select-txt {
    font-size: 12px;
    margin-left: 13px;
    color: var(--text-ds-neutral-50);
    margin: 0;
    margin-left: 5px;
  }
  .select-txt-new {
    color: var(--text-ds-neutral-400);
    margin: 0;
    margin-left: 5px;
    font-size: 12px;
  }
  .dropdown-options {
    background-color: var(--bg-ds-surface-600);
    margin-top: 5px;
    width: 206px;
    padding-top: 4px;
    margin: 4px auto auto 0px;
    gap: 4px;
    padding-bottom: 4px;
    cursor: pointer;
    border-radius: 4px;
  }
  .options-txt {
    margin-left: 6px;
  }
  .dropdown-single-option {
    align-items: center;
    margin-left: 4px;
    margin-right: 4px;
    padding-top: 6px;
    padding-bottom: 6px;
  }
  .dropdown-single-option:hover {
    background-color: var(--bg-ds-surface-400);
    border-radius: 2px;
  }
  .dropdown-single-option:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
  }
  .dropdown-single-option p {
    margin-bottom: 0px;
  }
  .scrollable-list {
    max-height: 288px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  /* Scrollbar track */
  .scrollable-list::-webkit-scrollbar-thumb {
    background-color: var(--bg-ds-surface-100);
    border-radius: 8px;
  }
  .search-notfound-text {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 153%;
  }

  .method-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .back-header {
    width: 100%;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--bg-ds-surface-200);
    margin-bottom: 2px;
  }
  .selected-container {
    align-items: center;
  }
  .request-icon {
    font-weight: 400 !important;
  }
  .dropdown-item {
    cursor: pointer;
    padding: 5px;
    padding-top: 4px;
  }
  .folder {
    font-weight: bold;
  }
  .request {
    margin-left: 20px;
  }
  .nested {
    margin-left: 15px;
  }
  .selected {
    background-color: blue;
  }
  .label-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    color: var(--text-ds-neutral-50);
  }
  .select-api-input {
    width: 140px;
    height: 20px;
    border: none;
    background-color: var(--bg-ds-surface-400);
    padding-right: 0px;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 14px;
  }
  .select-api-input::placeholder {
    color: var(--text-ds-neutral-500);
  }
</style>
