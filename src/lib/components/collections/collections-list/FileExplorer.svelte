<script lang="ts">
  import folder from "$lib/assets/folder.svg";
  import folderOpenIcon from "$lib/assets/folder-open.svg";
  import IconButton from "$lib/components/buttons/IconButton.svelte";
  import WorkspaceCard from "$lib/components/dashboard/workspace-card/WorkspaceCard.svelte";
  import {
    currentCollectionWorkspaceFolderId,
    isShowFolderPopup,
    useCollectionTree,
  } from "$lib/store/collection";
  import { insertCollectionRequest } from "$lib/services/collection";
  import File from "./File.svelte";
  import { getNextName } from "./collectionList";
  import { RequestDefault, RequestMethod } from "$lib/utils/enums/request.enum";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import { v4 as uuidv4 } from "uuid";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { CollectionListViewModel } from "./CollectionList.ViewModel";
  import type { CreateApiRequestPostBody } from "$lib/utils/dto";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import threedotIcon from "$lib/assets/3dot.svg";
  import { CollectionService } from "$lib/services/collection.service";
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
  const handleAPIClick = async () => {
    const request = generateSampleRequest(
      "UNTRACKED-" + uuidv4(),
      new Date().toString(),
    );
    collectionsMethods.handleCreateTab(request);
    moveNavigation("right");
    explorer = { ...explorer, items: [...explorer.items, request] };

    const requestObj: CreateApiRequestPostBody = {
      collectionId: collectionId,
      workspaceId: currentWorkspaceId,
      folderId: explorer.id,
      items: {
        name: explorer.name,
        type: ItemType.FOLDER,
        items: {
          name: request.name,
          type: ItemType.REQUEST,
          request: {
            method: RequestDefault.METHOD,
          },
        },
      },
    };
    _colllectionListViewModel.addRequestInFolderInCollection(requestObj);
  };

  let pos = { x: 0, y: 0 };
  let menu = { h: 0, y: 0 };
  let browser = { h: 0, y: 0 };
  let content;
  let showMenu = false;
  let button;

  let openMenuButton: HTMLElement = null;

  let openFolderId: string;

  function rightClickContextMenu(e, seletedFolderId, button) {
  
    if (openFolderId === seletedFolderId) {
      showMenu = !showMenu;
    } else {
      openFolderId = seletedFolderId;
      showMenu = true;
    }
    if (button) {
      openMenuButton = button;
      const rect = button.getBoundingClientRect();
      pos = { x: rect.right, y: rect.top };
    } else {
      browser = {
        y: window.innerWidth,
        h: window.innerHeight,
      };

      pos = {
        x: e.clientX,
        y: e.clientY,
      };

      if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
      if (browser.y - pos.x < menu.y) pos.x = pos.x - menu.y;
    }

    // Ensure the menu stays within the viewport
    pos.x = Math.min(pos.x, window.innerWidth - menu.y);
    pos.y = Math.min(pos.y, window.innerHeight - menu.h);
  }

  function onPageClick(e) {
    showMenu = false;
  }
  function getContextMenuDimension(node) {
    let height = node.offsetHeight;
    let width = node.offsetWidth;
    menu = {
      h: height,
      y: width,
    };
  }

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

    // title = updateCollectionName?.data?.data?.name;
    // collectionsMethods.updateCollectionName(openCollectionId, title);
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

  async function deleteFolder() {
   
    isShowFolderPopup.set(true);
    currentCollectionWorkspaceFolderId.set({
      collectionId: collectionId,
      workspaceId: currentWorkspaceId,
      folderId: openFolderId,
    });
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
      onClick: deleteFolder,
      displayText: "Delete",
    },
  ];
</script>

<svelte:window on:click={onPageClick} />

{#if showMenu}
  <nav
    use:getContextMenuDimension
    style="position: absolute; top:{pos.y}px; left:{pos.x}px"
  >
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
  <div>
    <div
      on:contextmenu|preventDefault={(e) =>
        rightClickContextMenu(e, explorer.id, button)}
      style="height:36px;width:280px;"
      class="d-flex align-items-center justify-content-between my-button btn-primary w-100 pe-3 ps-2"
      on:click={() => {
        if (!explorer.id.includes("MYUID45345")) {
          expand = !expand;
        }
      }}
    >
      <div class="d-flex align-items-center justify-content-center gap-2 pe-0">
        {#if expand}
          <div class="pe-0">
            <img src={folderOpenIcon} alt="" style="height:24px; width:24px;" />
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

      <button
        class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center"
        on:click={(e) => {
          e.stopPropagation();
          rightClickContextMenu(e, explorer.id, button);
        }}
      >
        <img src={threedotIcon} alt="threedotIcon" />
      </button>
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
      <div class="mt-2 mb-2">
        <IconButton text={"+ API Request"} onClick={handleAPIClick} />
      </div>
    </div>
  </div>
{:else}
  <div style="padding-left: 0; cursor:pointer;">
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
