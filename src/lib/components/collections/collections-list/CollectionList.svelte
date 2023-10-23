<script lang="ts">
  import doubleangleLeft from "$lib/assets/doubleangleLeft.svg";
  import doubleangleRight from "$lib/assets/doubleangleRight.svg";

  import searchIcon from "$lib/assets/search.svg";
  import filterIcon from "$lib/assets/filter.svg";
  import plusIcon from "$lib/assets/plus.svg";
  import Folder from "./Folder.svelte";
  import { fetchCollection } from "$lib/services/collection";
  import {
    collectionList,
    setCollectionList,
    currentWorkspaceId,
  } from "$lib/store/collection";

  import { collapsibleState } from "$lib/store/requestSection"; // Adjust the import path as needed

  let collection: any;

  let getCollectionData = async (id: string) => {
    const res = await fetchCollection(id);
    if (res.isSuccessful) {
      setCollectionList(res.data.data);
    }
  };

  collectionList.subscribe((value) => {
    collection = value;
  });
  currentWorkspaceId.subscribe((value) => {
    getCollectionData(value);
  });

  //this is for expand and collaps
  let collapsExpandToggle = false;

  collapsibleState.subscribe((value) => {
    collapsExpandToggle = value;
  });

  const setcollapsExpandToggle = () => {
    collapsExpandToggle = !collapsExpandToggle;
    collapsibleState.set(collapsExpandToggle);
  };
  console.log(collapsibleState);
</script>

<!-- //this will show only when button will be collaps -->
{#if collapsExpandToggle}
  <div>
    <button
      class="bg-blackColor border-0 rounded pb-3 pe-1"
      style="display: {collapsExpandToggle
        ? 'block'
        : 'none'};position: absolute;left:72px;top: 100px;width:16px;height:86px;z-index:{collapsExpandToggle
        ? '2'
        : '0'}"
      on:click={setcollapsExpandToggle}
    >
      <img src={doubleangleRight} alt="Expand" class="mb-4 mt-2" />
      <div style="transform: rotate(270deg);font-size:10px;" class="mt-3 mb-2">
        Collections
      </div>
    </button>
  </div>
{/if}

<div
  style="width:{collapsExpandToggle
    ? '0px'
    : '280px'};border-right: {collapsExpandToggle
    ? '0px'
    : '1px solid #313233'};"
  class="sidebar d-flex flex-column bg-backgroundColor"
>
  <div
    class="d-flex justify-content-between align-items-center align-self-stretch ps-3 pe-3 pt-3"
  >
    <p class="mb-0 text-whiteColor" style="font-size: 18px;">Domigo</p>
    <button
      class="bg-backgroundColor border-0"
      on:click={setcollapsExpandToggle}
    >
      <img src={doubleangleLeft} alt="" />
    </button>
  </div>
  <div
    class="d-flex align-items-center justify-content-between ps-3 pe-3 pt-3 gap-2"
  >
    <div
      style="height:32px; width:180px "
      class="inputField bg-blackColor ps-2 pe-1 gap-2 d-flex align-items-center justify-content-center rounded"
    >
      <img src={searchIcon} alt="" />
      <input
        type="search"
        style="  font-size: 12px;font-weight:500;"
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
        class="btn btn-blackColor p-0 d-flex align-items-center justify-content-center"
        style="width: 32px; height:32px;"
      >
        <img src={plusIcon} alt="" />
      </button>
    </div>
  </div>

  <div class="d-flex flex-column pt-3">
    <div class="d-flex flex-column justify-content-center">
      {#each collection as col}
        <Folder collection={col} title={col.name} />
      {/each}
    </div>
  </div>
</div>

<style>
  .sidebar {
    position: fixed;
    top: 50px;
    left: 72px;
    height: calc(100vh - 50px);
  }
  .inputField {
    outline: none;
  }
</style>
