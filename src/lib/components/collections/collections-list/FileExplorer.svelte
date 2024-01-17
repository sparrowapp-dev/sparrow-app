<script lang="ts">
  import folder from "$lib/assets/folder.svg";
  import folderOpenIcon from "$lib/assets/open-folder.svg";
  import IconButton from "$lib/components/buttons/IconButton.svelte";

  import { isFolderCreatedFirstTime } from "$lib/store/collection";

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
  import { generateSampleFolder } from "$lib/utils/sample/folder.sample";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { isApiCreatedFirstTime } from "$lib/store/request-response-section";
  import { handleFolderClick } from "$lib/utils/helpers/handle-clicks.helper";
  import requestIcon from "$lib/assets/create_request.svg";
  import angleRight from "$lib/assets/angleRight.svg";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";

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

  const collectionService = new CollectionService();

  const _colllectionListViewModel = new CollectionListViewModel();
  export let collectionsMethods: CollectionsMethods;

  let showFolderAPIButtons: boolean = true;

  const handleAPIClick = async () => {
    isApiCreatedFirstTime.set(true);
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

  // Assuming you have a container reference (e.g., containerRef) in your component
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
      const response = await collectionService.updateFolderInCollection(
        currentWorkspaceId,
        collectionId,
        explorer.id,
        {
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

  let menuItems = [
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

  let workspaceId = currentWorkspaceId;

  $: {
    if (activePath) {
      if (activePath.folderId === explorer.id) {
        expand = true;
      }
    }
  }
</script>

{#if isFolderPopup}
  <FolderPopup
    {collectionsMethods}
    {collectionId}
    folderId={explorer.id}
    {workspaceId}
    folder={explorer}
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
        />
      {/each}
      {#if showFolderAPIButtons}
        <div class="mt-2 mb-2 ms-0">
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
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div style="cursor:pointer;">
    <File
      api={explorer}
      {folderId}
      {folderName}
      {collectionsMethods}
      {collectionId}
      {currentWorkspaceId}
      name={explorer.name}
      id={explorer.id}
      {activeTabId}
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
