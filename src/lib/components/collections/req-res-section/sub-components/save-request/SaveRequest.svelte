<script lang="ts">
    export let visibility : boolean = true;
    import Collection from "$lib/components/file-types/collection/Collection.svelte";
    import Folder from "$lib/components/file-types/folder/Folder.svelte";
    import Request from "$lib/components/file-types/request/Request.svelte";
    import {
    collectionList,
    setCollectionList
  } from "$lib/store/collection";
    import { loginSchema } from "$lib/utils/validation";
    import { onDestroy, onMount } from "svelte";
    import { currentWorkspace } from "$lib/store/workspace.store";
    import {ItemType} from "$lib/utils/enums/item-type.enum";
  let collection: any;
  let directory: any = [];
  let path: any = [];
  let request: any;
  const collectionListUnsubscribe =  collectionList.subscribe((value) => {
    collection = value;
    directory = JSON.parse(JSON.stringify(collection));
  });

  let helper =  (tree, id, path) =>{
    if (tree._id === id || tree.id === id) {
        path.push({name: tree.name, id: tree._id ? tree._id : tree.id,
            type: tree.type ? tree.type : ItemType.COLLECTION}); 
        return {
            items : tree.items,
            path
        };
    }
    // Recursively search through the tree structure
    if (tree && tree.items) {
        for (let j = 0; j < tree.items.length; j++) {
            path.push(
                {
                    name: tree.name, 
                    id: tree._id ? tree._id : tree.id,
                    type: tree.type ? tree.type : ItemType.COLLECTION
                }); // Recursive backtracking
            let data = helper( tree.items[j], id, path) 
             if(data){
                return data; 
             }
            path.pop();
        }
    }
    return 0;
  }

  const searchTreeDocument = (tree, id) => {
    for (let i = 0; i < tree.length; i++) {
      const path = [];
      let data = helper(
        tree[i],
        id, path
      );
      if(data) return data;
    }
  }
  let workspace;
  const currentWorkspaceUnsubscribe = currentWorkspace.subscribe((value) => {
    if(value.id !== ""){
        workspace = value
    }
  });
  onDestroy(collectionListUnsubscribe);
  onDestroy(currentWorkspaceUnsubscribe)
</script>
<div class="save-request-backdrop {visibility ? 'd-block' : 'd-none'}"></div>

<div class="save-request">
    <div class="contain">
        <div class="row">
            <h4>Save Request</h4>
        </div>
        <div class="row">
            <div class="col-6">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span on:click={()=>{
                    directory = JSON.parse(JSON.stringify(collection));
                    path = [];
                }}>{workspace.name}</span>
                {#if path.length > 0}
                {#each path as elem}
                <span on:click={()=>{
                    let response = searchTreeDocument(collection, elem.id);
                    directory = response.items;
                    path = response.path;
                }}>/{elem.name}</span> 
                {/each}
                {/if}
                <hr/>
                {#if directory.length > 0}
                    {#each directory as col}
                        {#if col.type === ItemType.FOLDER}
                            <div on:click={()=>{
                                let response = searchTreeDocument(collection, col._id ? col._id : col.id);
                                directory = response.items;
                                path = response.path;
                            }}>
                                <Folder name = {col.name} />
                            </div>
                        {:else if col.type === ItemType.REQUEST}
                            <Request name = {col.name} method={col.request.method}/>
                        {:else} 
                            <div on:click={()=>{
                                let response = searchTreeDocument(collection, col._id ? col._id : col.id);
                                directory = response.items;
                                path = response.path;
                            }}>
                                <Collection name = {col.name} />
                            </div>
                        {/if}
                    {/each}
                {/if}
            </div>
            <div class="col-6">
                <div>Right panel</div>
            </div>
        </div>
    </div>
</div>

<style>
    .save-request-backdrop{
        position: fixed;
        top: 44px;
        left:0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.7);
        z-index: 9999999999999999999;
    }
    .save-request{
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        padding: 24px;
        background-color: var(--background-color);
        width: 960px;
        height: 640px;
        z-index: 99999999999999999999;
    }
</style>

