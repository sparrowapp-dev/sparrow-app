<script lang="ts">
  // ---- Components
  import { Spinner } from "@sparrow/library/ui";
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import { Tooltip } from "@sparrow/library/ui";
  import { Options } from "@sparrow/library/ui";
  import { HttpRequestDefaultNameBaseEnum } from "@sparrow/common/types/workspace/http-request-base";

  // ---- Helper functions
  import { getMethodStyle } from "@sparrow/common/utils/conversion.helper";

  import { UntrackedItems, WorkspaceRole } from "@sparrow/common/enums";

  // --- SVG
  import { dot3Icon as threedotIcon } from "@sparrow/library/assets";
  import { reloadSyncIcon } from "@sparrow/library/assets";

  import type {
    CollectionBaseInterface,
    CollectionItemBaseInterface,
  } from "@sparrow/common/types/workspace/collection-base";
  import { HttpRequestMethodBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
  import {
    openedComponent,
    addCollectionItem,
    removeCollectionItem,
  } from "../../../../stores/recent-left-panel";
  import {
    ChevronDownRegular,
    ChevronRightRegular,
    MoreHorizontalRegular,
  } from "@sparrow/library/icons";
  import { SavedRequest } from "..";

  let expand = false;
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

  export let searchData: string;
  export let activeTabPath;

  /**
   * Role of user in workspace
   */
  export let userRole;
  export let activeTabType;
  export let isWebApp;

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
    const selectElement = document.getElementById(`show-more-api-${api.id}`);
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
      await onItemRenamed("request", {
        workspaceId: collection.workspaceId,
        collection,
        folder: folder ? folder : { id: "" },
        request: api,
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

  const dragStart = (event: DragEvent, collection: CollectionBaseInterface) => {
    const data = {
      workspaceId: collection.workspaceId,
      collectionId: collection.id,
      folderId: folder?.id ?? "",
      requestId: api.id,
      name: api.name,
      method: api?.request?.method,
    };
    event.dataTransfer?.setData("text/plain", JSON.stringify(data));
  };

  let httpMethodUIStyle = "";
  $: {
    httpMethodUIStyle = getMethodStyle(
      api?.request?.method as HttpRequestMethodBaseEnum,
    );
  }

  let verticalActiveLine = false;

  $: {
    if (api.items) {
      if (api.items.find((item) => item.id === activeTabId)) {
        verticalActiveLine = true;
      } else {
        verticalActiveLine = false;
      }
    }
  }
  $: {
    if ($openedComponent.has(api.id)) {
      expand = true;
    }
    if (searchData) {
      expand = true;
    }
    // if (activeTabPath) {
    //   if (activeTabPath.requestId === api.id) {
    //     expand = true;
    //   }
    // }
  }
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>

<Modal
  title={"Delete Request?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isDeletePopup}
  handleModalState={() => (isDeletePopup = false)}
>
  <div class="text-lightGray mb-1 text-ds-font-size-14 text-ds-font-weight-medium">
    <p>
      Are you sure you want to delete this Request? <span
      class="text-ds-font-weight-semi-bold" style="color: var(--text-ds-neutral-50);">"{api.name}"</span
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
          onItemOpened("request", {
            workspaceId: collection.workspaceId,
            collection,
            folder,
            request: api,
          });
        },
        displayText: `Open ${HttpRequestDefaultNameBaseEnum.NAME}`,
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          isRenaming = true;
          setTimeout(() => inputField.focus(), 100);
        },
        displayText: `Rename ${HttpRequestDefaultNameBaseEnum.NAME}`,
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
    {noOfColumns}
  />
{/if}

<div
  tabindex="0"
  draggable={activeTabType === "TESTFLOW" ? true : false}
  on:dragstart={(event) => {
    dragStart(event, collection);
  }}
  bind:this={requestTabWrapper}
  class="d-flex draggable align-items-center justify-content-between my-button btn-primary {api.id ===
  activeTabId
    ? 'active-request-tab'
    : ''}"
  style={`height:32px; padding-left:3px; gap:4px; {margin-bottom :2px;}`}
>
  <button
    tabindex="-1"
    on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    on:click|preventDefault={() => {
      if (api?.items && api?.items?.length > 0) {
      } else {
        expand = false;
      }
      if (!isRenaming) {
        expand = !expand;
        if (expand) {
          addCollectionItem(api.id, "Request");
          onItemOpened("request", {
            workspaceId: collection.workspaceId,
            collection,
            folder,
            request: api,
          });
        } else {
          removeCollectionItem(api.id);
        }
      }
    }}
    style={folder?.id
      ? "padding-left: 41.5px; height:100% "
      : "padding-left: 28px; height:100%;"}
    class="main-file d-flex align-items-center position-relative bg-transparent border-0 {api.id?.includes(
      UntrackedItems.UNTRACKED,
    )
      ? 'unclickable'
      : ''}"
  >
    <!-- {#if api?.isDeleted && "activeSync"}
      <span
        class="delete-ticker position-absolute sparrow-fs-10 px-2 d-none"
        style="right: 0; background-color: var(--background-color); "
        >DELETED</span
      >
    {/if} -->
    <!-- {#if "actSync" && api?.source === "SPEC"}
      <img src={reloadSyncIcon} class="ms-2 d-none" alt="" />
    {/if} -->

    <span style="  display: flex; margin-right:4px; ">
      {#if api?.items && api?.items?.length > 0}
        <Button
          startIcon={!expand ? ChevronRightRegular : ChevronDownRegular}
          size="extra-small"
          customWidth={"24px"}
          type="teritiary-regular"
        />
      {:else}
        <div
          class="api-method"
          style="width: 24px !important; height:24px !important; padding:0;"
        ></div>
      {/if}
    </span>
    <div
      class="api-method text-{httpMethodUIStyle} {api?.isDeleted &&
        'api-method-deleted'}"
      style="font-size: 9px;"
    >
      {api.request?.method?.toUpperCase() === "DELETE"
        ? "DEL"
        : api.request?.method?.toUpperCase()}
    </div>

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
      <div
        class="api-name ellipsis {api?.isDeleted && 'api-name-deleted'}"
        style={`color: ${api?.items?.length > 0 ? "var(--bg-ds-neutral-50)" : "var(--bg-ds-neutral-200)"}`}
      >
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
          tabindex={-1}
          id={`show-more-api-${api.id}`}
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
<div style="padding-left: 0; display: {expand ? 'block' : 'none'};">
  <div
    class="sub-files position-relative"
    style="background-color: {api.id === activeTabId
      ? 'var(--bg-ds-surface-600)'
      : 'transparent'};"
  >
    <div
      class="box-line"
      style={`left: ${folder?.id ? "55.5px" : "41.1px"}; background-color: ${verticalActiveLine ? "var(--bg-ds-neutral-500)" : "var(--bg-ds-surface-100)"};`}
    ></div>
    <!-- {#if } -->
    {#each api?.items || [] as exp}
      <div>
        <SavedRequest
          {userRole}
          api={exp}
          request={api}
          {onItemRenamed}
          {onItemDeleted}
          {onItemOpened}
          {folder}
          {collection}
          {activeTabId}
        />
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .delete-ticker {
    color: var(--error--color);
    font-weight: 500;
  }
  .api-method {
    font-size: 9px;
    font-weight: 500;
    width: 30px !important;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: end;
  }
  .api-name {
    height: 24px;
    line-height: 18px;
    font-weight: 500;
    width: calc(100% - 58px);
    text-align: left;
    display: flex;
    align-items: center;

    padding: 2px 4px;
    caret-color: var(--bg-ds-primary-300);
  }
  .api-name:focus {
    border: 1px solid var(--bg-ds-primary-300) !important;
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
  .btn-primary:active {
    background-color: var(--bg-ds-surface-500);
    color: var(--text-ds-neutral-50);
    border-radius: 4px;
  }
  .btn-primary:focus-visible .threedot-icon-container {
    visibility: visible;
  }
  .btn-primary:focus-visible {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--bg-ds-primary-300);
    outline: none;
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
  .renameInputFieldFile {
    height: 24px;
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    padding: 4px 2px;
    outline: none;
    border-radius: 4px !important;
    border: 1px solid var(--bg-ds-primary-300);
    caret-color: var(--bg-ds-primary-300);
  }
  .renameInputFieldFile:focus {
    border: 1px solid var(--border-ds-primary-300) !important;
  }
  .main-file {
    width: calc(100% - 28px);
  }
  .active-request-tab {
    background-color: var(--bg-ds-surface-500) !important;
    border-radius: 4px;
    .delete-ticker {
      background-color: var(--selected-active-sidebar) !important;
    }
  }
  .active-request-tab:hover {
    border-radius: 4px;
    .delete-ticker {
      background-color: var(--selected-active-sidebar) !important;
    }
  }

  .draggable:active {
    opacity: 0.9;
  }
  .box-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    // background-color: var(--bg-ds-surface-100);
    z-index: 150;
  }
</style>
