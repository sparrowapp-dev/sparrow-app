<script lang="ts">
  import commetIcon from "$lib/assets/comment-fill.svg";
  import codeIcon from "$lib/assets/code.svg";
  import BookIcon from "$lib/assets/book.svelte";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import MethodButton from "$lib/components/buttons/MethodButton.svelte";
  import { onDestroy } from "svelte";
  import SaveRequest from "./sub-components/save-request/SaveRequest.svelte";
  import type { RequestBody } from "$lib/utils/interfaces/request.interface";
  import { updateCollectionRequest } from "$lib/services/collection";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import SaveIcon from "$lib/assets/save-desc.svg";
  import EditIcon from "$lib/assets/edit-desc.svg";
  import { notifications } from "$lib/utils/notifications";
  export let activeTab;
  export let collectionsMethods: CollectionsMethods;

  let componentData: NewTab;
  let description: string;
  let isSaveDescription: boolean;
  let additions: string;
  let collectionName: string;
  let folderName;

  const tabSubscribe = activeTab.subscribe(async (event: NewTab) => {
    collectionName = "";
    folderName = "";
    componentData = event;
    description = event?.description;
    isSaveDescription = event?.property?.request?.state?.isSaveDescription;
    additions = event?.property?.request?.state?.additions;
    const path = event?.path;
    if (path?.folderId) {
      const folder = await collectionsMethods.readRequestOrFolderInCollection(
        path.collectionId,
        path.folderId,
      );
      folderName = "/" + folder?.name;
    }
    if (path?.collectionId) {
      const collection = await collectionsMethods.readCollection(
        path.collectionId,
      );
      collectionName = "/" + collection?.name;
    }
  });

  let handleInputValue = () => {
    collectionsMethods.updateTab(description, "description", componentData.id);
  };

  let visibility: boolean = false;
  const handleBackdrop = (flag) => {
    visibility = flag;
  };

  const handleSaveRequest = async () => {
    const _id = componentData?.id;
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
    const expectedRequest: RequestBody = {
      method: existingRequest?.request.method,
      url: existingRequest?.request.url,
      body: existingRequest?.request.body,
      headers: existingRequest?.request.headers,
      queryParams: existingRequest?.request.queryParams,
    };

    if (!folderId) {
      let res = await updateCollectionRequest(_id, {
        collectionId: collectionId,
        workspaceId: workspaceId,
        items: {
          id: existingRequest?.id,
          name: existingRequest?.name,
          description,
          type: existingRequest?.type,
          request: expectedRequest,
        },
      });
      if (res.isSuccessful) {
        collectionsMethods.updateRequestOrFolderInCollection(
          collectionId,
          _id,
          res.data.data,
        );
        collectionsMethods.setRequestSave(true, "description", _id);
        notifications.success("Documentation updated");
      } else {
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
            id: existingRequest?.id,
            name: existingRequest?.name,
            description,
            type: existingRequest?.type,
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
        collectionsMethods.setRequestSave(true, "description", _id);
        notifications.success("Documentation updated");
      } else {
      }
    }
  };

  onDestroy(() => {
    tabSubscribe();
  });
</script>

<!-- comment for future use -->

<!-- {#if selectedTab.type === ItemType.WORKSPACE}
  <WorkspaceSidebar></WorkspaceSidebar>
{/if} -->

<div class="d-flex">
  {#if additions === "description"}
    <div class="sidebar-content p-3 bg-backgroundLight">
      <div class="d-flex">
        <div>
          <MethodButton method={componentData?.property.request.method} />
        </div>
        <div style="width: calc(100% - 70px);">
          <p class="ellipsis mb-0" style="font-size:12px;">
            {componentData?.name}
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
        {#if isSaveDescription}
          <p
            class="description-field text-labelColor"
            on:click={() => {
              collectionsMethods.updateRequestState(
                !isSaveDescription,
                "isSaveDescription",
              );
            }}
          >
            <img src={EditIcon} alt="" />
            Edit
          </p>
          {#if description?.length === 0}
            <small class="description-head"
              >Click edit button to add description.</small
            >
          {:else}
            <small class="description-head">{description}</small>
          {/if}
        {:else}
          <p
            class="description-field text-labelColor"
            on:click={() => {
              if (
                componentData?.path.collectionId &&
                componentData?.path.workspaceId
              ) {
                handleSaveRequest();
                collectionsMethods.updateRequestState(
                  !isSaveDescription,
                  "isSaveDescription",
                );
              } else {
                visibility = true;
              }
            }}
          >
            <img src={SaveIcon} alt="save" />
            Save Changes
          </p>
          <textarea
            autofocus
            placeholder="Describe how to use this API request to your team. Simply start typing here."
            bind:value={description}
            on:input={handleInputValue}
            disabled={isSaveDescription}
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
          if (additions === "description") {
            collectionsMethods.updateRequestState("", "additions");
          } else {
            collectionsMethods.updateRequestState("description", "additions");
          }
        }}
      >
        <BookIcon color={additions === "description" ? "#85C2FF" : "#8A9299"} />
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

{#if visibility}
  <SaveRequest
    {collectionsMethods}
    {componentData}
    onClick={handleBackdrop}
    onFinish={() => {
      collectionsMethods.updateRequestState(
        !isSaveDescription,
        "isSaveDescription",
      );
    }}
    type="SAVE_DESCRIPTION"
  />
{/if}

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
