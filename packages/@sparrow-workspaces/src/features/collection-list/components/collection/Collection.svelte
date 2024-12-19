<script lang="ts">
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  export let onItemCreated: (entityType: string, args: any) => void;
  export let onItemDeleted: (entityType: string, args: any) => void;
  export let onItemRenamed: (entityType: string, args: any) => void;
  export let onItemOpened: (entityType: string, args: any) => void;
  export let onBranchSwitched: (collection: CollectionDocument) => void;
  export let onRefetchCollection: (
    workspaceId: string,
    collection: CollectionDocument,
  ) => void;
  export let activeTabPath: Path;
  export let activeTabId: string;
  export let userRoleInWorkspace: WorkspaceRole;
  export let collection: CollectionDocument;
  export let searchData = "";
  /**
   * Role of user in active workspace
   */
  export let userRole;
  export let isWebApp = false;
  import { angleRightV2Icon as angleRight } from "@sparrow/library/assets";
  import { dot3Icon as threedotIcon } from "@sparrow/library/assets";
  import {
    ItemType,
    UntrackedItems,
  } from "@sparrow/common/enums/item-type.enum";
  import { Spinner } from "@sparrow/library/ui";
  import { onDestroy, onMount } from "svelte";
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Tooltip } from "@sparrow/library/ui";
  import { gitBranchIcon } from "@sparrow/library/assets";
  import { ReloadCollectionIcon } from "@sparrow/library/assets";
  import type { CollectionDocument, TabDocument } from "@app/database/database";
  import Folder from "../folder/Folder.svelte";
  import type { Path } from "@sparrow/common/interfaces/request.interface";
  import { addIcon as AddIcon } from "@sparrow/library/assets";
  import {
    FolderIcon,
    SyncIcon,
    FolderPlusIcon,
    RequestIcon,
    SocketIcon,
    SocketIoIcon,
    GraphIcon,
  } from "@sparrow/library/icons";
  import { Options } from "@sparrow/library/ui";
  import { isGuestUserActive } from "@app/store/auth.store";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";

  let deletedIds: [string] | [] = [];
  let requestCount = 0;
  let folderCount = 0;
  let visibility = false;
  let isActiveSyncEnabled = true;
  let isBranchSynced: boolean = false;
  let menuItems: [any];
  let isRenaming = false;
  let activeSyncLoad: boolean = false;
  let isSyncBtnHovered = false;
  let pos = { x: 0, y: 0 };
  let isCollectionPopup: boolean = false;
  let showMenu: boolean = false;
  let showAddItemMenu = false;
  let noOfColumns = 180;
  let noOfRows = 5;
  let inputField: HTMLInputElement;
  let collectionTabWrapper: HTMLElement;
  let isGuestUser: boolean;
  isGuestUserActive.subscribe((value) => {
    isGuestUser = value;
  });

  /**
   * Handle position of the context menu
   * @param e: Event
   */
  function rightClickContextMenu(e: Event) {
    setTimeout(() => {
      showMenu = !showMenu;
    }, 100);
  }

  function rightClickContextMenu2(e: Event) {
    setTimeout(() => {
      showAddItemMenu = !showAddItemMenu;
    }, 100);
  }

  function handleSelectClick(event: MouseEvent) {
    const selectElement = document.getElementById(
      `show-more-collection-${collection.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showMenu = false;
    }
  }
  function handleSelectClick2(event: MouseEvent) {
    const selectElement = document.getElementById(
      `add-item-collection-${collection.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showAddItemMenu = false;
    }
  }

  /**
   * Handle selected methods from filter
   */
  // const selectedMethodUnsubscibe = selectMethodsStore.subscribe((value) => {
  //   if (value && value.length > 0) {
  //     showFolderAPIButtons = false;
  //     visibility = true;
  //   } else if (value && value.length === 0) {
  //     visibility = false;
  //   } else {
  //     showFolderAPIButtons = true;
  //   }
  // });
  onDestroy(() => {
    // selectedMethodUnsubscibe();
  });

  $: {
    if (searchData) {
      visibility = true;
    }
    if (activeTabPath) {
      if (activeTabPath.collectionId === collection.id) {
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
    // isActiveSyncEnabled = await commonService.isFeatureEnabled(
    //   "isActiveSyncEnabled",
    // );
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
  let newCollectionName: string = "";

  const handleRenameInput = (event: { target: { value: string } }) => {
    newCollectionName = event.target.value.trim();
  };

  const onRenameBlur = async () => {
    if (newCollectionName) {
      await onItemRenamed("collection", {
        workspaceId: collection.workspaceId,
        collection,
        newName: newCollectionName,
      });
    }
    isRenaming = false;
    newCollectionName = "";
  };

  const onRenameInputKeyPress = (event: { key: string }) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldCollection",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
  on:click={handleSelectClick2}
  on:contextmenu|preventDefault={handleSelectClick2}
  on:load={() => {
    getFeatures();
  }}
/>

<Modal
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
          workspaceId: collection.workspaceId,
          collection,
          deletedIds,
        });
        isCollectionPopup = false;
      }}
    />
  </div></Modal
>

{#if showMenu}
  <Options
    xAxis={collectionTabWrapper.getBoundingClientRect().right - 30}
    yAxis={[
      collectionTabWrapper.getBoundingClientRect().top + 20,
      collectionTabWrapper.getBoundingClientRect().bottom + 5,
    ]}
    zIndex={700}
    menuItems={[
      {
        onClick: () =>
          onItemOpened("collection", {
            workspaceId: collection.workspaceId,
            collection,
          }),
        displayText: "Open Collection",
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          (isRenaming = true), setTimeout(() => inputField.focus(), 100);
        },
        displayText: "Rename Collection",
        disabled: false,
        hidden:
          !(collection?.activeSync && isBranchSynced) &&
          !(collection?.activeSync && !isBranchSynced)
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
    {noOfColumns}
  />
{/if}

{#if showAddItemMenu}
  <Options
    xAxis={collectionTabWrapper.getBoundingClientRect().right - 55}
    yAxis={[
      collectionTabWrapper.getBoundingClientRect().top - 0,
      collectionTabWrapper.getBoundingClientRect().bottom + 5,
    ]}
    zIndex={700}
    menuItems={[
      {
        onClick: () => {
          onItemCreated("folder", {
            workspaceId: collection.workspaceId,
            collection,
          });
        },
        displayText: "Add Folder",
        disabled: false,
        hidden: false,
        icon: FolderIcon,
      },
      {
        onClick: () => {
          onItemCreated("requestCollection", {
            workspaceId: collection.workspaceId,
            collection,
          });
        },
        displayText: "Add REST API",
        disabled: false,
        hidden: false,
        icon: SyncIcon,
      },
      {
        onClick: () => {
          onItemCreated("websocketCollection", {
            workspaceId: collection.workspaceId,
            collection,
          });
        },
        displayText: "Add WebSocket",
        disabled: false,
        hidden: false,
        icon: SocketIcon,
      },
      {
        onClick: () => {
          onItemCreated("socketioCollection", {
            workspaceId: collection.workspaceId,
            collection,
          });
        },
        displayText: `Add ${SocketIORequestDefaultAliasBaseEnum.NAME}`,
        disabled: false,
        hidden: false,
        icon: SocketIoIcon,
      },
      {
        onClick: () => {
          onItemCreated("graphqlCollection", {
            workspaceId: collection.workspaceId,
            collection,
          });
        },
        displayText: `Add ${GraphqlRequestDefaultAliasBaseEnum.NAME}`,
        disabled: false,
        hidden: isWebApp ? true : false,
        icon: GraphIcon,
      },
    ]}
    {noOfColumns}
  />
{/if}

<button
  bind:this={collectionTabWrapper}
  style="height:32px; border-color: {showMenu ? '#ff7878' : ''}"
  class="btn-primary ps-4 mb-1 d-flex w-100 align-items-center justify-content-between border-0 my-button {collection.id ===
  activeTabId
    ? 'active-collection-tab'
    : ''}"
>
  <button
    class="d-flex ps-2 main-collection align-items-center bg-transparent border-0"
    on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    on:click|preventDefault={() => {
      if (!isRenaming) {
        visibility = !visibility;
        if (!collection.id.includes(UntrackedItems.UNTRACKED)) {
          if (visibility) {
            onItemOpened("collection", {
              workspaceId: collection.workspaceId,
              collection,
            });
          }
        }
      }
    }}
  >
    <img
      src={angleRight}
      class=""
      style="height:8px; width:8px; margin-right:8px; {visibility
        ? 'transform:rotate(90deg);'
        : 'transform:rotate(0deg);'}"
      alt="angleRight"
      on:click|stopPropagation={() => {
        visibility = !visibility;
      }}
    />
    {#if isRenaming}
      <input
        class="py-0 renameInputFieldCollection w-100"
        id="renameInputFieldCollection"
        type="text"
        style="font-size: 12px;"
        value={collection.name}
        maxlength={100}
        bind:this={inputField}
        on:click|stopPropagation={() => {}}
        on:input={handleRenameInput}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    {:else}
      <div
        class="collection-collection-name justify-content-center d-flex align-items-center py-1 mb-0 flex-column"
        style="height: 32px; text-align: left;"
      >
        <p class="ellipsis w-100 mb-0 text-fs-12">
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
  {#if collection && collection.id && collection.id.includes(UntrackedItems.UNTRACKED) && !isGuestUser}
    <Spinner size={"15px"} />
  {:else}
    <!-- <Tooltip
      placement="bottom"
      title="More options"
      styleProp="bottom: -8px; {!collection?.activeSync ? 'left: -50%' : ''}"
    > -->
    {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
      <Tooltip
        title={"Add Options"}
        placement={"bottom"}
        distance={13}
        show={!showAddItemMenu}
        zIndex={701}
      >
        <button
          id={`add-item-collection-${collection.id}`}
          class="add-icon-container border-0 rounded d-flex justify-content-center align-items-center {showAddItemMenu
            ? 'add-item-active'
            : ''}"
          on:click={(e) => {
            rightClickContextMenu2(e);
          }}
        >
          <img height="12px" width="12px" src={AddIcon} alt="AddIcon" />
        </button>
      </Tooltip>

      <Tooltip
        title={"More"}
        placement={"bottom"}
        distance={17}
        zIndex={701}
        show={!showMenu}
      >
        <button
          id={`show-more-collection-${collection.id}`}
          class="threedot-icon-container border-0 p-0 ms-1 rounded d-flex justify-content-center align-items-center {showMenu
            ? 'threedot-active'
            : ''}"
          style="transform: rotate(90deg);"
          on:click={(e) => {
            rightClickContextMenu(e);
          }}
        >
          <img src={threedotIcon} alt="threedotIcon" />
        </button>
        <!-- </Tooltip> -->
      </Tooltip>
    {/if}

    {#if isActiveSyncEnabled && collection?.activeSync}
      <Tooltip placement="bottom" title="Sync" styleProp="left: 25%;">
        <button
          class="sync-button p-1 border-0 rounded"
          on:click={() => {
            onRefetchCollection(collection.workspaceId, collection);
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
      class="z-1"
      style=" padding-left: 0; padding-right:0; display: {visibility
        ? 'block'
        : 'none'};"
    >
      <div class="sub-folders ps-0">
        {#each collection.items as explorer}
          <Folder
            bind:userRole
            {onItemCreated}
            {onItemDeleted}
            {onItemRenamed}
            {onItemOpened}
            {collection}
            {userRoleInWorkspace}
            {activeTabPath}
            {explorer}
            {activeTabId}
            {searchData}
            {isWebApp}
          />
        {/each}
        {#if !collection?.items?.length}
          <p class="text-fs-10 ps-4 ms-2 my-2 text-secondary-300">
            This collection is empty
          </p>
        {/if}

        <div class="d-flex gap-2 ps-1 ms-4">
          {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
            <Tooltip title={"Add Folder"} placement={"bottom"} distance={12}>
              <div
                class="shortcutIcon d-flex justify-content-center align-items-center rounded-1"
                style="height: 24px; width: 24px; "
                role="button"
                on:click={() => {
                  onItemCreated("folder", {
                    workspaceId: collection.workspaceId,
                    collection,
                  });
                }}
              >
                <FolderPlusIcon
                  height="16px"
                  width="16px"
                  color="var(--request-arc)"
                />
              </div>
            </Tooltip>

            <Tooltip title={"Add REST API"} placement={"bottom"} distance={12}>
              <div
                class="shortcutIcon d-flex justify-content-center align-items-center rounded-1"
                style="height: 24px; width: 24px;"
                role="button"
                on:click={() => {
                  onItemCreated("requestCollection", {
                    workspaceId: collection.workspaceId,
                    collection,
                  });
                }}
              >
                <RequestIcon
                  height="16px"
                  width="16px"
                  color="var(--request-arc)"
                />
              </div>
            </Tooltip>

            <Tooltip
              title={`Add ${SocketIORequestDefaultAliasBaseEnum.NAME}`}
              placement={"bottom"}
              distance={12}
            >
              <div
                class="shortcutIcon d-flex justify-content-center align-items-center rounded-1"
                style="height: 24px; width: 24px;"
                role="button"
                on:click={() => {
                  onItemCreated("socketioCollection", {
                    workspaceId: collection.workspaceId,
                    collection,
                  });
                  MixpanelEvent(Events.Collection_SocketIO, {
                    description: "Created Socket.IO inside collection.",
                  });
                }}
              >
                <SocketIoIcon
                  height={"13px"}
                  width={"13px"}
                  color={"var(--request-arc)"}
                />
              </div>
            </Tooltip>
            <Tooltip title={"Add WebSocket"} placement={"bottom"} distance={12}>
              <div
                class="shortcutIcon d-flex justify-content-center align-items-center rounded-1"
                style="height: 24px; width: 24px;"
                role="button"
                on:click={() => {
                  onItemCreated("websocketCollection", {
                    workspaceId: collection.workspaceId,
                    collection,
                  });
                  MixpanelEvent(Events.Collection_WebSocket);
                }}
              >
                <SocketIcon
                  height="12px"
                  width="16px"
                  color="var(--request-arc)"
                />
              </div>
            </Tooltip>
            {#if !isWebApp}
              <Tooltip
                title={`Add ${GraphqlRequestDefaultAliasBaseEnum.NAME}`}
                placement={"bottom"}
                distance={12}
              >
                <div
                  class="shortcutIcon d-flex justify-content-center align-items-center rounded-1"
                  style="height: 24px; width: 24px;"
                  role="button"
                  on:click={() => {
                    onItemCreated("graphqlCollection", {
                      workspaceId: collection.workspaceId,
                      collection,
                    });
                    MixpanelEvent(Events.Collection_GraphQL, {
                      description: "Created GraphQL inside collection.",
                    });
                  }}
                >
                  <GraphIcon
                    height={"13px"}
                    width={"13px"}
                    color={"var(--request-arc)"}
                  />
                </div>
              </Tooltip>
            {/if}
          {/if}
        </div>
        <!-- {#if showFolderAPIButtons}
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
                    workspaceId: collection.workspaceId,
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
                    workspaceId: collection.workspaceId,
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
        {/if} -->
      </div>
    </div>
  {:else}
    <div
      style="padding-left: 0; padding-right:0; cursor:pointer; display: {visibility
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
  .my-button:hover .add-icon-container {
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
  .threedot-icon-container:active {
    background-color: var(--bg-secondary-420) !important;
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--bg-tertiary-600);
  }
  .add-icon-container {
    visibility: hidden;
    background-color: transparent;
    padding: 5px;
  }
  .add-icon-container:hover {
    background-color: var(--bg-tertiary-500) !important;
    border-radius: 4px;
    padding: 5px;
  }

  .add-icon-container:active {
    background-color: var(--bg-secondary-420) !important;
  }
  .add-item-active {
    visibility: visible;
    background-color: var(--bg-tertiary-600);
  }
  .refresh-collection-loader-active {
    visibility: visible;
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
  }

  .renameInputFieldCollection {
    border: none;
    background-color: transparent;
    color: var(--white-color);
    padding-left: 0;
    outline: none;
    border-radius: 2px !important;
  }
  .renameInputFieldCollection:focus {
    border: 1px solid var(--border-primary-300) !important;
  }
  .main-collection {
    width: calc(100% - 48px);
  }
  .active-collection-tab {
    background-color: var(--bg-tertiary-400) !important;
  }
  .collection-collection-name {
    width: calc(100% - 10px);
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

  .shortcutIcon:hover {
    background: var(--right-border);
  }
</style>
