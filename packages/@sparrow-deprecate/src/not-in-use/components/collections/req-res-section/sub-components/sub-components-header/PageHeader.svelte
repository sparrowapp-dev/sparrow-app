<script lang="ts">
  import angleDown from "@deprecate/assets/angle-down.svg";
  import {
    collapsibleState,
    isApiCreatedFirstTime,
  } from "@deprecate/store/request-response-section";
  import floppyDisk from "@deprecate/assets/floppy-disk.svelte";
  import SaveRequest from "@deprecate/components/collections/req-res-section/sub-components/save-request/SaveRequest.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { NewTab } from "@deprecate/utils/interfaces/request.interface";
  import { updateCollectionRequest } from "@app/services/collection";
  import { ItemType } from "@deprecate/utils/enums/item-type.enum";
  import type { RequestBody } from "@deprecate/utils/interfaces/request.interface";
  import type { CollectionsMethods } from "@deprecate/utils/interfaces/collections.interface";
  import { Spinner } from "@sparrow/library/ui";
  import lockicon from "@deprecate/assets/lock-icon.svg";
  import { Tooltip } from "@sparrow/library/ui";
  import { generateSampleRequest } from "@deprecate/utils/sample/request.sample";
  import { setContentTypeHeader } from "@deprecate/utils/helpers/auth.helper";
  import { RequestDataset } from "@deprecate/utils/enums/request.enum";
  import type { WorkspaceRole } from "@deprecate/utils/enums";
  import { hasWorkpaceLevelPermission } from "@deprecate/utils/helpers";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "@deprecate/utils/constants/permissions.constant";
  import { Modal } from "@sparrow/library/ui";
  import Dropdown from "@deprecate/components/dropdown/Dropdown.svelte";
  import { notifications } from "@sparrow/library/ui";
  import type { CollectionDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import { Button } from "@sparrow/library/ui";
  import UserProfileList from "@deprecate/components/profile/UserProfileList.svelte";
  import FloppyDisk from "@deprecate/assets/floppy-disk.svelte";
  import { PenIcon } from "@deprecate/assets/icons";
  import Pen from "@deprecate/assets/icons/pen.svelte";
  export let activeTab;
  export let collectionsMethods: CollectionsMethods;
  export let loggedUserRoleInWorkspace: WorkspaceRole;
  export let currentWorkspace;

  const collections: Observable<CollectionDocument[]> =
    collectionsMethods.collection;

  let visibility: boolean = false;
  const handleBackdrop = (flag) => {
    visibility = flag;
  };
  let saveBtnHover = false;
  let tabName: string = "";
  let componentData: NewTab;
  let existingRequest;
  const monthNamesAbbreviated = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let lastUpdatedAt = "";
  const tabSubscribe = activeTab.subscribe(async (event: NewTab) => {
    if (event) {
      tabName = event?.name;
      componentData = event;
      if (event?.path?.collectionId && event?.path?.folderId) {
        existingRequest = await collectionsMethods.readRequestInFolder(
          event.path.collectionId,
          event.path.folderId,
          event.id,
        );
      } else if (event?.path?.collectionId) {
        existingRequest =
          await collectionsMethods.readRequestOrFolderInCollection(
            event.path.collectionId,
            event.id,
          );
      }
      if (existingRequest?.updatedAt) {
        const date = new Date(existingRequest?.updatedAt);
        lastUpdatedAt = `${
          monthNamesAbbreviated[date.getMonth()]
        } ${date.getDate()}, ${date.getFullYear()}`;
      } else {
        lastUpdatedAt = "";
      }
    }
  });

  const handleSaveRequest = async () => {
    const id = componentData?.id;
    collectionsMethods.updateTab(true, "saveInProgress", id);
    const res = await collectionsMethods.saveApiRequest(componentData);
    if (res) {
      collectionsMethods.setRequestSave(true, "api", id);
      notifications.success("API request saved successfully.");
    }
    collectionsMethods.updateTab(false, "saveInProgress", id);
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
    if ((event.metaKey || event.ctrlKey) && event.code === "KeyS") {
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
    collectionSubscribe.unsubscribe();
  });

  let collectionCountArr = [];
  let currentCollection;
  const refreshCount = async () => {
    if (collectionCountArr && componentData?.path?.collectionId) {
      for (const collection of collectionCountArr) {
        if (collection._data.id === componentData?.path?.collectionId) {
          currentCollection = collection;
        }
      }
    }
  };
  const collectionSubscribe = collections.subscribe(
    (value: CollectionDocument[]) => {
      if (value) {
        collectionCountArr = value;
        refreshCount();
      }
    },
  );
  let deleteLoader = false;
  const handleDelete = async () => {
    deleteLoader = true;
    const { folderId, collectionId, workspaceId } = componentData.path;
    const { currentBranch, primaryBranch } = currentCollection;
    const { id, name, source, activeSync } = componentData;
    const res = await collectionsMethods.deleteApiRequest(
      workspaceId,
      collectionId,
      id,
      name,
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

  $: {
    if (componentData?.path?.collectionId) {
      refreshCount();
    }
  }

  let isFilePopup = false;
  const handleFilePopUp = (flag) => {
    isFilePopup = flag;
  };
</script>

<Modal
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
        class="text-whiteColor fw-bold">"{componentData?.name}"</span
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
  </div></Modal
>

<div class="d-flex flex-column" data-tauri-drag-region>
  <div
    class="p-3 deleted-banner sparrow-fs-12"
    style={`display:${
      componentData?.activeSync && componentData?.isDeleted ? "block" : "none"
    }`}
  >
    The <b>"{tabName}"</b> request is removed from swagger and will be automatically
    deleted from Sparrow in two weeks.
  </div>
  <div
    class="d-flex align-items-center justify-content-between {$collapsibleState
      ? 'ps-5 pt-4 pe-3'
      : 'pt-4 px-3'}"
  >
    <div class="w-100 me-3 position-relative input-container">
      <input
        {autofocus}
        id="renameInputFieldNamePageHeader"
        bind:value={tabName}
        on:input={handleInputValue}
        class="tabbar-tabName w-100 p-1 pe-4"
        bind:this={inputElement}
        style="outline: none;"
        maxlength={100}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
        disabled={componentData?.source === "SPEC"}
      />
      <div
        class="pen-icon position-absolute d-none"
        style="right:5px; top: 5px;"
      >
        <Pen color={"var(--sparrow-text-color)"}></Pen>
      </div>
    </div>

    <div class="d-flex gap-3">
      {#if componentData?.source !== "SPEC" || !componentData?.activeSync}
        <div class="d-flex gap-3">
          <div class="d-flex gap-1">
            <Tooltip
              title={PERMISSION_NOT_FOUND_TEXT}
              show={!hasWorkpaceLevelPermission(
                loggedUserRoleInWorkspace,
                workspaceLevelPermissions.SAVE_REQUEST,
              )}
            >
              <button
                disabled={componentData.saveInProgress ||
                  !hasWorkpaceLevelPermission(
                    loggedUserRoleInWorkspace,
                    workspaceLevelPermissions.SAVE_REQUEST,
                  )}
                style="width:130px;"
                class="save-request-btn btn btn-primary d-flex align-items-center py-1.6 justify-content-between rounded border-0"
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
                on:mouseenter={() => (saveBtnHover = true)}
                on:mouseleave={() => (saveBtnHover = false)}
              >
                {#if componentData.saveInProgress}
                  <span class="me-1">
                    <Spinner size={"14px"} />
                  </span>
                {:else}
                  <!-- <img
                    src={floppyDisk}
                    alt=""
                    style="height: 20px; width:20px;"
                  /> -->
                  <FloppyDisk
                    height={20}
                    width={20}
                    color={saveBtnHover ? "var(--background-dark)" : "white"}
                  />
                {/if}
                <p class="mb-0 sparrow-fs-14" style="font-weight:400;">
                  Save Request
                </p>
              </button>
            </Tooltip>
            <span class="position-relative" style="width:35px;">
              <Dropdown
                disabled={componentData.saveInProgress ||
                  !hasWorkpaceLevelPermission(
                    loggedUserRoleInWorkspace,
                    workspaceLevelPermissions.SAVE_REQUEST,
                  )}
                dropdownId={"saveAsDropdown"}
                dropDownType={{ type: "img", title: angleDown }}
                data={[
                  {
                    name: "Save As",
                    id: "collection",
                    dynamicClasses: "text-whiteColor",
                  },
                ]}
                onclick={() => {
                  isOpen = false;
                  visibility = true;
                }}
                staticCustomStyles={[
                  {
                    id: "saveAsDropdown-options-container",
                    styleKey: "minWidth",
                    styleValue: "180px",
                  },
                ]}
                staticClasses={[
                  {
                    id: "saveAsDropdown-img",
                    classToAdd: ["btn", "bg-dullBackground", "px-2", "py-1"],
                  },
                  {
                    id: "saveAsDropdown-options-name",
                    classToAdd: ["fs-6"],
                  },
                  {
                    id: "saveAsDropdown-options-container",
                    classToAdd: ["end-0", "mt-1", "rounded"],
                  },
                ]}
              ></Dropdown>
              <Modal
                title={"Save Request"}
                type={"dark"}
                width={"55%"}
                zIndex={10000}
                isOpen={visibility}
                handleModalState={handleBackdrop}
              >
                <SaveRequest
                  {collectionsMethods}
                  {componentData}
                  {currentCollection}
                  onClick={handleBackdrop}
                />
              </Modal>
            </span>
          </div>
          <div>
            <Tooltip placement={"bottom"} title={"Coming Soon!"}>
              <button
                disabled
                class="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-3 py-1.3 rounded border-0"
              >
                <p
                  class="mb-0 text-whiteColor sparrow-fs-14"
                  style="font-weight:400"
                >
                  Share
                </p>
              </button>
            </Tooltip>
          </div>
        </div>
      {/if}
    </div>

    {#if componentData?.source === "SPEC" && componentData?.activeSync && componentData?.isDeleted}
      <div class="d-flex gap-3">
        <div class="d-flex gap-3">
          <div class="d-flex gap-1">
            <Button
              disable={false}
              title={"Delete Request"}
              textStyleProp={"font-size: var(--base-text); min-width:100px;"}
              type={"dark"}
              loader={false}
              onClick={() => {
                isFilePopup = true;
              }}
            />
          </div>
        </div>
      </div>
    {/if}
  </div>
  {#if lastUpdatedAt && componentData?.activeSync && componentData?.source === "SPEC"}
    <div class="pt-2 ps-3 d-flex align-items-center">
      {#if currentWorkspace?.users}
        <div class="d-flex">
          <UserProfileList
            width={25}
            height={25}
            borderRadius={24}
            users={currentWorkspace.users}
            maxProfiles={3}
            classProp="position-absolute"
          />
        </div>
      {/if}
      <p class="sparrow-fs-12 mb-0 ps-2">
        <span class="text-textColor"> Last updated on: </span>
        {lastUpdatedAt} <span class="text-textColor">by:</span>
        {existingRequest?.updatedBy}
      </p>
    </div>
  {/if}
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
    border-bottom: 1px solid transparent;
    caret-color: var(--send-button);
  }
  .tabbar-tabName:hover {
    border-bottom: 1px solid var(--send-button);
  }
  .tabbar-tabName:focus {
    background-color: var(--border-color);
    border-bottom: 1px solid var(--send-button);
  }
  .save-request-btn {
  }
  .save-request-btn:hover {
    background-color: var(--workspace-hover-color);
    color: var(--background-dark);
  }
  .save-request-btn:active {
    background-color: var(--button-active);
    color: white;
  }
  .save-request-dropdown-btn {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
  }
  .saveas-text:hover {
    background-color: #232424;
  }
  .deleted-banner {
    background-color: var(--error--color);
    color: var(--background-dark);
  }
  .input-container:hover .pen-icon {
    display: block !important;
  }
</style>
