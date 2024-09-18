<script lang="ts">
  import { getMethodStyle } from "$lib/utils/helpers";
  import type { CollectionDocument } from "@app/database/database";
  import { CollectionIcon, FolderIcon2 } from "@library/icons";
  import type { Observable } from "rxjs";
  import { onDestroy, onMount } from "svelte";
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

  const handleSelectApi = (data) => {
    if (data?.totalRequests !== undefined) {
      selectedCollection = data;
      selectedItem = "COLLECTION";
    }
    if (data?.type === "FOLDER") {
      selectedFolder = data;
      selectedItem = "FOLDER";
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
    }
    if (data?.type !== "REQUEST") {
      previousItem = data;
      arrayData = data.items;
    }
  };
  let dropdownRef;

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      isOpen = false;
      arrayData = collections;
    }
  };

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<div class="dropdown" bind:this={dropdownRef}>
  <!-- <p>Select API Request</p> -->
  <div on:click={() => (isOpen = !isOpen)} class="dropdown-header">
    {#if selectedRequest}
      <div class="d-flex selected-container">
        <p class="method-container">
          <span class="text-{getMethodStyle(selectedRequest?.request?.method)}">
            <span
              class={"request-icon"}
              style="font-size: 10px; font-weight: 500;"
              >{selectedRequest?.request?.method || ""}</span
            >
          </span>
        </p>
        <p style="font-size: 10px; margin-left: 10px;" class="ellipsis">
          {selectedRequest?.name}
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
      <p class="select-txt">Select an API Request</p>
    {/if}
  </div>
  <div
    class="dropdown-options"
    style="overflow:auto; display: {isOpen
      ? 'block'
      : 'none'}; position:absolute"
  >
    {#each arrayData as data}
      <div class="d-flex dropdown-single-option">
        <div style="margin-left: 5px;">
          {#if data.type === "REQUEST"}
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
              color={"var(--icon-secondary-130)"}
            />
          {:else}
            <CollectionIcon
              height={"10px"}
              width={"10px"}
              color={"var(--icon-secondary-130)"}
            />
          {/if}
        </div>
        <p
          class="options-txt ellipsis"
          on:click={() => {
            handleSelectApi(data);
          }}
        >
          {data.name}
        </p>
      </div>
    {/each}
  </div>
</div>

<style>
  .dropdown {
  }
  .dropdown-header {
    background-color: #3c3f52;
    /* color: white; */
    padding-top: 12px;
    padding-bottom: 2px;
    border-radius: 2px;
    width: 170px;
    cursor: pointer;
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
    padding-top: 10px;
    padding-bottom: 10px;
    cursor: pointer;
    /* justify-content: center;
    align-items: center; */
    /* align-self: center; */
    /* padding-left: 10px; */
  }
  .options-txt {
    font-size: 10px;
    margin-left: 6px;
    margin-top: 15px;
    /* align-self: center; */
  }
  /* .dropdown-options:hover */
  /* .options-txt:hover {
  } */
  .dropdown-single-option {
    /* align-self: center; */
    /* padding-left: 2px; */
    /* background-color: red; */
    width: 150px;
    align-items: center;
    margin-left: 10px;
    /* width:; */
  }
  .dropdown-single-option:hover {
    background-color: #353646;
    border-radius: 2px;
    /* margin-right: 10px; */
    /* padding-left: 2px; */
  }
  .method-container {
    background-color: #22232e;
    padding-left: 6px;
    padding-right: 6px;
    padding-top: 2px;
    padding-bottom: 2px;
    margin-left: 5px;
    border-radius: 2px;
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
