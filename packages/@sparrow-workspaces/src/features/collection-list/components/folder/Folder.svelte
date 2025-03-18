<script lang="ts">
  // ---- SVG
  import {
    folderIcon as folderCloseIcon,
    openFolderIcon as folderOpenIcon,
    dot3Icon as threedotIcon,
    angleRightV2Icon as angleRight,
  } from "@sparrow/library/assets";
  import {
    ArrowSwapRegular,
    ChevronDownRegular,
    ChevronRightRegular,
    FolderOpenRegular,
    FolderRegular,
    MoreHorizontalRegular,
    RequestIcon,
  } from "@sparrow/library/icons";

  import { HttpRequestDefaultNameBaseEnum } from "@sparrow/common/types/workspace/http-request-base";

  // ---- Components
  import {
    Spinner,
    Modal,
    Button,
    Options,
    Tooltip,
  } from "@sparrow/library/ui";

  // ---- Enum, Constants and Interface
  import { UntrackedItems } from "@sparrow/common/enums/item-type.enum";

  import { WorkspaceRole } from "@sparrow/common/enums";
  import type { Path } from "@sparrow/common/interfaces/request.interface";

  import { WebSocket, Request, SocketIo, Graphql } from "..";
  import {
    CollectionItemTypeBaseEnum,
    type CollectionBaseInterface,
    type CollectionItemBaseInterface,
  } from "@sparrow/common/types/workspace/collection-base";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";

  import { opendComponent } from "../../../../stores/recent-left-panel";
  /**
   * Callback for Item created
   * @param entityType - type of item to create like request/folder
   * @param args - Arguments to pass on create
   */
  export let onItemCreated: (entityType: string, args: any) => void;
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
   * Role of user in workspace
   */
  export let userRoleInWorkspace: WorkspaceRole;
  /**
   * Current Tab Path
   */
  export let activeTabPath: Path;
  /**
   * Selected folder details
   */
  export let explorer: CollectionItemBaseInterface;
  export let folder: CollectionItemBaseInterface | null = null;
  export let activeTabId: string;
  export let searchData: string;
  export let activeTabType;
  /**
   * Role of user in active workspace
   */
  export let userRole;
  export let isWebApp = false;

  let expand: boolean = false;
  let deleteLoader: boolean = false;
  let showMenu: boolean = false;
  let isFolderPopup: boolean = false;
  let noOfColumns = 180;
  let isRenaming = false;
  let requestCount: number;
  let graghQlCount: number;
  let webSocketCount: number;
  let socketIoCount: number;
  let requestIds: string[] = [];
  let folderTabWrapper: HTMLElement;

  $: {
    if (searchData) {
      expand = true;
    }
    if (activeTabPath) {
      if (activeTabPath?.folderId === explorer.id) {
        expand = true;
      }
    }
    if (explorer) {
      requestIds = [];
      requestCount = 0;
      graghQlCount = 0;
      socketIoCount = 0;
      webSocketCount = 0;

      if (explorer.items) {
        explorer.items.forEach((item: any) => {
          if (item.type === CollectionItemTypeBaseEnum.REQUEST) {
            requestCount++;
            requestIds.push(item.id);
          } else if (item.type === CollectionItemTypeBaseEnum.GRAPHQL) {
            graghQlCount++;
            requestIds.push(item.id);
          } else if (item.type === CollectionItemTypeBaseEnum.WEBSOCKET) {
            webSocketCount++;
            requestIds.push(item.id);
          } else if (item.type === CollectionItemTypeBaseEnum.SOCKETIO) {
            socketIoCount++;
            requestIds.push(item.id);
          }
        });
      }
    }
  }

  // const selectedMethodUnsubscibe = selectMethodsStore.subscribe((value) => {
  //   if (value && value.length > 0) {
  //     expand = true;
  //     showFolderAPIButtons = false;
  //   } else {
  //     showFolderAPIButtons = true;
  //     expand = false;
  //   }
  // });

  function rightClickContextMenu() {
    setTimeout(() => {
      showMenu = !showMenu;
    }, 100);
  }

  function handleSelectClick(event: MouseEvent) {
    const selectElement = document.getElementById(
      `show-more-folder-${explorer.id}`,
    );
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showMenu = false;
    }
  }

  let newFolderName: string = "";
  const handleRenameInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    newFolderName = target.value.trim();
  };

  const onRenameBlur = async () => {
    if (newFolderName) {
      await onItemRenamed("folder", {
        workspaceId: collection.workspaceId,
        collection,
        folder: explorer,
        newName: newFolderName,
      });
    }
    isRenaming = false;
    newFolderName = "";
  };

  const onRenameInputKeyPress = (event: { key: string }) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldFolder",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };

  const addFolderItem = (collection) => {
    opendComponent.update((map) => {
      const newMap = new Map(map);
      newMap.set(collection.id, `folder`);
      return newMap;
    });
  };
  const removeFolderItem = (id) => {
    opendComponent.update((map) => {
      const newMap = new Map(map);
      newMap.delete(id); // Remove the entry by ID
      return newMap;
    });
  };
  $: {
    if ($opendComponent.has(explorer.id)) {
      expand = true;
    }
  }
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>
<div>
  <Modal
    title={"Delete Folder?"}
    type={"danger"}
    width={"35%"}
    zIndex={1000}
    isOpen={isFolderPopup}
    handleModalState={(flag = false) => (isFolderPopup = flag)}
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
        <p>{HttpRequestDefaultNameBaseEnum.NAME}</p>
      </div>
      {#if !isWebApp}
        <div class="d-flex gap-1">
          <span class="text-plusButton">{graghQlCount}</span>
          <p>GraphQL</p>
        </div>
      {/if}
      <div class="d-flex gap-1">
        <span class="text-plusButton">{webSocketCount}</span>
        <p>WebSocket</p>
      </div>
      <div class="d-flex gap-1">
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
          onItemDeleted("folder", {
            workspaceId: collection.workspaceId,
            collection,
            folder: explorer,
            requestIds,
          });
          deleteLoader = false;
          isFolderPopup = false;
        }}
      />
    </div></Modal
  >

  {#if showMenu && userRole !== WorkspaceRole.WORKSPACE_VIEWER}
    <Options
      xAxis={folderTabWrapper.getBoundingClientRect().right - 30}
      yAxis={[
        folderTabWrapper.getBoundingClientRect().top - 0,
        folderTabWrapper.getBoundingClientRect().bottom + 5,
      ]}
      zIndex={500}
      menuItems={[
        {
          onClick: () => {
            expand = true;
            if (expand) {
              onItemOpened("folder", {
                workspaceId: collection.workspaceId,
                collection,
                folder: explorer,
              });
            }
          },
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
            onItemCreated("requestFolder", {
              workspaceId: collection.workspaceId,
              collection,
              folder: explorer,
            });
          },
          displayText: `Add ${HttpRequestDefaultNameBaseEnum.NAME}`,
          disabled: false,
          hidden:
            !collection.activeSync ||
            (explorer?.source === "USER" && collection.activeSync)
              ? false
              : true,
        },
        {
          onClick: () => {
            onItemCreated("websocketFolder", {
              workspaceId: collection.workspaceId,
              collection,
              folder: explorer,
            });
          },
          displayText: "Add WebSocket",
          disabled: false,
          hidden:
            !collection.activeSync ||
            (explorer?.source === "USER" && collection.activeSync)
              ? false
              : true,
        },
        {
          onClick: () => {
            onItemCreated("socketioFolder", {
              workspaceId: collection.workspaceId,
              collection,
              folder: explorer,
            });
          },
          displayText: `Add ${SocketIORequestDefaultAliasBaseEnum.NAME}`,
          disabled: false,
          hidden:
            !collection.activeSync ||
            (explorer?.source === "USER" && collection.activeSync)
              ? false
              : true,
        },
        {
          onClick: () => {
            onItemCreated("graphqlFolder", {
              workspaceId: collection.workspaceId,
              collection,
              folder: explorer,
            });
          },
          displayText: `Add ${GraphqlRequestDefaultAliasBaseEnum.NAME}`,
          disabled: false,
          hidden:
            (!isWebApp && !collection.activeSync) ||
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
      {noOfColumns}
    />
  {/if}

  {#if explorer}
    {#if explorer.type === "FOLDER"}
      <div
        tabindex="0"
        bind:this={folderTabWrapper}
        on:click|preventDefault={() => {
          if (!isRenaming) {
            if (!explorer.id.includes(UntrackedItems.UNTRACKED)) {
              expand = !expand;
              if (expand) {
                addFolderItem(explorer);
                onItemOpened("folder", {
                  workspaceId: collection.workspaceId,
                  collection,
                  folder: explorer,
                });
              } else {
                removeFolderItem(explorer.id);
              }
            }
          }
        }}
        style="height:32px; padding-left:48px; margin-bottom:2px; "
        class=" d-flex align-items-center justify-content-between my-button btn-primary {explorer.id ===
        activeTabId
          ? 'active-folder-tab'
          : ''}"
      >
        <button
          tabindex="-1"
          style=" gap:4px; height:32px; "
          class="main-folder pe-1 d-flex align-items-center pe-0 border-0 bg-transparent"
          on:contextmenu|preventDefault={rightClickContextMenu}
        >
          <span
            on:click|stopPropagation={() => {
              expand = !expand;
            }}
            style="  display: flex; "
          >
            <Button
              startIcon={!expand ? ChevronRightRegular : ChevronDownRegular}
              size="extra-small"
              customWidth={"24px"}
              type="teritiary-regular"
            />
          </span>

          {#if expand}
            <div
              style="height:24px; width:30px;"
              class="d-flex align-items-center justify-content-center"
            >
              <FolderOpenRegular color="var(--icon-ds-neutral-300)" />
            </div>
          {:else}
            <div
              class="d-flex align-items-center justify-content-center"
              style="height:24px; width:30px;"
            >
              <FolderRegular color="var(--icon-ds-neutral-300)" />
            </div>
          {/if}
          {#if isRenaming}
            <input
              class="py-0 renameInputFieldFolder w-100"
              id="renameInputFieldFolder"
              type="text"
              style="font-size: 12px; padding-left:5px; font-weight:500; color : var(--text-ds-neutral-50); line-height:18px;"
              autofocus
              maxlength={100}
              value={explorer.name}
              on:click|stopPropagation={() => {}}
              on:input={handleRenameInput}
              on:blur={onRenameBlur}
              on:keydown={onRenameInputKeyPress}
            />
          {:else}
            <div
              class="folder-title d-flex align-items-center"
              style="cursor:pointer; font-size:12px;
                      height: 32px;
                      font-weight:500;
                      margin-left:0px;
                      font-size:12px;
                      color:var(--text-ds-neutral-50);
                      line-height:18px;
                      "
            >
              <p class="ellipsis mb-0" style="font-size: 12px;">
                {explorer.name}
              </p>
            </div>
          {/if}
        </button>

        {#if explorer.id.includes(UntrackedItems.UNTRACKED)}
          <Spinner size={"15px"} />
        {:else if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
          <Tooltip
            title={"Add REST API"}
            placement={"bottom-center"}
            zIndex={701}
            distance={13}
          >
            <span class="threedot-icon-container d-flex">
              <Button
                size="extra-small"
                customWidth={"24px"}
                type="teritiary-regular"
                startIcon={ArrowSwapRegular}
                onClick={(e) => {
                  e.stopPropagation();
                  expand = true;
                  onItemCreated("requestFolder", {
                    workspaceId: collection.workspaceId,
                    collection,
                    folder: explorer,
                  });
                }}
              />
            </span>
          </Tooltip>

          <Tooltip
            title={"More"}
            placement={"bottom-center"}
            zIndex={701}
            distance={17}
            show={!showMenu}
          >
            <span class="threedot-icon-container rounded d-flex">
              <Button
                id={`show-more-folder-${explorer.id}`}
                size="extra-small"
                customWidth={"24px"}
                type="teritiary-regular"
                startIcon={MoreHorizontalRegular}
                onClick={rightClickContextMenu}
              />
            </span>
          </Tooltip>
        {/if}
      </div>
      <div style="padding-left: 0; display: {expand ? 'block' : 'none'};">
        <div class="sub-files position-relative">
          {#if explorer?.items?.length > 0}
            <div class="box-line"></div>
          {/if}
          {#each explorer?.items || [] as exp}
            <svelte:self
              {userRole}
              {onItemCreated}
              {onItemDeleted}
              {onItemRenamed}
              {onItemOpened}
              {activeTabType}
              {collection}
              {userRoleInWorkspace}
              {activeTabPath}
              explorer={exp}
              folder={explorer}
              {activeTabId}
              {isWebApp}
            />
          {/each}
          {#if !explorer?.items?.length}
            <p
              class="text-fs-10 my-2 text-secondary-300"
              style="padding-left: 90px;"
            >
              This folder is empty
            </p>
          {/if}
          <!-- {#if   showFolderAPIButtons && explorer?.source === "USER"}
            <div class="mt-2 mb-2 ms-0">
              <Tooltip
                classProp="mt-2 mb-2 ms-0"
                title={PERMISSION_NOT_FOUND_TEXT}
                show={!hasWorkpaceLevelPermission(
                  userRoleInWorkspace,
                  workspaceLevelPermissions.SAVE_REQUEST,
                )}
              >
                <img
                  class="list-icons"
                  src={requestIcon}
                  alt="+ API Request"
                  on:click={() => {
                    onItemCreated("requestFolder", {
                      workspaceId: collection.workspaceId,
                      collection,
                      folder: explorer,
                    });
                    MixpanelEvent(Events.ADD_NEW_API_REQUEST, {
                      source: "Side Panel Collection List",
                    });
                  }}
                />
              </Tooltip>
            </div>
          {/if} -->
        </div>
      </div>
    {:else if explorer.type === CollectionItemTypeBaseEnum.REQUEST}
      <div style="cursor:pointer;">
        <Request
          {userRole}
          api={explorer}
          {onItemRenamed}
          {onItemDeleted}
          {onItemOpened}
          {activeTabPath}
          {searchData}
          {activeTabType}
          {folder}
          {collection}
          {activeTabId}
          {isWebApp}
        />
      </div>
    {:else if explorer.type === CollectionItemTypeBaseEnum.WEBSOCKET}
      <div style="cursor:pointer;">
        <WebSocket
          {userRole}
          api={explorer}
          {onItemRenamed}
          {onItemDeleted}
          {onItemOpened}
          {folder}
          {collection}
          {activeTabId}
        />
      </div>
    {:else if explorer.type === CollectionItemTypeBaseEnum.SOCKETIO}
      <div style="cursor:pointer;">
        <SocketIo
          {userRole}
          socketIo={explorer}
          {onItemRenamed}
          {onItemDeleted}
          {onItemOpened}
          {folder}
          {collection}
          {activeTabId}
        />
      </div>
    {:else if explorer.type === CollectionItemTypeBaseEnum.GRAPHQL && !isWebApp}
      <div style="cursor:pointer;">
        <Graphql
          {userRole}
          graphql={explorer}
          {onItemRenamed}
          {onItemDeleted}
          {onItemOpened}
          {folder}
          {collection}
          {activeTabId}
        />
      </div>
    {/if}
  {/if}
</div>

<style>
  .btn-primary {
    color: var(--bg-ds-neutral-50);
    padding-right: 5px;
    border-radius: 8px;
  }

  .btn-primary:hover {
    background-color: var(--bg-ds-surface-500) !important;
    color: var(--bg-ds-neutral-50);
  }
  .btn-primary:focus-visible {
    background-color: var(--bg-ds-surface-500);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
    border-radius: 4px;
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

  .my-button:hover .add-icon-container {
    visibility: visible;
  }

  .threedot-icon-container {
    visibility: hidden;
    background-color: transparent;
  }

  .add-icon-container {
    visibility: hidden;
    background-color: transparent;
    padding: 5px;
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--bg-tertiary-600);
    border-radius: 4px;
  }

  .add-icon-container:hover {
    background-color: var(--bg-tertiary-500) !important;
    border-radius: 4px;
    padding: 5px;
  }

  .btn-primary:hover {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
  }

  .btn-primary:hover .threedot-icon-container {
    visibility: visible;
  }
  .btn-primary:active {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-500);
    color: var(--text-ds-neutral-50);
  }
  .btn-primary:active .threedot-icon-container {
    visibility: visible;
  }
  .btn-primary:focus-visible {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
    outline: none;
    border: 2px solid var(--bg-ds-primary-300);
  }
  .btn-primary:focus-visible .threedot-icon-container {
    visibility: visible;
  }

  .renameInputFieldFolder {
    height: 24px;
    border: none;
    background-color: transparent;
    color: var(--text-ds-neutral-50);
    outline: none;
    border-radius: 4px !important;
    padding: 4px 2px;
    caret-color: var(--bg-ds-primary-300);
  }
  .renameInputFieldFolder:focus {
    border: 1px solid var(--border-ds-primary-300) !important;
  }
  .box-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 58.5px;
    width: 1px;
    background-color: var(--bg-ds-surface-100);
    z-index: 200;
  }

  .main-folder {
    width: calc(100% - 58px);
  }
  .active-folder-tab {
    background-color: var(--bg-tertiary-400) !important;
    width: 100%;
    height: 100%;
    border-radius: 2px;
  }
  .folder-title {
    width: calc(100% - 58px);
  }
  .folder-icon {
    width: 16px;
  }
  .shortcutIcon:hover {
    background: var(--right-border);
  }
</style>
