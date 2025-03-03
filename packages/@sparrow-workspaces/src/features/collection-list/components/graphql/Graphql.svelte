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
  import {
    GraphIcon,
    MoreHorizontalRegular,
    SocketIoIcon,
  } from "@sparrow/library/icons";

  // --- Types
  import {
    type CollectionBaseInterface,
    type CollectionItemBaseInterface,
  } from "@sparrow/common/types/workspace/collection-base";
  import { UntrackedItems, WorkspaceRole } from "@sparrow/common/enums";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";

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
   * Selected graphql details
   */
  export let graphql: CollectionItemBaseInterface;
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
      `show-more-graphql-${graphql.id}`,
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
      await onItemRenamed("graphql", {
        workspaceId: collection.workspaceId,
        collection,
        folder: folder ? folder : { id: "" },
        graphql: graphql,
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
  title={`Delete ${GraphqlRequestDefaultAliasBaseEnum.NAME}?`}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isDeletePopup}
  handleModalState={() => (isDeletePopup = false)}
>
  <div class="text-lightGray mb-1 sparrow-fs-12">
    <p>
      Are you sure you want to delete this {GraphqlRequestDefaultAliasBaseEnum.NAME}?
      <span class="text-whiteColor fw-bold">"{graphql.name}"</span>
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
        onItemDeleted("graphql", {
          workspaceId: collection.workspaceId,
          collection,
          graphql: graphql,
          folder,
        });
        deleteLoader = false;
        isDeletePopup = false;
      }}
    />
  </div></Modal
>

{#if showMenu && userRole !== WorkspaceRole.WORKSPACE_VIEWER}
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
          onItemOpened("graphql", {
            workspaceId: collection.workspaceId,
            collection,
            folder,
            graphql: graphql,
          });
        },
        displayText: `Open ${GraphqlRequestDefaultAliasBaseEnum.NAME}`,
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          isRenaming = true;
          setTimeout(() => inputField.focus(), 100);
        },
        displayText: `Rename ${GraphqlRequestDefaultAliasBaseEnum.NAME}`,
        disabled: false,
        hidden:
          !collection.activeSync ||
          (graphql.source === "USER" && collection.activeSync)
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
          (graphql.source === "USER" && collection.activeSync) ||
          graphql.isDeleted
            ? false
            : true,
      },
    ]}
    {noOfColumns}
  />
{/if}

<div
  tabindex="0"
  bind:this={requestTabWrapper}
  class="d-flex align-items-center justify-content-between my-button btn-primary {graphql.id ===
  activeTabId
    ? 'active-request-tab'
    : ''} "
  style="height:32px; padding-left:3px;"
>
  <button
    tabindex="-1"
    on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    on:click|preventDefault={() => {
      if (!isRenaming) {
        onItemOpened("graphql", {
          workspaceId: collection.workspaceId,
          collection,
          folder,
          graphql: graphql,
        });
      }
    }}
    style={folder?.id
      ? "padding-left: 62.5px; gap:4px;"
      : "padding-left: 48.5px; gap:4px;"}
    class="main-file d-flex align-items-center position-relative bg-transparent border-0 {graphql.id?.includes(
      UntrackedItems.UNTRACKED,
    )
      ? 'unclickable'
      : ''}"
  >
    <span class="api-method">
      <GraphIcon
        height={"12px"}
        width={"12px"}
        color={"var(--icon-ds-accent-400)"}
      />
    </span>

    {#if isRenaming}
      <input
        class="py-0 rename-input-field-graphql"
        style="font-size: 12px; width: calc(100% - 50px);"
        id="renameInputFieldSocketIo"
        type="text"
        maxlength={100}
        value={graphql.name}
        on:click|stopPropagation={() => {}}
        bind:this={inputField}
        on:input={handleRenameInput}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    {:else}
      <div
        class="api-name ellipsis {graphql?.isDeleted && 'api-name-deleted'}"
        style="font-size: 12px; "
      >
        {graphql.name}
      </div>
    {/if}
  </button>

  {#if graphql.id?.includes(UntrackedItems.UNTRACKED)}
    <Spinner size={"15px"} />
  {:else if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
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
          id={`show-more-graphql-${graphql.id}`}
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

    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .api-name {
    font-weight: 500;
    width: calc(100% - 48px);
    text-align: left;
    font-size: 12px;
    line-height: 18px;
    padding: 4px 2px;
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
    // background-color: var(--bg-tertiary-600);
  }

  .btn-primary {
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    padding-right: 5px;
    border-radius: 2px;
  }

  .btn-primary:hover {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
  }
  .btn-primary:hover .threedot-icon-container {
    visibility: visible;
  }

  .btn-primary:active {
    background-color: var(--bg-ds-surface-500);
    border-radius: 4px;
  }
  .btn-primary:active .threedot-icon-container {
    visibility: visible;
  }
  .btn-primary:focus-visible {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
    outline: none;
    border: 2px solid var(--bg-ds-primary-300);
  }
  .btn-primary:focus-visible .threedot-icon-container {
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
  .rename-input-field-graphql {
    border: none;
    background-color: transparent;
    color: var(--text-ds-neutral-50);
    padding: 4px 2px;
    outline: none;
    border-radius: 4px !important;
    height: 24px;
    font-size: 12px;
    line-height: 18px;
    caret-color: var(--bg-ds-primary-300);
  }
  .rename-input-field-graphql:focus {
    border: 1px solid var(--border-ds-primary-300) !important;
  }
  .main-file {
    width: calc(100% - 24px);
  }
  .active-request-tab {
    background-color: var(--bg-ds-surface-500) !important;
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
