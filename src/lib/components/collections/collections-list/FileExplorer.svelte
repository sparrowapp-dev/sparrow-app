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
    const { insertNode, updateNodeId } = useCollectionTree();
    let expand : boolean = false;
    export let explorer;
    export let collectionId :string;
    export let currentWorkspaceId : string;
    export let folderId : string = "";
    export let folderName : string = "";
    export let collectionList;
    const handleAPIClick = async () =>{
      const name: string = getNextName(explorer.items, ItemType.REQUEST, RequestDefault.NAME);
      const currentDummyId : string = uuidv4() + "MYUID45345";
      insertNode(
        JSON.parse(JSON.stringify(collectionList)),
        explorer.id, ItemType.REQUEST, 
        name, 
        currentDummyId ,
        RequestDefault.METHOD);
      
        const res = await insertCollectionRequest({
        collectionId: collectionId,
        workspaceId: currentWorkspaceId,
        folderId: explorer.id,
        items: {
          name: explorer.name,
          type: ItemType.FOLDER,
          items:{
            name: name,
            type: ItemType.REQUEST,
            request: {
              method: RequestDefault.METHOD
            }
          }
        }
      });
      if(res.isSuccessful){
        updateNodeId(JSON.parse(
          JSON.stringify(collectionList)),
          currentDummyId,
          new Date() + "uid"); // MOCKED DATA [UPDATION REQUIRED HERE]
      } 
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
      <File folderId = {folderId} folderName={folderName} collectionId={collectionId} currentWorkspaceId={currentWorkspaceId} name={explorer.name} id={explorer.id} method={explorer.request.method} />
    </div>
{/if}