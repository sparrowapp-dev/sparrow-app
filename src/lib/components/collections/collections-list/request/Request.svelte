<script lang="ts">
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { getPathFromUrl } from "$lib/utils/helpers/common.helper";
  import { showPathStore } from "$lib/store/methods";
  import { onDestroy } from "svelte";
  import threedotIcon from "$lib/assets/3dot.svg";
  import { CollectionService } from "$lib/services/collection.service";
  import { currentFolderIdName, isShowFilePopup } from "$lib/store/collection";
  import { isApiCreatedFirstTime } from "$lib/store/request-response-section";
  import { setAuthType, setBodyType } from "$lib/utils/helpers/auth.helper";
  import ModalWrapperV1 from "$lib/components/Modal/Modal.svelte";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import Button from "$lib/components/buttons/Button.svelte";
  import RightOption from "$lib/components/right-click-menu/RightClickMenuView.svelte";
  import reloadSyncIcon from "$lib/assets/reload-sync.svg";

  export let name: string;
  export let id: string;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  export let folderId: string;
  export let folderName: string;
  export let api;
  export let collectionsMethods: CollectionsMethods;
  export let activeTabId: string;
  export let activeSync = false;
  export let currentBranch;
  export let primaryBranch;

  let showPath = false;
  let isFilePopup: boolean = false;

  const collectionService = new CollectionService();

  currentFolderIdName.set({
    folderId: folderId,
    folderName: folderName,
  });

  let url,
    method,
    body,
    headers,
    queryParams,
    auth,
    type,
    description,
    selectedRequestBodyType,
    actSync,
    isDeleted,
    source,
    selectedRequestAuthType;

  const selectedMethodUnsubscibe = showPathStore.subscribe((value) => {
    showPath = value;
  });

  const handleFilePopUp = (flag) => {
    isFilePopup = flag;
  };

  const handleClick = () => {
    let request = generateSampleRequest(id, new Date().toString());
    request.path = path;
    request.name = name;
    if (description) request.description = description;
    if (url) request.property.request.url = url;
    if (body) request.property.request.body = body;
    if (method) request.property.request.method = method;
    if (queryParams) request.property.request.queryParams = queryParams;
    if (auth) request.property.request.auth = auth;
    if (headers) request.property.request.headers = headers;
    if (actSync) request.activeSync = actSync;
    if (isDeleted) request.isDeleted = isDeleted;
    if (source === "SPEC") request.source = source;
    if (selectedRequestBodyType)
      request = setBodyType(request, selectedRequestBodyType);
    if (selectedRequestAuthType)
      request = setAuthType(request, selectedRequestAuthType);
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
      auth = api.request?.auth;
      body = api.request?.body;
      type = api.request?.type;
      description = api.description;
      selectedRequestBodyType = api.request?.selectedRequestBodyType;
      actSync = activeSync;
      isDeleted = api?.isDeleted;
      source = api?.source;
      selectedRequestAuthType = api.request?.selectedRequestAuthType;

      if (!activeSync || (source === "USER" && activeSync)) {
        menuItems = [
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
      } else if (isDeleted) {
        menuItems = [
          {
            onClick: () => {
              handleClick();
            },
            displayText: "Open Request",
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
      } else {
        menuItems = [
          {
            onClick: () => {
              handleClick();
            },
            displayText: "Open Request",
            disabled: false,
          },
        ];
      }
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

  let noOfColumns = 180;
  let noOfRows = 3;
  function rightClickContextMenu(e) {
    e.preventDefault();
    setTimeout(() => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      pos = { x: mouseX, y: mouseY };
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
    let userSource = {};
    if (source === "USER") {
      userSource = {
        currentBranch: currentBranch ? currentBranch : primaryBranch,
        source: "USER",
      };
    }
    if (newRequestName) {
      if (!folderId) {
        let storage = api;
        storage.name = newRequestName;
        const response = await collectionService.updateRequestInCollection(
          api.id,
          {
            collectionId: collectionId,
            workspaceId: currentWorkspaceId,
            ...userSource,
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
            ...userSource,
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

  let menuItems = [];

  let deleteLoader: boolean = false;

  const handleDelete = async () => {
    deleteLoader = true;
    const res = await collectionsMethods.deleteApiRequest(
      currentWorkspaceId,
      collectionId,
      api.id,
      api.name,
      activeSync,
      source,
      currentBranch,
      primaryBranch,
      folderId,
    );
    if (res) {
      handleFilePopUp(false);
    }
    deleteLoader = false;
  };
</script>

<ModalWrapperV1
  title={"Delete Request?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isFilePopup}
  handleModalState={handleFilePopUp}
>
  <div class="text-lightGray mb-1 sparrow-fs-12">
    <p>
      Are you sure you want to delete this Request? <span
        class="text-whiteColor fw-bold">"{api.name}"</span
      >
      will be removed and cannot be restored.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded"
    style="font-size: 16px;"
  >
    <Button
      disable={deleteLoader}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"dark"}
      loader={false}
      onClick={() => {
        handleFilePopUp(false);
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
    class="main-file d-flex align-items-center position-relative {id?.includes(
      UntrackedItems.UNTRACKED,
    )
      ? 'unclickable'
      : ''}"
  >
    {#if api?.isDeleted && activeSync}
      <span
        class="delete-ticker position-absolute sparrow-fs-10 px-2"
        style="right: 0; background-color: var(--background-color); "
        >DELETED</span
      >
    {/if}
    {#if actSync && source === "SPEC"}
      <img src={reloadSyncIcon} class="ms-2" alt="" />
    {/if}
    <div
      class="api-method text-{getMethodStyle(method)} {isDeleted &&
        'api-method-deleted'}"
    >
      {method?.toUpperCase()}
    </div>

    {#if isRenaming}
      <input
        class="form-control py-0 renameInputFieldFile sparrow-fs-12"
        id="renameInputFieldFile"
        type="text"
        autofocus
        value={name}
        maxlength={100}
        on:input={handleRenameInput}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    {:else}
      <div class="api-name ellipsis {isDeleted && 'api-name-deleted'}">
        {name}
        {#if showPath}
          <span class="path-name ellipsis"
            >{`${url ? getPathFromUrl(url) : ""}`}</span
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

<style lang="scss">
  .delete-ticker {
    color: var(--error--color);
    font-weight: 500;
  }
  .api-method {
    font-size: 10px;
    font-weight: 500;
    width: 48px;
    height: 30px;
    padding-left: 6px;
    padding-right: 4px;
    border-radius: 8px;
    display: flex;
    align-items: center;
  }
  .api-name {
    font-size: 12px;
    font-weight: 400;
    width: calc(100% - 48px);
  }
  .api-name-deleted {
    color: var(--editor-angle-bracket) !important;
  }
  .api-method-deleted {
    color: var(--deleted-api-method) !important;
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

  .btn-primary:hover {
    .delete-ticker {
      background-color: var(--border-color) !important;
    }
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
  .main-file {
    width: calc(100% - 24px);
  }
  .active-request-tab {
    background-color: var(--selected-active-sidebar) !important;
    .delete-ticker {
      background-color: var(--selected-active-sidebar) !important;
    }
  }
  .active-request-tab:hover {
    .delete-ticker {
      background-color: var(--selected-active-sidebar) !important;
    }
  }
</style>
