<script lang="ts">
  // ---- Components
  import { Spinner } from "@sparrow/library/ui";
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import { Tooltip } from "@sparrow/library/ui";
  import { Options } from "@sparrow/library/ui";

  // ---- Helper functions
  import { getMethodStyle } from "@sparrow/common/utils/conversion.helper";
  import { getPathFromUrl } from "@sparrow/common/utils/common.helper";

  // ---- Enum and Interfaces
  import type {
    Request,
    Folder,
    Path,
  } from "@sparrow/common/interfaces/request.interface";
  import { UntrackedItems, WorkspaceRole } from "@sparrow/common/enums";

  // --- SVG
  import { dot3Icon as threedotIcon } from "@sparrow/library/assets";

  // ---- DB
  import { MoreHorizontalRegular, SocketIcon } from "@sparrow/library/icons";
  import type {
    CollectionBaseInterface,
    CollectionItemBaseInterface,
  } from "@sparrow/common/types/workspace/collection-base";

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
  export let collection: CollectionBaseInterface;
  /**
   * Selected folder details
   */
  export let folder: CollectionItemBaseInterface | null;
  /**
   * Selected API details
   */
  export let api: CollectionItemBaseInterface;
  /**
   * Current Tab Path
   */
  export let activeTabId: string;

  /**
   * Role of user in workspace
   */
  export let userRole;
  export let isSharedWorkspace = false;
  export let onItemMoved: (args: any) => void;

  // Drag handler functions passed from parent
  export let dragStart: (event: DragEvent, collection: any, folder: any, api: any) => void;
  export let dragStop: () => void;
  export let handleDragOver: (event: DragEvent, collection: any, folder: any, api: any, requestTabWrapper: HTMLElement, setDropPosition: (pos: "top" | "bottom" | null) => void, setIsDragOver: (val: boolean) => void, setIsForbiddenDrop: (val: boolean) => void) => void;
  export let handleDragLeave: (setIsDragOver: (val: boolean) => void, setIsForbiddenDrop: (val: boolean) => void, setDropPosition: (pos: "top" | "bottom" | null) => void) => void;
  export let handleDrop: (event: DragEvent, collection: any, folder: any, api: any, setDropPosition: (pos: "top" | "bottom" | null) => void, setIsDragOver: (val: boolean) => void, setIsForbiddenDrop: (val: boolean) => void, currentDropPosition: "top" | "bottom" | null) => void;

  let isDeletePopup: boolean = false;
  let showMenu: boolean = false;
  let noOfColumns = 180;
  let inputField: HTMLInputElement;
  let isRenaming = false;
  let deleteLoader: boolean = false;
  let isDragging: boolean = false;
  let isDragOver: boolean = false;
  let isForbiddenDrop: boolean = false;
  let dropPosition: "top" | "bottom" | null = null;

  let requestTabWrapper: HTMLElement;

  import {
    dragState,
  } from "../../../../stores/drag-state";

  function rightClickContextMenu(e: Event) {
    setTimeout(() => {
      showMenu = !showMenu;
    }, 100);
  }

  function handleSelectClick(event: MouseEvent) {
    const selectElement = document.getElementById(
      `show-more-websocket-${api.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showMenu = false;
    }
  }

  let newRequestName: string = "";

  const handleRenameInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    newRequestName = target.value.trim();
  };

  const onRenameBlur = async () => {
    if (newRequestName) {
      await onItemRenamed("web-socket", {
        workspaceId: collection.workspaceId,
        collection,
        folder: folder ? folder : { id: "" },
        websocket: api,
        newName: newRequestName,
      });
    }
    isRenaming = false;
    newRequestName = "";
  };

  const onRenameInputKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldFile",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>

<Modal
  title={"Delete WebSocket?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isDeletePopup}
  handleModalState={() => (isDeletePopup = false)}
>
  <div
    class="mb-1 mt-2 text-ds-font-size-14 text-ds-font-weight-medium"
    style="color: var(--text-ds-neutral-100); line-height:20px;"
  >
    <p>
      Are you sure you want to delete this WebSocket? <span
        class="text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-50);">"{api.name}"</span
      >
      will be removed and cannot be restored.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end mt-1 mb-0 rounded w-100 text-ds-font-size-16"
    style="gap:12px"
  >
    <Button
      disable={deleteLoader}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"secondary"}
      loader={false}
      onClick={() => {
        isDeletePopup = false;
      }}
      customWidth={"96px"}
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
        onItemDeleted("websocket", {
          workspaceId: collection.workspaceId,
          collection,
          websocket: api,
          folder,
        });
        deleteLoader = false;
        isDeletePopup = false;
      }}
      customWidth={"96px"}
    />
  </div></Modal
>

{#if showMenu && userRole !== WorkspaceRole.WORKSPACE_VIEWER && !isSharedWorkspace}
  <Options
    xAxis={requestTabWrapper.getBoundingClientRect().right - 30}
    yAxis={[
      requestTabWrapper.getBoundingClientRect().top - 5,
      requestTabWrapper.getBoundingClientRect().bottom + 5,
    ]}
    zIndex={500}
    menuItems={[
      {
        onClick: () => {
          onItemOpened("websocket", {
            workspaceId: collection.workspaceId,
            collection,
            folder,
            websocket: api,
          });
        },
        displayText: "Open WebSocket",
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          isRenaming = true;
          setTimeout(() => inputField.focus(), 100);
        },
        displayText: "Rename WebSocket",
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
  />
{/if}

<div
  tabindex="0"
  draggable={!collection.activeSync}
  on:dragstart={(event) => {
    if (!collection.activeSync) {
      isDragging = true;
      dragStart(event, collection, folder, api);
    }
  }}
  on:dragend={() => {
    isDragging = false;
    dragStop();
  }}
  on:dragover={(event) => handleDragOver(event, collection, folder, api, requestTabWrapper, (pos) => dropPosition = pos, (val) => isDragOver = val, (val) => isForbiddenDrop = val)}
  on:dragleave={() => handleDragLeave((val) => isDragOver = val, (val) => isForbiddenDrop = val, (pos) => dropPosition = pos)}
  on:drop={(event) => handleDrop(event, collection, folder, api, (pos) => dropPosition = pos, (val) => isDragOver = val, (val) => isForbiddenDrop = val, dropPosition)}
  bind:this={requestTabWrapper}
  class="d-flex draggable align-items-center justify-content-between my-button btn-primary {api.id ===
  activeTabId
    ? 'active-request-tab'
    : ''} {isDragOver
    ? 'drag-over-request valid-drop-zone'
    : ''} {isForbiddenDrop
    ? 'drag-forbidden'
    : ''} {$dragState.isOverForbiddenZone && isDragging
    ? 'dragging-over-forbidden'
    : ''} {dropPosition === 'top' ? 'drop-indicator-top' : ''} {dropPosition ===
  'bottom'
    ? 'drop-indicator-bottom'
    : ''} {collection.activeSync ? 'active-sync-no-drag' : ''}"
  style="height:32px; padding-left:3px;"
>
  <button
    tabindex="-1"
    on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    on:click|preventDefault={() => {
      if (!isRenaming) {
        onItemOpened("websocket", {
          workspaceId: collection.workspaceId,
          collection,
          folder,
          websocket: api,
        });
      }
    }}
    style={folder?.id
      ? "padding-left: 41.5px; height:100%;"
      : "padding-left: 29px;  height:100%;"}
    class="main-file d-flex align-items-center position-relative bg-transparent border-0 {api.id?.includes(
      UntrackedItems.UNTRACKED,
    )
      ? 'unclickable'
      : ''}"
  >
    <div
      class="api-method"
      style="width: 24px !important; height:24px !important; padding:0;"
    ></div>
    <span class="api-method"
      ><SocketIcon
        height={"12px"}
        width={"16px"}
        color={"var(--icon-ds-primary-400)"}
      /></span
    >

    {#if isRenaming}
      <input
        class="py-0 renameInputFieldFile text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
        style=" width: calc(100% - 50px);"
        id="renameInputFieldFile"
        type="text"
        maxlength={100}
        value={api.name}
        on:click|stopPropagation={() => {}}
        bind:this={inputField}
        on:input={handleRenameInput}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    {:else}
      <div class="api-name ellipsis {api?.isDeleted && 'api-name-deleted'}">
        <p
          class="ellipsis m-0 p-0 text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
        >
          {api.name}
        </p>
      </div>
    {/if}
  </button>

  {#if api.id?.includes(UntrackedItems.UNTRACKED)}
    <Spinner size={"15px"} />
  {:else if userRole !== WorkspaceRole.WORKSPACE_VIEWER && !isSharedWorkspace}
    {#if isDragging}
      <span class="threedot-icon-container d-flex">
        <Button
          tabindex={"-1"}
          id={`show-more-websocket-${api.id}`}
          size="extra-small"
          customWidth={"24px"}
          type="teritiary-regular"
          startIcon={MoreHorizontalRegular}
          onClick={(e) => {
            rightClickContextMenu(e);
          }}
        />
      </span>
    {:else}
      <Tooltip
        title={"More"}
        show={!showMenu}
        placement={"bottom-center"}
        zIndex={701}
        distance={17}
      >
        <span class="threedot-icon-container d-flex">
          <Button
            tabindex={"-1"}
            id={`show-more-websocket-${api.id}`}
            size="extra-small"
            customWidth={"24px"}
            type="teritiary-regular"
            startIcon={MoreHorizontalRegular}
            onClick={(e) => {
              rightClickContextMenu(e);
            }}
          />
        </span>
      </Tooltip>
    {/if}
  {/if}
</div>

<style lang="scss">
  .delete-ticker {
    color: var(--error--color);
    font-weight: 500;
  }
  .api-method {
    font-size: 12px;
    font-weight: 500;
    width: 30px !important;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: start;
    padding: 4px;
    padding-left: 0px;
  }
  .api-name {
    font-weight: 500;
    font-size: 12px;
    height: 24px;
    line-height: 18px;
    width: calc(100% - 58px);
    text-align: left;
    align-items: center;
    padding: 2px 4px;
    color: var(--text-ds-neutral-200);
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

  .btn-primary {
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    padding-right: 5px;
    border-radius: 2px;
  }
  .btn-primary:hover {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
    border-radius: 4px;
  }
  .btn-primary:hover .threedot-icon-container {
    visibility: visible;
  }

  .btn-primary:hover {
    .delete-ticker {
      background-color: var(--border-color) !important;
    }
  }

  .btn-primary:focus-visible {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
    border-radius: 4px;
    border: 2px solid var(--bg-ds-primary-300);
    outline: none;
  }

  .btn-primary:focus-visible .threedot-icon-container {
    visibility: visible;
  }
  .border-primary:active {
    background-color: var(--bg-ds-surface-500);
    color: var(--bg-ds-surface-500);
  }
  .btn-primary:active .threedot-icon-container {
    visibility: visible;
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
    height: 24px;
    border: none;
    background-color: transparent;
    color: var(--text-ds-neutral-50);
    padding: 4px 2px;
    outline: none;
    border-radius: 4px !important;
    caret-color: var(--bg-ds-primary-300);
  }
  .renameInputFieldFile:focus {
    border: 1px solid var(--border-ds-primary-300) !important;
  }
  .main-file {
    width: calc(100% - 28px);
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

  .draggable:active {
    opacity: 0.9;
  }

  /* Drag-over highlight for request drop target */
  .drag-over-request {
    outline: 2px solid var(--bg-ds-primary-300);
    background-color: var(--bg-ds-surface-400) !important;
    transition:
      outline 0.1s,
      background-color 0.1s;
  }

  /* Insertion line indicators */
  .drop-indicator-top {
    position: relative;
  }

  .drop-indicator-top::before {
    content: "";
    position: absolute;
    top: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--bg-ds-primary-300);
    z-index: 100;
  }

  .drop-indicator-bottom {
    position: relative;
  }

  .drop-indicator-bottom::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--bg-ds-primary-300);
    z-index: 100;
  }

  /* Forbidden drop cursor and styling */
  .drag-forbidden {
    cursor: not-allowed !important;
  }

  .drag-forbidden * {
    cursor: not-allowed !important;
  }

  /* Apply forbidden cursor to the dragged element itself */
  .dragging-over-forbidden {
    cursor: not-allowed !important;
    opacity: 0.6;
  }

  .dragging-over-forbidden * {
    cursor: not-allowed !important;
  }

  /* ActiveSync collections - non-draggable styling */
  .active-sync-no-drag {
    cursor: default !important;
  }

  .active-sync-no-drag * {
    cursor: default !important;
  }

  /* Valid drop zone styling - blue dashed border overlay */
  .valid-drop-zone {
    position: relative;
  }

  .valid-drop-zone::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(59, 130, 246, 0.1);
    border: 2px dashed rgba(59, 130, 246, 0.6);
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.2s;
    border-radius: 4px;
  }
</style>
