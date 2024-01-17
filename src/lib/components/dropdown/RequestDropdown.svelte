<script lang="ts">
  let visibilty = false;
  import plusIcon from "$lib/assets/plus.svg";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import { v4 as uuidv4 } from "uuid";
  let container;
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import { isApiCreatedFirstTime } from "$lib/store/request-response-section";
  import { slide } from "svelte/transition";
  import Spinner from "../Transition/Spinner.svelte";
  import ImportCollection from "../collections/collections-list/ImportCollection.svelte";
  import { createCollectionSource } from "$lib/store/event-source.store";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";

  export let handleCreateCollection;
  export let currentWorkspaceId;
  export let collectionUnderCreation: boolean = false;
  export let collectionsMethods: CollectionsMethods;

  let isImportCollectionPopup: boolean = false;
  const handleImportCollectionPopup = (flag) => {
    createCollectionSource.set("AddIcon");
    isImportCollectionPopup = flag;
  };

  function onWindowClick(e) {
    if (container.contains(e.target) == false) {
      visibilty = false;
      changeBtnBackground();
    }
  }

  function changeBtnBackground() {
    document.getElementById("dropdown-btn-color").style.backgroundColor =
      visibilty ? "#85C2FF" : "#000000";
  }
  const addApiRequest = () => {
    isApiCreatedFirstTime.set(true);
    collectionsMethods.handleCreateTab(
      generateSampleRequest("UNTRACKED-" + uuidv4(), new Date().toString()),
    );
    moveNavigation("right");
    MixpanelEvent(Events.ADD_NEW_API_REQUEST, { source: "Side Panel TopBar" });
  };
</script>

<svelte:window on:click={onWindowClick} />

{#if isImportCollectionPopup}
  <ImportCollection
    onClick={handleImportCollectionPopup}
    {handleCreateCollection}
    {currentWorkspaceId}
    {collectionsMethods}
  />
{/if}

<div
  class="d-flex align-items-center justify-content-center"
  bind:this={container}
>
  <button
    id="dropdown-btn-color"
    class="dropdown dropdown-btn btn p-0 d-flex align-items-center justify-content-center bg-backgroundDark {visibilty
      ? 'drop-active'
      : ''}"
    style="width: 32px; height:32px;"
    on:click={() => {
      visibilty = !visibilty;
      changeBtnBackground();
    }}
  >
    {#if collectionUnderCreation}
      <Spinner size={"15px"} />
    {/if}
    {#if !collectionUnderCreation}
      <img src={plusIcon} alt="plus" />
    {/if}

    {#if visibilty}
      <div class="dropdown-content" transition:slide={{ duration: 100 }}>
        <button
          on:click={() => {
            handleImportCollectionPopup(true);
          }}>Collection</button
        >
        <button on:click={addApiRequest}>API Request</button>
      </div>
    {/if}
  </button>
</div>

<style>
  .dropdown {
    position: relative;
    display: inline-block;
    /* border: 1px solid var(--border-color) !important; */
  }
  .dropdown-content {
    position: absolute;
    top: 32px;
    right: 0px;
    background-color: #f1f1f1;
    overflow: auto;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 5;
  }

  .dropdown-content button {
    display: block;
    font-size: 12px;
    font-weight: 400;
    background-color: var(--blackColor);
    color: var(--white-color);
    border: 1px solid rgb(44, 44, 44);
    padding: 8px;
    padding-left: 8px;
    width: 150px;
    text-align: left;
  }
  .dropdown-content > button:hover {
    background-color: #232424;
  }
  .drop-active {
    background-color: var(--send-button) !important;
  }
</style>
