<script lang="ts">
  import angleRight from "$lib/assets/angleRight.svg";
  import threedotIcon from "$lib/assets/3dot.svg";
  import IconButton from "$lib/components/buttons/IconButton.svelte";
  import FileExplorer from "./FileExplorer.svelte";
  import { getNextName } from "./collectionList";
  import { CollectionListViewModel } from "./CollectionList.ViewModel";
  import { CollectionService } from "$lib/services/collection.service";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { v4 as uuidv4 } from "uuid";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { selectMethodsStore } from "$lib/store/methods";
  import { onDestroy } from "svelte";
  import CollectionPopup from "$lib/components/Modal/CollectionPopup.svelte";

  export let title: string;
  export let collection: any;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  export let collectionList;
  export let collectionsMethods: CollectionsMethods;
  
  let showFolderAPIButtons: boolean = true;
  const collectionService = new CollectionService();
  const _colllectionListViewModel = new CollectionListViewModel();
  let visibility = false;

  const handleFolderClick = async (): Promise<void> => {
    const folder = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: getNextName(collection.items, ItemType.FOLDER, "New Folder"),
      description: "",
      type: ItemType.FOLDER,
      items: [],
    };

    collectionsMethods.addRequestOrFolderInCollection(collectionId, folder);

    const response = await _colllectionListViewModel.addFolder(
      currentWorkspaceId,
      collectionId,
      {
        name: folder.name,
        description: folder.description,
      },
    );

    if (response.isSuccessful && response.data.data) {
      const folderObj = response.data.data;
      collectionsMethods.updateRequestOrFolderInCollection(
        collectionId,
        folder.id,
        folderObj,
      );
      return;
    }
  };

  const handleAPIClick = async () => {
    const request = generateSampleRequest(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toString(),
    );

    const requestObj = {
      collectionId: collectionId,
      workspaceId: currentWorkspaceId,
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
  let button;

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

  let isCollectionPopup: boolean = false;

  const handleCollectionPopUp = (flag) => {
    isCollectionPopup = flag;
  };

  function closeRightClickContextMenu() {
    showMenu = false;
  }

  //open collection
  function openCollections() {
    visibility = !visibility;
    showMenu = false;
  }

  let newCollectionName: string = "";
  let isRenaming = false;

  const handleRenameInput = (event) => {
    newCollectionName = event.target.value;
  };

  const onRenameBlur = async () => {
    if (newCollectionName) {
      const updateCollectionName = await collectionService.updateCollectionData(
        collectionId,
        currentWorkspaceId,
        { name: newCollectionName },
      );

      title = updateCollectionName?.data?.data?.name;

      const updatedCollection = {
        name: title,
        _id: collection._id,
        updatedAt: collection.updatedAt,
        updatedBy: collection.updatedBy,
        totalRequests: collection.totalRequests,
        createdAt: collection.createdAt,
        createdBy: collection.createdBy,
      };
      collectionsMethods.updateCollection(openCollectionId, updatedCollection);
    }
    isRenaming = false;
  };

  //rename collection name
  const renameCollection = () => {
    isRenaming = true;
    const inputField = document.getElementById(
      "renameInputField",
    ) as HTMLInputElement;
    showMenu = false;
  };

  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      onRenameBlur();
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
    handleFolderClick();
    if (collectionId === openCollectionId) {
      visibility = true;
    }
    showMenu = false;
  };

  let menuItems = [
    {
      onClick: openCollections,
      displayText: "Open collection",
    },
    {
      onClick: renameCollection,
      displayText: "Rename collection",
    },
    {
      onClick: addRequest,
      displayText: "Add Request",
    },
    {
      onClick: addFolder,
      displayText: "Add Folder",
    },

    {
      onClick: () => {
        handleCollectionPopUp(true);
      },
      displayText: "Delete",
    },
  ];
</script>

{#if isCollectionPopup}
  <CollectionPopup
    {collectionsMethods}
    {collection}
    collectionId = {collectionId}
    workspaceId = {currentWorkspaceId}
    closePopup={handleCollectionPopUp}
  />
{/if}

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

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
/>

<button
  style="height:36px; border-color: {showMenu ? '#ff7878' : ''}"
  class="btn-primary d-flex w-100 align-items-center justify-content-between border-0 py-1 ps-4 pe-3 my-button"
>
  <div
    on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    on:click={() => {
      if (!collection._id.includes(UntrackedItems.UNTRACKED)) {
        visibility = !visibility;
      }
    }}
    class="d-flex w-100 align-items-center"
  >
    <img
      src={angleRight}
      style="height:14px; width:14px; margin-right:8px; {visibility
        ? 'transform:rotate(90deg);'
        : 'transform:rotate(0deg);'}"
      alt="angleRight"
    />
    {#if isRenaming}
      <input
        class="form-control py-0"
        id="renameInputField"
        type="text"
        style="font-size: 14px;"
        value={title}
        on:input={handleRenameInput}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    {:else}
      <p class="mb-0" style="font-size: 14px;">
        {title}
      </p>
    {/if}
  </div>
  {#if collection._id.includes(UntrackedItems.UNTRACKED)}
    <Spinner size={"15px"} />
  {:else}
    <button
      class="threedot-icon-container pe-1 border-0 rounded d-flex justify-content-center align-items-center"
      on:click={(e) => {
        rightClickContextMenu(e);
      }}
    >
      <img src={threedotIcon} alt="threedotIcon" />
    </button>
  {/if}
</button>

<div
  style="padding-left: 40px; padding-right:12px; cursor:pointer; display: {visibility
    ? 'block'
    : 'none'};"
>
  {#each collection.items as exp}
    <FileExplorer
      {collectionsMethods}
      {collectionList}
      {collectionId}
      {currentWorkspaceId}
      explorer={exp}
      {visibility}
    />
  {/each}
  {#if showFolderAPIButtons}
    <div class="mt-2 mb-2">
      <IconButton text={"+ Folder"} onClick={handleFolderClick} />
      <IconButton text={"+ API Request"} onClick={handleAPIClick} />
    </div>
  {/if}
</div>

<style>
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
    background-color: #232527;
  }
</style>
