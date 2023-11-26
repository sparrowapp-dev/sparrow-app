<script lang="ts">
  import angleRight from "$lib/assets/angleRight.svg";
  import IconButton from "$lib/components/buttons/IconButton.svelte";
  import { currentWorkspace } from "$lib/store/workspace.store";
  import FileExplorer from "./FileExplorer.svelte";
  import type { CreateDirectoryPostBody } from "$lib/utils/dto";
  import { getNextName } from "./collectionList";
  import { onDestroy } from "svelte";
  import { useCollectionTree } from "$lib/store/collection";
    import { ItemType } from "$lib/utils/enums/item-type.enum";
    import { RequestDefault } from "$lib/utils/enums/request.enum";
    import { v4 as uuidv4 } from "uuid";
    import { CollectionViewModel } from "./Collection.ViewModel";
    import { createSampleRequest } from "$lib/utils/sample/request.sample";
    import { handleTabAddons } from "$lib/store/request-response-section";
    import { moveNavigation } from "$lib/utils/helpers/navigation";
  const { insertNode, updateNodeId, insertHead } = useCollectionTree();
  const _colllectionViewModel = new CollectionViewModel();
  let visibility = false;
  export let title: string;
  export let collection: any;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  let workspaceId: string = "";
  export let collectionList;
  
  const currentWorkspaceUnsubscribe = currentWorkspace.subscribe(
    (value: any) => {
      workspaceId = value.id;
    },
  );

  const handleFolderClick = async (): Promise<void> => {
    const folder = {
      id:uuidv4(),
      name: getNextName(collection.items, ItemType.FOLDER, "New Folder"),
      description: "",
      type:ItemType.FOLDER,
      items:[],
    };
    collection={...collection,"items":[...collection.items,folder]}
    _colllectionViewModel.addFolder(workspaceId,collection._id,{name:folder.name,description:folder.description});
  };
  
  const handleAPIClick = async () => {     
    const request=createSampleRequest(uuidv4());
    handleTabAddons(request);
    moveNavigation('right');
    collection={...collection,"items":[...collection.items,request]}

    const requestObj={
    collectionId:collection._id,
    workspaceId,
    items:{
      name:request.name,
      type:ItemType.REQUEST,
      request:{
        method:RequestDefault.METHOD
      }
    }
    
    
  };
  _colllectionViewModel.addRequest(requestObj);
}
  onDestroy(currentWorkspaceUnsubscribe);
</script>

<button
  on:click={() => {
     if(!collection._id.includes("MYUID45345")){
          visibility = !visibility;
      }
  }}
  style="height:36px;"
  class="btn btn-primary d-flex w-100 align-items-center justify-content-start border-0 py-1 ps-4"
>
  <img
    src={angleRight}
    style="height:14px; width:14px; margin-right:8px; {visibility
      ? 'transform:rotate(90deg);'
      : 'transform:rotate(0deg);'}"
    alt="angleRight"
  />
  <p class="mb-0" style="font-size: 14px;">{title}</p>
</button>
<div
  style="padding-left: 40px; cursor:pointer; display: {visibility
    ? 'block'
    : 'none'};"
>
  {#each collection.items as exp}
    <FileExplorer collectionList={collectionList} collectionId = {collectionId} currentWorkspaceId =  {currentWorkspaceId} explorer={exp} />
  {/each}
  <IconButton text={"+ Folder"} onClick={handleFolderClick} />
  <IconButton text={"+ API Request"} onClick={handleAPIClick} />
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
