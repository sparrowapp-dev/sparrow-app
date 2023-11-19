<script lang="ts">
  import plusIcon from "$lib/assets/actionicon-normal.svg";
  import crossIcon from "$lib/assets/cross.svg";
  import angleLeft from "$lib/assets/angleLeft.svg";
  import angleRight from "$lib/assets/angle-right.svg";
  import linesmallIcon from "$lib/assets/linesmall.svg";
  import PageHeader from "./PageHeader.svelte";
  import {
    collapsibleState,
    currentTab,
  } from "$lib/store/request-response-section";
  import { tabs, handleTabAddons } from "$lib/store/request-response-section";
  import Tab from "./Tab.svelte";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { onDestroy } from "svelte";
  import {
    RequestDefault,
    RequestDataType,
  } from "$lib/utils/enums/request.enum";
  import { v4 as uuidv4 } from "uuid";
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  import DefaultTabBar from "../sub-components-header/DefaultTabBar.svelte";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import {
    createSampleRequest,
    generateSampleRequest,
  } from "$lib/utils/sample/request.sample";
  import { TabBarViewModel } from "./TabBar.ViewModel";
  import type { Observable } from "rxjs";
  import type { TabDocument } from "$lib/database/app.database";

  let tabsStore: NewTab[] = [];
  let tabWidth: number = 196;
  let scrollerParent: number;
  let scrollerWidth: number;

  const _viewModel = new TabBarViewModel();
  const activeTab = _viewModel.activeTab;
  const openTab: Observable<any> = _viewModel.tabs;

  openTab.subscribe((tabs: TabDocument[]) => {
    if (tabs.length >= 0 && tabs.length <= 5) {
      tabWidth = 196;
    } else if (tabs.length >= 6 && tabs.length <= 10) {
      tabWidth = 140;
    } else {
      tabWidth = 100;
    }
  });
  const tabsUnsubscribe = tabs.subscribe((value: NewTab[]) => {
    tabsStore = value;
  });

  let isCollaps: boolean;
  collapsibleState.subscribe((value) => (isCollaps = value));

  let currentTabId: string = "";
  const currentTabUnsubscribe = currentTab.subscribe((value) => {
    if (value && value.id) {
      currentTabId = value.id;
    }
  });
  onDestroy(() => {
    currentTabUnsubscribe();
    tabsUnsubscribe();
  });
</script>

<div class="">
  <div
    style="border-top: 1px solid #313233;width:{isCollaps ? '100%' : '100%'}"
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
      {#if $openTab}
        {#each $openTab as tab, index}
          <Tab
            {tab}
            {index}
            currentTabId={$activeTab?.id}
            {tabWidth}
            method={tab.property.request.method}
            handleTabRemove={_viewModel.handleRemoveTab}
            updateCurrentTab={_viewModel.handleActiveTab}
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
          handleTabAddons(createSampleRequest(uuidv4()));
          _viewModel.handleCreateTab(generateSampleRequest(uuidv4()));
          moveNavigation("right");
        }}
      >
        <img src={plusIcon} alt="" />
      </button>
    </div>
  </div>
  {#if $openTab?.length > 0}
    <PageHeader />
  {:else}
    <DefaultTabBar />
  {/if}
</div>

<style>
  .tabbar {
    height: 36px;
  }

  .tab-scroller::-webkit-scrollbar {
    display: none;
  }
</style>
