<script lang="ts">
  import { ThreeDotIcon } from "$lib/assets/app.asset";
  import { formatDateInString } from "$lib/utils/workspacetimeUtils";
  import { onDestroy } from "svelte";

  export let workspace: any;
  let isRemoveButtonVisible = false;

  const handleShowMore = () => {
    isRemoveButtonVisible = !isRemoveButtonVisible;
  };
  const handleWindowClick = (event) => {};

  window.addEventListener("click", handleWindowClick);

  onDestroy(() => {
    window.removeEventListener("click", handleWindowClick);
  });
</script>

<div class="flex-grow-1 col-5 pb-4">
  <div
    class="bg-black workspace-card rounded position-relative p-4"
    on:mouseleave={() => isRemoveButtonVisible && handleShowMore()}
    on:click={() => isRemoveButtonVisible && handleShowMore()}
  >
    <div class="d-flex justify-content-between">
      <h4>{workspace.name}</h4>
      <button
        class="border-0 my-auto show-more-btn rounded"
        on:click={(e) => {
          e.stopPropagation();
          handleShowMore();
        }}
      >
        <ThreeDotIcon />
      </button>
    </div>
    {#if isRemoveButtonVisible}
      <button
        class="remove-workspace-btn rounded cursor-pointer position-absolute end-0 me-4 border-0"
        >Remove Workspace</button
      >
    {/if}
    <p class="teams-workspace__para mb-1">
      <!-- <span>{workspace}</span> APIs <span class="px-1"></span> -->
      <span>{workspace?.collections?.length ?? 0}</span> COLLECTIONS
    </p>
    <p class="teams-workspace__date mb-0">
      Last updated on <span>{formatDateInString(workspace?.createdAt)}</span>
    </p>
  </div>
</div>

<style>
  .workspace-card:hover {
    background-color: #313233 !important;
  }
  .workspace-card:hover .teams-workspace__para,
  .workspace-card:hover .teams-workspace__date {
    color: #999 !important;
  }
  .show-more-btn {
    visibility: hidden;
    background-color: transparent;
  }
  .show-more-btn:hover {
    background-color: var(--blackColor);
  }
  .remove-workspace-btn {
    padding: 4px 8px;
    background-color: var(--blackColor);
    color: var(--dangerColor);
  }

  .workspace-card:hover .show-more-btn {
    visibility: visible;
  }
  .teams-workspace__para {
    font-size: 12px;
    color: #45494d;
  }
  .teams-workspace__para span {
    color: #85c2ff;
    font-size: 16px;
  }
  .teams-workspace__date {
    color: #45494d;
    font-size: 16px;
  }
  .teams-workspace__date span {
    font-size: 14px;
    color: white;
  }
</style>
