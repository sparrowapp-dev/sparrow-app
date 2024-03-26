<script lang="ts">
  import checkIcon from "$lib/assets/check.svg";
  import { onDestroy, onMount } from "svelte";
  import select from "$lib/assets/dropdown.svg";
  import { fade, fly, slide } from "svelte/transition";
  import { SearchIcon } from "$lib/assets/";

  export let data: Array<{
    name: string;
    id: string;
    description: string;
    color: string;
  }>;
  export let onclick: (tab: string) => void;
  export let method: string;
  export let id: string;
  export let isError: boolean = false;
  export let maxHeight = "200px";
  export let search = false;
  export let searchText = "Search";
  export let searchErrorMessage = "No value found";
  export let icon;
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
    if (method) {
      data.forEach((element) => {
        if (element.id === method) {
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
      class="select-btn rounded d-flex align-items-center justify-content-between {isError
        ? 'isError'
        : ''}"
      class:select-btn-active={isOpen}
    >
      <span>{@html icon}</span>
      <p class=" mb-0 ellipsis text-{selectedRequest?.color}">
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
            <SearchIcon />
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
    background: none;
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
    background-color: #232424;
  }
  .select-btn {
    border: 1px solid #313233;
    cursor: pointer;
  }
  .isError {
    border: 1px solid var(--error--color) !important;
  }
  .select-btn-active {
    border: 1px solid var(--send-button);
  }
  input {
    outline: none;
  }
</style>
