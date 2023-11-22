<script lang="ts">
  import plusIcon from "$lib/assets/actionicon-normal.svg";
  import angleLeft from "$lib/assets/angleLeft.svg";
  import angleRight from "$lib/assets/angle-right.svg";
  import {
    collapsibleState,
  } from "$lib/store/request-response-section";
  import Tab from "./Tab.svelte";
  import { v4 as uuidv4 } from "uuid";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import { generateSampleRequest } from "$lib/utils/sample/request.sample";
  import type { TabDocument } from "$lib/database/app.database";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";

  export let collectionsMethods: CollectionsMethods;
  export let tabList: TabDocument[];
  
  $: {
    if (tabList) {
      if (tabList.length >= 0 && tabList.length <= 5) {
        tabWidth = 196;
      } else if (tabList.length >= 6 && tabList.length <= 10) {
        tabWidth = 140;
      } else {
        tabWidth = 100;
      }
    }
  }

  let tabWidth: number = 196;
  let scrollerParent: number;
  let scrollerWidth: number;

</script>

<div class="">
  <div
    style="border-top: 1px solid #313233;width:{$collapsibleState ? '100%' : '100%'}"
    class="tabbar bg-blackColor d-flex bg-backgroundColor;"
    bind:offsetWidth={scrollerParent}
  >
    {#if scrollerParent <= scrollerWidth + 105}
      <div class="d-inline-block" style="height:35px; width:35px;">
        <button
          class=" btn border-0 ps-1 pe-1 py-0 h-100 w-100"
          on:click={() => {
            moveNavigation("left");
          }}
        >
          <img src={angleLeft} alt="" />
        </button>
      </div>
    {/if}
    <div
      class=" d-inline-block tab-scroller"
      bind:offsetWidth={scrollerWidth}
      id="tab-scroller"
      style="overflow-x: auto; white-space: nowrap; max-width: calc(100% - 105px);"
    >
      {#if tabList}
        {#each tabList as tab, index}
          <Tab
            tab = {collectionsMethods.extractTabDocument(tab)}
            handleTabRemove={collectionsMethods.handleRemoveTab}
            updateCurrentTab={collectionsMethods.handleActiveTab}
            {index}
            {tabWidth}
          />
        {/each}
      {/if}
    </div>
    {#if scrollerParent <= scrollerWidth + 105}
      <div class="d-inline-block" style="height:35px; width:35px;">
        <button
          class=" btn border-0 ps-1 pe-1 py-0 h-100 w-100"
          on:click={() => {
            moveNavigation("right");
          }}
        >
          <img src={angleRight} alt="" />
        </button>
      </div>
    {/if}
    <div class="d-inline-block" style="height:35px; width:35px;">
      <button
        class=" btn border-0 ps-1 pe-1 py-0 h-100 w-100"
        on:click={() => {
          collectionsMethods.handleCreateTab(
            generateSampleRequest(
              "UNTRACKED-" + uuidv4(),
              new Date().toString(),
            ),
          )
          moveNavigation("right");
        }}
      >
        <img src={plusIcon} alt="" />
      </button>
    </div>
  </div>
</div>

<style>
  .tabbar {
    height: 36px;
  }

  .tab-scroller::-webkit-scrollbar {
    display: none;
  }
</style>
