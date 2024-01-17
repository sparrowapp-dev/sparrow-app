<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import checkIcon from "$lib/assets/check.svg";
  import { onDestroy, onMount } from "svelte";
  import { fade, fly, slide } from "svelte/transition";

  let isOpen: boolean = false;

  export let data: Array<{
    name: string;
    id: string;
    color: string;
  }>;
  export let onclick: (tab: string) => void;
  export let method: string;
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
    const dropdownElement = document.getElementById("request-dropdown");
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
  class="parent-dropdown display-inline-block z-1"
  style=" position: relative;"
  on:click={handleDropdownClick}
>
  <div on:click={toggleDropdown}>
    <div
      id="request-dropdown"
      class="dropdown-btn rounded d-flex align-items-center justify-content-between"
      class:dropdown-btn-active={isOpen}
    >
      <p class=" mb-0 text-{selectedRequest?.color}">
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
      class="d-none dropdown-data p-1 rounded"
      class:dropdown-active={isOpen}
      transition:slide={{ duration: 100 }}
    >
      {#each data as list}
        <div
          class="d-flex px-2 py-1 justify-content-between highlight"
          on:click={() => {
            isOpen = false;
            onclick(list.id);
          }}
        >
          <p
            class="m-0 p-0 text-{list.color}"
            style="font-size: 12px;"
            class:selected-request={list.id === selectedRequest?.id}
          >
            {list.name}
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
    background-color: var(--background-dropdown);
    color: white;
    position: absolute;
    top: 40px;
    left: 0;
    min-width: 120px;
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
  .dropdown-btn-active {
    border: 1px solid var(--send-button);
  }
</style>
