<script lang="ts">
    import doubleangleLeft from "$lib/assets/doubleangleLeft.svg";
    import searchIcon from "$lib/assets/search.svg";
    import filterIcon from "$lib/assets/filter.svg";
    import plusIcon from "$lib/assets/plus.svg";
    import Folder from "./Folder.svelte";
    import {fetchCollection} from "$lib/services/collection";
    import {collectionList, currentWorkspaceId} from '$lib/store/collection';

    let collection:any;

    let getCollectionData = async (id: string)=>{
      const res = await fetchCollection(id);
      if(res.isSuccessful){
        collectionList.set(res.data.data);
      }
    }

    collectionList.subscribe((value) => {
      collection = value;
    });
    currentWorkspaceId.subscribe((value) => {
        getCollectionData(value);
    }); 

</script>

<div
  style="width: 280px; height: calc(100vh - 50px); overflow:auto; border-right: 1px solid #313233;padding:0px, 24px, 8px, 8px "
  class="d-flex flex-column bg-backgroundColor"
>
  <div
    class="d-flex justify-content-between align-items-center align-self-stretch ps-3 pe-3 pt-3"
  >
    <p class="mb-0 text-whiteColor" style="font-size: 18px;">Domigo</p>
    <button class="bg-backgroundColor border-0">
      <img src={doubleangleLeft} alt="" />
    </button>
  </div>
  <div
    class="d-flex align-items-center justify-content-between ps-3 pe-3 pt-3 gap-0"
  >
    <div
      style="height:32px; width:180px "
      class="inputField bg-blackColor ps-2 pe-1 gap-2 d-flex align-items-center justify-content-center rounded"
    >
      <img src={searchIcon} alt="" />
      <input
        type="search"
        class="inputField border-0 w-100 h-100 bg-blackColor"
        placeholder="Search APIs in Domigo"
      />
    </div>

    <div class="d-flex align-items-center justify-content-center">
      <button
        class="btn btn-blackColor d-flex align-items-center justify-content-center"
        style="width: 32px; height:32px;"
      >
        <img src={filterIcon} alt="" />
      </button>
    </div>
    <div class="d-flex align-items-center justify-content-center">
      <button
        class="btn btn-plusButton py-0 d-flex align-items-center justify-content-center"
        style="width: 32px; height:32px;"
      >
        <img src={plusIcon} alt="" />
      </button>
    </div>
  </div>

  <div class="d-flex flex-column pt-3">
    <div class="d-flex flex-column justify-content-center">
      {#each collection as col}
          <Folder collectionId={col._id} title={col.name}/>
      {/each}
    </div>
  </div>
</div>

<style>
  .inputField {
    outline: none;
  }
</style>
