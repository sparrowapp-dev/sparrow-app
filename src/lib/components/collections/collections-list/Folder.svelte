<script lang="ts">
  import angleRight from "$lib/assets/angleRight.svg";
  import IconButton from "$lib/components/buttons/IconButton.svelte";
  import FileExplorer from "./FileExplorer.svelte";
  import { getNextName } from "./collectionList";
  import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { RequestDefault } from "$lib/utils/enums/request.enum";
  import { v4 as uuidv4 } from "uuid";
  import { CollectionListViewModel } from "./CollectionList.ViewModel";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";

  export let title: string;
  export let collection: any;
  export let collectionId: string;
  export let currentWorkspaceId: string;
  export let collectionList;
  export let collectionsMethods: CollectionsMethods;

  const _colllectionListViewModel = new CollectionListViewModel();
  let visibility = false;

  const handleFolderClick = async (): Promise<void> => {

    const folder = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: getNextName(collection.items, ItemType.FOLDER, "New Folder"),
      description: "",
      type: ItemType.FOLDER,
      items: [],
    };
    
    collectionsMethods.addRequestOrFolderInCollection(collectionId, folder);

    const response = await _colllectionListViewModel.addFolder(currentWorkspaceId, collectionId, {
      name: folder.name,
      description: folder.description,
    });

    if (response.isSuccessful && response.data.data) {
      const folderObj = response.data.data;
      collectionsMethods.updateRequestOrFolderInCollection(collectionId, folder.id, folderObj );
      return;
    }
  };

  const handleAPIClick = async () => {
    const request = generateSampleRequest(
      "UNTRACKED-" + uuidv4(),
      new Date().toString(),
    );
    collectionsMethods.handleCreateTab(request);
    moveNavigation("right");
    collection = { ...collection, items: [...collection.items, request] };

    const requestObj = {
      collectionId: collection._id,
      currentWorkspaceId,
      items: {
        name: request.name,
        type: ItemType.REQUEST,
        request: {
          method: RequestDefault.METHOD,
        },
      },
    };
    _colllectionListViewModel.addRequest(requestObj);
  };
</script>

<button
  on:click={() => {
    if (!collection._id.includes(UntrackedItems.UNTRACKED)) {
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
    <FileExplorer
      {collectionsMethods}
      {collectionList}
      {collectionId}
      {currentWorkspaceId}
      explorer={exp}
    />
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
