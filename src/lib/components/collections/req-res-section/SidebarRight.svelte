<script lang="ts">
  import commetIcon from "$lib/assets/comment-fill.svg";
  import codeIcon from "$lib/assets/code.svg";
  import bookIcon from "$lib/assets/book.svg";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import MethodButton from "$lib/components/buttons/MethodButton.svelte";
  import { onDestroy } from "svelte";
  import SaveRequest from "./sub-components/save-request/SaveRequest.svelte";
  import type { RequestBody } from "$lib/utils/interfaces/request.interface";
  import { updateCollectionRequest } from "$lib/services/collection";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  export let activeTab;
  export let collectionsMethods;

  let componentData: NewTab;
  let description: string;

  const tabSubscribe = activeTab.subscribe((event: NewTab) => {
    componentData = event;
    description = event?.description;
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
  <div class="sidebar-content p-3 bg-backgroundColor">
    <div class="d-flex">
      <div>
        <MethodButton method={componentData?.property.request.method} />
      </div>
      <div>
        <p>{componentData?.name}</p>
      </div>
    </div>
    <div>
      <p
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
        Save Changes
      </p>
      <textarea
        placeholder="Enter API Description"
        bind:value={description}
        on:input={handleInputValue}
        class="api-description w-100"
      />
    </div>
  </div>

  <div class="sidebar-right bg-backgroundColor">
    <div class="d-flex flex-column">
      <!-- comment for future use -->

      <!-- <Tooltip>
          <button class="bg-backgroundColor border-0 mb-4 mt-3">
            <img src={commetIcon} alt="" />
          </button>
        </Tooltip> -->
      <Tooltip>
        <button class="bg-backgroundColor border-0 mb-4">
          <img src={bookIcon} alt="" />
        </button>
      </Tooltip>
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
    type="SAVE_DESCRIPTION"
  />
{/if}

<style>
  .sidebar-right {
    width: 32px;
    border-left: 1px solid var(--border-color);
    height: calc(100vh - 80px);
  }
  .sidebar-content {
    width: 320px;
    border-left: 1px solid var(--border-color);
    height: calc(100vh - 80px);
  }
  .api-description {
    background-color: transparent;
  }
</style>
