<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import checkIcon from "$lib/assets/check.svg";
  import { onDestroy, onMount } from "svelte";

  export let data: Array<{
    name: string;
    id: string;
  }>;
  export let onclick: (tab: string) => void;
  export let title: string;
  export let dropdownId: string = "";

  let selectedTitle: {
    name: string;
    id: string;
  };

  let isOpen: boolean = false;

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  $: {
    if (title) {
      data.forEach((element) => {
        if (element.id === title) {
          selectedTitle = element;
        }
      });
    }
  }

  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById(`${dropdownId}-dropdown-${title}`);
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
  style=" position: relative;  z-index:999;"
  on:click={handleDropdownClick}
>
  <div on:click={toggleDropdown} id={`${dropdownId}-dropdown-${title}`}>
    <div
      class="dropdown-btn px-1 d-flex align-items-center justify-content-between"
      class:dropdown-btn-active={isOpen}
    >
      <p class=" mb-0">
        {selectedTitle?.name}
      </p>
      <span class:dropdown-logo-active={isOpen}
        ><img
          style="margin-left:10px; height:12px; width:12px;"
          src={dropdown}
          alt=""
        /></span
      >
    </div>
  </div>
  <div class="d-none dropdown-data p-1 rounded" class:dropdown-active={isOpen}>
    {#each data as list}
      <div
        class="d-flex px-2 py-1 justify-content-between highlight"
        on:click={() => {
          isOpen = false;
          onclick(list.id);
        }}
      >
        <p
          class="m-0 p-0"
          style="font-size: 12px;"
          class:selected-request={list.id === selectedTitle?.id}
        >
          {list.name}
        </p>
        {#if selectedTitle?.id === list.id}
          <img src={checkIcon} alt="" />
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .dropdown-btn {
    background: none;
    outline: none;
    border: none;
    height: 26px;
  }
  .dropdown-btn:hover {
    border-bottom: 1px solid #85c2ff;
  }
  .dropdown-data {
    background-color: black;
    color: white;
    position: absolute;
    top: 32px;
    left: 0;
    min-width: 136px;
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
    cursor: pointer;
  }
  .dropdown-btn-active {
    background-color: var(--border-color);
    border-bottom: 1px solid #85c2ff;
  }
</style>
