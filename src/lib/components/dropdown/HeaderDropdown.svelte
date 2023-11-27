<script lang="ts">
  import dropdown from "$lib/assets/dropdown.svg";
  import constants from "$lib/utils/constants";
  import { onDestroy, onMount } from "svelte";
  let workspaceLimit = constants.WORKSPACE_LIMIT;
  let visibility = false;
  export let data: any;
  export let onclick: any;

  let isOpen: boolean = false;

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById("workspace-dropdown");
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
  class="rounded"
  style="position: relative; display:inline-block; z-index:999;"
  on:click={handleDropdownClick}
  class:dropdown-btn-active={isOpen}
>
  <button
    style="font-size: 12px;"
    class="dropdown-btn rounded border-0 ps-2 py-2 gap-2"
    on:click={toggleDropdown}
    id="workspace-dropdown"
    >Workspace
    <span class="px-2" class:dropdown-logo-active={isOpen}
      ><img
        style="height:15px; width:20px;"
        src={dropdown}
        alt=""
        class:dropdown-logo-active={isOpen}
      /></span
    ></button
  >
  <div
    style="display:none;"
    class="dropdown-data rounded px-2"
    class:dropdown-active={isOpen}
  >
    <p
      style="cursor:pointer "
      class="d-flex align-items-center justify-content-between m-0 p-1 mt-1 drop-btn2 rounded"
      on:click={() => {
        isOpen = true;
      }}
    >
      <span>Create New Workspace</span><span style="height:20px;width:20px"
        >+</span
      >
    </p>
    <hr class="m-0 p-0" />
    {#if $data}
      {#each $data as list, index}
        {#if index < workspaceLimit}
          <p
            class="d-flex dropdown-btn align-items-center px-2 mt-2 p-1 rounded gap-0 mb-0"
            style="cursor: pointer;"
            on:click={() => {
              isOpen = false;
              onclick(list._id, list.name);
            }}
          >
            {list.name}
          </p>
        {/if}
      {/each}
    {/if}
    <hr class="m-0 p-0 mt-1" />
    <p
      style="cursor:pointer"
      class="drop-btn d-flex align-items-center mb-2 mt-1 p-1 rounded"
      on:click={() => {
        isOpen = true;
      }}
    >
      View All Workspaces
    </p>
  </div>
</div>

<style>
  .dropdown-btn {
    background: none;
    outline: none;
    cursor: pointer;
    border: none;
  }

  .drop-btn {
    background: none;
    outline: none;
    cursor: pointer;
    border: none;
    color: var(--request-arc);
  }

  .drop-btn2 {
    background: none;
    outline: none;
    cursor: pointer;
    border: none;
    color: var(--send-button);
  }

  .drop-btn2:hover {
    color: var(--workspace-hover-color);
    background-color: var(--border-color);
  }

  .drop-btn:hover {
    color: var(--workspace-hover-color);
    background-color: var(--border-color);
  }

  .dropdown-btn:hover {
    background-color: var(--border-color);
  }
  .dropdown-data {
    background-color: black;
    color: white;
    position: absolute;
    top: 40px;
    left: 0;
    width: 200px;
    border: 1px solid rgb(44, 44, 44);
  }

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

  .dropdown-btn-active {
    border: 1px solid #85c2ff;
    background-color: var(--blackColor);
  }
</style>
