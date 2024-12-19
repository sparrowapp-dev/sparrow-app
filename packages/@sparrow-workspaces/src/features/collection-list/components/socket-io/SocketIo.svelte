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
  import { SocketIoIcon } from "@sparrow/library/icons";

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
  export let folder: CollectionItemBaseInterface;
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

  let isDeletePopup: boolean = false;
  let showMenu: boolean = false;
  let noOfColumns = 180;
  let inputField: HTMLInputElement;
  let isRenaming = false;
  let deleteLoader: boolean = false;

  let requestTabWrapper: HTMLElement;

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
  <div class="text-lightGray mb-1 sparrow-fs-12">
    <p>
      Are you sure you want to delete this {SocketIORequestDefaultAliasBaseEnum.NAME}?
      <span class="text-whiteColor fw-bold">"{socketIo.name}"</span>
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

{#if showMenu}
  <Options
    xAxis={requestTabWrapper.getBoundingClientRect().right - 30}
    yAxis={[
      requestTabWrapper.getBoundingClientRect().top - 0,
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
    {noOfColumns}
  />
{/if}

<div
  bind:this={requestTabWrapper}
  class="d-flex align-items-center mb-1 mt-1 justify-content-between my-button btn-primary {socketIo.id ===
  activeTabId
    ? 'active-request-tab'
    : ''} "
  style="height:32px;"
>
  <button
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
    style={folder?.id ? "padding-left: 46px;" : "padding-left: 30px;"}
    class="main-file d-flex align-items-center position-relative bg-transparent border-0 {socketIo.id?.includes(
      UntrackedItems.UNTRACKED,
    )
      ? 'unclickable'
      : ''}"
  >
    <span class="api-method">
      <SocketIoIcon
        height={"14px"}
        width={"14px"}
        color={"var(--icon-primary-300)"}
      />
    </span>

    {#if isRenaming}
      <input
        class="py-0 rename-input-field-socket-io"
        style="font-size: 12px; width: calc(100% - 50px);"
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
        style="font-size: 12px;"
      >
        {socketIo.name}
      </div>
    {/if}
  </button>

  {#if socketIo.id?.includes(UntrackedItems.UNTRACKED)}
    <Spinner size={"15px"} />
  {:else if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
    <Tooltip
      title={"More"}
      show={!showMenu}
      placement={"bottom"}
      zIndex={701}
      distance={17}
    >
      <button
        id={`show-more-socket-io-${socketIo.id}`}
        class="threedot-icon-container border-0 p-0 rounded d-flex justify-content-center align-items-center {showMenu
          ? 'threedot-active'
          : ''}"
        style="transform: rotate(90deg);"
        on:click={(e) => {
          rightClickContextMenu(e);
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
    width: 48px !important;
    height: 30px;
    padding-left: 6px;
    padding-right: 4px;
    border-radius: 8px;
    display: flex;
    align-items: center;
  }
  .api-name {
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
    background-color: var(--bg-tertiary-500);
  }

  .btn-primary {
    background-color: transparent;
    color: var(--white-color);
    padding-right: 5px;
    border-radius: 2px;
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
  .rename-input-field-socket-io {
    border: none;
    background-color: transparent;
    color: var(--white-color);
    padding-left: 0;
    outline: none;
    border-radius: 2px !important;
  }
  .rename-input-field-socket-io:focus {
    border: 1px solid var(--border-primary-300) !important;
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
