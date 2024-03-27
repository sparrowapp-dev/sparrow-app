<script lang="ts">
  import checkIcon from "$lib/assets/check.svg";
  import { onDestroy, onMount } from "svelte";
  import select from "$lib/assets/dropdown.svg";
  import { fade, fly, slide } from "svelte/transition";
  import { SearchIcon } from "$lib/assets/icons";

  export let data: Array<{
    name: string;
    id: string;
    description: string;
    color: string;
  }>;
  export let onclick: (tab: string) => void;
  export let title: string;
  export let id: string;
  export let isError: boolean = false;
  export let maxHeight = "200px";
  export let minWidth = "50px";
  export let maxWidth = "500px";
  export let search = false;
  export let searchText = "Search";
  export let searchErrorMessage = "No value found";
  export let borderType = "all";
  export let borderActiveType = "all";
  export let headerTheme = "dark";
  export let rounded = true;
  export let iconRequired = false;
  export let icon = "";
  const Icon = icon;

  let selectBorderClass = "";
  switch (borderType) {
    case "none":
      selectBorderClass = "select-border-none";
      break;
    case "all":
      selectBorderClass = "select-border-all";
      break;
    case "bottom":
      selectBorderClass = "select-border-bottom";
      break;
  }

  let selectActiveBorderClass = "";
  let selectErrorBorderClass = "";
  switch (borderActiveType) {
    case "none":
      selectActiveBorderClass = "select-active-border-none";
      selectErrorBorderClass = "select-error-border-none";
      break;
    case "all":
      selectActiveBorderClass = "select-active-border-all";
      selectErrorBorderClass = "select-error-border-all";
      break;
    case "bottom":
      selectActiveBorderClass = "select-active-border-bottom";
      selectErrorBorderClass = "select-error-border-bottom";
      break;
  }

  let selectBackgroundClass = "";
  switch (headerTheme) {
    case "transparent":
      selectBackgroundClass = "select-background-transparent";
      break;
    case "dark":
      selectBackgroundClass = "select-background-dark";
      break;
  }

  let isOpen: boolean = false;
  let selectedRequest: {
    name: string;
    id: string;
    color: string;
  };
  const toggleSelect = () => {
    isOpen = !isOpen;
  };

  $: {
    if (title) {
      data.forEach((element) => {
        if (element.id === title) {
          selectedRequest = element;
        }
      });
    }
  }

  function handleSelectClick(event: MouseEvent) {
    const selectElement = document.getElementById(`color-select-${id}`);
    if (selectElement && !selectElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onDestroy(() => {
    window.removeEventListener("click", handleSelectClick);
  });

  onMount(() => {
    window.addEventListener("click", handleSelectClick);
  });

  let searchData = "";
</script>

<div
  class="parent-select display-inline-block"
  style=" position: relative;"
  id={`color-select-${id}`}
>
  <div on:click={toggleSelect}>
    <div
      class="select-btn {selectBackgroundClass} {rounded
        ? 'rounded'
        : ''}  d-flex align-items-center justify-content-between {selectBorderClass} {isOpen
        ? selectActiveBorderClass
        : ''} {isError ? selectErrorBorderClass : ''}"
      style="min-width:{minWidth}; max-width:{maxWidth};"
    >
      <p class=" mb-0 ellipsis text-{selectedRequest?.color}">
        {#if iconRequired}
          <span
            ><Icon
              height={12}
              width={12}
              color={"var(--sparrow-text-color)"}
            /></span
          >
        {/if}
        {selectedRequest?.name}
      </p>
      <span class="d-flex" class:select-logo-active={isOpen}
        ><img
          style="height:12px; width:12px;"
          class="ms-2"
          src={select}
          alt=""
        /></span
      >
    </div>
  </div>

  {#if isOpen}
    <div
      class="d-none z-2 select-data p-1 rounded"
      class:select-active={isOpen}
      transition:slide={{ duration: 100 }}
    >
      <slot name="pre-select" />
      {#if search}
        <div class="position-relative">
          <input
            type="text"
            class="inputField searchField rounded border-0 p-2 w-100 bg-backgroundDark"
            style="font-size: 12px; font-weight:500; padding-left:35px !important;"
            placeholder={searchText}
            bind:value={searchData}
          />
          <span
            class="position-absolute"
            style="top:5px;
                  left: 10px"
          >
            <SearchIcon height={16} width={16} color={"var(--defaultcolor)"} />
          </span>
          <hr class="my-2" />
        </div>
      {/if}
      <div style="max-height:{maxHeight}; overflow:auto;">
        {#each data.filter((element) => {
          return element.name.toLowerCase().includes(searchData.toLowerCase());
        }) as list}
          <div
            class="d-flex px-2 py-2 justify-content-between highlight {list.hide
              ? 'd-none'
              : ''}"
            on:click={() => {
              isOpen = false;
              onclick(list.id);
            }}
          >
            <p
              class="m-0 p-0 text-{list.color} ellipsis"
              style="font-size: 12px;"
              class:selected-request={list.id === selectedRequest?.id}
            >
              {list.name}<br />
              {#if list.description}
                <small class="text-textColor">{list.description}</small>
              {/if}
            </p>
            {#if selectedRequest?.id === list.id}
              <img src={checkIcon} alt="" />
            {/if}
          </div>
        {/each}
      </div>
      {#if data.filter((element) => {
        return element.name.toLowerCase().includes(searchData.toLowerCase());
      }).length === 0}
        <div class="p-2">
          <small class="sparrow-fs-12">{searchErrorMessage}</small>
        </div>
      {/if}
      <slot name="post-select" />
    </div>
  {/if}
</div>

<style>
  .select-btn {
    outline: none;
    border: none;
    height: 34px;
    width: auto;
    padding: 0 10px;
  }
  .select-btn:hover {
    background-color: var(--border-color);
  }
  .select-data {
    background-color: var(--blackColor);
    color: white;
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    border: 1px solid rgb(44, 44, 44);
  }
  .select-btn p,
  .select-data p {
    font-size: 12px;
    font-weight: 400;
  }
  .select-active {
    display: block !important;
  }
  .select-logo-active {
    transform: rotateX(180deg) !important;
  }
  .highlight {
    border-radius: 4px;
    cursor: pointer;
  }
  .highlight:hover {
    background-color: var(--dull-background-color);
    color: var(--send-button);
  }
  .select-btn {
    cursor: pointer;
  }

  input {
    outline: none;
  }

  .select-border-none {
    border: none;
  }

  .select-border-all {
    border: 1px solid var(--border-color);
  }

  .select-border-bottom {
    border-bottom: 1px solid var(--border-color);
  }

  .select-active-border-none {
    border: none;
  }

  .select-active-border-all {
    border: none;
    border: 1px solid var(--send-button);
  }

  .select-active-border-bottom {
    border: none;
    border-bottom: 1px solid var(--send-button);
  }

  .select-error-border-none {
    border: none !important;
  }

  .select-error-border-all {
    border: none !important;
    border: 1px solid var(--error--color) !important;
  }

  .select-error-border-bottom {
    border: none !important;
    border-bottom: 1px solid var(--error--color) !important;
  }

  .select-background-dark {
    background-color: var(--blackColor);
  }
  .select-background-transparent {
    background-color: transparent;
  }
</style>
