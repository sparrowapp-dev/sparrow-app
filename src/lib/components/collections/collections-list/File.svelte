<script lang="ts">
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  import type { Path } from "$lib/utils/interfaces/request.interface";
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
  import { isApiCreatedFirstTime } from "$lib/store/request-response-section";

  export let name: string;
  export let id: string;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  export let folderId: string;
  export let folderName: string;
  export let api;
  export let collectionsMethods: CollectionsMethods;
  export let activeTabId: string;

  let showPath = false;
  let isFilePopup: boolean = false;

  const collectionService = new CollectionService();

  currentFolderIdName.set({
    folderId: folderId,
    folderName: folderName,
  });

  let url, method, body, headers, queryParams, type, description;

  const selectedMethodUnsubscibe = showPathStore.subscribe((value) => {
    showPath = value;
  });

  const handleFilePopUp = (flag) => {
    isFilePopup = flag;
  };

  const handleClick = () => {
    const request = generateSampleRequest(id, new Date().toString());
    request.path = path;
    request.name = name;
    if (description) request.description = description;
    if (url) request.property.request.url = url;
    if (body) request.property.request.body = body;
    if (method) request.property.request.method = method;
    if (queryParams) request.property.request.queryParams = queryParams;
    if (headers) request.property.request.headers = headers;
    request.property.request.save.api = true;
    request.property.request.save.description = true;
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
      description = api.description;
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

  let pos = { x: 0, y: 0 };

  let showMenu: boolean = false;

  let containerRef;

  function rightClickContextMenu(e) {
    e.preventDefault();
    setTimeout(() => {
      const containerRect = containerRef?.getBoundingClientRect();
      const mouseX = e.clientX - (containerRect?.left || 0);
      const mouseY = e.clientY - (containerRect?.top || 0);
      pos = { x: mouseX, y: mouseY + 20 };
      showMenu = true;
    }, 100);
  }

  function closeRrightClickContextMenu() {
    showMenu = false;
  }

  let newRequestName: string = "";
  let isRenaming = false;

  const handleRenameInput = (event) => {
    newRequestName = event.target.value;
  };

  const onRenameBlur = async () => {
    if (newRequestName) {
      if (!folderId) {
        let storage = api;
        storage.name = newRequestName;
        const response = await collectionService.updateRequestInCollection(
          api.id,
          {
            collectionId: collectionId,
            workspaceId: currentWorkspaceId,
            items: storage,
          },
        );
        if (response.isSuccessful) {
          collectionsMethods.updateRequestOrFolderInCollection(
            collectionId,
            api.id,
            response.data.data,
          );
          collectionsMethods.updateTab(newRequestName, "name", api.id);
        }
      } else if (collectionId && currentWorkspaceId && folderId) {
        let storage = api;
        storage.name = newRequestName;
        const response = await collectionService.updateRequestInCollection(
          api.id,
          {
            collectionId: collectionId,
            workspaceId: currentWorkspaceId,
            folderId,
            items: {
              name: folderName,
              id: folderId,
              type: ItemType.FOLDER,
              items: storage,
            },
          },
        );
        if (response.isSuccessful) {
          collectionsMethods.updateRequestInFolder(
            collectionId,
            folderId,
            api.id,
            response.data.data,
          );
          collectionsMethods.updateTab(newRequestName, "name", api.id);
        }
      }
    }
    isRenaming = false;
    newRequestName = "";
  };

  //rename collection name
  const renameRequest = () => {
    isRenaming = true;
  };

  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldFile",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };

  let menuItems = [
    {
      onClick: () => {
        handleClick();
      },
      displayText: "Open Request",
      disabled: false,
    },
    {
      onClick: renameRequest,
      displayText: "Rename Request",
      disabled: false,
    },
    {
      onClick: () => {
        handleFilePopUp(true);
      },
      displayText: "Delete",
      disabled: false,
    },
  ];
</script>

{#if isFilePopup}
  <FilePopup
    {collectionsMethods}
    {folderId}
    {collectionId}
    workspaceId={currentWorkspaceId}
    request={api}
    closePopup={handleFilePopUp}
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
              disabled={item.disabled}
              class={`align-items-center mb-1 px-3 py-2 ${
                item.disabled && "text-requestBodyColor"
              }`}
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
  on:click={closeRrightClickContextMenu}
  on:contextmenu|preventDefault={closeRrightClickContextMenu}
/>

<div
  class="d-flex align-items-center mb-1 mt-1 ps-0 justify-content-between my-button btn-primary {id ===
  activeTabId
    ? 'active-request-tab'
    : ''}"
  style="height:32px;"
  on:click={() => {
    isApiCreatedFirstTime.set(false);
  }}
>
  <div
    on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    on:click={() => {
      handleClick();
    }}
    class="main-file d-flex align-items-center {id?.includes(
      UntrackedItems.UNTRACKED,
    )
      ? 'unclickable'
      : ''}"
  >
    <div
      class="api-method text-{getMethodStyle(method)}  {id === activeTabId
        ? ' active-request-method'
        : ''}"
    >
      {method?.toUpperCase()}
    </div>

    {#if isRenaming}
      <input
        class="form-control py-0 renameInputFieldFile"
        style="font-size: 12px;"
        id="renameInputFieldFile"
        type="text"
        autofocus
        value={name}
        on:input={handleRenameInput}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    {:else}
      <div class="api-name ellipsis">
        {name}
        {#if showPath}
          <span class="path-name"
            >{`${url ? truncatePath(getPathFromUrl(url), 14) : ""}`}</span
          >
        {/if}
      </div>
    {/if}
  </div>

  {#if id?.includes(UntrackedItems.UNTRACKED)}
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

<style>
  .api-method {
    font-size: 12px;
    font-weight: 500;
    margin-right: 8px;
    border: 1px solid var(--border-color);
    height: 30px;
    border-radius: 8px;
    padding: 8px 12px 8px 8px;
    display: flex;
    justify-content: center;
    align-items: center;
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
    padding-left: 0 !important;
    padding-right: 5px;
    border-radius: 8px;
  }

  .btn-primary:hover {
    background-color: var(--border-color);
    color: var(--white-color);
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
  .renameInputFieldFile {
    border: none;
    background-color: transparent;
    color: var(--white-color);
    padding-left: 0;
  }
  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .main-file {
    width: calc(100% - 24px);
  }
  .active-request-tab {
    background-color: var(--selected-active-sidebar) !important;
  }
  .active-request-method {
    background-color: var(--selected-active-sidebar) !important;
  }
</style>
