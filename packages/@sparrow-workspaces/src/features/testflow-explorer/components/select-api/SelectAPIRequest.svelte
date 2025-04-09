<script lang="ts">
  import { getMethodStyle } from "@sparrow/common/utils";
  import type { CollectionDocument } from "@app/database/database";
  import {
    CollectionIcon,
    ChevronUpRegular,
    FolderRegular,
    AddRegular,
  } from "@sparrow/library/icons";
  import { type Observable } from "rxjs";
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
  export let collections = [];
  export let updateNode;
  export let collectionData: Observable<CollectionDocument[]>;
  export let handleOpenAddCustomRequestModal;

  collectionData.subscribe((value) => {
    if (value) {
      collections = value;
    }
  });

  let arrayData = collections;
  let filteredArrayData = collections;
  let selectedRequest = null;
  let isOpen = false;
  let previousItem;
  let selectedCollection;
  let selectedFolder;
  let selectedItem = "COLLECTION";
  let ignoreClickOutside = false;
  let searchQuery = "";
  let searchInputRef;
  let dropdownRef: HTMLElement;
  let showSampleApi = false;

  const handleSelectApi = (data) => {
    if (data?.totalRequests !== undefined) {
      selectedCollection = data;
      selectedItem = "COLLECTION";
      // arrayData = data.items;
      filteredArrayData = data.items;
      previousItem = data;
    }
    if (data?.type === "FOLDER") {
      selectedFolder = data;
      selectedItem = "FOLDER";
      // arrayData = data.items;
      filteredArrayData = data.items;
      previousItem = data;
    }
    if (data?.type === "REQUEST") {
      selectedItem = "REQUEST";
      isOpen = false;
      selectedRequest = data;
      if (previousItem?.type === "FOLDER") {
        updateNode(
          data.name,
          data.id,
          selectedCollection.id,
          data.request.method,
          previousItem.id,
        );
      } else {
        updateNode(
          data.name,
          data.id,
          selectedCollection.id,
          data.request.method,
        );
      }
      // arrayData = collections;
      filteredArrayData = collections;
      selectedCollection = null;
      selectedFolder = null;
    }
  };

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
      filteredArrayData = arrayData.filter((item) =>
        item.name?.toLowerCase().includes(searchQuery),
      );
      selectedCollection = null;
      selectedFolder = null;
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
      return name?.length > charLimit ? name.substring(0, 4) + "..." : name;
    }
    return name?.length > charLimit + 2
      ? name.substring(0, charLimit) + "..."
      : name;
  };

  // Update search query manually
  const handleInputChange = (event) => {
    searchQuery = event.target.value.toLowerCase();
    selectedCollection = null;
    selectedFolder = null;
    isOpen = true;
    filteredArrayData = arrayData.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.items?.some((subItem: any) =>
          subItem.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
  };

  const handleInputClick = () => {
    isOpen = true;
  };

  const handleClickBackInList = () => {
    if (selectedFolder) {
      filteredArrayData = selectedCollection.items;
      selectedFolder = null;
    } else if (selectedCollection) {
      filteredArrayData = arrayData.filter((item) =>
        item.name?.toLowerCase().includes(searchQuery),
      );
      selectedCollection = null;
      ignoreClickOutside = true;
    }
  };

  // Reactive statement to focus input when isOpen changes
  $: if (isOpen && searchInputRef) {
    searchInputRef.focus();
  }
</script>

<div class="dropdown" bind:this={dropdownRef}>
  <!-- <p>Select API Request</p> -->
  <div
    class="dropdown-header d-flex justify-content-between align-items-center mx-auto {isOpen
      ? 'active'
      : ''}"
    on:click={() => (isOpen = !isOpen)}
    tabindex="0"
  >
    <div
      style="display: flex; align-items: center; padding: 5px 0px; gap: 6px;"
    >
      {#if $currentStep >= 6 && $isTestFlowTourGuideOpen}
        <div style="display: flex; align-items: center; gap: 6px;">
          <span
            class="request-icon text-{getMethodStyle(method)}"
            style="font-size: 9px; font-weight: 600; text-align: center;"
          >
            GET
          </span>
          <span class="select-txt">Sample API</span>
        </div>
      {:else if (name || method) && !isOpen}
        <div
          on:click={(e) => (e.stopPropagation(), (isOpen = !isOpen))}
          style="display: flex; align-items: center; gap: 6px; padding:0px 8px;"
        >
          <span
            class="request-icon text-{getMethodStyle(method)}"
            style="font-size: 9px; font-weight: 600; text-align: center;"
          >
            {method}
          </span>
          <span class="select-txt">{truncateName(name, 17)}</span>
        </div>
      {:else}
        <input
          class="search-box"
          type="text"
          placeholder="Select API Request"
          value={searchQuery}
          on:input={handleInputChange}
          on:click|stopPropagation={handleInputClick}
          bind:this={searchInputRef}
        />
      {/if}
    </div>
    <div
      style="display: flex; align-items: center; padding-right: 7px; padding-bottom:1px"
    >
      {#if isOpen}
        <ChevronUpRegular size={"16px"} color={"var(--icon-ds-neutral-100)"} />
      {:else}
        <ChevronDownRegular
          size={"16px"}
          color={"var(--icon-ds-neutral-100)"}
        />
      {/if}
    </div>
  </div>

  <div
    class="dropdown-options px-1"
    style="overflow:auto; display: {isOpen
      ? 'block'
      : 'none'}; position:absolute"
  >
    {#if selectedCollection}
      <div class="d-flex ellipsis back-header px-1">
        <Tooltip title={"Back"} placement={"top-center"} size="medium">
          <Button
            size="extra-small"
            type="teritiary-regular"
            startIcon={ChevronLeftRegular}
            onClick={handleClickBackInList}
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
        {#if selectedFolder && !isOpen}
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
    <div class="scrollable-list" style="max-height: 288px;">
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
      {:else if filteredArrayData?.filter((data) => {
        if (data?.type === "REQUEST" || !data?.type || data?.type === "FOLDER") return true;
        return false;
      })?.length > 0}
        {#each filteredArrayData as data}
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
          style="align-items:center; justify-content:center; padding-top:12px;"
          class="d-flex"
        >
          <p class="empty-text">No results found.</p>
        </div>
      {/if}
    </div>

    <div on:click={handleOpenAddCustomRequestModal} class="custom-component">
      <AddRegular size={"12px"} color={"var(--icon-ds-neutral-100)"} />
      <div class="label-text" style="margin-left: 18px;">
        Add Custom Request
      </div>
    </div>
  </div>
</div>

<style>
  .dropdown-header {
    background-color: var(--bg-ds-surface-400);
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 4px;
    width: 206px;
    height: 28px;
    cursor: pointer;
    outline: none;
  }

  .dropdown-header:hover {
    border: 1px solid var(--border-ds-neutral-300);
  }
  .dropdown-header.active {
    border: 1px solid var(--border-ds-primary-300);
  }
  .dropdown-header:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
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
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
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

  .custom-component {
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: center;
    padding-left: 13px;
    padding-top: 10px;
    padding-bottom: 10px;
    margin-top: 4px;
    border-top: 1px solid var(--border-ds-surface-100);
  }

  .search-box {
    border: none;
    background: transparent;
    width: 100%;
    padding-left: 8px;
    font-size: 12px;
  }

  .search-box:focus {
    outline: none;
    border: none;
    box-shadow: none;

    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    color: white;
  }

  .search-box::placeholder {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    color: var(--text-ds-neutral-400);
  }

  .empty-text {
    font-size: 12px;
    font-weight: 400;
    color: var(--text-ds-neutral-400);
  }
</style>
