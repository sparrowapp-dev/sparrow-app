<script lang="ts">
  import whitePlus from "$lib/assets/plus-white.svg";
  import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { v4 as uuidv4 } from "uuid";
  import ImportCollection from "./ImportCollection.svelte";
  import { createCollectionSource } from "$lib/store/event-source.store";
  export let handleCreateCollection: any;
  export let collectionsMethods: CollectionsMethods;
  export let currentWorkspaceId;

  let isImportCollectionPopup: boolean = false;
  const handleImportCollectionPopup = (flag) => {
    createCollectionSource.set("SidePanel");
    isImportCollectionPopup = flag;
  };

  export let showDefault: boolean;
  const addApiRequest = () => {
    collectionsMethods.handleCreateTab(
      generateSampleRequest(
        UntrackedItems.UNTRACKED + uuidv4(),
        new Date().toString(),
      ),
    );
    moveNavigation("right");
  };
</script>

{#if isImportCollectionPopup}
  <ImportCollection
    onClick={handleImportCollectionPopup}
    {handleCreateCollection}
    {currentWorkspaceId}
    {collectionsMethods}
  />
{/if}

{#if showDefault}
  <div
    class="container-fluid row d-flex flex-column align-items-center ps-4 pe-3 pt-3"
  >
    <p
      style="font-size: 14px;
font-weight: 300;"
    >
      Add Collections to your Workspace to group your requests or send an API
      request directly
    </p>
    <div class="d-flex flex-column gap-3 w-100 mt-3 align-items-center">
      <button
        class="buttons d-flex justify-content-center align-items-center gap-1"
        on:click={() => {
          handleImportCollectionPopup(true);
        }}
      >
        <img src={whitePlus} alt="+" />Collection
      </button>
      <button class="buttons" on:click={addApiRequest}>
        <img src={whitePlus} alt="+" />
        API Request</button
      >
    </div>
  </div>
{/if}

<style>
  .buttons {
    width: 180px;
    height: 32px;
    padding: 4px, 12px, 4px, 4px;
    border-radius: 4px;
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
    border: none;
  }
</style>
