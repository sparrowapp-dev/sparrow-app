<script lang="ts">
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { HttpRequestDefaultNameBaseEnum } from "@sparrow/common/types/workspace/http-request-base";

  export let onItemCreated: (entityType: string, args: any) => void;
  export let onItemDeleted: (entityType: string, args: any) => void;
  export let onItemRenamed: (entityType: string, args: any) => void;
  export let onItemOpened: (entityType: string, args: any) => void;
  export let onBranchSwitched: (collection: CollectionBaseInterface) => any;
  export let onRefetchCollection: (
    workspaceId: string,
    collection: CollectionBaseInterface,
  ) => void;
  export let activeTabPath: Path;
  export let activeTabId: string;
  export let userRoleInWorkspace: WorkspaceRole;
  export let collection: CollectionBaseInterface;
  export let searchData = "";
  export let activeTabType;
  /**
   * Role of user in active workspace
   */
  export let userRole;
  export let isWebApp = false;
  export let isFirstCollectionExpand = false;

  import {
    openedComponent,
    addCollectionItem,
    removeCollectionItem,
  } from "../../../../stores/recent-left-panel";

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
    DismissRegular,
    AddRegular,
    ChevronRightRegular,
    ChevronDownRegular,
    MoreHorizontalRegular,
    FolderAddRegular,
    ArrowSwapRegular,
  } from "@sparrow/library/icons";
  import { Options } from "@sparrow/library/ui";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";
  import type { CollectionBaseInterface } from "@sparrow/common/types/workspace/collection-base";
  import { CollectionNavigationTabEnum } from "@sparrow/common/types/workspace/collection-tab";

  let deletedIds: string[] = [];
  let requestCount = 0;
  let folderCount = 0;
  let graphQLCount = 0;
  let webSocketCount = 0;
  let socketIoCount = 0;
  let visibility = false;
  let isActiveSyncEnabled = true;
  let isBranchSynced: boolean = false;
  let isRenaming = false;
  let activeSyncLoad: boolean = false;
  let isSyncBtnHovered = false;
  let isCollectionPopup: boolean = false;
  let showMenu: boolean = false;
  let showAddItemMenu = false;
  let noOfColumns = 180;
  let inputField: HTMLInputElement;
  let collectionTabWrapper: HTMLElement;

  /**
   * Handle position of the context menu
   */
  const rightClickContextMenu = () => {
    setTimeout(() => {
      showMenu = !showMenu;
    }, 100);
  };

  const rightClickContextMenu2 = () => {
    setTimeout(() => {
      showAddItemMenu = !showAddItemMenu;
    }, 100);
  };

  const handleSelectClick = (event: MouseEvent) => {
    const selectElement = document.getElementById(
      `show-more-collection-${collection.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showMenu = false;
    }
  };

  const handleSelectClick2 = (event: MouseEvent) => {
    const selectElement = document.getElementById(
      `add-item-collection-${collection.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showAddItemMenu = false;
    }
  };

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
      graphQLCount = 0;
      webSocketCount = 0;
      socketIoCount = 0;
      collection?.items?.forEach((item: any) => {
        if (item.type === ItemType.FOLDER) {
          deletedIds.push(item.id);
          folderCount++;

          for (let i = 0; i < item.items.length; i++) {
            if (item.items[i].type === ItemType.REQUEST) {
              requestCount++;
              deletedIds.push(item.items[i].id);
            } else if (item.items[i].type === ItemType.GRAPHQL) {
              graphQLCount++;
              deletedIds.push(item.items[i].id);
            } else if (item.items[i].type === ItemType.WEB_SOCKET) {
              webSocketCount++;
              deletedIds.push(item.items[i].id);
            } else if (item.items[i].type === ItemType.SOCKET_IO) {
              socketIoCount++;
              deletedIds.push(item.items[i].id);
            }
          }
        } else if (item.type === ItemType.REQUEST) {
          requestCount++;
          deletedIds.push(item.id);
        } else if (item.type === ItemType.GRAPHQL) {
          graphQLCount++;
          deletedIds.push(item.id);
        } else if (item.type === ItemType.SOCKET_IO) {
          socketIoCount++;
          deletedIds.push(item.id);
        } else if (item.type === ItemType.WEB_SOCKET) {
          webSocketCount++;
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

  $: {
    if ($openedComponent.has(collection.id) || isFirstCollectionExpand) {
      visibility = true;
    }
  }

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
  let refreshCollectionLoader = false;
  let newCollectionName: string = "";

  const handleRenameInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    newCollectionName = target.value.trim();
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

  let verticalCollectionLine = false;
  $: {
    if (collection.items.find((item) => item.id === activeTabId)) {
      verticalCollectionLine = true;
    } else {
      verticalCollectionLine = false;
    }
  }
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
  on:click={handleSelectClick2}
  on:contextmenu|preventDefault={handleSelectClick2}
/>

<Modal
  title={"Delete Collection?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isCollectionPopup}
  handleModalState={() => (isCollectionPopup = false)}
>
  <div class="text-lightGray mb-1">
    <p
      class="text-ds-font-size-12 text-ds-line-height-120 text-ds-font-weight-medium"
    >
      Are you sure you want to delete this Collection? Everything in <span
        class="text-whiteColor fw-bold">"{collection.name}"</span
      >
      will be removed.
    </p>
  </div>
  <div class="d-flex gap-3">
    <div class="d-flex gap-1 text-ds-font-size-12">
      <span class="text-plusButton">{folderCount}</span>
      <p>Folder</p>
    </div>
    <div class="d-flex gap-1 text-ds-font-size-12">
      <span class="text-plusButton">{requestCount}</span>
      <p>{HttpRequestDefaultNameBaseEnum.NAME}</p>
    </div>
    <div class="d-flex gap-1 text-ds-font-size-12">
      <span class="text-plusButton">{graphQLCount}</span>
      <p>GraphQL</p>
    </div>
    <div class="d-flex gap-1 text-ds-font-size-12">
      <span class="text-plusButton">{webSocketCount}</span>
      <p>WebSocket</p>
    </div>
    <div class="d-flex gap-1 text-ds-font-size-12">
      <span class="text-plusButton">{socketIoCount}</span>
      <p>Socket.IO</p>
    </div>
  </div>
  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
  >
    <Button
      disable={deleteLoader}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"secondary"}
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

{#if showMenu && userRole !== WorkspaceRole.WORKSPACE_VIEWER}
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
        onClick: () =>
          onItemOpened("collection", {
            workspaceId: collection.workspaceId,
            collection,
            navigation: CollectionNavigationTabEnum.AUTH,
          }),
        displayText: "Set Auth",
        disabled: false,
        hidden: false,
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
        displayText: `Add ${HttpRequestDefaultNameBaseEnum.NAME}`,
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
        hidden: false,
        icon: GraphIcon,
      },
    ]}
    {noOfColumns}
  />
{/if}

<div
  tabindex="0"
  bind:this={collectionTabWrapper}
  style="height:32px; gap:4px;  padding-left:16px; margin-bottom:{collection.id ===
  activeTabId
    ? '0px'
    : '0px'};"
  class="btn-primary d-flex w-100 align-items-center justify-content-between border-0 my-button {collection.id ===
  activeTabId
    ? 'active-collection-tab'
    : ''}"
>
  <button
    tabindex="-1"
    class="d-flex main-collection align-items-center bg-transparent border-0 gap:2px;"
    style="gap:4px;"
    on:contextmenu|preventDefault={rightClickContextMenu}
    on:click|preventDefault={() => {
      if (!isRenaming) {
        visibility = !visibility;
        if (!collection.id.includes(UntrackedItems.UNTRACKED)) {
          if (visibility) {
            addCollectionItem(collection.id, "collection");
            onItemOpened("collection", {
              workspaceId: collection.workspaceId,
              collection,
            });
          } else {
            removeCollectionItem(collection.id);
          }
        }
      }
    }}
  >
    <Button
      size="extra-small"
      customWidth={"24px"}
      type="teritiary-regular"
      startIcon={!visibility ? ChevronRightRegular : ChevronDownRegular}
      onClick={(e) => {
        // visibility = !visibility;
      }}
    />
    {#if isRenaming}
      <input
        class="py-0 renameInputFieldCollection w-100 ellipsis text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
        id="renameInputFieldCollection"
        type="text"
        style=" gap: 4px; "
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
        class="collection-collection-name justify-content-center d-flex py-1 mb-0 flex-column"
        style="height: 32px; text-align: left; width:80% ; padding:2px 4px;"
      >
        <p
          class="ellipsis mb-0 text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
        >
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
    <!-- <Tooltip
      placement="bottom-center"
      title="More options"
      styleProp="bottom: -8px; {!collection?.activeSync ? 'left: -50%' : ''}"
      > -->
    {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
      <Tooltip
        title={"Add Options"}
        placement={"bottom-center"}
        distance={13}
        show={!showAddItemMenu}
        zIndex={701}
      >
        <span class="add-icon-container">
          <Button
            id={`add-item-collection-${collection.id}`}
            size="extra-small"
            customWidth={"24px"}
            type="teritiary-regular"
            onClick={(e) => {
              rightClickContextMenu2(e);
            }}
            startIcon={AddRegular}
          />
        </span>
      </Tooltip>

      <Tooltip
        title={"More"}
        placement={"bottom-center"}
        distance={17}
        zIndex={701}
        show={!showMenu}
      >
        <span class="add-icon-container">
          <Button
            id={`show-more-collection-${collection.id}`}
            size="extra-small"
            customWidth={"24px"}
            type="teritiary-regular"
            startIcon={MoreHorizontalRegular}
            onClick={(e) => {
              rightClickContextMenu();
            }}
          />
        </span>
      </Tooltip>
    {/if}

    {#if isActiveSyncEnabled && collection?.activeSync}
      <Tooltip placement="bottom-center" title="Sync" styleProp="left: 25%;">
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
</div>
<!-- {console.log(collection.name, !collection?.activeSync, activeSyncLoad)} -->
{#if !collection?.activeSync || activeSyncLoad}
  {#if !collection?.activeSync || isBranchSynced}
    <div
      class="z-1"
      style=" padding-left: 0; padding-right:0;  display: {visibility
        ? 'block'
        : 'none'};"
    >
      <div
        class=" ps-0 position-relative"
        style={`background-color: ${collection.id === activeTabId ? "var(--bg-ds-surface-600)" : "transparent"}; margin-bottom: ${collection.id === activeTabId ? "0px" : "0px"};`}
      >
        {#if collection?.items?.length > 0}
          <div
            class="box-line"
            style="background-color: {verticalCollectionLine
              ? 'var(--bg-ds-neutral-500)'
              : 'var(--bg-ds-surface-100)'}"
          ></div>
        {/if}
        <div class="">
          {#each collection.items as explorer}
            <Folder
              {userRole}
              {onItemCreated}
              {onItemDeleted}
              {onItemRenamed}
              {onItemOpened}
              {collection}
              {userRoleInWorkspace}
              {activeTabPath}
              {explorer}
              {activeTabType}
              {activeTabId}
              {searchData}
              {isWebApp}
            />
          {/each}
        </div>
        {#if !collection?.items?.length}
          <p
            class="text-ds-font-size-10 ps-5 ms-2 my-{collection.id ===
            activeTabId
              ? '0'
              : '0'} text-secondary-300"
          >
            This collection is empty
          </p>
        {/if}

        <div class="d-flex gap-2 ms-2" style="padding-left: 26px;">
          {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
            <Tooltip
              title={"Add Folder"}
              placement={"bottom-center"}
              distance={12}
            >
              <div
                class="shortcutIcon d-flex justify-content-center align-items-center rounded-1"
                style="height: 24px; width: 24px; "
                role="button"
                tabindex="0"
                on:keydown={() => {}}
                on:click={() => {
                  onItemCreated("folder", {
                    workspaceId: collection.workspaceId,
                    collection,
                  });
                }}
              >
                <FolderAddRegular
                  size="16px"
                  color="var(--bg-ds-neutral-300)"
                />
              </div>
            </Tooltip>

            <Tooltip
              title={"Add REST API"}
              placement={"bottom-center"}
              distance={12}
            >
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
                <ArrowSwapRegular
                  size="16px"
                  color="var(--bg-ds-neutral-300)"
                />
              </div>
            </Tooltip>

            <Tooltip
              title={`Add ${SocketIORequestDefaultAliasBaseEnum.NAME}`}
              placement={"bottom-center"}
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
            <Tooltip
              title={"Add WebSocket"}
              placement={"bottom-center"}
              distance={12}
            >
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

            <Tooltip
              title={`Add ${GraphqlRequestDefaultAliasBaseEnum.NAME}`}
              placement={"bottom-center"}
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
        </div>
        <!-- {#if showFolderAPIButtons}
          <div class="mt-2 mb-2 d-flex">
            <Tooltip
              placement="bottom-center"
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
              placement="bottom-center"
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
  .box-line {
    visibility: none;
  }

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
    display: flex;
  }
  .add-icon-container:hover {
  }

  .add-icon-container:active {
    /* background-color: var(--bg-secondary-420) !important; */
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
    color: var(--text-ds-neutral-50);
    padding-right: 5px;
    border-radius: 2px;
  }

  .btn-primary:hover {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
    border-radius: 4px;
  }
  .btn-primary:hover .add-icon-container {
    visibility: visible;
  }
  .btn-primary:hover .box-line {
    visibility: visible;
  }

  .box-line {
    position: absolute;
    top: 0;
    bottom: 0%;
    left: 27.5px;
    width: 1px;

    z-index: 1;
  }

  .btn-primary:focus-visible {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
    outline: none;
    border-radius: 4px;
    border: 2px solid var(--bg-ds-primary-300) !important;
  }
  .btn-primary:active {
    background-color: var(--bg-ds-surface-500);
    color: var(--text-ds-neutral-50);
    outline: none;
    border-radius: 4px;
  }
  .btn-primary:focus-visible .add-icon-container {
    visibility: visible;
  }

  .renameInputFieldCollection {
    border: none;
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    height: 24px;
    outline: none;
    border-radius: 4px !important;
    padding: 4px 2px;
    caret-color: var(--bg-ds-primary-300);
  }
  .renameInputFieldCollection:focus {
    border: 1px solid var(--border-ds-primary-300) !important;
  }
  .main-collection {
    width: calc(100% - 58px);
  }
  .active-collection-tab {
    background-color: var(--bg-ds-surface-500) !important;
    border-radius: 4px;
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
  .sub-folders {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 40px;
    width: 1px;
    background-color: var(--bg-ds-surface-100);
  }
</style>
