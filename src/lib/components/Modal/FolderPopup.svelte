<script lang="ts">
  import closeIcon from "$lib/assets/close.svg";
  import type { CollectionDocument } from "$lib/database/app.database";
  import { CollectionService } from "$lib/services/collection.service";
  import {
    currentCollectionWorkspaceFolderId,
    isShowFolderPopup,
  } from "$lib/store/collection";
  import type { Observable } from "rxjs";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { notifications } from "$lib/utils/notifications";
  import { CollectionListViewModel } from "../collections/collections-list/CollectionList.ViewModel";
  import { ItemType } from "$lib/utils/enums/item-type.enum";

  export let collectionsMethods: CollectionsMethods;
  const collectionService = new CollectionService();

  let totalRequest: number = 0;
  let totalFolder: number = 1;
  let currentWorkspaceCollectionFolder;
  let collectionTobeDeleted = [];
  let folderName: string = "";

  currentCollectionWorkspaceFolderId.subscribe((value) => {
    if (value) {
      currentWorkspaceCollectionFolder = value;
    }
    console.log(currentWorkspaceCollectionFolder);
  });

  const _colllectionListViewModel = new CollectionListViewModel();

  let folder: any[] = [];
  const collections: Observable<CollectionDocument[]> =
    _colllectionListViewModel.collection;

  const collectionSubscribe = collections.subscribe(
    (value: CollectionDocument[]) => {
      if (value && value.length > 0) {
        console.log(value);
        collectionTobeDeleted = value.filter((collection) => {
          if (
            collection._data._id ===
            currentWorkspaceCollectionFolder.collectionId
          ) {
            return collection._data;
          }
        });
        console.log(collectionTobeDeleted);
      }
    },
  );

  collectionTobeDeleted[0]?._data.items.forEach((item) => {
    if (
      item.id === currentWorkspaceCollectionFolder.folderId &&
      item.type === ItemType.FOLDER
    ) {
      folderName = item.name;
      totalRequest += item.items.length;
    }
  });

  const handleDelete = async () => {
    const deleteFolder = await collectionService.deleteFolderInCollection(
      currentWorkspaceCollectionFolder.workspaceId,
      currentWorkspaceCollectionFolder.collectionId,
      currentWorkspaceCollectionFolder.folderId,
    );
    if (deleteFolder.isSuccessful) {
      collectionsMethods?.deleteFolder(
        currentWorkspaceCollectionFolder.collectionId,
        currentWorkspaceCollectionFolder.folderId,
      );
      isShowFolderPopup.set(false);
      notifications.success(`"${folderName}" Folder deleted.`);
    } else {
      isShowFolderPopup.set(false);
      notifications.error("Failed to delete the Folder.");
    }
  };

  let isPopupShow: boolean;

  isShowFolderPopup.subscribe((value) => {
    isPopupShow = value;
  });

  const handleCancel = async () => {
    isShowFolderPopup.set(false);
  };
</script>

{#if isPopupShow}
  <div class="background-overlay" />
{/if}

<div class="container d-flex flex-column mb-0 px-4 pb-0 pt-4">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h5 class="mb-0 text-whiteColor" style="font-weight: 500;">
      Delete Folder?
    </h5>
    <button class="btn-close1 border-0 rounded" on:click={handleCancel}>
      <img src={closeIcon} alt="" />
    </button>
  </div>
  <div style="font-size: 14px;" class="text-lightGray mb-1">
    <p>
      Are you sure you want to delete this Folder? Everything in <span
        style="font-weight:700;"
        class="text-whiteColor">"{folderName}"</span
      >
      will be removed.
    </p>
  </div>
  <div class="d-flex gap-3" style="font-size:12px">
    <div class="d-flex gap-1">
      <span class="text-plusButton">{totalRequest}</span>
      <p>API Requests</p>
    </div>
    <div class="d-flex gap-1">
      <span class="text-plusButton">{totalFolder}</span>
      <p>Folder</p>
    </div>
  </div>
  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
    style="font-size: 16px;"
  >
    <button
      class="btn-primary px-3 py-1 border-0 rounded"
      on:click={handleCancel}>Cancel</button
    >
    <button
      class="btn-secondary border-0 text-blackColor px-3 py-1 rounded"
      on:click={handleDelete}>Delete</button
    >
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
    backdrop-filter: blur(3px);
    z-index: 9999999999;
    border: 2px solid red;
  }

  .container {
    position: fixed;
    height: 244px;
    width: 540px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 99999999999999;
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
