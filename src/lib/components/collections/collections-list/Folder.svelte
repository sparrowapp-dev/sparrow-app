<script lang="ts">
  import angleRight from "$lib/assets/angleRight.svg";
  import threedotIcon from "$lib/assets/3dot.svg";

  import IconButton from "$lib/components/buttons/IconButton.svelte";
  import { currentWorkspace } from "$lib/store/workspace.store";
  import {
    insertCollectionDirectory,
    insertCollectionRequest,
  } from "$lib/services/collection";
  import FileExplorer from "./FileExplorer.svelte";
  import type { CreateDirectoryPostBody } from "$lib/utils/dto";
  import { getNextName } from "./collectionList";
  import { onDestroy } from "svelte";
  import { useCollectionTree } from "$lib/store/collection";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import { RequestDefault } from "$lib/utils/enums/request.enum";
  import ContextMenu from "./ContextMenu.svelte";
  import { v4 as uuidv4 } from "uuid";
  const { insertNode, updateNodeId, insertHead } = useCollectionTree();
  let visibility = false;
  export let title: string;
  export let collection: any;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  let workspaceId: string = "";
  export let collectionList;

  const currentWorkspaceUnsubscribe = currentWorkspace.subscribe(
    (value: any) => {
      workspaceId = value.id;
    },
  );

  const handleFolderClick = async (): Promise<void> => {
    let directory: CreateDirectoryPostBody = {
      name: getNextName(collection.items, ItemType.FOLDER, "New Folder"),
      description: "",
    };
    const currentDummyId: string = uuidv4() + "MYUID45345";
    insertNode(
      JSON.parse(JSON.stringify(collectionList)),
      collection._id,
      ItemType.FOLDER,
      directory.name,
      currentDummyId,
    );
    const res = await insertCollectionDirectory(
      workspaceId,
      collection._id,
      directory,
    );
    if (res.isSuccessful) {
      updateNodeId(
        JSON.parse(JSON.stringify(collectionList)),
        currentDummyId,
        res.data.data.id,
      );
    }
  };
  const handleAPIClick = async () => {
    const file: string = getNextName(
      collection.items,
      ItemType.REQUEST,
      RequestDefault.NAME,
    );
    const currentDummyId: string = uuidv4() + "MYUID45345";
    insertNode(
      JSON.parse(JSON.stringify(collectionList)),
      collection._id,
      ItemType.REQUEST,
      file,
      currentDummyId,
      { method: RequestDefault.METHOD },
    );

    const res = await insertCollectionRequest({
      collectionId: collection._id,
      workspaceId: workspaceId,
      items: {
        name: file,
        type: ItemType.REQUEST,
        request: {
          method: RequestDefault.METHOD,
        },
      },
    });

    if (res.isSuccessful) {
      updateNodeId(
        JSON.parse(JSON.stringify(collectionList)),
        currentDummyId,
        new Date() + "uid", // MOCKED DATA [UPDATION REQUIRED HERE]
      );
    }
  };
  onDestroy(currentWorkspaceUnsubscribe);

  //this is for right click on collections
  // pos is cursor position when right click occur
  let pos = { x: 0, y: 0 };
  // menu is dimension (height and width) of context menu
  let menu = { h: 0, y: 0 };
  // browser/window dimension (height and width)
  let browser = { h: 0, y: 0 };
  // showMenu is state of context-menu visibility
  let showMenu = false;
  // to display some text
  let content;

  function rightClickContextMenu(e) {
    showMenu = true;
    browser = {
      y: window.innerWidth,
      h: window.innerHeight,
    };
    pos = {
      x: e.clientX,
      y: e.clientY,
    };
    // If bottom part of context menu will be displayed
    // after right-click, then change the position of the
    // context menu. This position is controlled by `top` and `left`
    // at inline style.
    // Instead of context menu is displayed from top left of cursor position
    // when right-click occur, it will be displayed from bottom left.
    if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
    if (browser.y - pos.x < menu.y) pos.x = pos.x - menu.y;
  }
  function onPageClick(e) {
    // To make context menu disappear when
    // mouse is clicked outside context menu
    showMenu = false;
  }
  function getContextMenuDimension(node) {
    // This function will get context menu dimension
    // when navigation is shown => showMenu = true
    let height = node.offsetHeight;
    let width = node.offsetWidth;
    menu = {
      h: height,
      y: width,
    };
  }
  function addCollections() {
    // content.textContent = "created...";
  }
  function renameCollection() {
    // content.textContent = "created...";
  }
  function addRequest() {
    // content.textContent = "created...";
  }

  function addFolder() {
    // content.textContent = "created...";
  }

  function deleteCollection() {
    // content.textContent = "created...";
  }

  let menuItems = [
    {
      onClick: addCollections,
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
      onClick: deleteCollection,
      displayText: "Delete",
    },
  ];
</script>

<div class="content" bind:this={content} />

{#if showMenu && collectionId}
  <nav
    use:getContextMenuDimension
    style="position: absolute; top:{pos.y}px; left:{pos.x}px"
  >
    <div class="navbar" id="navbar">
      <ul>
        {#each menuItems as item}
          <li>
            <button on:click={item.onClick}>{item.displayText}</button>
          </li>
        {/each}
      </ul>
    </div>
  </nav>
{/if}

<svelte:window on:click={onPageClick} />

<button
  on:contextmenu|preventDefault={rightClickContextMenu}
  on:click={() => {
    if (!collection._id.includes("MYUID45345")) {
      visibility = !visibility;
    }
  }}
  style="height:36px;"
  class=" btn-primary d-flex w-100 align-items-center justify-content-between border-0 py-1 ps-4 my-button"
>
  <div class="d-flex align-items-center">
    <img
      src={angleRight}
      style="height:14px; width:14px; margin-right:8px; {visibility
        ? 'transform:rotate(90deg);'
        : 'transform:rotate(0deg);'}"
      alt="angleRight"
    />
    <p class="mb-0" style="font-size: 14px;">{title}</p>
  </div>
  <div class="threedot-icon-container">
    <img src={threedotIcon} alt="threedotIcon" />
  </div>
</button>
<div
  style="padding-left: 40px; cursor:pointer; display: {visibility
    ? 'block'
    : 'none'};"
>
  {#each collection.items as exp}
    <FileExplorer
      {collectionList}
      {collectionId}
      {currentWorkspaceId}
      explorer={exp}
    />
  {/each}
  <IconButton text={"+ Folder"} onClick={handleFolderClick} />
  <IconButton text={"+ API Request"} onClick={handleAPIClick} />
</div>

<style>
  .my-button:hover .threedot-icon-container {
    visibility: visible;
  }

  .threedot-icon-container {
    visibility: hidden;
  }

  .btn-primary {
    background-color: #1e1e1e;
    color: #fff;
  }

  .btn-primary:hover {
    background-color: #232527;
    color: #fff;
    padding: 20px;
  }

  .navbar {
    display: flex;
    align-items: start;
    justify-content: start;
    width: 170px;
    background-color: #000;
    border-radius: 6px;
    overflow: hidden;
    flex-direction: column;
    color: white;
  }

  ul li {
    display: block;
  }

  ul li button {
    font-size: 12px;
    width: 100%;
    height: 30px;
    text-align: left;
    border: 0px;
    background-color: #000;
  }

  ul li button:hover {
    padding-left: 4px;
    width: 100%;
    color: #ffffff;
    text-align: left;
    border-radius: 4px;
    background-color: rgba(107, 105, 105, 0.192);
  }
</style>
