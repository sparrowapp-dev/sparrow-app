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
    if(event){
    tabName = event?.name;
    componentData = event;
    }
  });

  const handleSaveRequest = async () => {
    const _id = componentData.id;
    collectionsMethods.updateTab(true, "saveInProgress", _id);
    const { folderId, folderName, collectionId, workspaceId } =
      componentData.path;

    const expectedRequest: RequestBody = {
      method: componentData.property.request.method,
      url: componentData.property.request.url,
      body: componentData.property.request.body,
      headers: componentData.property.request.headers,
      queryParams: componentData.property.request.queryParams,
    };

    if (!folderId && !folderName) {
      let res = await updateCollectionRequest(componentData.id, {
        collectionId: collectionId,
        workspaceId: workspaceId,
        items: {
          id: componentData.id,
          name: tabName,
          type: ItemType.REQUEST,
          request: expectedRequest,
        },
      });
      if (res.isSuccessful) {
        collectionsMethods.updateRequestOrFolderInCollection(
          collectionId,
          componentData.id,
          res.data.data,
        );
        collectionsMethods.updateTab(false, "saveInProgress", _id);
        collectionsMethods.updateTab(true, "save", _id);
      } else {
        collectionsMethods.updateTab(false, "saveInProgress", _id);
      }
    } else {
      let res = await updateCollectionRequest(componentData.id, {
        collectionId: collectionId,
        workspaceId: workspaceId,
        folderId: folderId,
        items: {
          name: folderName,
          type: ItemType.FOLDER,
          items: {
            id: componentData.id,
            name: tabName,
            type: ItemType.REQUEST,
            request: expectedRequest,
          },
        },
      });
      if (res.isSuccessful) {
        collectionsMethods.updateRequestInFolder(
          collectionId,
          folderId,
          componentData.id,
          res.data.data,
        );
        collectionsMethods.updateTab(false, "saveInProgress", _id);
        collectionsMethods.updateTab(true, "save", _id);
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
        placeholder="Enter API Request Name"
        bind:value={tabName}
        on:input={handleInputValue}
        class="tabbar-tabName w-100"
        bind:this={inputElement}
        style="outline: none;"
      />
    </div>

    <div class="d-flex gap-3">
      <div class="d-flex gap-3">
        <div class="d-flex gap-1">
          <button
            disabled={componentData?.save}
            style="width:140px;"
            class="btn btn-primary d-flex align-items-center py-1.6 justify-content-center rounded border-0"
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
              class="px-2 py-2 btn btn-primary d-flex align-items-center justify-content-center rounded border-0"
            >
              <img src={angleDown} alt="" class="w-100 h-100" />
            </button>
            <div class="rounded save-options {isOpen ? 'd-block' : 'd-none'}">
              <p
                style="width:120px;"
                class="bg-black m-0 py-1 px-3 cursor-pointer rounded fs-6"
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
    background-color: #313233;
  }

  .btn-primary:hover {
    background-color: #616364;
  }
  .save-options {
    position: absolute;
    top: 40px;
    right: 0;
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
</style>
