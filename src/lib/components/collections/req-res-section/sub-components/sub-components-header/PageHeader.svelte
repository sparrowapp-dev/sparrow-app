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
  import type { WorkspaceRole } from "$lib/utils/enums";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "$lib/utils/constants/permissions.constant";
  import ModalWrapperV1 from "$lib/components/Modal/Modal.svelte";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import type { CollectionDocument } from "$lib/database/app.database";
  import type { Observable } from "rxjs";
  import Button from "$lib/components/buttons/Button.svelte";
  export let activeTab;
  export let collectionsMethods: CollectionsMethods;
  export let loggedUserRoleInWorkspace: WorkspaceRole;

  const collections: Observable<CollectionDocument[]> =
    collectionsMethods.collection;

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
    let userSource = {};
    if (componentData?.activeSync && componentData?.source === "USER") {
      userSource = {
        currentBranch: currentCollection?.currentBranch
          ? currentCollection?.currentBranch
          : currentCollection?.primaryBranch,
        source: "USER",
      };
    }
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
    const authType = componentData.property.request.state?.auth;

    const expectedRequest: RequestBody = {
      method: componentData.property.request.method,
      url: componentData.property.request.url,
      body: componentData.property.request.body,
      headers: componentData.property.request.headers,
      queryParams: componentData.property.request.queryParams,
      auth: componentData.property.request.auth,
      selectedRequestBodyType: setContentTypeHeader(bodyType),
      selectedRequestAuthType: authType,
    };
    if (!folderId) {
      let res = await updateCollectionRequest(_id, {
        collectionId: collectionId,
        workspaceId: workspaceId,
        ...userSource,
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
        ...userSource,
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
    notifications.success("API request saved");
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
  </div></ModalWrapperV1
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
        disabled={componentData?.source === "SPEC"}
      />
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
                  <span class="me-1">
                    <Spinner size={"14px"} />
                  </span>
                {:else}
                  <img
                    src={floppyDisk}
                    alt=""
                    style="height: 20px; width:20px;"
                  />
                {/if}
                <p
                  class="mb-0 text-whiteColor sparrow-fs-14"
                  style="font-weight:400;"
                >
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
              <ModalWrapperV1
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
              </ModalWrapperV1>
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
  .deleted-banner {
    background-color: var(--error--color);
    color: var(--background-dark);
  }
</style>
