<script lang="ts">
  /**
   * @deprecated please do not use this file
   * Instead of this we can use src\lib\components\dropdown\Dropdown
   * **/
  import dropdown from "$lib/assets/dropdown.svg";
  import checkIcon from "$lib/assets/check.svg";
  import { onDestroy, onMount } from "svelte";
  import { fade, fly, slide } from "svelte/transition";

  let isOpen: boolean = false;

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

  let selectedRequest: {
    name: string;
    id: string;
    color: string;
  };

  const toggleDropdown = () => {
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

  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById(`color-dropdown-${id}`);
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
  });

  onMount(() => {
    window.addEventListener("click", handleDropdownClick);
  });
</script>

<div
  class="parent-dropdown display-inline-block"
  style=" position: relative;"
  on:click={handleDropdownClick}
>
  <div on:click={toggleDropdown}>
    <div
      id={`color-dropdown-${id}`}
      class="dropdown-btn rounded d-flex align-items-center justify-content-between {isError
        ? 'isError'
        : ''}"
      class:dropdown-btn-active={isOpen}
    >
      <p class=" mb-0 ellipsis text-{selectedRequest?.color}">
        {selectedRequest?.name}
      </p>
      <span class="d-flex" class:dropdown-logo-active={isOpen}
        ><img
          style="height:12px; width:12px;"
          class="ms-2"
          src={dropdown}
          alt=""
        /></span
      >
    </div>
  </div>

  {#if isOpen}
    <div
      class="d-none z-2 dropdown-data p-1 rounded"
      class:dropdown-active={isOpen}
      style="max-height:{maxHeight}; overflow:auto;"
      transition:slide={{ duration: 100 }}
    >
      {#each data as list}
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
  {/if}
</div>

<style>
  .dropdown-btn {
    background: none;
    outline: none;
    border: none;
    height: 34px;
    width: auto;
    padding: 0 10px;
  }
  .dropdown-btn:hover {
    background-color: var(--border-color);
  }
  .dropdown-data {
    background-color: var(--blackColor);
    color: white;
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    border: 1px solid rgb(44, 44, 44);
  }
  .dropdown-btn p,
  .dropdown-data p {
    font-size: 12px;
    font-weight: 400;
  }
  .dropdown-active {
    display: block !important;
  }
  .dropdown-logo-active {
    transform: rotateX(180deg) !important;
  }
  .highlight {
    border-radius: 4px;
    cursor: pointer;
  }
  .highlight:hover {
    background-color: #232424;
  }
  .dropdown-btn {
    border: 1px solid #313233;
    cursor: pointer;
  }
  .isError {
    border: 1px solid var(--error--color) !important;
  }
  .dropdown-btn-active {
    border: 1px solid var(--send-button);
  }
</style>
