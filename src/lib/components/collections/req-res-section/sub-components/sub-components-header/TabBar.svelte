<script lang="ts">
  import plusIcon from "$lib/assets/actionicon-normal.svg";
  import crossIcon from "$lib/assets/cross.svg";
  import angleLeft from "$lib/assets/angleLeft.svg";
  import angleRight from "$lib/assets/angle-right.svg";
  import linesmallIcon from "$lib/assets/linesmall.svg";
  import PageHeader from "./PageHeader.svelte";
  import { collapsibleState, currentTab } from "$lib/store/request-response-section";
  import {tabs, handleTabRemove, handleTabAddons, updateCurrentTab} from "$lib/store/request-response-section";
    import Tab from "./Tab.svelte";
    import type { Tab as tab } from "$lib/utils/interfaces/request.interface";
    import { onDestroy } from "svelte";
    import { RequestDefault } from "$lib/utils/enums/request.enum";
  
  let tabsStore : tab[] = [];
  let tabWidth : number = 196;
  let scrollerParent : number;
  let scrollerWidth : number;

  const tabsUnsubscribe = tabs.subscribe((value: tab[])=>{
    tabsStore = value;
    if(tabsStore.length >= 0 && tabsStore.length <= 5){
      tabWidth = 196;
    }
    else if(tabsStore.length >= 6 && tabsStore.length <= 10){
      tabWidth = 140;
    }
    else{
      tabWidth = 100;
    }

  });

  let isCollaps: boolean;
  collapsibleState.subscribe((value) => (isCollaps = value));

  const sideScroll = (element : any, direction : string, speed : number, distance : number, step: number) => {
    let scrollAmount = 0;
    var slideTimer = setInterval(function(){
        if(direction == 'left'){
            element.scrollLeft -= step;
        } else {
            element.scrollLeft += step;
        }
        scrollAmount += step;
        if(scrollAmount >= distance){
            window.clearInterval(slideTimer);
        }
    }, speed);
  }

  const moveNavigation = (direction : string) => {
    const navigation = document.getElementById("tab-scroller");
    if(direction === "left"){
      sideScroll(navigation,'left',25,100,10);
    }
    else{
      sideScroll(navigation,'right',25,100,10);
    }
  }

  let currentTabId : string = "";
  const currentTabUnsubscribe = currentTab.subscribe((value)=>{
    if(value && value.id){
      currentTabId = value.id;
    }
  });
  onDestroy(()=>{
    currentTabUnsubscribe();
    tabsUnsubscribe();
  });

</script>

<div class="">
  <div
    style="border-top: 1px solid #313233;width:{isCollaps ? '100%' : '100%'}"
    class="tabbar bg-blackColor d-flex bg-backgroundColor;" bind:offsetWidth={scrollerParent}>
    {#if scrollerParent <= scrollerWidth + 105}
    <div class="d-inline-block" style="height:35px; width:35px;">
      <button class=" btn border-0 ps-1 pe-1 py-0 h-100 w-100" on:click={()=>{
        moveNavigation('left')
      } }>
        <img src={angleLeft} alt="" />
      </button>
    </div>
    {/if}
    <div class=" d-inline-block tab-scroller" bind:offsetWidth={scrollerWidth} id="tab-scroller" style="overflow-x: auto; white-space: nowrap; max-width: calc(100% - 105px);">
      {#each tabsStore as tab , index}
        <Tab 
          tab={tab} 
          index = {index}
          currentTabId={currentTabId} 
          tabWidth={tabWidth} 
          method={tab.method}
          handleTabRemove={handleTabRemove} 
          updateCurrentTab={updateCurrentTab}/>
      {/each}
    </div>
    {#if scrollerParent <= scrollerWidth + 105}
    <div class="d-inline-block" style="height:35px; width:35px;">
      <button class=" btn border-0 ps-1 pe-1 py-0 h-100 w-100" on:click={()=>{
        moveNavigation('right')
      } }>
        <img src={angleRight} alt="" />
      </button>
    </div>
    {/if}
    <div class="d-inline-block" style="height:35px; width:35px;">
      <button class=" btn border-0 ps-1 pe-1 py-0 h-100 w-100" on:click={()=>{
        handleTabAddons(new Date()+"dummy", RequestDefault.NAME, RequestDefault.METHOD);
        moveNavigation('right');
      } }>
        <img src={plusIcon} alt="" />
      </button>
    </div>
  </div>
  <PageHeader />  
</div>

<style>
  .tabbar {
    height: 36px;
  }

  .tab-scroller::-webkit-scrollbar {
    display: none;
  }
</style>
