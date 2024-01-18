<script lang="ts">
  import closeIcon from "$lib/assets/close.svg";
  import { CollectionService } from "$lib/services/collection.service";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { notifications } from "$lib/utils/notifications";
  import CoverButton from "../buttons/CoverButton.svelte";
  import { fly, fade } from "svelte/transition";
  export let collectionId: string;
  export let workspaceId: string;
  export let collection;
  export let closePopup: (flag: boolean) => void;
  export let collectionsMethods: CollectionsMethods;

  const collectionService = new CollectionService();

  let requestCount: number = 0;
  let folderCount: number = 0;

  let deleteIds: string[] = [];
  collection.items.forEach((item) => {
    if (item.type === ItemType.FOLDER) {
      deleteIds.push(item.id);
      folderCount++;
      requestCount += item.items.length;
      for (let i = 0; i < item.items.length; i++) {
        deleteIds.push(item.items[i].id);
      }
    }
    if (item.type === ItemType.REQUEST) {
      requestCount++;
      deleteIds.push(item.id);
    }
  });
  deleteIds.push(collectionId);

  let deleteLoader: boolean = false;
  const handleDelete = async () => {
    deleteLoader = true;
    const response = await collectionService.deleteCollection(
      workspaceId,
      collectionId,
    );

    if (response.isSuccessful) {
      collectionsMethods.deleteCollection(collectionId);
      collectionsMethods.deleteCollectioninWorkspace(workspaceId, collectionId);
      closePopup(false);
      notifications.success(`"${collection.name}" Collection deleted.`);
      collectionsMethods.removeMultipleTabs(deleteIds);
      deleteLoader = false;
    } else {
      notifications.error("Failed to delete the Collection.");
      deleteLoader = false;
    }
  };
</script>

<div
  class="background-overlay"
  on:click={() => {
    closePopup(false);
  }}
  transition:fade={{ delay: 0, duration: 100 }}
/>

<div
  class="container d-flex flex-column mb-0 px-4 pb-0 pt-4"
  transition:fly={{ y: 50, delay: 0, duration: 100 }}
  on:introstart
  on:outroend
>
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h5 class="mb-0 text-whiteColor" style="font-weight: 500;">
      Delete Collection?
    </h5>
    <button
      class="btn-close1 border-0 rounded"
      on:click={() => {
        closePopup(false);
      }}
    >
      <img src={closeIcon} alt="" />
    </button>
  </div>
  <div style="font-size: 14px;" class="text-lightGray mb-1">
    <p>
      Are you sure you want to delete this Collection? Everything in <span
        style="font-weight:700;"
        class="text-whiteColor">"{collection.name}"</span
      >
      will be removed.
    </p>
  </div>
  <div class="d-flex gap-3" style="font-size:12px">
    <div class="d-flex gap-1">
      <span class="text-plusButton">{requestCount}</span>
      <p>API Requests</p>
    </div>
    <div class="d-flex gap-1">
      <span class="text-plusButton">{folderCount}</span>
      <p>Folder</p>
    </div>
  </div>
  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
    style="font-size: 16px;"
  >
    <CoverButton
      disable={deleteLoader}
      text={"Cancel"}
      size={14}
      type={"dark"}
      loader={false}
      onClick={() => {
        closePopup(false);
      }}
    />

    <CoverButton
      disable={deleteLoader}
      text={"Delete"}
      size={14}
      type={"danger"}
      loader={deleteLoader}
      onClick={() => {
        handleDelete();
      }}
    />
  </div>
</div>

<style>
  .background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    z-index: 9;
  }

  .container {
    position: fixed;
    height: 244px;
    width: 540px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 10;
    border-radius: 10px;
  }

  .btn-close1 {
    background-color: var(--background-color);
  }

  .btn-close1:hover {
    background-color: var(--dangerColor);
  }

  .btn-close1:active {
    background-color: var(--dangerColor);
  }
  .btn-primary {
    background-color: var(--border-color);
  }

  .btn-primary:hover {
    color: var(--blackColor);
    background-color: var(--workspace-hover-color);
  }

  .btn-primary:active {
    color: var(--blackColor);
    background-color: var(--button-pressed);
  }

  .btn-secondary {
    background-color: var(--dangerColor);
  }

  .btn-secondary:hover {
    background-color: var(--delete-hover);
  }
</style>
