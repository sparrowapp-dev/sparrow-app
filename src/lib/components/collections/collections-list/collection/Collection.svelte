<script lang="ts">
  import angleRight from "$lib/assets/angleRight.svg";
  import threedotIcon from "$lib/assets/3dot.svg";
  import refreshIcon from "$lib/assets/refresh.svg";
  import Folder from "../folder/Folder.svelte";
  import { getNextName } from "../collectionList";
  import { CollectionListViewModel } from "../CollectionList.ViewModel";

  import { CollectionService } from "$lib/services/collection.service";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { v4 as uuidv4 } from "uuid";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { selectMethodsStore } from "$lib/store/methods";
  import { onDestroy, onMount } from "svelte";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { handleCollectionClick } from "$lib/utils/helpers/handle-clicks.helper";
  import { generateSampleFolder } from "$lib/utils/sample/folder.sample";
  import {
    isCollectionCreatedFirstTime,
    isFolderCreatedFirstTime,
  } from "$lib/store/collection";
  import { isApiCreatedFirstTime } from "$lib/store/request-response-section";
  import folderIcon from "$lib/assets/create_folder.svg";
  import requestIcon from "$lib/assets/create_request.svg";
  import ModalWrapperV1 from "$lib/components/Modal/Modal.svelte";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import Button from "$lib/components/buttons/Button.svelte";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "$lib/utils/constants/permissions.constant";
  import { ResponseStatusCode, type WorkspaceRole } from "$lib/utils/enums";
  import RightOption from "$lib/components/right-click-menu/RightClickMenuView.svelte";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import { CommonService } from "$lib/services-v2/common.service";
  import { ImportCollectionViewModel } from "../import-collection/ImportCollection.viewModel";
  import { invoke } from "@tauri-apps/api/core";
  import gitBranchIcon from "$lib/assets/git-branch.svg";
  import { CollectionMessage } from "$lib/utils/constants/request.constant";

  export let title: string;
  export let collection: any;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  export let loggedUserRoleInWorkspace: WorkspaceRole;

  let showFolderAPIButtons: boolean = true;
  export let collectionList;
  export let collectionsMethods: CollectionsMethods;
  export let activeTabId: string;
  export let activePath;
  const _viewImportCollection = new ImportCollectionViewModel();
  const collectionService = new CollectionService();
  const commonService = new CommonService();
  const _colllectionListViewModel = new CollectionListViewModel();
  let visibility = false;
  let isActiveSyncEnabled = true;
  const handleFolderClick = async (): Promise<void> => {
    if (
      !hasWorkpaceLevelPermission(
        loggedUserRoleInWorkspace,
        workspaceLevelPermissions.ADD_FOLDER,
      )
    ) {
      return;
    }
    isFolderCreatedFirstTime.set(true);
    let totalFolder: number = 0;
    let totalRequest: number = 0;
    const folder = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: getNextName(collection.items, ItemType.FOLDER, "New Folder"),
      description: "",
      type: ItemType.FOLDER,
      items: [],
    };

    collectionsMethods.addRequestOrFolderInCollection(collectionId, folder);

    let userSource = {};
    if (collection?.activeSync) {
      userSource = {
        currentBranch: collection?.currentBranch
          ? collection?.currentBranch
          : collection?.primaryBranch,
        source: "USER",
      };
    }
    const response = await _colllectionListViewModel.addFolder(
      currentWorkspaceId,
      collectionId,
      {
        ...userSource,
        name: folder.name,
        description: folder.description,
      },
    );

    if (response.isSuccessful && response.data.data) {
      let path: Path = {
        workspaceId: currentWorkspaceId,
        collectionId: collectionId,
        folderId: response.data.data.id,
        folderName: response.data.data.name,
      };

      const SampleFolder = generateSampleFolder(
        response.data.data.id,
        new Date().toString(),
      );

      SampleFolder.id = response.data.data.id;
      SampleFolder.path = path;
      SampleFolder.name = response.data.data.name;
      SampleFolder.save = true;
      collectionsMethods.handleCreateTab(SampleFolder);
      moveNavigation("right");

      const folderObj = response.data.data;
      collectionsMethods.updateRequestOrFolderInCollection(
        collectionId,
        folder.id,
        folderObj,
      );
      return;
    }
    return;
  };

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
    const request = generateSampleRequest(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toString(),
    );

    let userSource = {};
    if (collection?.activeSync) {
      userSource = {
        currentBranch: collection?.currentBranch
          ? collection?.currentBranch
          : collection?.primaryBranch,
        source: "USER",
      };
    }
    const requestObj = {
      collectionId: collectionId,
      workspaceId: currentWorkspaceId,
      ...userSource,
      items: {
        name: request.name,
        type: request.type,
        description: "",
        request: {
          method: request.property.request.method,
        },
      },
    };
    collectionsMethods.addRequestOrFolderInCollection(collectionId, {
      ...requestObj.items,
      id: request.id,
    });
    const response = await _colllectionListViewModel.addRequest(requestObj);
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;

      collectionsMethods.updateRequestOrFolderInCollection(
        collectionId,
        request.id,
        res,
      );

      request.id = res.id;
      request.path.workspaceId = currentWorkspaceId;
      request.path.collectionId = collectionId;
      request.property.request.save.api = true;
      request.property.request.save.description = true;

      collectionsMethods.handleCreateTab(request);
      moveNavigation("right");
      return;
    }
  };
  const selectedMethodUnsubscibe = selectMethodsStore.subscribe((value) => {
    if (value && value.length > 0) {
      showFolderAPIButtons = false;
      visibility = true;
    } else if (value && value.length === 0) {
      visibility = false;
    } else {
      showFolderAPIButtons = true;
    }
  });
  onDestroy(() => {
    selectedMethodUnsubscibe();
  });

  let openCollectionId: string;

  let pos = { x: 0, y: 0 };

  let showMenu: boolean = false;

  let noOfColumns = 180;
  let noOfRows = 5;
  function rightClickContextMenu(e) {
    e.preventDefault();
    setTimeout(() => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      pos = { x: mouseX, y: mouseY };
      showMenu = true;
    }, 100);
  }

  let isCollectionPopup: boolean = false;

  const handleCollectionPopUp = (flag) => {
    isCollectionPopup = flag;
  };

  function closeRightClickContextMenu() {
    showMenu = false;
  }

  //open collection
  function openCollections() {
    if (!collection.id.includes(UntrackedItems.UNTRACKED)) {
      handleCollectionClick(collection, currentWorkspaceId, collectionId);
    }
    if (!visibility) {
      visibility = !visibility;
    }
    showMenu = false;
  }

  let newCollectionName: string = "";
  let isRenaming = false;

  const handleRenameInput = (event) => {
    newCollectionName = event.target.value;
  };

  const onRenameBlur = async () => {
    if (newCollectionName) {
      const response = await collectionService.updateCollectionData(
        collectionId,
        currentWorkspaceId,
        { name: newCollectionName },
      );
      if (response.isSuccessful) {
        collectionsMethods.updateCollection(collectionId, response.data.data);
        collectionsMethods.updateTab(newCollectionName, "name", collectionId);
      }
    }
    isRenaming = false;
    newCollectionName = "";
  };

  //rename collection name
  const renameCollection = () => {
    isRenaming = true;
    showMenu = false;
  };

  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldCollection",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };

  //add request in collection
  const addRequest = async () => {
    handleAPIClick();
    if (collectionId === openCollectionId) {
      visibility = true;
    }
    showMenu = false;
  };

  //add folder in collection
  const addFolder = () => {
    visibility = true;
    handleFolderClick();
    if (collectionId === openCollectionId) {
      visibility = true;
    }
    showMenu = false;
  };

  let menuItems = [];
  let requestCount: number = 0;
  let folderCount: number = 0;
  let deletedIds: string[] = [];

  const handleBranchSwitch = async () => {
    const detectBranch = collection?.currentBranch
      ? collection?.currentBranch
      : collection?.primaryBranch;
    const collectionId = collection?.id;
    const response = await collectionService.switchCollectionBranch(
      collectionId,
      detectBranch,
    );
    setTimeout(() => {
      if (response.isSuccessful) {
        collectionsMethods.updateCollection(collectionId, {
          currentBranch: detectBranch,
          items: response.data.data.items,
        });
        isBranchSynced = true;
      } else {
        collectionsMethods.updateCollection(collectionId, {
          currentBranch: detectBranch,
          items: [],
        });
        isBranchSynced = false;
      }
      activeSyncLoad = true;
    }, 500);
  };
  $: {
    if (activePath) {
      if (activePath.collectionId === collection.id) {
        visibility = true;
      }
    }
    // if (collection?.activeSync) {
    //   handleBranchSwitch();
    // }
    if (collection) {
      deletedIds.length = [];
      requestCount = 0;
      folderCount = 0;
      collection?.items?.forEach((item) => {
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
      deletedIds.push(collectionId);

      if (collection?.activeSync) {
        menuItems = [
          {
            onClick: openCollections,
            displayText: "Open collection",
            disabled: false,
          },
          {
            onClick: addRequest,
            displayText: "Add Request",
            disabled: false,
          },
          {
            onClick: addFolder,
            displayText: "Add Folder",
            disabled: false,
          },
          {
            onClick: () => {
              handleCollectionPopUp(true);
            },
            displayText: "Delete",
            disabled: false,
          },
        ];
      } else {
        menuItems = [
          {
            onClick: openCollections,
            displayText: "Open collection",
            disabled: false,
          },
          {
            onClick: renameCollection,
            displayText: "Rename collection",
            disabled: false,
          },
          {
            onClick: addRequest,
            displayText: "Add Request",
            disabled: false,
          },
          {
            onClick: addFolder,
            displayText: "Add Folder",
            disabled: false,
          },

          {
            onClick: () => {
              handleCollectionPopUp(true);
            },
            displayText: "Delete",
            disabled: false,
          },
        ];
      }
    }
  }
  let activeSyncLoad = false;
  let isBranchSynced = false;
  // delete collection
  onMount(() => {
    if (collection?.activeSync) {
      handleBranchSwitch();
    }
  });

  let prevCurrentBranch = "";
  let prevBranches = "";
  $: {
    if (collection?.activeSync && collection?.currentBranch) {
      if (collection.currentBranch !== prevCurrentBranch) {
        handleBranchSwitch();
      }
      prevCurrentBranch = collection.currentBranch;
    }
    if (collection?.activeSync && collection?.branches) {
      if (JSON.stringify(collection.branches) !== prevBranches) {
        handleBranchSwitch();
      }
      prevBranches = JSON.stringify(collection.branches);
    }
  }

  let deleteLoader: boolean = false;
  const handleDelete = async () => {
    deleteLoader = true;
    const response = await collectionService.deleteCollection(
      currentWorkspaceId,
      collectionId,
    );

    if (response.isSuccessful) {
      collectionsMethods.deleteCollection(collectionId);
      collectionsMethods.deleteCollectioninWorkspace(
        currentWorkspaceId,
        collectionId,
      );
      handleCollectionPopUp(false);
      notifications.success(`"${collection.name}" Collection deleted.`);
      collectionsMethods.removeMultipleTabs(deletedIds);
      deleteLoader = false;
    } else {
      notifications.error("Failed to delete the Collection.");
      deleteLoader = false;
    }
  };
  const getFeatures = async () => {
    isActiveSyncEnabled = await commonService.isFeatureEnabled(
      "isActiveSyncEnabled",
    );
  };
  let refreshCollectionLoader = false;
  const refetchCollection = async () => {
    if (refreshCollectionLoader) return;
    const errMessage = `Failed to sync the collection. Local reposisitory branch is not set to ${collection?.currentBranch}.`;
    try {
      const activeResponse = await invoke("get_git_active_branch", {
        path: collection?.localRepositoryPath,
      });
      if (activeResponse) {
        let currentBranch = activeResponse;
        if (collection?.currentBranch) {
          if (currentBranch !== collection?.currentBranch) {
            notifications.error(errMessage);
            return;
          }
        } else {
          if (currentBranch !== collection?.primaryBranch) {
            notifications.error(errMessage);
            return;
          }
        }
      } else {
        notifications.error(errMessage);
        return;
      }
    } catch (e) {
      notifications.error(errMessage);
      return;
    }
    refreshCollectionLoader = true;
    const responseJSON = await collectionService.validateImportCollectionURL(
      collection.activeSyncUrl,
    );
    if (responseJSON?.data?.status === ResponseStatusCode.OK) {
      const response = await _viewImportCollection.importCollectionData(
        currentWorkspaceId,
        {
          url: collection.activeSyncUrl,
          urlData: {
            data: JSON.parse(responseJSON.data.response),
            headers: responseJSON.data.headers,
          },
          primaryBranch: collection?.primaryBranch,
          currentBranch: collection?.currentBranch
            ? collection?.currentBranch
            : collection?.primaryBranch,
        },
        collection.activeSync,
      );

      if (response.isSuccessful) {
        collectionsMethods.updateCollection(
          collection.id,
          response.data.data.collection,
        );
        notifications.success("Collection synced.");
      } else {
        notifications.error("Failed to sync the collection. Please try again.");
      }
    } else {
      notifications.error(
        `Unable to detect ${collection.activeSyncUrl.replace("-json", "")}.`,
      );
    }
    refreshCollectionLoader = false;
  };
</script>

<ModalWrapperV1
  title={"Delete Collection?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isCollectionPopup}
  handleModalState={handleCollectionPopUp}
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
        handleCollectionPopUp(false);
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

{#if showMenu}
  <RightOption
    xAxis={pos.x}
    yAxis={pos.y}
    {menuItems}
    {noOfRows}
    {noOfColumns}
  />
{/if}

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
  on:load={() => {
    getFeatures();
  }}
/>

<button
  style="height:36px; border-color: {showMenu ? '#ff7878' : ''}"
  class="btn-primary d-flex w-100 align-items-center justify-content-between border-0 ps-2 my-button {collection.id ===
  activeTabId
    ? 'active-collection-tab'
    : ''}"
>
  <div
    on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    class="d-flex main-collection align-items-center"
  >
    <img
      src={angleRight}
      class=""
      style="height:14px; width:14px; margin-right:8px; {visibility
        ? 'transform:rotate(90deg);'
        : 'transform:rotate(0deg);'}"
      alt="angleRight"
      on:click={() => {
        if (!collection?.id?.includes(UntrackedItems.UNTRACKED)) {
          visibility = !visibility;
        }
      }}
    />
    {#if isRenaming}
      <input
        class="form-control py-0 renameInputFieldCollection"
        id="renameInputFieldCollection"
        type="text"
        style="font-size: 12px;"
        value={title}
        autofocus
        maxlength={100}
        on:input={handleRenameInput}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    {:else}
      <div
        class="collection-title justify-content-center d-flex align-items-center py-1 mb-0 flex-column"
        style="height: 36px;"
        on:click={() => {
          isCollectionCreatedFirstTime.set(false);

          if (!collection.id.includes(UntrackedItems.UNTRACKED)) {
            handleCollectionClick(collection, currentWorkspaceId, collectionId);
          }
        }}
      >
        <p class="ellipsis w-100 mb-0" style="font-size: 0.75rem;">
          {title}
        </p>
        {#if isActiveSyncEnabled && collection.activeSync}
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
  </div>
  {#if collection && collection.id && collection.id.includes(UntrackedItems.UNTRACKED)}
    <Spinner size={"15px"} />
  {:else}
    {#if isActiveSyncEnabled && collection?.activeSync}
      <button
        class="threedot-icon-container p-1 border-0 rounded d-flex justify-content-center align-items-center {refreshCollectionLoader
          ? 'refresh-collection-loader-active'
          : ''} "
        on:click={() => {
          refetchCollection();
        }}
      >
        <img
          src={refreshIcon}
          alt="refetch"
          class={refreshCollectionLoader ? "refresh-collection-loader" : ""}
        />
      </button>
    {/if}
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
</button>
{#if !collection?.activeSync || activeSyncLoad}
  {#if !collection?.activeSync || isBranchSynced}
    <div
      style="padding-left: 15px; padding-right:0; cursor:pointer; display: {visibility
        ? 'block'
        : 'none'};"
    >
      <div class="sub-folders ps-3">
        {#each collection.items as exp}
          <Folder
            {loggedUserRoleInWorkspace}
            {collectionsMethods}
            {collectionList}
            {collectionId}
            {currentWorkspaceId}
            explorer={exp}
            {visibility}
            {activeTabId}
            {activePath}
            activeSync={collection?.activeSync}
            currentBranch={collection?.currentBranch}
            primaryBranch={collection?.primaryBranch}
          />
        {/each}
        {#if showFolderAPIButtons}
          <div class="mt-2 mb-2 d-flex">
            <Tooltip
              placement="bottom"
              title={!hasWorkpaceLevelPermission(
                loggedUserRoleInWorkspace,
                workspaceLevelPermissions.SAVE_REQUEST,
              )
                ? PERMISSION_NOT_FOUND_TEXT
                : CollectionMessage[0]}
              classProp="mt-2 mb-2"
            >
              <img
                class="list-icons mb-2 mt-2"
                src={folderIcon}
                alt="+ Folder"
                on:click={handleFolderClick}
              />
            </Tooltip>
            <Tooltip
              placement="bottom"
              title={!hasWorkpaceLevelPermission(
                loggedUserRoleInWorkspace,
                workspaceLevelPermissions.SAVE_REQUEST,
              )
                ? PERMISSION_NOT_FOUND_TEXT
                : CollectionMessage[1]}
              classProp="mt-2 mb-2"
            >
              <img
                class="list-icons mb-2 mt-2 ms-3"
                src={requestIcon}
                alt="+ API Request"
                on:click={handleAPIClick}
              />
            </Tooltip>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <span class="sparrow-fs-12 ms-4 text-muted">This branch is unavailable</span
    >
  {/if}
{/if}

<style>
  .my-button:hover .threedot-icon-container {
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

  .threedot-active {
    visibility: visible;
    background-color: var(--workspace-hover-color);
  }
  .refresh-collection-loader-active {
    visibility: visible;
  }
  .threedot-icon-container:hover {
    background-color: var(--workspace-hover-color);
  }

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

  .renameInputFieldCollection {
    border: none;
    background-color: transparent;
    color: var(--white-color);
    padding-left: 0;
  }
  .sub-folders {
    border-left: 1px solid var(--border-color);
  }
  .main-collection {
    width: calc(100% - 48px);
  }
  .active-collection-tab {
    background-color: var(--selected-active-sidebar) !important;
  }
  .collection-title {
    width: calc(100% - 30px);
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
</style>
