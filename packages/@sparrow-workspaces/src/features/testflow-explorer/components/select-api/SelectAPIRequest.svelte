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
  import { DropdownArrow } from "@sparrow/library/icons";
  import { BackArrowIcon } from "../../icons";
  import { Stack2 } from "@sparrow/library/icons";
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
  collectionData.subscribe((value) => {
    if (value) {
      collections = value;
    }
  });

  let arrayData = collections;
  let selectedRequest = null;
  let isOpen = false;
  let previousItem;
  let selectedCollection;
  let selectedFolder;
  let selectedItem = "COLLECTION";
  let ignoreClickOutside = false;

  const handleSelectApi = (data) => {
    if (data?.totalRequests !== undefined) {
      selectedCollection = data;
      selectedItem = "COLLECTION";
      arrayData = data.items;
      previousItem = data;
    }
    if (data?.type === "FOLDER") {
      selectedFolder = data;
      selectedItem = "FOLDER";
      arrayData = data.items;
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
  const truncateFolderName = (name: string) => {
    if (name.length > 6) {
      return name.substring(0, 4) + "...";
    }
    return name;
  };
  const truncateCollectionName = (name: string) => {
    if (name.length > 14) {
      return name.substring(0, 12) + "...";
    }
    return name;
  };
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
      style="display: flex; align-items: center; padding: 5px 8px; gap: 6px;"
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
      {:else if name || method}
        <div style="display: flex; align-items: center; gap: 6px;">
          <span
            class="request-icon text-{getMethodStyle(method)}"
            style="font-size: 9px; font-weight: 600; text-align: center;"
          >
            {method}
          </span>
          <span class="select-txt">{name}</span>
        </div>
      {:else}
        <span class="select-txt-new">Select API Request</span>
      {/if}
    </div>
    <div
      style="display: flex; align-items: center; padding-right: 7px; padding-bottom:1px"
    >
      {#if isOpen}
        <ChevronUpRegular />
      {:else}
        <DropdownArrow />
      {/if}
    </div>
  </div>
  <div
    class="dropdown-options"
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
            startIcon={BackArrowIcon}
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
          <Stack2 />
          <p
            class="ellipsis label-text"
            style="margin-left: 4px; margin-bottom:0px"
          >
            {truncateCollectionName(selectedCollection.name)}
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
              {truncateFolderName(selectedFolder.name)}
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
                  <Stack2 />
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
                style="margin-left: 5px;"
                class="d-flex align-items-center justify-content-center"
              >
                {#if data?.type === "REQUEST"}
                  <span class="text-{getMethodStyle(data?.request?.method)}">
                    <span
                      class={"request-icon"}
                      style="font-size: 9px; font-weight: 600;"
                      >{data?.request?.method || ""}</span
                    >
                  </span>
                {:else if data?.type === "FOLDER"}
                  <FolderRegular size={"16px"} />
                {:else}
                  <Stack2 />
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
          style="width:170px; align-items:center; justify-content:center;"
          class="d-flex"
        >
          <p style="color: #808080; font-size: 10px; margin-top: 10px; ">
            No APIs Present.
          </p>
        </div>
      {/if}
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
</style>
