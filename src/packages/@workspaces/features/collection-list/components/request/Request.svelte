<script lang="ts">
  import { onDestroy } from "svelte";

  // ---- Components
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import ModalWrapperV1 from "$lib/components/Modal/Modal.svelte";
  import Button from "$lib/components/buttons/Button.svelte";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import MoreOptions from "../more-options/MoreOptions.svelte";

  // ---- Helper functions
  import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  import { getPathFromUrl } from "$lib/utils/helpers/common.helper";

  // ---- Enum and Interfaces
  import type {
    Request,
    Folder,
    Path,
  } from "$lib/utils/interfaces/request.interface";
  import { UntrackedItems } from "$lib/utils/enums";

  // ---- Store
  import { showPathStore } from "$lib/store/methods";
  import { currentFolderIdName } from "$lib/store/collection";

  // --- SVG
  import threedotIcon from "$lib/assets/3dot.svg";
  import reloadSyncIcon from "$lib/assets/reload-sync.svg";

  // ---- DB
  import type { CollectionDocument } from "$lib/database/app.database";

  /**
   * Callback for Item Deleted
   * @param entityType - type of item to delete like request/folder
   * @param args - Arguments to pass on delete
   */
  export let onItemDeleted: (entityType: string, args: any) => void;
  /**
   * Callback for Item Rename
   * @param entityType - type of item to rename like request/folder
   * @param args - Arguments to pass on rename
   */
  export let onItemRenamed: (entityType: string, args: any) => void;
  /**
   * Callback for Item Open
   * @param entityType - type of item to open like request/folder
   * @param args - Arguments to pass on open
   */
  export let onItemOpened: (entityType: string, args: any) => void;
  /**
   * Whole Collection Document
   */
  export let collection: CollectionDocument;
  /**
   * Selected folder details
   */
  export let folder: Folder;
  /**
   * Selected API details
   */
  export let api: Request;
  /**
   * Current Tab Path
   */
  export let activeTabPath: Path;

  let showPath = false;

  if (folder) {
    currentFolderIdName.set({
      folderId: folder.id,
      folderName: folder.name,
    });
  }

  let isDeletePopup: boolean = false;
  let pos = { x: 0, y: 0 };
  let showMenu: boolean = false;
  let noOfColumns = 180;
  let noOfRows = 3;
  let newRequestName: string = api.name;
  let inputField: HTMLInputElement;
  let isRenaming = false;
  let deleteLoader: boolean = false;

  const selectedMethodUnsubscibe = showPathStore.subscribe((value) => {
    showPath = value;
  });

  // $: {
  //   if (api) {
  //     path = {
  //       workspaceId: $currentWorkspace._id,
  //       collectionId: collection.id,
  //       folderId: folder ? folder.id : "",
  //       folderName: folder ? folder.name : "",
  //     };
  //   }
  // }

  onDestroy(() => {
    selectedMethodUnsubscibe();
  });
</script>

<ModalWrapperV1
  title={"Delete Request?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isDeletePopup}
  handleModalState={() => (isDeletePopup = false)}
>
  <div class="text-lightGray mb-1 sparrow-fs-12">
    <p>
      Are you sure you want to delete this Request? <span
        class="text-whiteColor fw-bold">"{api.name}"</span
      >
      will be removed and cannot be restored.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded w-100"
    style="font-size: 16px;"
  >
    <Button
      disable={deleteLoader}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"dark"}
      loader={false}
      onClick={() => {
        isDeletePopup = false;
      }}
    />

    <Button
      disable={deleteLoader}
      title={"Delete"}
      textStyleProp={"font-size: var(--base-text)"}
      loaderSize={18}
      type={"danger"}
      loader={deleteLoader}
      onClick={() => {
        deleteLoader = true;
        onItemDeleted("request", {
          workspaceId: collection.workspaceId,
          collection,
          request: api,
          folder,
        });
        deleteLoader = false;
        isDeletePopup = false;
      }}
    />
  </div></ModalWrapperV1
>

{#if showMenu}
  <MoreOptions
    xAxis={pos.x}
    yAxis={pos.y}
    menuItems={[
      {
        onClick: () => {
          onItemOpened("request", {
            workspaceId: collection.workspaceId,
            collection,
            folder,
            request: api,
          });
        },
        displayText: "Open Request",
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          isRenaming = true;
          setTimeout(() => inputField.focus(), 100);
        },
        displayText: "Rename Request",
        disabled: false,
        hidden:
          !collection.activeSync ||
          (api.source === "USER" && collection.activeSync)
            ? false
            : true,
      },
      {
        onClick: () => {
          isDeletePopup = true;
        },
        displayText: "Delete",
        disabled: false,
        hidden:
          !collection.activeSync ||
          (api.source === "USER" && collection.activeSync) ||
          api.isDeleted
            ? false
            : true,
      },
    ]}
    {noOfRows}
    {noOfColumns}
  />
{/if}

<svelte:window
  on:click={() => (showMenu = false)}
  on:contextmenu|preventDefault={() => (showMenu = false)}
/>

<div
  class="d-flex align-items-center mb-1 mt-1 ps-0 justify-content-between my-button btn-primary {api.id ===
  activeTabPath?.requestId
    ? 'active-request-tab'
    : ''}"
  style="height:32px;"
>
  <button
    on:click={() => {
      onItemOpened("request", {
        workspaceId: collection.workspaceId,
        collection,
        folder,
        request: api,
      });
    }}
    class="main-file d-flex align-items-center position-relative bg-transparent border-0 {api.id?.includes(
      UntrackedItems.UNTRACKED,
    )
      ? 'unclickable'
      : ''}"
  >
    {#if api?.isDeleted && "activeSync"}
      <span
        class="delete-ticker position-absolute sparrow-fs-10 px-2"
        style="right: 0; background-color: var(--background-color); "
        >DELETED</span
      >
    {/if}
    {#if "actSync" && api?.source === "SPEC"}
      <img src={reloadSyncIcon} class="ms-2" alt="" />
    {/if}
    <div
      class="api-method text-{getMethodStyle(
        api.request.method,
      )} {api?.isDeleted && 'api-method-deleted'}"
      style="font-size: 12px;"
    >
      {api.request.method?.toUpperCase()}
    </div>

    {#if isRenaming}
      <input
        class="form-control py-0 renameInputFieldFile"
        style="font-size: 12px;"
        id="renameInputFieldFile"
        type="text"
        maxlength={100}
        value={newRequestName}
        bind:this={inputField}
        on:blur={(e) => {
          onItemRenamed("request", {
            workspaceId: collection.workspaceId,
            collection,
            folder,
            request: api,
            newName: e?.target?.value,
          });
          isRenaming = false;
        }}
        on:keydown={(e) => {
          if (e.key === "Enter") {
            onItemRenamed("request", {
              workspaceId: collection.workspaceId,
              collection,
              folder: folder ? folder : { id: "" },
              request: api,
              newName: e?.target?.value,
            });
            isRenaming = false;
          }
        }}
      />
    {:else}
      <div
        class="api-name ellipsis {api?.isDeleted && 'api-name-deleted'}"
        style="font-size: 12px;"
      >
        {api.name}
        {#if showPath}
          <span class="path-name ellipsis"
            >{`${
              api?.request?.url ? getPathFromUrl(api?.request?.url) : ""
            }`}</span
          >
        {/if}
      </div>
    {/if}
  </button>

  {#if api.id?.includes(UntrackedItems.UNTRACKED)}
    <Spinner size={"15px"} />
  {:else}
    <Tooltip title="More options" styleProp="left: -50%">
      <button
        class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center {showMenu
          ? 'threedot-active'
          : ''}"
        on:click|preventDefault={(e) => {
          pos.x = e.clientX;
          pos.y = e.clientY;
          setTimeout(() => (showMenu = true), 100);
        }}
      >
        <img src={threedotIcon} alt="threedotIcon" />
      </button>
    </Tooltip>
  {/if}
</div>

<style lang="scss">
  .delete-ticker {
    color: var(--error--color);
    font-weight: 500;
  }
  .api-method {
    font-size: 10px;
    font-weight: 500;
    width: 48px;
    height: 30px;
    padding-left: 6px;
    padding-right: 4px;
    border-radius: 8px;
    display: flex;
    align-items: center;
  }
  .api-name {
    font-size: 12px;
    font-weight: 400;
    width: calc(100% - 48px);
    text-align: left;
  }
  .api-name-deleted {
    color: var(--editor-angle-bracket) !important;
  }
  .api-method-deleted {
    color: var(--deleted-api-method) !important;
  }
  .api-info {
    display: flex;
    flex-direction: column;
  }
  .path-name {
    margin-top: -4px;
    font-family: Roboto Mono;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    color: #999999;
  }
  .highlight {
    color: var(--white-color);
  }

  .my-button:hover .threedot-icon-container {
    visibility: visible;
  }

  .threedot-icon-container {
    visibility: hidden;
    background-color: transparent;
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--bg-tertiary-600);
  }
  .threedot-icon-container:hover {
    background-color: var(--bg-tertiary-600);
  }

  .btn-primary {
    background-color: var(--background-color);
    color: var(--white-color);
    padding-left: 0 !important;
    padding-right: 5px;
    border-radius: 8px;
  }

  .btn-primary:hover {
    background-color: var(--bg-tertiary-600);
    color: var(--white-color);
    border-radius: 2px;
  }

  .btn-primary:hover {
    .delete-ticker {
      background-color: var(--border-color) !important;
    }
  }

  .navbar {
    width: 180px;
    height: auto;
    overflow: hidden;
  }

  ul li {
    display: block;
  }

  ul li button {
    font-size: 12px;
    display: flex;
    width: 100%;
    border: 0px;
    background-color: var(--blackColor);
  }

  ul li button:hover {
    width: 100%;
    color: var(--white-color);
    border-radius: 8px;
    background-color: var(--background-color);
  }
  .unclickable {
    pointer-events: none;
  }
  .renameInputFieldFile {
    border: none;
    background-color: transparent;
    color: var(--white-color);
    padding-left: 0;
  }
  .main-file {
    width: calc(100% - 24px);
  }
  .active-request-tab {
    background-color: var(--bg-tertiary-400) !important;
    .delete-ticker {
      background-color: var(--selected-active-sidebar) !important;
    }
  }
  .active-request-tab:hover {
    .delete-ticker {
      background-color: var(--selected-active-sidebar) !important;
    }
  }
</style>
