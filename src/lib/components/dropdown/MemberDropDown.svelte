<script lang="ts">
  import Dropdown from "$lib/assets/dropdown.svelte";
  import checkIcon from "$lib/assets/check.svg";
  import { onDestroy, onMount } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { WorkspaceRole } from "$lib/utils/enums";
  export let workspaceId:string=null;
  let isOpen: boolean = false;
  export let isWorkspaceMemberDropDown:boolean=false;
  export let data: Array<{
    name: string;
    id: string;
    color: string;
  }>;
  export let onclick: (tab: string,workspaceId?:string) => void;
  export let method: string;
  export let id;
  export let disabled: boolean = false;
  let isHover: boolean = false;
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
    const dropdownElement = document.getElementById(`dropdown-member-${id}`);
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
  on:mouseover={() => {
    isHover = true;
  }}
  on:mouseout={() => {
    isHover = false;
  }}
  on:click={(event) => {
    if (!disabled) {
      handleDropdownClick(event);
    }
    event.stopPropagation();
  }}
  

  >
  {#if isWorkspaceMemberDropDown && method===WorkspaceRole.WORKSPACE_ADMIN}
  <p
  class="me-4 mt-2 m-0 p-0 text"
  style="font-size: 12px;">
  Admin</p>
{:else}

  <div
    on:click={() => {
      if (!disabled) {
        toggleDropdown();
      }
    }}
  >
    <div
      id={`dropdown-member-${id}`}
      class="dropdown-btn rounded d-flex align-items-center justify-content-between {!disabled &&
      isHover
        ? 'dropdown-btn-hover'
        : ''}"
      class:dropdown-btn-active={isOpen}
    >
      <p
        class="{disabled
          ? 'disabled-text'
          : ''} mb-0 text-{selectedRequest?.color}"
      >
        {selectedRequest?.name}
      </p>
      <span class="d-flex ps-2" class:dropdown-logo-active={isOpen}>
        <Dropdown
          height={12}
          width={12}
          color={disabled ? "var(--sparrow-text-color)" : "white"}
        /></span
      >
    </div>
  </div>

  {#if isOpen && !disabled}
    <div
      class="d-none dropdown-data p-1 rounded z-2"
      class:dropdown-active={isOpen}
      transition:slide={{ duration: 100 }}
    >
      {#each data as list}
        <div
          class="d-flex px-2 py-1 justify-content-between highlight"
          on:click={() => {
            isOpen = false;
            onclick(list.id,workspaceId);
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
    border: 1px solid transparent;
    cursor: pointer;
  }
  .dropdown-btn-hover {
    background-color: var(--border-color);
  }
  .dropdown-data {
    background-color: var(--background-dropdown);
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
    background-color: var( --dull-background-color);
  }
  .dropdown-btn-active {
    border: 1px solid var(--send-button) !important;
  }
  .disabled-text {
    color: var(--sparrow-text-color) !important;
  }
</style>
