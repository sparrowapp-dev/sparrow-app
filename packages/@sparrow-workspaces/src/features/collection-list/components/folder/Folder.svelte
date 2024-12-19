<script lang="ts">
  import { onDestroy } from "svelte";

  // ---- SVG
  import { folderIcon as folderCloseIcon } from "@sparrow/library/assets";
  import { openFolderIcon as folderOpenIcon } from "@sparrow/library/assets";
  import { dot3Icon as threedotIcon } from "@sparrow/library/assets";
  import { RequestIcon } from "@sparrow/library/icons";
  import { angleRightV2Icon as angleRight } from "@sparrow/library/assets";

  // ---- Components
  import { Spinner } from "@sparrow/library/ui";
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import { Options } from "@sparrow/library/ui";
  import { Tooltip } from "@sparrow/library/ui";

  // ---- Enum, Constants and Interface
  import {
    ItemType,
    UntrackedItems,
  } from "@sparrow/common/enums/item-type.enum";

  import { WorkspaceRole } from "@sparrow/common/enums";
  import type { Path } from "@sparrow/common/interfaces/request.interface";

  // ---- Store
  // import { selectMethodsStore } from "@app/store/auth.store/methods";

  // ---- Helper Functions
  // import { hasWorkpaceLevelPermission } from "@sparrow/common/utils";
  // import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  import { WebSocket, Request, SocketIo, Graphql } from "..";
  import type {
    CollectionBaseInterface,
    CollectionItemBaseInterface,
  } from "@sparrow/common/types/workspace/collection-base";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";

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
  export let folder: CollectionItemBaseInterface;
  export let activeTabId: string;
  export let searchData: string;
  /**
   * Role of user in active workspace
   */
  export let userRole;
  export let isWebApp = false;

  let expand: boolean = false;
  let showFolderAPIButtons: boolean = true;
  let deleteLoader: boolean = false;
  let showMenu: boolean = false;
  let isFolderPopup: boolean = false;
  let noOfColumns = 180;
  let isRenaming = false;
  let requestCount: number;
  let requestIds: [string] | [] = [];
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
      requestCount = explorer?.items?.length;
      if (explorer?.items) {
        requestIds = explorer?.items?.map((element: { id: any }) => {
          return element.id;
        });
      }
      requestIds.push(explorer?.id);
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

  function rightClickContextMenu(e: Event) {
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
  const handleRenameInput = (event: { target: { value: string } }) => {
    newFolderName = event.target.value.trim();
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

  onDestroy(() => {
    // selectedMethodUnsubscibe();
  });
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

  {#if showMenu}
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
          displayText: "Add REST API",
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
        bind:this={folderTabWrapper}
        style="height:32px;"
        class="d-flex ps-3 align-items-center mb-1 justify-content-between my-button btn-primary {explorer.id ===
        activeTabId
          ? 'active-folder-tab'
          : ''}"
      >
        <button
          style="padding-left: 30px;"
          class="main-folder pe-1 d-flex align-items-center pe-0 border-0 bg-transparent"
          on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
          on:click|preventDefault={() => {
            if (!isRenaming) {
              if (!explorer.id.includes(UntrackedItems.UNTRACKED)) {
                expand = !expand;
                if (expand) {
                  onItemOpened("folder", {
                    workspaceId: collection.workspaceId,
                    collection,
                    folder: explorer,
                  });
                }
              }
            }
          }}
        >
          <img
            src={angleRight}
            class="me-3"
            style="height:8px; width:4px; margin-right:8px; {expand
              ? 'transform:rotate(90deg);'
              : 'transform:rotate(0deg);'}"
            alt="angleRight"
            on:click|stopPropagation={() => {
              expand = !expand;
            }}
          />
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
          {#if isRenaming}
            <input
              class="py-0 renameInputFieldFolder w-100"
              id="renameInputFieldFolder"
              type="text"
              style="font-size: 12px;"
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
                      height: 36px;
                      font-weight:400;
                      margin-left:0px"
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
            placement={"bottom"}
            zIndex={701}
            distance={13}
          >
            <button
              class="add-icon-container border-0 rounded d-flex justify-content-center align-items-center"
              on:click|preventDefault={() => {
                expand = true;
                onItemCreated("requestFolder", {
                  workspaceId: collection.workspaceId,
                  collection,
                  folder: explorer,
                });
              }}
            >
              <RequestIcon
                height="16px"
                width="16px"
                color="var(--white-color)"
              />
            </button>
          </Tooltip>

          <Tooltip
            title={"More"}
            placement={"bottom"}
            zIndex={701}
            distance={17}
            show={!showMenu}
          >
            <button
              id={`show-more-folder-${explorer.id}`}
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
      <div style="padding-left: 0; display: {expand ? 'block' : 'none'};">
        <div class="sub-files">
          {#each explorer.items as exp}
            <svelte:self
              bind:userRole
              {onItemCreated}
              {onItemDeleted}
              {onItemRenamed}
              {onItemOpened}
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
            <p class="text-fs-10 ps-5 my-2 text-secondary-300">
              This folder is empty
            </p>
          {/if}
          <!-- {#if showFolderAPIButtons && explorer?.source === "USER"}
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
    {:else if explorer.type === "REQUEST"}
      <div style="cursor:pointer;">
        <Request
          bind:userRole
          api={explorer}
          {onItemRenamed}
          {onItemDeleted}
          {onItemOpened}
          {folder}
          {collection}
          {activeTabId}
          {activeTabPath}
        />
      </div>
    {:else if explorer.type === ItemType.WEB_SOCKET}
      <div style="cursor:pointer;">
        <WebSocket
          bind:userRole
          api={explorer}
          {onItemRenamed}
          {onItemDeleted}
          {onItemOpened}
          {folder}
          {collection}
          {activeTabId}
          {activeTabPath}
        />
      </div>
    {:else if explorer.type === ItemType.SOCKET_IO}
      <div style="cursor:pointer;">
        <SocketIo
          bind:userRole
          socketIo={explorer}
          {onItemRenamed}
          {onItemDeleted}
          {onItemOpened}
          {folder}
          {collection}
          {activeTabId}
          {activeTabPath}
        />
      </div>
    {:else if explorer.type === ItemType.GRAPHQL && !isWebApp}
      <div style="cursor:pointer;">
        <Graphql
          bind:userRole
          graphql={explorer}
          {onItemRenamed}
          {onItemDeleted}
          {onItemOpened}
          {folder}
          {collection}
          {activeTabId}
          {activeTabPath}
        />
      </div>
    {/if}
  {/if}
</div>

<style>
  .btn-primary {
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

  .threedot-icon-container:hover {
    background-color: var(--bg-tertiary-500) !important;
    border-radius: 4px;
  }

  .add-icon-container:hover {
    background-color: var(--bg-tertiary-500) !important;
    border-radius: 4px;
    padding: 5px;
  }

  .btn-primary:hover {
    border-radius: 2px;
    background-color: var(--bg-tertiary-600);
    color: var(--white-color);
  }
  .renameInputFieldFolder {
    border: none;
    background-color: transparent;
    color: var(--white-color);
    padding-left: 0;
    outline: none;
    border-radius: 2px !important;
  }
  .renameInputFieldFolder:focus {
    border: 1px solid var(--border-primary-300) !important;
  }
  .sub-files {
  }

  .main-folder {
    width: calc(100% - 48px);
  }
  .active-folder-tab {
    background-color: var(--bg-tertiary-400) !important;
    width: 100%;
    height: 100%;
    border-radius: 2px;
  }
  .folder-title {
    width: calc(100% - 40px);
  }
  .folder-icon {
    width: 16px;
  }
  .shortcutIcon:hover {
    background: var(--right-border);
  }
</style>
