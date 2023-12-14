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
  export let activeTab;
  export let collectionsMethods: CollectionsMethods;

  let componentData: NewTab;
  let description: string;
  let isSaveDescription: boolean;
  let additions: string;

  const tabSubscribe = activeTab.subscribe((event: NewTab) => {
    componentData = event;
    description = event?.description;
    isSaveDescription = event.property.request.state.isSaveDescription;
    additions = event.property.request.state.additions;
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
      {#if isSaveDescription}
        <p class="description-field text-labelColor"
        on:click={()=>{
          collectionsMethods.updateRequestState(!isSaveDescription,"isSaveDescription");
        }}
        >Edit</p>
        {#if description?.length === 0}
        <small class="description-head">Click edit button to add description.</small>
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
              collectionsMethods.updateRequestState(!isSaveDescription,"isSaveDescription");
            } else {
              visibility = true;
            }
          }}
        >
          Save Changes
        </p>
        <textarea
        autofocus
        placeholder="Describe how to use this API request to your team. Simply start typing here."
        bind:value={description}
        on:input={handleInputValue}
        disabled={isSaveDescription}
        maxlength="300"
        rows="10"
        class="p-1 api-description w-100 {isSaveDescription ? 'block-mode' : 'edit-mode'}"
      />
      {/if}
      
    </div>
  </div>
  {/if}
  <div class="sidebar-right bg-backgroundColor">
    <div class="d-flex flex-column">
      <!-- comment for future use -->

      <!-- <Tooltip>
          <button class="bg-backgroundColor border-0 mb-4 mt-3">
            <img src={commetIcon} alt="" />
          </button>
        </Tooltip> -->
        <button class="bg-backgroundColor border-0 mb-4" 
        on:click={()=>{
          if(additions === "description"){
            collectionsMethods.updateRequestState("","additions");
          }
          else{
            collectionsMethods.updateRequestState("description","additions");
          }
        }}
        >
        <BookIcon color={additions === "description"? '#85C2FF' :'#8A9299'} />
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
    onFinish={()=>{
      collectionsMethods.updateRequestState(!isSaveDescription,"isSaveDescription");
    }}
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
    font-size: 12px;
    outline: none;
    border: 1px solid #85C2FF;
    caret-color: #85C2FF;
    
  }
  .description-field{
    font-size: 12px;
  }
  .description-head{
    font-size: 12px;
    color: #CCCCCC;
  }

</style>
