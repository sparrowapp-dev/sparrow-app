<script lang="ts">
  // ---- Components
  import {
    Spinner,
    Modal,
    Button,
    Tooltip,
    Options,
  } from "@sparrow/library/ui";

  // --- Icons
  import { dot3Icon as threedotIcon } from "@sparrow/library/assets";
  import { MoreHorizontalRegular, SocketIoIcon } from "@sparrow/library/icons";

  // --- Types
  import {
    type CollectionBaseInterface,
    type CollectionItemBaseInterface,
  } from "@sparrow/common/types/workspace/collection-base";
  import { UntrackedItems, WorkspaceRole } from "@sparrow/common/enums";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";

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
   * Selected socketIo details
   */
  export let socketIo: CollectionItemBaseInterface;
  /**
   * Current Tab Path
   */
  export let activeTabId: string;

  /**
   * Role of user in workspace
   */
  export let userRole;
  /**
   * Indicate if workspace is public or not
   */
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
      `show-more-socket-io-${socketIo.id}`,
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
      await onItemRenamed("socket-io", {
        workspaceId: collection.workspaceId,
        collection,
        folder: folder ? folder : { id: "" },
        socketio: socketIo,
        newName: newRequestName,
      });
    }
    isRenaming = false;
    newRequestName = "";
  };

  const onRenameInputKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldSocketIo",
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
  title={`Delete ${SocketIORequestDefaultAliasBaseEnum.NAME}?`}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isDeletePopup}
  handleModalState={() => (isDeletePopup = false)}
>
  <div
    class="text-lightGray mb-1 text-ds-font-size-14 text-ds-font-weight-medium"
  >
    <p>
      Are you sure you want to delete this {SocketIORequestDefaultAliasBaseEnum.NAME}?
      <span
        class="text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-50);">"{socketIo.name}"</span
      >
      will be removed and cannot be restored.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded w-100 text-ds-font-size-16"
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
        onItemDeleted("socket-io", {
          workspaceId: collection.workspaceId,
          collection,
          socketio: socketIo,
          folder,
        });
        deleteLoader = false;
        isDeletePopup = false;
      }}
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
          onItemOpened("socket-io", {
            workspaceId: collection.workspaceId,
            collection,
            folder,
            socketio: socketIo,
          });
        },
        displayText: `Open ${SocketIORequestDefaultAliasBaseEnum.NAME}`,
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          isRenaming = true;
          setTimeout(() => inputField.focus(), 100);
        },
        displayText: `Rename ${SocketIORequestDefaultAliasBaseEnum.NAME}`,
        disabled: false,
        hidden:
          !collection.activeSync ||
          (socketIo.source === "USER" && collection.activeSync)
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
          (socketIo.source === "USER" && collection.activeSync) ||
          socketIo.isDeleted
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
      dragStart(event, collection, folder, socketIo);
    }
  }}
  on:dragend={() => {
    isDragging = false;
    dragStop();
  }}
  on:dragover={(event) => handleDragOver(event, collection, folder, socketIo, requestTabWrapper, (pos) => dropPosition = pos, (val) => isDragOver = val, (val) => isForbiddenDrop = val)}
  on:dragleave={() => handleDragLeave((val) => isDragOver = val, (val) => isForbiddenDrop = val, (pos) => dropPosition = pos)}
  on:drop={(event) => handleDrop(event, collection, folder, socketIo, (pos) => dropPosition = pos, (val) => isDragOver = val, (val) => isForbiddenDrop = val, dropPosition)}
  bind:this={requestTabWrapper}
  class="d-flex draggable align-items-center justify-content-between my-button btn-primary {socketIo.id ===
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
        onItemOpened("socket-io", {
          workspaceId: collection.workspaceId,
          collection,
          folder,
          socketio: socketIo,
        });
      }
    }}
    style={folder?.id
      ? "padding-left: 41.5px; height:100%;"
      : "padding-left: 29px; height:100%;  "}
    class="main-file d-flex align-items-center position-relative bg-transparent border-0 {socketIo.id?.includes(
      UntrackedItems.UNTRACKED,
    )
      ? 'unclickable'
      : ''}"
  >
    <div
      class="api-method"
      style="width: 24px !important; height:24px !important; padding:0;"
    ></div>
    <span class="api-method">
      <SocketIoIcon
        height={"12px"}
        width={"12px"}
        color={"var(--icon-ds-success-300)"}
      />
    </span>

    {#if isRenaming}
      <input
        class="py-0 rename-input-field-socket-io text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
        style="  width: calc(100% - 50px);"
        id="renameInputFieldSocketIo"
        type="text"
        maxlength={100}
        value={socketIo.name}
        on:click|stopPropagation={() => {}}
        bind:this={inputField}
        on:input={handleRenameInput}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    {:else}
      <div
        class="api-name ellipsis {socketIo?.isDeleted && 'api-name-deleted'} "
      >
        <p
          class="ellipsis m-0 p-0 text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
        >
          {socketIo.name}
        </p>
      </div>
    {/if}
  </button>

  {#if socketIo.id?.includes(UntrackedItems.UNTRACKED)}
    <Spinner size={"15px"} />
  {:else if userRole !== WorkspaceRole.WORKSPACE_VIEWER && !isSharedWorkspace}
    {#if isDragging}
      <span class="threedot-icon-container d-flex">
        <Button
          tabindex={"-1"}
          id={`show-more-socket-io-${socketIo.id}`}
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
            id={`show-more-socket-io-${socketIo.id}`}
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
    font-size: 10px;
    font-weight: 500;
    width: 30px !important;
    height: 24px;
    line-height: 18px;
    color: var(--bg-ds-neutral-50);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: start;
    padding: 4px;
    padding-left: 0;
  }
  .api-name {
    height: 24px;
    line-height: 18px;
    font-weight: 400;
    width: calc(100% - 58px);
    text-align: left;
    color: var(--bg-ds-neutral-200);
    align-items: center;
    caret-color: var(--bg-ds-primary-300);
    padding: 2px 4px;
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
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--bg-tertiary-600);
  }

  .btn-primary {
    background-color: transparent;
    color: var(--text-ds-neutral-50);
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
  .btn-primary:focus-visible {
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--border-ds-primary-300);
    outline: none;
    border-radius: 4px;
  }
  .btn-primary:focus-visible .threedot-icon-container {
    visibility: visible;
  }

  .btn-primary:active {
    background-color: var(--bg-ds-surface-500);
    border-radius: 4px;
  }
  .btn-primary:active .threedot-icon-container {
    visibility: visible;
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
  .rename-input-field-socket-io {
    height: 24px;
    border: none;
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    outline: none;
    border-radius: 4px !important;
    padding: 4px 2px;
    caret-color: var(--bg-ds-primary-300);
  }
  .rename-input-field-socket-io:focus {
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
