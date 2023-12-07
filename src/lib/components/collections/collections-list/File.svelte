<script lang="ts">
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  import type { NewTab, Path } from "$lib/utils/interfaces/request.interface";
  import {
    getPathFromUrl,
    truncatePath,
  } from "$lib/utils/helpers/common.helper";
  import { showPathStore } from "$lib/store/methods";
  import { onDestroy } from "svelte";
  import threedotIcon from "$lib/assets/3dot.svg";
  import { CollectionService } from "$lib/services/collection.service";
  import { currentFolderIdName, isShowFilePopup } from "$lib/store/collection";
  import FilePopup from "$lib/components/Modal/FilePopup.svelte";
  export let name: string;
  export let id: string;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  export let folderId: string;
  export let folderName: string;
  export let api;
  export let collectionsMethods: CollectionsMethods;
  let showPath = false;

  const collectionService = new CollectionService();

  currentFolderIdName.set({
    folderId: folderId,
    folderName: folderName,
  });

  let url, method, body, headers, queryParams, type;

  let apiClass = "red-api";

  const selectedMethodUnsubscibe = showPathStore.subscribe((value) => {
    showPath = value;
  });


  const handleClick = () => {
    const request = generateSampleRequest(id, new Date().toString());
    request.path = path;
    request.name = name;
    if (url) request.property.request.url = url;
    if (body) request.property.request.body = body;
    if (method) request.property.request.method = method;
    if (queryParams) request.property.request.queryParams = queryParams;
    if (headers) request.property.request.headers = headers;
    request.save = true;
    collectionsMethods.handleCreateTab(request);
    moveNavigation("right");
  };

  $: {
    if (api) {
      if (api.property) {
        api = api.property;
      }
      url = api.request?.url;
      method = api.request?.method;
      headers = api.request?.headers;
      queryParams = api.request?.queryParams;
      body = api.request?.body;
      type = api.request?.type;
    }
  }

  let path: Path = {
    workspaceId: currentWorkspaceId,
    collectionId,
    folderId,
    folderName,
  };
  onDestroy(() => {
    selectedMethodUnsubscibe();
  });

  let openRequestId = null;
  let isMenuOpen = false;

  let pos = { x: 0, y: 0 };

  let menu = { h: 0, y: 0 };

  let browser = { h: 0, y: 0 };
  let content;

  let showMenu = false;
  let button;
  let openMenuButton: HTMLElement = null;
  let containerRef;
  function rightClickContextMenu(e, button) {
    e.preventDefault();

    const containerRect = containerRef?.getBoundingClientRect();
    const mouseX = e.clientX - (containerRect?.left || 0);
    const mouseY = e.clientY - (containerRect?.top || 0);

    pos = { x: mouseX, y: mouseY };

    openRequestId = id;
    showMenu = true;
  }

  function onPageClick(e) {
    isMenuOpen = false;
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

  let folderID;
  //open collection
  function openRequest() {
    // visibility = !visibility;
  }

  let newRequestName: string = "";
  let isRenaming = false;

  const handleRenameInput = (event) => {
    newRequestName = event.target.value;
  };

  const onRenameBlur = async () => {
    if (folderId) {
      folderID = folderId;
    }

    if (newRequestName) {
      const updateRequestName =
        await collectionService.updateRequestInCollection(openRequestId, {
          collectionId: collectionId,
          workspaceId: currentWorkspaceId,
          folderId: folderID,
          items: {
            name: newRequestName,
            type: "REQUEST",
          },
        });

      name = updateRequestName?.data?.data.name;
      collectionsMethods.updateRequestInFolderCollection(
        collectionId,
        openRequestId,
        updateRequestName.data.data,
        folderID,
      );
    }
    isRenaming = false;
  };

  //rename collection name
  const renameRequest = () => {
    isRenaming = true;
    const inputField = document.getElementById(
      "renameInputField",
    ) as HTMLInputElement;
  };

  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      onRenameBlur();
    }
  };

  //delete collection
  const deleteRequest = async () => {
    isShowFilePopup.set(true);
  };

  let menuItems = [
    {
      onClick: openRequest,
      displayText: "Open Request",
    },
    {
      onClick: renameRequest,
      displayText: "Rename Request",
    },
    {
      onClick: deleteRequest,
      displayText: "Delete",
    },
  ];

  let isFilePopup: boolean;
  isShowFilePopup.subscribe((value) => {
    isFilePopup = value;
  });

  let workspaceId = currentWorkspaceId;

  function toggleMenuVisibility() {
    showMenu = !showMenu;
  }
</script>

{#if isFilePopup}
  <FilePopup
    {collectionsMethods}
    {folderId}
    {folderName}
    {collectionId}
    {openRequestId}
    {name}
    {workspaceId}
  />
{/if}

<div class="content" bind:this={content} />

{#if showMenu && id === openRequestId}
  <div
    on:click={toggleMenuVisibility}
    style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;"
  />
  <nav
    use:getContextMenuDimension
    style="position: fixed; top:{pos.y}px; left:{pos.x}px"
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

<svelte:window on:click={onPageClick} />

<div
  class="d-flex align-items-center mb-1 mt-1 ps-1 justify-content-between my-button btn-primary {id?.includes(
    UntrackedItems.UNTRACKED,
  )
    ? 'unclickable'
    : ''}"
  style="height:32px;"
  on:contextmenu|preventDefault={(e) => rightClickContextMenu(e, button)}
  on:click={() => {
    handleClick();
  }}
>
  <div class="d-flex align-items-center">
    <div class="api-method text-{getMethodStyle(method)}">
      {method?.toUpperCase()}
    </div>

    {#if isRenaming}
      <input
        class="form-control py-0"
        style="font-size: 14px;"
        id="renameInputField"
        type="text"
        value={name}
        on:input={handleRenameInput}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    {:else}
      <div class="api-name">
        {name}
        {#if showPath}
        <span class="path-name"
          >{`${url ? truncatePath(getPathFromUrl(url), 14) : ""}`}</span
        >
      {/if}
      </div>
    {/if}
  </div>

  <button
    class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center"
    on:click={(e) => {
      e.stopPropagation();
      rightClickContextMenu(e, button);
    }}
  >
    <img src={threedotIcon} alt="threedotIcon" />
  </button>

  {#if id?.includes(UntrackedItems.UNTRACKED)}
    <Spinner size={"15px"} />
  {/if}
</div>

<style>
  .api-method {
    font-size: 12px;
    font-weight: 500;
    margin-right: 8px;
    border: 1px solid var(--border-color);
    width: 56px;
    height: 34px;
    border-radius: 8px;
    padding: 8px 12px 8px 8px;
    display: flex;
    justify-content: center;
    text-align: left;
  }
  .api-name {
    font-size: 12px;
    font-weight: 400;
  }
  .api-info {
    display: flex;
    flex-direction: column;
  }
  .path-name {
    margin-top: -4px;
    font-family: Roboto Mono;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    color: #999999;
  }
  .highlight {
    color: var(--white-color);
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
  .unclickable {
    pointer-events: none;
  }
</style>
