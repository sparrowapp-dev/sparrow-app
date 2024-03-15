<script lang="ts">
  import RightOption from "$lib/components/right-click-menu/RightClickMenuView.svelte";
  import folder from "$lib/assets/folder.svg";
  import folderOpenIcon from "$lib/assets/open-folder.svg";

  import { isFolderCreatedFirstTime } from "$lib/store/collection";

  import Request from "../request/Request.svelte";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { v4 as uuidv4 } from "uuid";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { CollectionListViewModel } from "../CollectionList.ViewModel";
  import type { CreateApiRequestPostBody } from "$lib/utils/dto";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import threedotIcon from "$lib/assets/3dot.svg";
  import { CollectionService } from "$lib/services/collection.service";
  import { selectMethodsStore } from "$lib/store/methods";
  import { onDestroy } from "svelte";
  import { generateSampleFolder } from "$lib/utils/sample/folder.sample";
  import { isApiCreatedFirstTime } from "$lib/store/request-response-section";
  import { handleFolderClick } from "$lib/utils/helpers/handle-clicks.helper";
  import requestIcon from "$lib/assets/create_request.svg";
  import angleRight from "$lib/assets/angleRight.svg";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import ModalWrapperV1 from "$lib/components/Modal/Modal.svelte";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import Button from "$lib/components/buttons/Button.svelte";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import {
    workspaceLevelPermissions,
    PERMISSION_NOT_FOUND_TEXT,
  } from "$lib/utils/constants/permissions.constant";
  import { WorkspaceRole } from "$lib/utils/enums";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";

  let expand: boolean = false;
  export let explorer;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  export let folderId: string = "";
  export let folderName: string = "";
  export let collectionList;
  export let visibility;
  export let activeTabId: string;
  export let activePath;
  export let activeSync = false;
  export let currentBranch;
  export let primaryBranch;
  const collectionService = new CollectionService();

  const _colllectionListViewModel = new CollectionListViewModel();
  export let collectionsMethods: CollectionsMethods;
  export let loggedUserRoleInWorkspace: WorkspaceRole;

  let showFolderAPIButtons: boolean = true;
  const handleAPIClick = async () => {
    if (
      !hasWorkpaceLevelPermission(
        loggedUserRoleInWorkspace,
        workspaceLevelPermissions.SAVE_REQUEST,
      )
    ) {
      return;
    }
    isApiCreatedFirstTime.set(true);
    const sampleRequest = generateSampleRequest(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toString(),
    );

    let userSource = {};
    if (activeSync && explorer?.source === "USER") {
      userSource = {
        currentBranch: currentBranch ? currentBranch : primaryBranch,
        source: "USER",
      };
    }

    const requestObj: CreateApiRequestPostBody = {
      collectionId: collectionId,
      workspaceId: currentWorkspaceId,
      ...userSource,
      folderId: explorer.id,
      items: {
        name: explorer.name,
        type: ItemType.FOLDER,
        items: {
          name: sampleRequest.name,
          type: sampleRequest.type,
          description: "",
          request: {
            method: sampleRequest.property.request.method,
          },
        },
      },
    };

    collectionsMethods.addRequestInFolder(
      requestObj.collectionId,
      requestObj.folderId,

      {
        ...requestObj.items.items,
        id: sampleRequest.id,
      },
    );
    const response =
      await _colllectionListViewModel.addRequestInFolderInCollection(
        requestObj,
      );
    if (response.isSuccessful && response.data.data) {
      const request = response.data.data;

      collectionsMethods.updateRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        sampleRequest.id,
        request,
      );

      sampleRequest.id = request.id;
      sampleRequest.path.workspaceId = currentWorkspaceId;
      sampleRequest.path.collectionId = collectionId;
      sampleRequest.path.folderId = explorer.id;
      sampleRequest.path.folderName = explorer.name;
      sampleRequest.property.request.save.api = true;
      sampleRequest.property.request.save.description = true;

      collectionsMethods.handleCreateTab(sampleRequest);
      moveNavigation("right");
      return;
    }
  };

  const selectedMethodUnsubscibe = selectMethodsStore.subscribe((value) => {
    if (value && value.length > 0) {
      expand = true;
      showFolderAPIButtons = false;
    } else {
      showFolderAPIButtons = true;
      expand = false;
    }
  });

  onDestroy(() => {
    selectedMethodUnsubscibe();
  });

  let pos = { x: 0, y: 0 };

  let showMenu: boolean = false;
  let isFolderPopup: boolean = false;

  let noOfColumns = 180;
  let noOfRows = 4;
  function rightClickContextMenu(e) {
    e.preventDefault();
    setTimeout(() => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      pos = { x: mouseX, y: mouseY };
      showMenu = true;
    }, 100);
  }

  function closeRightClickContextMenu() {
    showMenu = false;
  }

  const handleFolderPopUp = (flag) => {
    isFolderPopup = flag;
  };

  let newFolderName: string = "";
  let isRenaming = false;

  const handleRenameInput = (event) => {
    newFolderName = event.target.value;
  };

  const onRenameBlur = async () => {
    if (newFolderName) {
      let userSource = {};
      if (activeSync && explorer?.source === "USER") {
        userSource = {
          currentBranch: currentBranch ? currentBranch : primaryBranch,
          source: "USER",
        };
      }
      const response = await collectionService.updateFolderInCollection(
        currentWorkspaceId,
        collectionId,
        explorer.id,
        {
          ...userSource,
          name: newFolderName,
        },
      );
      if (response.isSuccessful) {
        collectionsMethods.updateRequestOrFolderInCollection(
          collectionId,
          explorer.id,
          response.data.data,
        );
        collectionsMethods.updateTab(newFolderName, "name", explorer.id);
      }
    }
    isRenaming = false;
    newFolderName = "";
  };

  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldFolder",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };

  const renameFolder = () => {
    expand = false;
    isRenaming = true;
  };

  function openFolder() {
    if (!expand) expand = !expand;
  }

  function addRequest() {
    expand = true;
    handleAPIClick();
    MixpanelEvent(Events.ADD_NEW_API_REQUEST, {
      source: "Side Panel Dropdown",
    });
  }

  let menuItems = [];

  let workspaceId = currentWorkspaceId;

  let requestCount: number;
  let requestIds = [];
  $: {
    if (activePath) {
      if (activePath.folderId === explorer.id) {
        expand = true;
      }
    }
    if (explorer) {
      requestIds.length = 0;
      requestCount = 0;
      requestCount = explorer?.items?.length;
      if (explorer?.items) {
        requestIds = explorer?.items?.map((element) => {
          return element.id;
        });
      }
      requestIds.push(explorer?.id);

      if (explorer?.source === "USER") {
        menuItems = [
          {
            onClick: openFolder,
            displayText: "Open Folder",
            disabled: false,
          },
          {
            onClick: renameFolder,
            displayText: "Rename Folder",
            disabled: false,
          },
          {
            onClick: addRequest,
            displayText: "Add Request",
            disabled: false,
          },

          {
            onClick: () => {
              handleFolderPopUp(true);
            },
            displayText: "Delete",
            disabled: false,
          },
        ];
      } else {
        menuItems = [
          {
            onClick: openFolder,
            displayText: "Open Folder",
            disabled: false,
          },
        ];
      }
    }
  }

  // Delete folder functions
  let deleteLoader: boolean = false;

  const handleDelete = async () => {
    deleteLoader = true;
    let userSource = {};
    if (activeSync && explorer?.source === "USER") {
      userSource = {
        branchName: currentBranch ? currentBranch : primaryBranch,
      };
    }
    const response = await collectionService.deleteFolderInCollection(
      workspaceId,
      collectionId,
      explorer.id,
      {
        ...userSource,
      },
    );

    if (response.isSuccessful) {
      collectionsMethods.deleteRequestOrFolderInCollection(
        collectionId,
        explorer.id,
      );

      notifications.success(`"${explorer.name}" Folder deleted.`);
      deleteLoader = false;
      collectionsMethods.removeMultipleTabs(requestIds);
      handleFolderPopUp(false);
    } else {
      notifications.error("Failed to delete the Folder.");
      deleteLoader = false;
    }
  };
</script>

<ModalWrapperV1
  title={"Delete Folder?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isFolderPopup}
  handleModalState={handleFolderPopUp}
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
        handleFolderPopUp(false);
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
        handleDelete();
      }}
    />
  </div></ModalWrapperV1
>
<!-- {/if} -->

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
/>

{#if showMenu}
  <RightOption
    xAxis={pos.x}
    yAxis={pos.y}
    {menuItems}
    {noOfRows}
    {noOfColumns}
  />
{/if}

{#if explorer.type === "FOLDER"}
  <div
    style="height:36px;"
    class="d-flex align-items-center justify-content-between my-button btn-primary w-100 ps-2 {explorer.id ===
    activeTabId
      ? 'active-folder-tab'
      : ''}"
  >
    <div
      on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
      class="main-folder d-flex align-items-center pe-0"
    >
      <img
        src={angleRight}
        class=""
        style="height:14px; width:14px; margin-right:8px; {expand
          ? 'transform:rotate(90deg);'
          : 'transform:rotate(0deg);'}"
        alt="angleRight"
        on:click={() => {
          if (!explorer.id.includes(UntrackedItems.UNTRACKED)) {
            expand = !expand;
          }
        }}
      />
      {#if isRenaming}
        <input
          class="form-control py-0 renameInputFieldFolder"
          id="renameInputFieldFolder"
          type="text"
          style="font-size: 12px;"
          autofocus
          maxlength={100}
          value={explorer.name}
          on:input={handleRenameInput}
          on:blur={onRenameBlur}
          on:keydown={onRenameInputKeyPress}
        />
      {:else}
        <div
          on:click={() => {
            handleFolderClick(explorer, currentWorkspaceId, collectionId);
          }}
          class="folder-title d-flex align-items-center"
          style="cursor:pointer; font-size:12px;
          height: 36px;
           font-weight:400;"
        >
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
                src={folder}
                alt=""
                style="height:16px; width:16px;"
                class="folder-icon"
              />
            </div>
          {/if}
          <p class="ellipsis mb-0">
            {explorer.name}
          </p>
        </div>
      {/if}
    </div>

    {#if explorer.id.includes(UntrackedItems.UNTRACKED)}
      <Spinner size={"15px"} />
    {:else}
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
    {/if}
  </div>
  <div
    style="padding-left: 12px; cursor:pointer; display: {expand
      ? 'block'
      : 'none'};"
  >
    <div class="sub-files ps-3">
      {#each explorer.items as exp}
        <svelte:self
          folderId={explorer.id}
          folderName={explorer.name}
          explorer={exp}
          {collectionId}
          {currentWorkspaceId}
          {collectionsMethods}
          {activeTabId}
          {activeSync}
          {currentBranch}
          {primaryBranch}
        />
      {/each}
      {#if showFolderAPIButtons && explorer?.source === "USER"}
        <div class="mt-2 mb-2 ms-0">
          <Tooltip
            classProp="mt-2 mb-2 ms-0"
            title={PERMISSION_NOT_FOUND_TEXT}
            show={!hasWorkpaceLevelPermission(
              loggedUserRoleInWorkspace,
              workspaceLevelPermissions.SAVE_REQUEST,
            )}
          >
            <img
              class="list-icons"
              src={requestIcon}
              alt="+ API Request"
              on:click={() => {
                handleAPIClick();
                MixpanelEvent(Events.ADD_NEW_API_REQUEST, {
                  source: "Side Panel Collection List",
                });
              }}
            />
          </Tooltip>
        </div>
      {/if}
    </div>
  </div>
{:else if explorer.type === "REQUEST"}
  <div style="cursor:pointer;">
    <Request
      api={explorer}
      {folderId}
      {folderName}
      {collectionsMethods}
      {collectionId}
      {currentWorkspaceId}
      name={explorer.name}
      id={explorer.id}
      {activeTabId}
      {activeSync}
      {currentBranch}
      {primaryBranch}
    />
  </div>
{/if}

<style>
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

  .threedot-icon-container {
    visibility: hidden;
    background-color: transparent;
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--workspace-hover-color);
  }

  .threedot-icon-container:hover {
    background-color: var(--workspace-hover-color);
  }

  .btn-primary {
    background-color: var(--background-color);
    color: var(--white-color);
  }

  .btn-primary:hover {
    border-radius: 8px;
    background-color: var(--border-color);
    color: var(--white-color);
  }
  .renameInputFieldFolder {
    border: none;
    background-color: transparent;
    color: var(--white-color);
    padding-left: 0;
  }
  .sub-files {
    border-left: 1px solid var(--border-color);
  }

  .main-folder {
    width: calc(100% - 24px);
  }
  .active-folder-tab {
    background-color: var(--selected-active-sidebar) !important;
  }
  .folder-title {
    width: calc(100% - 30px);
  }
  .folder-icon {
    width: 16px;
  }
</style>
