<script lang="ts">
  import angleDown from "$lib/assets/angle-down.svg";
  import {
    collapsibleState,
    isApiCreatedFirstTime,
  } from "$lib/store/request-response-section";
  import floppyDisk from "$lib/assets/floppy-disk.svg";
  import SaveRequest from "$lib/components/collections/req-res-section/sub-components/save-request/SaveRequest.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { updateCollectionRequest } from "$lib/services/collection";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import type { RequestBody } from "$lib/utils/interfaces/request.interface";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import Spinner from "$lib/components/Transition/Spinner.svelte";
  import lockicon from "$lib/assets/lock-icon.svg";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { setContentTypeHeader } from "$lib/utils/helpers/auth.helper";
  import { RequestDataset } from "$lib/utils/enums/request.enum";
  export let activeTab;
  export let collectionsMethods: CollectionsMethods;

  let display: boolean = false;
  window.addEventListener("click", () => {
    display = false;
  });
  let visibility: boolean = false;
  const handleBackdrop = (flag) => {
    visibility = flag;
  };

  let tabName: string = "";
  let componentData: NewTab;

  const tabSubscribe = activeTab.subscribe((event: NewTab) => {
    if (event) {
      tabName = event?.name;
      componentData = event;
    }
  });

  const handleSaveRequest = async () => {
    const _id = componentData.id;
    collectionsMethods.updateTab(true, "saveInProgress", _id);
    const { folderId, folderName, collectionId, workspaceId } =
      componentData.path;
    let existingRequest;
    if (!folderId) {
      existingRequest =
        await collectionsMethods.readRequestOrFolderInCollection(
          collectionId,
          _id,
        );
    } else {
      existingRequest = await collectionsMethods.readRequestInFolder(
        collectionId,
        folderId,
        _id,
      );
    }
    const bodyType =
      componentData.property.request.state.dataset === RequestDataset.RAW
        ? componentData.property.request.state.raw
        : componentData.property.request.state.dataset;
    const expectedRequest: RequestBody = {
      method: componentData.property.request.method,
      url: componentData.property.request.url,
      body: componentData.property.request.body,
      headers: componentData.property.request.headers,
      queryParams: componentData.property.request.queryParams,
      selectedRequestBodyType: setContentTypeHeader(bodyType),
    };
    if (!folderId) {
      let res = await updateCollectionRequest(_id, {
        collectionId: collectionId,
        workspaceId: workspaceId,
        items: {
          id: _id,
          name: tabName,
          description: existingRequest?.description,
          type: ItemType.REQUEST,
          request: expectedRequest,
        },
      });
      if (res.isSuccessful) {
        collectionsMethods.updateRequestOrFolderInCollection(
          collectionId,
          _id,
          res.data.data,
        );
        collectionsMethods.setRequestSave(true, "api", _id);
        collectionsMethods.updateTab(false, "saveInProgress", _id);
      } else {
        collectionsMethods.updateTab(false, "saveInProgress", _id);
      }
    } else {
      let res = await updateCollectionRequest(_id, {
        collectionId: collectionId,
        workspaceId: workspaceId,
        folderId: folderId,
        items: {
          name: folderName,
          type: ItemType.FOLDER,
          items: {
            id: _id,
            name: tabName,
            description: existingRequest.description,
            type: ItemType.REQUEST,
            request: expectedRequest,
          },
        },
      });
      if (res.isSuccessful) {
        collectionsMethods.updateRequestInFolder(
          collectionId,
          folderId,
          _id,
          res.data.data,
        );
        collectionsMethods.setRequestSave(true, "api", _id);
        collectionsMethods.updateTab(false, "saveInProgress", _id);
      } else {
        collectionsMethods.updateTab(false, "saveInProgress", _id);
      }
    }
  };

  let handleInputValue = () => {
    collectionsMethods.updateTab(tabName, "name", componentData.id);
  };

  onDestroy(() => {
    tabSubscribe();
  });

  let isOpen: boolean = false;

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  function handleDropdownClick(event: MouseEvent) {
    const dropdownElement = document.getElementById("save-dropdown");
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onDestroy(() => {
    window.removeEventListener("click", handleDropdownClick);
  });

  onMount(() => {
    window.addEventListener("click", handleDropdownClick);
  });
  const handleKeyPress = (event) => {
    if (event.ctrlKey && event.code === "KeyS") {
      if (componentData?.path.collectionId && componentData?.path.workspaceId) {
        handleSaveRequest();
      } else {
        visibility = true;
      }
    }
  };

  let isRequestNameVisibility: boolean;

  const unsubscribeisApiCreatedFirstTime = isApiCreatedFirstTime.subscribe(
    (value) => {
      isRequestNameVisibility = value;
    },
  );

  let autofocus = isRequestNameVisibility;

  let inputElement;

  onMount(() => {
    if (autofocus) {
      inputElement.select();
    }
  });

  const onRenameBlur = async () => {
    if (!tabName) {
      const { collectionId, folderId } = componentData?.path;
      if (collectionId && folderId) {
        const req = await collectionsMethods.readRequestInFolder(
          collectionId,
          folderId,
          componentData?.id,
        );
        if (req?.name) {
          collectionsMethods.updateTab(req.name, "name", componentData.id);
        }
      } else if (collectionId) {
        const req = await collectionsMethods.readRequestOrFolderInCollection(
          collectionId,
          componentData.id,
        );
        if (req?.name) {
          collectionsMethods.updateTab(req.name, "name", componentData.id);
        }
      } else {
        const req = generateSampleRequest("id", new Date().toString());
        collectionsMethods.updateTab(req.name, "name", componentData.id);
      }
    }
  };

  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldNamePageHeader",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };
  onDestroy(() => {
    unsubscribeisApiCreatedFirstTime();
  });
</script>

<div class="d-flex flex-column" data-tauri-drag-region>
  <div
    class="d-flex align-items-center justify-content-between {$collapsibleState
      ? 'ps-5 pt-4 pe-3'
      : 'pt-4 px-3'}"
  >
    <div class="w-100 me-3">
      <input
        {autofocus}
        id="renameInputFieldNamePageHeader"
        bind:value={tabName}
        on:input={handleInputValue}
        class="tabbar-tabName w-100"
        bind:this={inputElement}
        style="outline: none;"
        maxlength={100}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    </div>

    <div class="d-flex gap-3">
      <div class="d-flex gap-3">
        <div class="d-flex gap-1">
          <button
            disabled={componentData?.save}
            style="width:140px;"
            class="save-request-btn btn btn-primary d-flex align-items-center py-1.6 justify-content-center rounded border-0"
            on:click={() => {
              if (
                componentData?.path.collectionId &&
                componentData?.path.workspaceId
              ) {
                handleSaveRequest();
              } else {
                visibility = true;
              }
            }}
          >
            {#if componentData.saveInProgress}
              <Spinner size={"14px"} />
            {:else}
              <img src={floppyDisk} alt="" style="height: 20px; width:20px;" />
            {/if}
            <p
              class="mb-0 text-whiteColor"
              style="font-size: 14px; font-weight:400;"
            >
              Save Request
            </p>
          </button>
          <span class="position-relative" style="width:35px;">
            <button
              id="save-dropdown"
              on:click={toggleDropdown}
              class="save-request-dropdown-btn px-2 py-2 btn btn-primary d-flex align-items-center justify-content-center rounded border-0"
            >
              <img src={angleDown} alt="" class="w-100 h-100" />
            </button>
            <div
              class="rounded z-2 save-options {isOpen ? 'd-block' : 'd-none'}"
            >
              <p
                class="m-1 saveas-text m-0 py-1 px-3 cursor-pointer rounded fs-6"
                on:click={() => {
                  isOpen = false;
                  visibility = true;
                }}
              >
                Save As
              </p>
            </div>
            {#if visibility}
              <SaveRequest
                {collectionsMethods}
                {componentData}
                onClick={handleBackdrop}
              />
            {/if}
          </span>
        </div>
        <div>
          <Tooltip>
            <button
              disabled
              class="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-3 py-1.3 rounded border-0"
            >
              <img src={lockicon} alt="lock-icon" />
              <p
                class="mb-0 text-whiteColor"
                style="font-size: 14px; font-weight:400"
              >
                Share
              </p>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>
</div>
<svelte:window on:keydown={handleKeyPress} />

<style>
  .btn-primary {
    background-color: #232424;
  }

  .btn-primary:hover {
    background-color: #232424;
  }
  .save-options {
    position: absolute;
    width: 180px;
    top: 40px;
    right: 0;
    border: 1px solid var(--border-color);
    background-color: var(--background-dropdown);
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .loader-anim {
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
  .tabbar-tabName {
    background-color: transparent;
    border: none;
    outline: none;
    font-size: 18px;
    font-weight: 400;
  }
  .save-request-btn {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }
  .save-request-dropdown-btn {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
  }
  .saveas-text:hover {
    background-color: #232424;
  }
</style>
