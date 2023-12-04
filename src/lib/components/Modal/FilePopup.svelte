<script lang="ts">
  import closeIcon from "$lib/assets/close.svg";
  import type { CollectionDocument } from "$lib/database/app.database";
  import { CollectionService } from "$lib/services/collection.service";
  import {
    currentFolderIdName,
    isShowFilePopup,
    isShowFolderPopup,
  } from "$lib/store/collection";
  import type { Observable } from "rxjs";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { notifications } from "$lib/utils/notifications";
  import { CollectionListViewModel } from "../collections/collections-list/CollectionList.ViewModel";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  export let folderId: string;
  export let folderName: string;
  export let collectionId: string;
  export let openRequestId: string;
  export let name: string;
  export let workspaceId: string;

  export let collectionsMethods: CollectionsMethods;
  const collectionService = new CollectionService();

  let fileTobeDeleted = [];
  let requestName: string = "";

  const _colllectionListViewModel = new CollectionListViewModel();

  let folder: any[] = [];
  const collections: Observable<CollectionDocument[]> =
    _colllectionListViewModel.collection;

  const collectionSubscribe = collections.subscribe(
    (value: CollectionDocument[]) => {
      if (value && value.length > 0) {
        fileTobeDeleted = value.filter((collection) => {
          if (collection._data._id === collectionId) {
            return collection._data;
          }
        });
      }
    },
  );

  fileTobeDeleted[0]?._data.items.forEach((item) => {
    if (item.id === openRequestId && item.type === ItemType.REQUEST) {
      requestName = item.name;
    }

    if (item.id === folderId && item.type === ItemType.FOLDER) {
      for (let i = 0; i < item.items.length; i++) {
        if (item.items[i].id === openRequestId) {
          requestName = item.items[i].name;
        }
      }
    }
  });

  const handleDelete = async () => {
    const deleteFolder = await collectionService.deleteRequestInCollection(
      openRequestId,
      {
        collectionId,
        workspaceId,
        folderId,
        items: {
          name: name,
          type: "REQUEST",
        },
      },
    );

    if (deleteFolder.isSuccessful) {
      if (folderId !== "" && folderName !== "") {
        collectionsMethods?.deleteRequestInFolderCollection(
          collectionId,
          openRequestId,
          folderId,
        );
      } else {
        collectionsMethods.deleteRequestInCollection(
          collectionId,
          openRequestId,
        );
      }

      isShowFilePopup.set(false);
      notifications.success(`"${requestName}" Request deleted.`);
    } else {
      isShowFilePopup.set(false);
      notifications.error("Failed to delete the Request.");
    }
  };

  let isFilePopup: boolean;

  isShowFilePopup.subscribe((value) => {
    isFilePopup = value;
  });

  const handleCancel = async () => {
    isShowFilePopup.set(false);
  };
</script>

{#if isFilePopup}
  <div class="background-overlay" />
{/if}

<div class="container d-flex flex-column mb-0 px-4 pb-0 pt-4">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h5 class="mb-0 text-whiteColor" style="font-weight: 500;">
      Delete Request?
    </h5>
    <button class="btn-close1 border-0 rounded" on:click={handleCancel}>
      <img src={closeIcon} alt="" />
    </button>
  </div>
  <div style="font-size: 14px;" class="text-lightGray mb-1">
    <p>
      Are you sure you want to delete this Request? <span
        style="font-weight:700;"
        class="text-whiteColor">"{requestName} "</span
      >
      will be removed.
    </p>
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
    z-index: 9999;
    border: 2px solid red;
  }

  .container {
    position: fixed;
    height: 204px;
    width: 540px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 9999;
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
