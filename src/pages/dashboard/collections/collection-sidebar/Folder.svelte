<script lang="ts">
    import angleRight from "$lib/assets/angleRight.svg";
    import IconButton from "$lib/components/buttons/IconButton.svelte";
    import {currentWorkspaceId, setCollectionList} from '$lib/store/collection';
    import { insertCollectionDirectory, fetchCollection } from '$lib/services/collection';
    import FileExplorer from "./FileExplorer.svelte";
    let visibility = true;
    export let title:string;
    export let collection:any;
   
    let workspaceId;
    currentWorkspaceId.subscribe((value)=>{
      workspaceId = value;
    });
    
    let getCollectionData = async (id: string)=>{
      const res = await fetchCollection(id);
      if(res.isSuccessful){
        setCollectionList(res.data.data);
      }
    }

    const getFolderName = ()=>{
      let folderAvailable = true;
      collection.items.forEach(element => {
        if(element.type === "FOLDER" && element.name === "New Folder"){
          folderAvailable = false;
        }
      });
      if(folderAvailable) return `New Folder`;
      for(let i = 2; i < collection.items.length + 10; i++){
        folderAvailable = true;
        collection.items.forEach(element => {
          if(element.type === "FOLDER" && element.name === `New Folder${i}`){
            folderAvailable = false;
          }
        });
        if(folderAvailable) return `New Folder${i}`;
      }
      return null;
    }
    
    const handleFolderClick = async ()=>{
      let folder = getFolderName();
      const res = await insertCollectionDirectory(workspaceId, collection._id, folder);
      if(res.isSuccessful){
            getCollectionData(workspaceId);
      }
    }
    const handleAPIClick = ()=>{
    }

</script>

<button on:click={()=>{visibility = !visibility}} style="height:36px;" class="btn btn-primary d-flex w-100 align-items-center justify-content-start border-0 py-1 ps-4">
    <img src={angleRight} style="height:14px; width:14px; margin-right:8px; {visibility ? 'transform:rotate(90deg);' :'transform:rotate(0deg);'}" alt="angleRight" />
    <p class="mb-0" style="font-size: 14px;">{title}</p>
</button>
<div style="padding-left: 40px; cursor:pointer; display: {visibility ? 'block' : 'none'};">
  {#each collection.items as exp}
  <FileExplorer explorer={exp} />
  {/each}
  <IconButton text = {"+ Folder"} onClick= {handleFolderClick} />
  <IconButton text = {"+ API Request"} onClick= {handleAPIClick} />
</div>

<style>
    .btn-primary {
    background-color: #1e1e1e;
    color: #fff;
  }

  .btn-primary:hover {
    background-color: #232527;
    color: #fff;
    padding: 20px;
  }
</style>