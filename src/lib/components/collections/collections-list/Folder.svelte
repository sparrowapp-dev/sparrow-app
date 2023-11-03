<script lang="ts">
  import angleRight from "$lib/assets/angleRight.svg";
  import IconButton from "$lib/components/buttons/IconButton.svelte";
  import { currentWorkspace } from "$lib/store/workspace.store";
  import {
    insertCollectionDirectory,
    insertCollectionRequest,
  } from "$lib/services/collection";
  import FileExplorer from "./FileExplorer.svelte";
  import type { CreateDirectoryPostBody } from "$lib/utils/dto";
  import { getNextName } from "./collectionList";
  import { onDestroy } from "svelte";
  import { useCollectionTree } from "$lib/store/collection";
    import { ItemType } from "$lib/utils/enums/item-type.enum";
  const { insertNode, updateNodeId, insertHead } = useCollectionTree();
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
    let directory: CreateDirectoryPostBody = {
      name: getNextName(collection.items, "FOLDER", "New Folder"),
      description: "",
    };
    const currentDummyId = new Date() + "dummy";
    insertNode(
      JSON.parse(JSON.stringify(collectionList)),
      collection._id,
      ItemType.FOLDER,
      directory.name,
      currentDummyId,
    );
    const res = await insertCollectionDirectory(
      workspaceId,
      collection._id,
      directory,
    );
    if (res.isSuccessful) {
      updateNodeId(
        JSON.parse(JSON.stringify(collectionList)),
        currentDummyId,
        res.data.data.id
      );
    }
  };
  const handleAPIClick = async () => {
    const file: string = getNextName(
      collection.items,
      "REQUEST",
      "New Request",
    );
    const res = await insertCollectionRequest({
      collectionId: collection._id,
      workspaceId: workspaceId,
      items: {
        name: file,
        type: "REQUEST",
        request: {
          method: "GET",
        },
      },
    });
    if (res.isSuccessful) {
      insertNode(
        collection._id,
        "REQUEST",
        file,
        JSON.stringify(new Date()),
        "GET",
      );
    }
  };
  onDestroy(currentWorkspaceUnsubscribe);
</script>

<button
  on:click={() => {
    visibility = !visibility;
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
    <FileExplorer {collectionId} {currentWorkspaceId} explorer={exp} />
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
