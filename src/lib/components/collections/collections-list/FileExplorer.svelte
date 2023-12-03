<script lang="ts">
  import folder from "$lib/assets/folder.svg";
  import IconButton from "$lib/components/buttons/IconButton.svelte";
  import WorkspaceCard from "$lib/components/dashboard/workspace-card/WorkspaceCard.svelte";
  import { useCollectionTree } from "$lib/store/collection";
  import { insertCollectionRequest } from "$lib/services/collection";
  import File from "./File.svelte";
  import { getNextName } from "./collectionList";
  import { RequestDefault, RequestMethod } from "$lib/utils/enums/request.enum";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { v4 as uuidv4 } from "uuid";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { CollectionListViewModel } from "./CollectionList.ViewModel";
  import type { CreateApiRequestPostBody } from "$lib/utils/dto";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
    import Spinner from "$lib/components/Transition/Spinner.svelte";
  const { insertNode, updateNodeId } = useCollectionTree();
  let expand: boolean = false;
  export let explorer;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  export let folderId: string = "";
  export let folderName: string = "";
  export let collectionList;
  const _colllectionListViewModel = new CollectionListViewModel();
  export let collectionsMethods: CollectionsMethods;

  const handleAPIClick = async () => {
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
      
      collectionsMethods.handleCreateTab(sampleRequest);
      moveNavigation("right");
      return;
    }
  };
</script>

{#if explorer.type === "FOLDER"}
  <div>
    <div
      style="height:36px;"
      class="d-flex w-100 align-items-center justify-content-between"
      on:click={() => {
        if (!explorer.id.includes(UntrackedItems.UNTRACKED)) {
          expand = !expand;
        }
      }}
    >
    <div class="d-flex align-items-center">
      <img src={folder} alt="" style="height:16px; width:16px;" />
      <span
        style="padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;"
        >{explorer.name}</span
      >
    </div>
    {#if explorer.id.includes(UntrackedItems.UNTRACKED)}
      <Spinner size={"15px"}/>
    {/if}
    </div>
    <div
      style="padding-left: 15px; cursor:pointer; display: {expand
        ? 'block'
        : 'none'};"
    >
      {#each explorer.items as exp}
        <svelte:self
          folderId={explorer.id}
          folderName={explorer.name}
          explorer={exp}
          {collectionId}
          {currentWorkspaceId}
          {collectionsMethods}
        />
      {/each}
      <IconButton text={"+ API Request"} onClick={handleAPIClick} />
    </div>
  </div>
{:else}
  <div style="padding-left: 0; cursor:pointer;">
    <File
      api={explorer}
      {folderId}
      {folderName}
      {collectionsMethods}
      {collectionId}
      {currentWorkspaceId}
      name={explorer.name}
      id={explorer.id}
    />
  </div>
{/if}
