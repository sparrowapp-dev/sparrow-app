<script lang="ts">
  import folder from "$lib/assets/folder.svg";
  import folderOpenIcon from "$lib/assets/open-folder.svg";
  import IconButton from "$lib/components/buttons/IconButton.svelte";
  import WorkspaceCard from "$lib/components/dashboard/workspace-card/WorkspaceCard.svelte";
  import {
    currentCollectionWorkspaceFolderId,
    isShowFolderPopup,
    useCollectionTree,
  } from "$lib/store/collection";
  import { insertCollectionRequest } from "$lib/services/collection";
  import File from "./File.svelte";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { v4 as uuidv4 } from "uuid";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { CollectionListViewModel } from "./CollectionList.ViewModel";
  import type { CreateApiRequestPostBody } from "$lib/utils/dto";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import threedotIcon from "$lib/assets/3dot.svg";
  import { CollectionService } from "$lib/services/collection.service";
  import FolderPopup from "$lib/components/Modal/FolderPopup.svelte";
  import { selectMethodsStore } from "$lib/store/methods";
  import { onDestroy } from "svelte";

  const { insertNode, updateNodeId } = useCollectionTree();
  let expand: boolean = false;
  export let explorer;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  export let folderId: string = "";
  export let folderName: string = "";
  export let collectionList;
  export let visibility;

  const collectionService = new CollectionService();

  const _colllectionListViewModel = new CollectionListViewModel();
  export let collectionsMethods: CollectionsMethods;

  let showFolderAPIButtons: boolean = true;

  const handleAPIClick = async () => {
    const sampleRequest = generateSampleRequest(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toString(),
    );

    const requestObj: CreateApiRequestPostBody = {
      collectionId: collectionId,
      workspaceId: currentWorkspaceId,
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

  let openFolderId: string = "";

  // Assuming you have a container reference (e.g., containerRef) in your component
  let containerRef;

  function rightClickContextMenu(e) {
    e.preventDefault();
    setTimeout(() => {
      const containerRect = containerRef?.getBoundingClientRect();
      const mouseX = e.clientX - (containerRect?.left || 0);
      const mouseY = e.clientY - (containerRect?.top || 0);
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
    expand = false;
    newFolderName = event.target.value;
  };

  const onRenameBlur = async () => {
    const folder = {
      name: newFolderName,
      description: "",
    };

    if (newFolderName) {
      const updateFolderName = await collectionService.updateFolderInCollection(
        currentWorkspaceId,
        collectionId,
        openFolderId,
        {
          name: folder.name,
          description: folder.description,
        },
      );

      explorer.name = updateFolderName?.data?.data?.name;
      collectionsMethods.updateFolderName(
        collectionId,
        openFolderId,
        explorer.name,
      );
    }

    expand = false;
    isRenaming = false;
  };

  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      onRenameBlur();
    }
  };

  const renameFolder = () => {
    expand = false;
    isRenaming = true;
    const inputField = document.getElementById(
      "renameInputField",
    ) as HTMLInputElement;
  };

  function openFolder() {
    expand = !expand;
  }

  function addRequest() {
    handleAPIClick();
    expand = true;
  }

  let menuItems = [
    {
      onClick: openFolder,
      displayText: "Open Folder",
    },
    {
      onClick: renameFolder,
      displayText: "Rename Folder",
    },
    {
      onClick: addRequest,
      displayText: "Add Request",
    },

    {
      onClick: () => {
        handleFolderPopUp(true);
      },
      displayText: "Delete",
    },
  ];

  let workspaceId = currentWorkspaceId;
</script>

{#if isFolderPopup}
  <FolderPopup
    {collectionsMethods}
    {collectionId}
    folderId = {explorer.id}
    {workspaceId}
    folder = {explorer}
    closePopup={handleFolderPopUp}
  />
{/if}

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
/>

{#if showMenu}
  <nav style="position: fixed; top:{pos.y}px; left:{pos.x}px; z-index:4;">
    <div
      class="navbar pb-0 d-flex flex-column rounded align-items-start justify-content-start text-whiteColor bg-blackColor"
      id="navbar"
    >
      <ul class="ps-2 pt-2 pe-2 pb-0 w-100">
        {#each menuItems as item}
          <li class="align-items-center">
            <button
              class="align-items-center mb-1 px-3 py-2"
              on:click={item.onClick}
              style={item.displayText === "Delete" ? "color: #ff7878" : ""}
              >{item.displayText}</button
            >
          </li>
        {/each}
      </ul>
    </div>
  </nav>
{/if}

{#if explorer.type === "FOLDER"}
  <div
    style="height:36px;"
    class="d-flex align-items-center justify-content-between my-button btn-primary w-100 ps-2"
  >
    <div
      on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
      on:click={() => {
        if (!explorer.id.includes(UntrackedItems.UNTRACKED)) {
          expand = !expand;
        }
      }}
      class="w-100 d-flex align-items-center gap-2 pe-0"
    >
      {#if expand}
        <div
          style="height:16px; width:16px;"
          class="d-flex align-items-center justify-content-center gap-0"
        >
          <img src={folderOpenIcon} alt="" class="pe-0" />
        </div>
      {:else}
        <img src={folder} alt="" style="height:16px; width:16px;" />
      {/if}

      {#if isRenaming}
        <input
          class="form-control py-0"
          id="renameInputField"
          type="text"
          style="font-size: 14px;"
          value={explorer.name}
          on:input={handleRenameInput}
          on:blur={onRenameBlur}
          on:keydown={onRenameInputKeyPress}
        />
      {:else}
        <span
          style="padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;"
          >{explorer.name}</span
        >
      {/if}
    </div>

    {#if explorer.id.includes(UntrackedItems.UNTRACKED)}
      <Spinner size={"15px"} />
    {:else}
      <button
        class="threedot-icon-container border-0 rounded ps-3 d-flex justify-content-center align-items-center"
        on:click={(e) => {
          rightClickContextMenu(e);
        }}
      >
        <img src={threedotIcon} alt="threedotIcon" />
      </button>
    {/if}
  </div>
  <div
    style="padding-left: 15px; cursor:pointer; display: {expand
      ? 'block'
      : 'none'};"
  >
    {#each explorer.items as exp}
      <svelte:self
        folderId={explorer.id}
        folderName={explorer.name}
        explorer={exp}
        {collectionId}
        {currentWorkspaceId}
        {collectionsMethods}
      />
    {/each}
    {#if showFolderAPIButtons}
      <div class="mt-2 mb-2 ms-2">
        <IconButton text={"+ API Request"} onClick={handleAPIClick} />
      </div>
    {/if}
  </div>
{:else}
  <div style="padding-left: 6px; cursor:pointer;">
    <File
      api={explorer}
      {folderId}
      {folderName}
      {collectionsMethods}
      {collectionId}
      {currentWorkspaceId}
      name={explorer.name}
      id={explorer.id}
    />
  </div>
{/if}

<style>
  .btn-primary {
    background-color: var(--background-color);
    color: var(--white-color);
  }

  .btn-primary:hover {
    border-radius: 8px;
    background-color: var(--border-color);
    color: var(--white-color);
    padding: 5px;
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
    background-color: var(--border-color);
  }

  .threedot-icon-container:hover {
    background-color: var(--border-color);
  }

  .threedot-icon-container:active {
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
</style>
