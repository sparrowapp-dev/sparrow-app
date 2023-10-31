<script lang="ts">
  import plusIcon from "$lib/assets/actionicon-normal.svg";
  import crossIcon from "$lib/assets/cross.svg";
  import angleLeft from "$lib/assets/angleLeft.svg";
  import angleRight from "$lib/assets/angle-right.svg";
  import linesmallIcon from "$lib/assets/linesmall.svg";
  import PageHeader from "./PageHeader.svelte";
  import { collapsibleState } from "$lib/store/request-response-section";
  import {tabs, handleTabRemove, handleTabAddons, updateCurrentTab} from "$lib/store/request-response-section";
  
  let tabsStore = [];
  tabs.subscribe((value)=>{
    tabsStore = value;
  });

  let isCollaps: boolean;
  collapsibleState.subscribe((value) => (isCollaps = value));

 

  function moveNavigation(byX) {
    const navigation = document.getElementById("tab-scroller");
    navigation.scrollLeft = navigation.scrollLeft + byX;
  }
</script>

<div class="">
  <div
    style="border-top: 1px solid #313233;width:{isCollaps ? '100%' : '100%'}"
    class="tabbar bg-blackColor d-flex bg-backgroundColor;"
  >
    <div
      class=" d-inline-block tab-scroller" id="tab-scroller" style="overflow-x: auto; white-space: nowrap; max-width: calc(100% - 36px);"
    >
      <!-- {#if tabs.length >= 5}
        <div class="d-inline-block" style="height: 35px;">
          <button
            class="btn btn-primary border-0" style="height: 35px;"
          >
            <img src={angleLeft} alt="angleLeft" class="" />
          </button>
          <img src={linesmallIcon} alt="" />
        </div>
      {/if} -->
      {#each tabsStore as tab}
        <div
          class="d-inline-block rounded px-2" on:click={()=>{
            updateCurrentTab(tab);
          }}
          style="width: 196px; height:35px; border-right: 1px solid grey;" 
          
        >
          <button class="bg-blackColor border-0">
            <span style="font-size: 12px; color:#69D696; height: 35px; ">{tab.type}</span>
            <span
              class="text-muted font-weight-normal"
              style="font-size: 12px; font-family: Roboto; color: #8A9299;"
            >
              {tab.name}</span
            >
          </button>

          <button class="btn btn-primary border-0" on:click={()=>{
            handleTabRemove(tab.id)
          }}  style="overflow:hidden; height:35px;">
            <img src={crossIcon} alt="cross" />
          </button>
          <!-- <div class="pe-1">
            <img src={linesmallIcon} alt="" />
          </div> -->
        </div>
      {/each}
      <!-- {#if tabs.length >= 5}
        <div
          class="d-inline-block" style="height: 35px;" on:click={() => moveNavigation(0)}
          
        >
          <button
            class="btn btn-primary border-0" style="height: 35px;"
          >
            <img src={angleRight} alt="angleLeft" class="" />
          </button>
        </div>
      {/if} -->
    </div>
    <div class="d-inline-block" style="height:35px; width:35px;">
      <button class=" btn btn-primary border-0 ps-1 pe-1 py-0 h-100 w-100" on:click={()=>{
        handleTabAddons("GET"," Untitled Request", new Date()+"dummy")
      } }>
        <img src={plusIcon} alt="" />
      </button>
    </div>
  </div>
  <PageHeader />  
</div>

<style>
  .tabbar {
    /* position: fixed;
    width: calc(100%-72px); */
    height: 36px;
  }

  .btn-primary {
    background-color: var(--blackColor);
    color: #8a9299;
  }

  .btn-primary:hover {
    background-color: #232527;
  }
  .tab-scroller::-webkit-scrollbar {
  display: none;
  }
</style>
