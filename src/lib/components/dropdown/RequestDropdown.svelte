<script lang="ts">
  let visibilty = false;
  import plusIcon from "$lib/assets/plus.svg";
    import { moveNavigation } from "$lib/utils/helpers/navigation";
    import { generateSampleRequest } from "$lib/utils/sample/request.sample";
    import { v4 as uuidv4 } from "uuid";
   let container;
   import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
   
  export let handleCreateCollection
  export let collectionsMethods: CollectionsMethods;
  function onWindowClick(e) {
    if (container.contains(e.target) == false) {
      visibilty = false;
      changeBtnBackground();
    }
  }

  function changeBtnBackground(){
    document.getElementById("dropdown-btn-color").style.backgroundColor= visibilty?"#85C2FF":"#000000"
  }
  const addApiRequest=()=>{
        collectionsMethods.handleCreateTab(
          generateSampleRequest(
            "UNTRACKED-"+uuidv4(), new Date().toString(),));
        moveNavigation('right');
  }
  
</script>

<svelte:window on:click={onWindowClick} />
<div
  class="d-flex align-items-center justify-content-center"
  bind:this={container}
>
  <button id="dropdown-btn-color"
    class="dropdown dropdown-btn btn p-0 d-flex align-items-center justify-content-center"
    style="width: 32px; height:32px;"
    on:click={() => {
      visibilty = !visibilty;
      changeBtnBackground()
    }}
  >
    <img src={plusIcon} alt="plus" />
    {#if visibilty}
      <div class="dropdown-content">
        <button on:click={handleCreateCollection}>Collection</button>
        <button on:click={addApiRequest}>API Request</button>
      </div>
    {/if}
  </button>
</div>

<style>
  .dropdown {
    position: relative;
    display: inline-block;
  }
  .dropdown-content {
    position: absolute;
    top: 25px;
    right: 0px;
    background-color: #f1f1f1;
    overflow: auto;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  .dropdown-content button {
    display: block;
    font-size: 12px;
    font-weight: 400;
    background-color: var(--blackColor);
    color:var(--white-color);
    border: 1px solid rgb(44, 44, 44);
    padding: 8px;
    padding-left: 8px;
    width: 150px;
    text-align: left;
  }
  .dropdown-content > button:hover {
    background-color: #232424;
  }
  #dropdown-btn-color{
    background-color: var(--blackColor);
  }
</style>
