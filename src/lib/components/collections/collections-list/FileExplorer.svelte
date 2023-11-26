<script lang="ts">
    import folder from "$lib/assets/folder.svg";
    import IconButton from "$lib/components/buttons/IconButton.svelte";
    import WorkspaceCard from "$lib/components/dashboard/workspace-card/WorkspaceCard.svelte";
    import { useCollectionTree } from "$lib/store/collection";
    import { insertCollectionRequest } from "$lib/services/collection";
    import File from "./File.svelte";
    import { getNextName } from "./collectionList";
    import { RequestDefault, RequestMethod } from "$lib/utils/enums/request.enum";
    import { ItemType } from "$lib/utils/enums/item-type.enum";
    import { v4 as uuidv4 } from "uuid";
    import { createSampleRequest } from "$lib/utils/sample/request.sample";
    import { handleTabAddons } from "$lib/store/request-response-section";
    import { moveNavigation } from "$lib/utils/helpers/navigation";
    import { CollectionViewModel } from "./Collection.ViewModel";
    import type { CreateApiRequestPostBody } from "$lib/utils/dto";
    const { insertNode, updateNodeId } = useCollectionTree();
    let expand : boolean = false;
    export let explorer;
    export let collectionId :string;
    export let currentWorkspaceId : string;
    export let folderId : string = "";
    export let folderName : string = "";
    export let collectionList;
    const _colllectionViewModel = new CollectionViewModel();
    const handleAPIClick = async () =>{
    const request=createSampleRequest(uuidv4());
    handleTabAddons(request);
    moveNavigation('right');
    explorer={...explorer,"items":[...explorer.items,request]}


    const requestObj:CreateApiRequestPostBody={
      collectionId: collectionId,
      workspaceId: currentWorkspaceId,
        folderId: explorer.id,
        items: {
          name: explorer.name,
          type: ItemType.FOLDER,
          items:{
            name: request.name,
            type: ItemType.REQUEST,
            request: {
              method: RequestDefault.METHOD
            }
          }
        }
    
    
  };
  _colllectionViewModel.addRequestInFolderInCollection(requestObj);
    }
</script>
{#if explorer.type === "FOLDER"}
    <div>
      <div style="height:36px;" class="d-flex align-items-center" on:click={() => {
        if(!explorer.id.includes("MYUID45345")){
          expand = !expand;
        }
        
        }}>
        <img src={folder} alt="" style="height:16px; width:16px;">
        <span style="padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;">{explorer.name}</span>
      </div>
      <div style="padding-left: 15px; cursor:pointer; display: {expand ? 'block' : 'none'};">
        {#each explorer.items as exp}
          <svelte:self folderId = {explorer.id} folderName={explorer.name} explorer={exp} collectionId={collectionId} currentWorkspaceId={currentWorkspaceId} />
        {/each}
        <IconButton text = {"+ API Request"} onClick= {handleAPIClick} />
      </div>
    </div>
{:else}
    <div style="padding-left: 0; cursor:pointer;">
      <File api = {explorer} folderId = {folderId} folderName={folderName} collectionId={collectionId} currentWorkspaceId={currentWorkspaceId} name={explorer.name} id={explorer.id}/>
    </div>
{/if}