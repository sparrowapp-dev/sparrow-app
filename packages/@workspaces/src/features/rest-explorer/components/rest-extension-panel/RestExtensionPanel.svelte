<script lang="ts">
  import commetIcon from "@deprecate/assets/comment-fill.svg";
  import codeIcon from "@deprecate/assets/code.svg";
  import BookIcon from "@deprecate/assets/book.svelte";
  import type { NewTab } from "@deprecate/utils/interfaces/request.interface";
  import { Tooltip } from "@sparrow/library/ui";
  import { onDestroy, onMount } from "svelte";
  import type { RequestBody } from "@deprecate/utils/interfaces/request.interface";
  import { updateCollectionRequest } from "@app/services/collection";
  import { ItemType } from "@deprecate/utils/enums/item-type.enum";
  //   import type { CollectionsMethods } from "@deprecate/utils/interfaces/collections.interface";
  import SaveIcon from "@deprecate/assets/save-desc.svg";
  import EditIcon from "@deprecate/assets/edit-desc.svg";

  import { Events, type WorkspaceRole } from "@deprecate/utils/enums";
  import { notifications } from "@sparrow/library/ui";

  import { workspaceLevelPermissions } from "@deprecate/utils/constants/permissions.constant";
  import {
    getMethodStyle,
    hasWorkpaceLevelPermission,
  } from "@deprecate/utils/helpers";
  import { Modal } from "@sparrow/library/ui";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import type { CollectionDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  // import { SaveAsRequest } from "../../../../features";
  /////////////////////////////////////////////////////////////////
  export let onSaveAsRequest;
  export let onSaveRequest;
  export let onUpdateRequestState;
  export let onUpdateRequestDescription;
  export let readCollection;
  export let collections: CollectionDocument[];
  export let readWorkspace;
  export let onCreateFolder;
  export let onCreateCollection;
  export let readRequestOrFolderInCollection;
  /////////////////////////////////////////////////////////////////
  //   export let collectionsMethods: CollectionsMethods;
  export let loggedUserRoleInWorkspace: WorkspaceRole = "editor";

  export let requestDescription;
  ////state
  export let state;
  //////
  export let requestPath;
  export let requestName;
  export let requestMethod;
  export let requestUrl;
  /////
  let collectionName: string;
  let folderName;

  let handleInputValue = () => {
    // collectionsMethods.updateTab(description, "description", componentData.id);
    onUpdateRequestDescription(requestDescription);
  };

  let visibility: boolean = false;
  const handleBackdrop = (flag) => {
    visibility = flag;
  };

  const handleSaveRequest = async () => {
    const x = await onSaveRequest(true);
    if (
      x.status === "error" &&
      x.message === "request is not a part of any workspace or collection"
    ) {
      visibility = true;
    } else if (x.status === "success") {
      notifications.success("Documentation updated");
      MixpanelEvent(Events.SAVE_API_DOCUMENTATION);
      onUpdateRequestState({
        isExposeEditDescription: !state.isExposeEditDescription,
      });
    }
    //////////////////////////

    // const id = componentData?.id;
    // const res = await collectionsMethods.saveApiRequest(componentData, true);
    // if (res) {
    //   collectionsMethods.setRequestSave(true, "description", id);
    //   notifications.success("Documentation updated");
    // }
  };

  let collectionCountArr = [];
  let currentCollection;
  const refreshCount = async () => {
    if (collectionCountArr && requestPath?.collectionId) {
      for (const collection of collectionCountArr) {
        if (collection._data.id === requestPath?.collectionId) {
          currentCollection = collection;
        }
      }
    }
    collectionName = "";
    folderName = "";
    if (requestPath?.folderId) {
      const folder = await readRequestOrFolderInCollection(
        requestPath.collectionId,
        requestPath.folderId,
      );
      folderName = "/" + folder?.name;
    }
    if (requestPath?.collectionId) {
      const collection = await readCollection(requestPath.collectionId);
      collectionName = "/" + collection?.name;
    }
  };
  $: {
    if (collections) {
      collectionCountArr = collections;
      refreshCount();
    }
  }
  // collections.subscribe(
  //   (value: CollectionDocument[]) =>
  //     if (value) {
  //     }
  //   },
  // );

  $: {
    if (requestPath?.collectionId) {
      refreshCount();
    }
  }

  onDestroy(() => {
    // collectionSubscribe.unsubscribe();
  });
</script>

<!-- comment for future use -->

<!-- {#if selectedTab.type === ItemType.WORKSPACE}
    <WorkspaceSidebar></WorkspaceSidebar>
  {/if} -->

<div class="d-flex">
  {#if state.requestExtensionNavigation === "description"}
    <div class="sidebar-content p-3 bg-backgroundLight">
      <div class="d-flex">
        <div>
          <!-- <ComboText
            value={requestMethod}
            comboContainerClassProp={"d-flex flex-start pb-2"}
            singleTextClassProp={"rounded d-flex align-items-center justify-content-center"}
            valueClassProp={`text-${getMethodStyle(requestMethod)}`}
          /> -->
        </div>
        <div style="width: calc(100% - 70px);">
          <p class="ellipsis mb-0" style="font-size:12px;">
            {name}
          </p>
          {#if !collectionName}
            <p class="ellipsis mb-0">
              <span class="text-textColor" style="font-size:12px;"
                >{"Unsaved"}</span
              >
            </p>
          {:else}
            <p class="ellipsis mb-0">
              <span class="text-textColor" style="font-size:12px;"
                >{collectionName || ""}</span
              ><span class="text-textColor" style="font-size:12px;"
                >{folderName || ""}</span
              >
            </p>
          {/if}
        </div>
      </div>
      <div>
        {#if state.isExposeEditDescription}
          <p
            class="description-field text-labelColor"
            on:click={() => {
              if (
                hasWorkpaceLevelPermission(
                  loggedUserRoleInWorkspace,
                  workspaceLevelPermissions.EDIT_API_DESC,
                )
              ) {
                // collectionsMethods.updateRequestState(
                //   !state.isSaveDescription,
                //   "isSaveDescription",
                // );
                onUpdateRequestState({
                  isExposeEditDescription: !state.isExposeEditDescription,
                });
              }
            }}
          >
            <img src={EditIcon} alt="" />
            Edit
          </p>
          {#if requestDescription?.length === 0}
            <small class="description-head"
              >Click edit button to add description.</small
            >
          {:else}
            <small class="description-head">{requestDescription}</small>
          {/if}
        {:else}
          <p
            class="description-field text-labelColor"
            on:click={handleSaveRequest}
          >
            <img src={SaveIcon} alt="save" />
            Save Changes
          </p>
          <textarea
            autofocus
            placeholder="Describe how to use this API request to your team. Simply start typing here."
            bind:value={requestDescription}
            on:input={handleInputValue}
            disabled={state.isExposeEditDescription}
            maxlength="1024"
            rows="10"
            class="p-1 api-description w-100"
          />
        {/if}
      </div>
    </div>
  {/if}
  <div class="sidebar-right">
    <div class="d-flex flex-column">
      <!-- comment for future use -->

      <!-- <Tooltip>
            <button class="bg-backgroundColor border-0 mb-4 mt-3">
              <img src={commetIcon} alt="" />
            </button>
          </Tooltip> -->
      <button
        class="bg-backgroundLight border-0 mb-4"
        on:click={() => {
          if (state.requestExtensionNavigation === "description") {
            // collectionsMethods.updateRequestState("", "additions");
            onUpdateRequestState({ requestExtensionNavigation: "" });
          } else {
            // collectionsMethods.updateRequestState("description", "additions");
            onUpdateRequestState({ requestExtensionNavigation: "description" });
          }
        }}
      >
        <BookIcon
          color={state.requestExtensionNavigation === "description"
            ? "#85C2FF"
            : "#8A9299"}
        />
      </button>
      <!-- comment for future use -->

      <!-- <Tooltip>
            <button class="bg-backgroundColor border-0">
              <img src={codeIcon} alt="" />
            </button>
          </Tooltip> -->
    </div>
  </div>
</div>

<!-- <Modal
  title={"Save Request"}
  type={"dark"}
  width={"55%"}
  zIndex={10000}
  isOpen={visibility}
  handleModalState={handleBackdrop}
>
  <SaveAsRequest
    onClick={handleBackdrop}
    onFinish={() => {
      onUpdateRequestState({
        isExposeEditDescription: !state.isExposeEditDescription,
      });
    }}
    {requestMethod}
    {requestUrl}
    {requestName}
    {requestDescription}
    {requestPath}
    {collections}
    {readCollection}
    {readWorkspace}
    {onSaveAsRequest}
    {onCreateFolder}
    {onCreateCollection}
    type="SAVE_DESCRIPTION"
  />
</Modal> -->

<style>
  .sidebar-right {
    width: 32px;
    border-left: 1px solid var(--border-color);
    border-top: 1px solid var(--border-color);
    background-color: var(--background-light);
    height: calc(100vh - 80px);
  }
  .sidebar-content {
    width: 250px;
    border-left: 1px solid var(--border-color);
    border-top: 1px solid var(--border-color);
    height: calc(100vh - 80px);
    overflow: hidden;
    overflow-y: auto;
  }
  .api-description {
    background-color: transparent;
    font-size: 12px;
    outline: none;
    caret-color: #85c2ff;
    resize: none;
    border-radius: 4px;
  }
  .api-description:focus {
    border: 1px solid #85c2ff;
  }
  .description-field {
    font-size: 12px;
  }
  .description-head {
    font-size: 12px;
    color: #cccccc;
  }
</style>
