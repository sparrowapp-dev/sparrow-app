<script lang="ts">
  import { getMethodStyle } from "@sparrow/common/utils";
  import type { CollectionDocument } from "@app/database/database";
  import { CollectionIcon, FolderIcon2 } from "@sparrow/library/icons";
  import type { Observable } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  import DropdownArrow from "../../icons/DropdownArrow.svelte";
  import { BackArrowIcon } from "../../icons";
  import {
    currentStep,
    isTestFlowTourGuideOpen,
  } from "../../../../stores/guide.tour";
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
    }
    else{
      showSampleApi=false;
    }
  }
</script>

<div class="dropdown" bind:this={dropdownRef}>
  <!-- <p>Select API Request</p> -->
  <div on:click={() => (isOpen = !isOpen)} class="dropdown-header">
    {#if $currentStep >= 6 && $isTestFlowTourGuideOpen}
      <div class="d-flex selected-container">
        <p class="method-container">
          <span class="text-{getMethodStyle('GET')}">
            <span
              class={"request-icon"}
              style="font-size: 10px; font-weight: 500;">{"GET"}</span
            >
          </span>
        </p>
        <p style="font-size: 10px; margin-left: 10px;" class="ellipsis">
          {"Sample API"}
        </p>
      </div>
    {:else if name || method}
      <div class="d-flex selected-container">
        <p class="method-container">
          <span class="text-{getMethodStyle(method)}">
            <span
              class={"request-icon"}
              style="font-size: 10px; font-weight: 500;">{method || ""}</span
            >
          </span>
        </p>
        <p style="font-size: 10px; margin-left: 10px;" class="ellipsis">
          {name}
        </p>
      </div>
    {:else}
      <div
        class="d-flex"
        style="justify-content: space-between; align-items:center"
      >
        <p class="select-txt">Select an API Request</p>
        <div style="margin-right: 10px;">
          <DropdownArrow height={"8px"} width={"8px"} />
        </div>
      </div>
    {/if}
  </div>
  <div
    class="dropdown-options"
    style="overflow:auto; display: {isOpen
      ? 'block'
      : 'none'}; position:absolute"
  >
    {#if selectedCollection}
      <div class="d-flex ellipsis back-header px-1">
        <div
          style="margin-left: 4px;"
          on:click={() => {
            if (selectedFolder) {
              arrayData = selectedCollection.items;
              selectedFolder = null;
            } else if (selectedCollection) {
              arrayData = collections;
              selectedCollection = null;
              ignoreClickOutside = true;
            }
          }}
        >
          <BackArrowIcon width="8px" height="8px" />
        </div>
        <div class="d-flex" style="margin-left: 4px; align-items:center;">
          <CollectionIcon
            height={"10px"}
            width={"10px"}
            color={"var(--icon-secondary-100)"}
          />
          <p class="ellipsis" style="margin-left: 4px; margin-bottom:0px">
            {selectedCollection.name}
          </p>
        </div>
        {#if selectedFolder}
          <p style="margin-bottom: 0px;"><span class="ms-1"></span>/</p>
          <div class="d-flex" style="margin-left: 4px; align-items:center;">
            <FolderIcon2
              height={"10px"}
              width={"10px"}
              color={"var(--icon-secondary-100)"}
            />
            <p class="ellipsis" style="margin-left: 4px; margin-bottom:0px;">
              {selectedFolder.name}
            </p>
          </div>
        {/if}
      </div>
    {/if}
    <div class="scrollable-list">
      {#if showSampleApi}
        {#each dummyCollection as data}
          {#if data?.type !== "WEBSOCKET"}
            <div
              class="d-flex align-items-center dropdown-single-option"
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
                  <FolderIcon2
                    height={"10px"}
                    width={"10px"}
                    color={"var(--icon-secondary-100)"}
                  />
                {:else}
                  <CollectionIcon
                    height={"10px"}
                    width={"10px"}
                    color={"var(--icon-secondary-100)"}
                  />
                {/if}
              </div>
              <p class="options-txt ellipsis">
                {data.name}
              </p>
            </div>
          {/if}
        {/each}
      {:else if arrayData?.length > 0}
        {#each arrayData as data}
          {#if data?.type !== "WEBSOCKET"}
            <div
              class="d-flex align-items-center dropdown-single-option"
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
                  <FolderIcon2
                    height={"10px"}
                    width={"10px"}
                    color={"var(--icon-secondary-100)"}
                  />
                {:else}
                  <CollectionIcon
                    height={"10px"}
                    width={"10px"}
                    color={"var(--icon-secondary-100)"}
                  />
                {/if}
              </div>
              <p class="options-txt ellipsis">
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
    background-color: #3c3f52;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 3px;
    width: 170px;
    cursor: pointer;
  }
  .dropdown-header p {
    margin-bottom: 0;
  }
  .select-txt {
    font-size: 10px;
    margin-left: 13px;
    color: #999999;
    /* align-self: center; */
  }
  .dropdown-options {
    background-color: #3c3f52;
    margin-top: 5px;
    width: 170px;
    padding-top: 4px;
    padding-bottom: 4px;
    cursor: pointer;
    border-radius: 4px;
  }
  .options-txt {
    font-size: 10px;
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
    background-color: #353646;
    border-radius: 2px;
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
    background-color: #22232e;
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 3px;
    margin-left: 8px;
    border-radius: 3px;
    margin-top: 0px;
  }
  .back-header {
    width: 100%;
    padding-bottom: 4px;
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
</style>
