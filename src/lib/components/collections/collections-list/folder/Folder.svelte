<script lang="ts">
  export let onCreateRequestInFolder: (
    collection: CollectionDocument,
    explorer: any,
  ) => void;
  export let onDeleteFolder: (
    collection: CollectionDocument,
    explorer: any,
    requestIds: [string],
  ) => void;
  export let onDeleteRequest: (
    collection: CollectionDocument,
    request: any,
    folder: any,
  ) => Promise<boolean>;
  export let onRenameFolder: (
    collection: CollectionDocument,
    explorer: any,
    newFolderName: string,
  ) => void;
  export let onRenameRequest: (
    collection: CollectionDocument,
    folder: any,
    request: any,
    newRequestName: string,
  ) => void;
  export let onOpenRequestOnTab: (request: any, path: Path) => void;
  export let collection: CollectionDocument;
  export let getUserRoleInWorkspace: () => WorkspaceRole;
  export let getActiveTab: () => Writable<{}>;
  export let explorer: any;
  export let folder: any = null;

  import RightOption from "$lib/components/right-click-menu/RightClickMenuView.svelte";
  import folderCloseIcon from "$lib/assets/folder.svg";
  import folderOpenIcon from "$lib/assets/open-folder.svg";
  import Request from "../request/Request.svelte";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import threedotIcon from "$lib/assets/3dot.svg";
  import { selectMethodsStore } from "$lib/store/methods";
  import { onDestroy } from "svelte";
  import { handleFolderClick } from "$lib/utils/helpers/handle-clicks.helper";
  import requestIcon from "$lib/assets/create_request.svg";
  import angleRight from "$lib/assets/angleRight.svg";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import ModalWrapperV1 from "$lib/components/Modal/Modal.svelte";
  import Button from "$lib/components/buttons/Button.svelte";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import {
    workspaceLevelPermissions,
    PERMISSION_NOT_FOUND_TEXT,
  } from "$lib/utils/constants/permissions.constant";
  import { WorkspaceRole } from "$lib/utils/enums";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import type { CollectionDocument } from "$lib/database/app.database";
  import type { Writable } from "svelte/store";
  import type { Path } from "$lib/utils/interfaces/request.interface";

  let expand: boolean = false;
  let showFolderAPIButtons: boolean = true;
  let deleteLoader: boolean = false;
  let pos = { x: 0, y: 0 };
  let showMenu: boolean = false;
  let isFolderPopup: boolean = false;
  let noOfColumns = 180;
  let noOfRows = 4;
  let isRenaming = false;
  let requestCount: number;
  let requestIds: [string] | [] = [];
  $: {
    // if (activePath) {
    //   if (activePath.folderId === explorer.id) {
    //     expand = true;
    //   }
    // }
    if (explorer) {
      requestIds = [];
      requestCount = 0;
      requestCount = explorer?.items?.length;
      if (explorer?.items) {
        requestIds = explorer?.items?.map((element) => {
          return element.id;
        });
      }
      requestIds.push(explorer?.id);
    }
  }

  const selectedMethodUnsubscibe = selectMethodsStore.subscribe((value) => {
    if (value && value.length > 0) {
      expand = true;
      showFolderAPIButtons = false;
    } else {
      showFolderAPIButtons = true;
      expand = false;
    }
  });

  onDestroy(() => {
    selectedMethodUnsubscibe();
  });
</script>

<svelte:window
  on:click={() => (showMenu = false)}
  on:contextmenu|preventDefault={() => (showMenu = false)}
/>

<div>
  <ModalWrapperV1
    title={"Delete Folder?"}
    type={"danger"}
    width={"35%"}
    zIndex={1000}
    isOpen={isFolderPopup}
    handleModalState={(flag) => (isFolderPopup = flag)}
  >
    <div class="text-lightGray mb-1 sparrow-fs-14">
      <p>
        Are you sure you want to delete this Folder? Everything in <span
          class="text-whiteColor fw-bold">"{explorer.name}"</span
        >
        will be removed.
      </p>
    </div>
    <div class="d-flex gap-3 sparrow-fs-12">
      <div class="d-flex gap-1">
        <span class="text-plusButton">{requestCount}</span>
        <p>API Requests</p>
      </div>
    </div>
    <div
      class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
    >
      <Button
        disable={deleteLoader}
        title={"Cancel"}
        textStyleProp={"font-size: var(--base-text)"}
        type={"dark"}
        loader={false}
        onClick={() => {
          isFolderPopup = false;
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
          onDeleteFolder(collection, explorer, requestIds);
          deleteLoader = false;
          isFolderPopup = false;
        }}
      />
    </div></ModalWrapperV1
  >

  {#if showMenu}
    <RightOption
      xAxis={pos.x}
      yAxis={pos.y}
      menuItems={[
        {
          onClick: () => (expand = true),
          displayText: "Open Folder",
          disabled: false,
          hidden: false,
        },
        {
          onClick: () => {
            expand = false;
            isRenaming = true;
          },
          displayText: "Rename Folder",
          disabled: false,
          hidden:
            !collection.activeSync ||
            (explorer?.source === "USER" && collection.activeSync)
              ? false
              : true,
        },
        {
          onClick: () => {
            expand = true;
            onCreateRequestInFolder(collection, explorer);
          },
          displayText: "Add Request",
          disabled: false,
          hidden:
            !collection.activeSync ||
            (explorer?.source === "USER" && collection.activeSync)
              ? false
              : true,
        },

        {
          onClick: () => {
            isFolderPopup = true;
          },
          displayText: "Delete",
          disabled: false,
          hidden:
            !collection.activeSync ||
            (explorer?.source === "USER" && collection.activeSync)
              ? false
              : true,
        },
      ]}
      {noOfRows}
      {noOfColumns}
    />
  {/if}

  {#if explorer}
    {#if explorer.type === "FOLDER"}
      <div
        style="height:36px;"
        class="d-flex align-items-center justify-content-between my-button btn-primary ps-2 {explorer.id ===
        'activeTabId'
          ? 'active-folder-tab'
          : ''}"
      >
        <button
          class="main-folder d-flex align-items-center pe-0 border-0 bg-transparent"
          on:click={() => {
            if (!explorer.id.includes(UntrackedItems.UNTRACKED)) {
              expand = !expand;
              if (expand) {
                handleFolderClick(
                  explorer,
                  collection.workspaceId,
                  collection.id,
                  collection.activeSync,
                );
              }
            }
          }}
        >
          <img
            src={angleRight}
            class=""
            style="height:14px; width:14px; margin-right:8px; {expand
              ? 'transform:rotate(90deg);'
              : 'transform:rotate(0deg);'}"
            alt="angleRight"
          />
          {#if isRenaming}
            <input
              class="form-control py-0 renameInputFieldFolder"
              id="renameInputFieldFolder"
              type="text"
              style="font-size: 12px;"
              autofocus
              maxlength={100}
              value={explorer.name}
              on:blur={(e) => {
                onRenameFolder(collection, explorer, e?.target?.value);
                isRenaming = false;
              }}
              on:keydown={(e) => {
                if (e.key === "Enter") {
                  onRenameFolder(collection, explorer, e?.target?.value);
                  isRenaming = false;
                }
              }}
            />
          {:else}
            <div
              class="folder-title d-flex align-items-center"
              style="cursor:pointer; font-size:12px;
                      height: 36px;
                      font-weight:400;"
            >
              {#if expand}
                <div
                  style="height:16px; width:16px;"
                  class="d-flex align-items-center justify-content-center me-2"
                >
                  <img src={folderOpenIcon} alt="" class="pe-0 folder-icon" />
                </div>
              {:else}
                <div class="d-flex me-2" style="height:16px; width:16px;">
                  <img
                    src={folderCloseIcon}
                    alt=""
                    style="height:16px; width:16px;"
                    class="folder-icon"
                  />
                </div>
              {/if}
              <p class="ellipsis mb-0">
                {explorer.name}
              </p>
            </div>
          {/if}
        </button>

        {#if explorer.id.includes(UntrackedItems.UNTRACKED)}
          <Spinner size={"15px"} />
        {:else}
          <Tooltip title="More options" styleProp="left: -50%">
            <button
              class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center {showMenu
                ? 'threedot-active'
                : ''}"
              on:click|preventDefault={(e) => {
                pos = { x: e.clientX, y: e.clientY };
                setTimeout(() => {
                  showMenu = true;
                }, 100);
              }}
            >
              <img src={threedotIcon} alt="threedotIcon" />
            </button>
          </Tooltip>
        {/if}
      </div>
      <div
        style="padding-left: 12px; cursor:pointer; display: {expand
          ? 'block'
          : 'none'};"
      >
        <div class="sub-files ps-3">
          {#each explorer.items as exp}
            <svelte:self
              {onCreateRequestInFolder}
              {onDeleteFolder}
              {onDeleteRequest}
              {onRenameFolder}
              {onRenameRequest}
              {onOpenRequestOnTab}
              {collection}
              {getUserRoleInWorkspace}
              {getActiveTab}
              explorer={exp}
              folder={explorer}
            />
          {/each}
          {#if showFolderAPIButtons && explorer?.source === "USER"}
            <div class="mt-2 mb-2 ms-0">
              <Tooltip
                classProp="mt-2 mb-2 ms-0"
                title={PERMISSION_NOT_FOUND_TEXT}
                show={!hasWorkpaceLevelPermission(
                  getUserRoleInWorkspace(),
                  workspaceLevelPermissions.SAVE_REQUEST,
                )}
              >
                <img
                  class="list-icons"
                  src={requestIcon}
                  alt="+ API Request"
                  on:click={() => {
                    onCreateRequestInFolder(collection, explorer);
                    MixpanelEvent(Events.ADD_NEW_API_REQUEST, {
                      source: "Side Panel Collection List",
                    });
                  }}
                />
              </Tooltip>
            </div>
          {/if}
        </div>
      </div>
    {:else if explorer.type === "REQUEST"}
      <div style="cursor:pointer;">
        <Request
          api={explorer}
          {onRenameRequest}
          {onDeleteRequest}
          {onOpenRequestOnTab}
          {folder}
          {collection}
        />
      </div>
    {/if}
  {/if}
</div>

<style>
  .btn-primary {
    background-color: var(--background-color);
    color: var(--white-color);
    padding-right: 5px;
    border-radius: 8px;
  }

  .btn-primary:hover {
    background-color: var(--border-color);
    color: var(--white-color);
  }
  .list-icons {
    width: 16px;
    height: 16px;
    margin-right: 10px;
  }
  .list-icons:hover {
    filter: invert(78%) sepia(86%) saturate(3113%) hue-rotate(177deg)
      brightness(100%) contrast(100%);
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

  .my-button:hover .threedot-icon-container {
    visibility: visible;
  }

  .threedot-icon-container {
    visibility: hidden;
    background-color: transparent;
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--workspace-hover-color);
  }

  .threedot-icon-container:hover {
    background-color: var(--workspace-hover-color);
  }

  .btn-primary {
    background-color: var(--background-color);
    color: var(--white-color);
  }

  .btn-primary:hover {
    border-radius: 8px;
    background-color: var(--border-color);
    color: var(--white-color);
  }
  .renameInputFieldFolder {
    border: none;
    background-color: transparent;
    color: var(--white-color);
    padding-left: 0;
  }
  .sub-files {
    border-left: 1px solid var(--border-color);
  }

  .main-folder {
    width: calc(100% - 24px);
  }
  .active-folder-tab {
    background-color: var(--selected-active-sidebar) !important;
  }
  .folder-title {
    width: calc(100% - 30px);
  }
  .folder-icon {
    width: 16px;
  }
</style>
