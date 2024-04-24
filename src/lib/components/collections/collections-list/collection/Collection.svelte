<script lang="ts">
  export let currentWorkspace: Observable<WorkspaceDocument>;
  export let onItemCreated: (entityType: string, args: any) => void;
  export let onItemDeleted: (entityType: string, args: any) => void;
  export let onItemRenamed: (entityType: string, args: any) => void;
  export let onItemOpened: (entityType: string, args: any) => void;
  export let onOpenRequestOnTab: (request: any, path: Path) => void;
  export let onBranchSwitched: (collection: CollectionDocument) => void;
  export let onRefetchCollection: (
    workspaceId: string,
    collection: CollectionDocument,
  ) => void;
  export let activeTab: Writable<{}>;
  export let userRoleInWorkspace: WorkspaceRole;
  export let collection: CollectionDocument;

  import angleRight from "$lib/assets/angleRight.svg";
  import threedotIcon from "$lib/assets/3dot.svg";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { selectMethodsStore } from "$lib/store/methods";
  import { onDestroy, onMount } from "svelte";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { handleCollectionClick } from "$lib/utils/helpers/handle-clicks.helper";
  import { isCollectionCreatedFirstTime } from "$lib/store/collection";
  import ModalWrapperV1 from "$lib/components/Modal/Modal.svelte";
  import Button from "$lib/components/buttons/Button.svelte";
  import { WorkspaceRole } from "$lib/utils/enums";
  import RightOption from "$lib/components/right-click-menu/RightClickMenuView.svelte";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import { CommonService } from "$lib/services-v2/common.service";
  import gitBranchIcon from "$lib/assets/git-branch.svg";
  import { ReloadCollectionIcon } from "$lib/assets/icons";
  import type {
    CollectionDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import type { Writable } from "svelte/store";
  import Folder from "../folder/Folder.svelte";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import { workspaceLevelPermissions } from "$lib/utils/constants/permissions.constant";
  import { PERMISSION_NOT_FOUND_TEXT } from "$lib/utils/constants/permissions.constant";
  import { CollectionMessage } from "$lib/utils/constants/request.constant";
  import folderIcon from "$lib/assets/create_folder.svg";
  import requestIcon from "$lib/assets/create_request.svg";
  import type { Observable } from "rxjs";

  let deletedIds: [string] | [] = [];
  let requestCount = 0;
  let folderCount = 0;
  let showFolderAPIButtons: boolean = true;
  const commonService = new CommonService();
  let visibility = false;
  let isActiveSyncEnabled = false;
  let isBranchSynced: boolean = false;
  let menuItems: [any];
  let isRenaming = false;
  let activeSyncLoad: boolean = false;
  let isSyncBtnHovered = false;
  let pos = { x: 0, y: 0 };
  let isCollectionPopup: boolean = false;
  let showMenu: boolean = false;
  let noOfColumns = 180;
  let noOfRows = 5;
  let inputField: HTMLInputElement;

  /**
   * Handle position of the context menu
   * @param e: Event
   */
  function rightClickContextMenu(e: Event) {
    e.preventDefault();
    setTimeout(() => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      pos = { x: mouseX, y: mouseY };
      showMenu = true;
    }, 100);
  }

  /**
   * Handle selected methods from filter
   */
  const selectedMethodUnsubscibe = selectMethodsStore.subscribe((value) => {
    if (value && value.length > 0) {
      showFolderAPIButtons = false;
      visibility = true;
    } else if (value && value.length === 0) {
      visibility = false;
    } else {
      showFolderAPIButtons = true;
    }
  });
  onDestroy(() => {
    selectedMethodUnsubscibe();
  });

  /**
   * Handle toggling context menu
   */
  function closeRightClickContextMenu() {
    showMenu = false;
  }

  $: {
    if ($activeTab?.activePath) {
      if ($activeTab?.activePath.collection.id === collection.id) {
        visibility = true;
      }
    }
    if (collection) {
      deletedIds = [];
      requestCount = 0;
      folderCount = 0;
      collection?.items?.forEach((item: any) => {
        if (item.type === ItemType.FOLDER) {
          deletedIds.push(item.id);
          folderCount++;
          requestCount += item.items.length;
          for (let i = 0; i < item.items.length; i++) {
            deletedIds.push(item.items[i].id);
          }
        } else if (item.type === ItemType.REQUEST) {
          requestCount++;
          deletedIds.push(item.id);
        }
      });
      deletedIds.push(collection.id);
    }
  }

  onMount(async () => {
    if (collection?.activeSync) {
      let response = await onBranchSwitched(collection);
      if (response) {
        isBranchSynced = response.isBranchSynced;
        activeSyncLoad = response.activeSyncLoad;
      }
    }
    isActiveSyncEnabled = await commonService.isFeatureEnabled(
      "isActiveSyncEnabled",
    );
  });

  let prevCurrentBranch = "";
  let prevBranches = "";
  $: {
    if (collection?.activeSync && collection?.currentBranch) {
      if (collection.currentBranch !== prevCurrentBranch) {
        onBranchSwitched(collection);
      }
      prevCurrentBranch = collection.currentBranch;
    }
    if (collection?.activeSync && collection?.branches) {
      if (JSON.stringify(collection.branches) !== prevBranches) {
        onBranchSwitched(collection);
      }
      prevBranches = JSON.stringify(collection.branches);
    }
  }

  let deleteLoader: boolean = false;
  const getFeatures = async () => {
    isActiveSyncEnabled = await commonService.isFeatureEnabled(
      "isActiveSyncEnabled",
    );
  };
  let refreshCollectionLoader = false;
</script>

<ModalWrapperV1
  title={"Delete Collection?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isCollectionPopup}
  handleModalState={() => (isCollectionPopup = false)}
>
  <div class="text-lightGray mb-1 sparrow-fs-14">
    <p>
      Are you sure you want to delete this Collection? Everything in <span
        class="text-whiteColor fw-bold">"{collection.name}"</span
      >
      will be removed.
    </p>
  </div>
  <div class="d-flex gap-3 sparrow-fs-12">
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
  >
    <Button
      disable={deleteLoader}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"dark"}
      loader={false}
      onClick={() => {
        isCollectionPopup = false;
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
        onItemDeleted("collection", {
          workspaceId: $currentWorkspace._id,
          collection,
          deletedIds,
        });
        isCollectionPopup = false;
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
        onClick: () =>
          onItemOpened("collection", {
            workspaceId: $currentWorkspace._id,
            collection,
          }),
        displayText: "Open collection",
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          (isRenaming = true), setTimeout(() => inputField.focus(), 100);
        },
        displayText: "Rename collection",
        disabled: false,
        hidden:
          !(collection?.activeSync && isBranchSynced) &&
          !(collection?.activeSync && !isBranchSynced)
            ? false
            : true,
      },
      {
        onClick: () =>
          onItemCreated("requestCollection", {
            workspaceId: $currentWorkspace._id,
            collection,
          }),
        displayText: "Add Request",
        disabled: false,
        hidden:
          (collection?.activeSync && isBranchSynced) ||
          (!(collection?.activeSync && isBranchSynced) &&
            !(collection?.activeSync && !isBranchSynced))
            ? false
            : true,
      },
      {
        onClick: () =>
          onItemCreated("folder", {
            workspaceId: $currentWorkspace._id,
            collection,
          }),
        displayText: "Add Folder",
        disabled: false,
        hidden:
          (collection?.activeSync && isBranchSynced) ||
          (!(collection?.activeSync && isBranchSynced) &&
            !(collection?.activeSync && !isBranchSynced))
            ? false
            : true,
      },
      {
        onClick: () => {
          isCollectionPopup = true;
        },
        displayText: "Delete",
        disabled: false,
        hidden: false,
      },
    ]}
    {noOfRows}
    {noOfColumns}
  />
{/if}

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
  on:load={() => {
    getFeatures();
  }}
/>

<button
  style="height:36px; border-color: {showMenu ? '#ff7878' : ''}"
  class="btn-primary d-flex w-100 align-items-center justify-content-between border-0 ps-2 my-button {collection.id ===
  'activeTabId'
    ? 'active-collection-tab'
    : ''}"
>
  <button
    on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    class="d-flex main-collection align-items-center bg-transparent border-0"
    on:click={() => {
      isCollectionCreatedFirstTime.set(false);
      visibility = !visibility;
      if (!collection.id.includes(UntrackedItems.UNTRACKED)) {
        onItemOpened("collection", {
          workspaceId: $currentWorkspace._id,
          collection,
        });
      }
    }}
  >
    <img
      src={angleRight}
      class=""
      style="height:14px; width:14px; margin-right:8px; {visibility
        ? 'transform:rotate(90deg);'
        : 'transform:rotate(0deg);'}"
      alt="angleRight"
    />
    {#if isRenaming}
      <input
        class="form-control py-0 renameInputFieldCollection"
        id="renameInputFieldCollection"
        type="text"
        style="font-size: 12px;"
        value={collection.name}
        maxlength={100}
        bind:this={inputField}
        on:blur={(e) => {
          onItemRenamed("collection", {
            workspaceId: $currentWorkspace._id,
            collection,
            newName: e?.target?.value,
          });
          isRenaming = false;
        }}
        on:keydown={(e) => {
          if (e.key === "Enter") {
            onItemRenamed("collection", {
              workspaceId: $currentWorkspace._id,
              collection,
              newName: e?.target?.value,
            });
            isRenaming = false;
          }
        }}
      />
    {:else}
      <div
        class="collection-collection.name justify-content-center d-flex align-items-center py-1 mb-0 flex-column"
        style="height: 36px; text-align: left;"
      >
        <p class="ellipsis w-100 mb-0" style="font-size: 0.75rem;">
          {collection.name}
        </p>
        {#if collection.activeSync}
          <span
            class="text-muted small w-100 ellipsis"
            style="font-size: 0.5rem;"
            ><img src={gitBranchIcon} alt="" />
            {collection?.currentBranch
              ? collection?.currentBranch
              : collection?.primaryBranch}
            {collection?.currentBranch
              ? collection?.currentBranch === collection?.primaryBranch
                ? "(Default)"
                : ""
              : "(Default)"}
          </span>
        {/if}
      </div>
    {/if}
  </button>
  {#if collection && collection.id && collection.id.includes(UntrackedItems.UNTRACKED)}
    <Spinner size={"15px"} />
  {:else}
    <Tooltip
      placement="bottom"
      title="More options"
      styleProp="bottom: -8px; {isActiveSyncEnabled ? 'left: -50%' : ''}"
    >
      <button
        class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center {showMenu
          ? 'threedot-active'
          : ''}"
        on:click={(e) => {
          rightClickContextMenu(e);
        }}
      >
        <img src={threedotIcon} alt="threedotIcon" />
      </button>
    </Tooltip>
    {#if isActiveSyncEnabled && collection?.activeSync}
      <Tooltip placement="bottom" title="Sync" styleProp="left: 25%;">
        <button
          class="sync-button p-1 border-0 rounded"
          on:click={() => {
            onRefetchCollection($currentWorkspace._id, collection);
          }}
          on:mouseenter={() => {
            isSyncBtnHovered = true;
          }}
          on:mouseleave={() => {
            isSyncBtnHovered = false;
          }}
        >
          <span
            class="{refreshCollectionLoader
              ? 'refresh-collection-loader'
              : ''}  d-flex justify-content-center align-items-center p-1"
          >
            <ReloadCollectionIcon
              color={isSyncBtnHovered ? "var(--active-sync-btn)" : "grey"}
            />
          </span>
        </button>
      </Tooltip>
    {/if}
  {/if}
</button>
<!-- {console.log(collection.name, !collection?.activeSync, activeSyncLoad)} -->
{#if !collection?.activeSync || activeSyncLoad}
  {#if !collection?.activeSync || isBranchSynced}
    <div
      style="padding-left: 15px; padding-right:0; cursor:pointer; display: {visibility
        ? 'block'
        : 'none'};"
    >
      <div class="sub-folders ps-3">
        {#each collection.items as explorer}
          <Folder
            {currentWorkspace}
            {onItemCreated}
            {onItemDeleted}
            {onItemRenamed}
            {onItemOpened}
            {onOpenRequestOnTab}
            {collection}
            {userRoleInWorkspace}
            {activeTab}
            {explorer}
          />
        {/each}
        {#if showFolderAPIButtons}
          <div class="mt-2 mb-2 d-flex">
            <Tooltip
              placement="bottom"
              title={!hasWorkpaceLevelPermission(
                userRoleInWorkspace,
                workspaceLevelPermissions.SAVE_REQUEST,
              )
                ? PERMISSION_NOT_FOUND_TEXT
                : CollectionMessage[0]}
              classProp="mt-2 mb-2"
            >
              <button
                class="bg-transparent border-0"
                on:click={() =>
                  onItemCreated("folder", {
                    workspaceId: $currentWorkspace._id,
                    collection,
                  })}
              >
                <img
                  class="list-icons mb-2 mt-2"
                  src={folderIcon}
                  alt="+ Folder"
                />
              </button>
            </Tooltip>
            <Tooltip
              placement="bottom"
              title={!hasWorkpaceLevelPermission(
                userRoleInWorkspace,
                workspaceLevelPermissions.SAVE_REQUEST,
              )
                ? PERMISSION_NOT_FOUND_TEXT
                : CollectionMessage[1]}
              classProp="mt-2 mb-2"
            >
              <button
                class="bg-transparent border-0"
                on:click={() =>
                  onItemCreated("requestCollection", {
                    workspaceId: $currentWorkspace._id,
                    collection,
                  })}
              >
                <img
                  class="list-icons mb-2 mt-2 ms-3"
                  src={requestIcon}
                  alt="+ API Request"
                />
              </button>
            </Tooltip>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div
      style="padding-left: 15px; padding-right:0; cursor:pointer; display: {visibility
        ? 'block'
        : 'none'};"
    >
      <span class="sparrow-fs-12 text-muted">This branch is unavailable</span>
    </div>
  {/if}
{/if}

<style>
  .sync-button {
    background-color: transparent;
  }
  .sync-button:active {
    background-color: var(--editor-angle-bracket);
  }
  .my-button:hover .threedot-icon-container {
    visibility: visible;
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
  .threedot-icon-container {
    visibility: hidden;
    background-color: transparent;
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--workspace-hover-color);
  }
  .refresh-collection-loader-active {
    visibility: visible;
  }
  .threedot-icon-container:hover {
    background-color: var(--workspace-hover-color);
  }

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

  .renameInputFieldCollection {
    border: none;
    background-color: transparent;
    color: var(--white-color);
    padding-left: 0;
  }
  .sub-folders {
    border-left: 1px solid var(--border-color);
  }
  .main-collection {
    width: calc(100% - 48px);
  }
  .active-collection-tab {
    background-color: var(--selected-active-sidebar) !important;
  }
  .collection-collection.name {
    width: calc(100% - 30px);
    text-align: left;
  }
  .refresh-collection-loader {
    animation: loader-animation 1s linear infinite;
  }
  @keyframes loader-animation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
