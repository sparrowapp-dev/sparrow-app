<script lang="ts">
  // ---- SVG
  import MoreOptions from "@workspaces/features/tab-bar/assets/MoreOptions.svelte";
  import ViewGrid from "@workspaces/features/tab-bar/assets/ViewGrid.svelte";
  import VerticalGrid from "@library/icons/VerticalGrid.svelte";
  import SplitVerital from "@workspaces/features/tab-bar/assets/SplitVertical.svg";
  import SplitHorizontal from "@workspaces/features/tab-bar/assets/SplitHorizontal.svg";
  import AngleRight from "@library/icons/AngleRight.svelte";
  import AngleLeft from "@library/icons/AngleLeft.svelte";
  import PlusIcon from "@library/icons/PlusIcon.svelte";

 
  // ---- Store
  import { collapsibleState } from "$lib/store/request-response-section";
 
  // ---- Interface
  import type { TabDocument } from "@app/database/database";
 
  // ---- Component
  import Tab from "@workspaces/features/tab-bar/components/tab/Tab.svelte";
  import { Dropdown } from "@library/ui";
 
  // ---- Helper
  import { moveNavigation, tabBarScroller } from "$lib/utils/helpers/navigation";
  import Button from "@library/ui/button/Button.svelte";
  import { requestSplitterDirection } from "@workspaces/features/rest-explorer/store";
 
  // ------ Props ------
  /**
   * List of tabs
   */
  export let tabList: TabDocument[] = [];
  /**
   * Callback for new tab requested
   */
  export let onNewTabRequested: () => void;
  /**
   * Callback for tab closed
   * @param id - Tab ID
   * @param tab - New Tab
   */
  export let onTabClosed: (id: string, tab: TabDocument) => void;
  /**
   * Callback for Tab Drop Event
   * @param event - Event
   */
  export let onDropEvent: (event: Event) => void;
  /**
   * Callback function for drag start from a index
   * @param index - Index of Tab
   */
  export let onDragStart: (index: number) => void;
  /**
   * Callback function for drop over at a index
   * @param index - Index of Tab
   */
  export let onDropOver: (index: number) => void;
  /**
   * Callback for Selected Tab
   * @param id - Tab ID
   */
  export let onTabSelected: (id: string) => void;
 
  export let onChangeViewInRequest: (view: string) => void;
 
  $: {
    if (tabList) {
      scrolable = tabList.length * 182 >= scrollerParent;
    }
  }
 
  let tabWidth: number = 182;
  let scrolable: boolean = false;
  let scrollerParent: number;
  let scrollerWidth: number;
  let moreOption: boolean = false;
  let viewChange: boolean = false;
</script>
 
<button
  class="tab border-0 w-100 bg-blackColor d-flex"
  style="cursor: default;"
  on:drop|preventDefault={(event) => {
    onDropEvent(event);
  }}
>
  <div
    style="width: 100%;"
    class="tabbar d-flex"
    bind:offsetWidth={scrollerParent}
  >
    {#if scrolable}
      <div class="d-inline-block" style="height:35px; width:35px;">
        <button on:click={() => {
          tabBarScroller("left");
        }} role="button" 
        class=" btn border-0 ps-0 pe-2 py-auto h-100 w-100"  
        style=" width:20px; transform: rotate(180deg); margin: 0 !important; height:2px; ">
          <div class="left-btn d-flex justify-content-center align-items-center " 
          style="height: 22px; width:22px;">
          <AngleLeft height={"12px"} width={"24px"} />  
          </div>
        </button>
      </div>
    {/if}
    <button
      on:dragover|preventDefault
      class=" d-inline-block tab-scroller border-0 bg-transparent"
      bind:offsetWidth={scrollerWidth}
      id="tab-scroller"
      style="overflow-x: auto; white-space: nowrap; max-width: calc(100% - 105px); "
    >
      {#if tabList}
        {#each tabList as tab, index (tab.tabId)}
          <Tab
            {tab}
            {onTabSelected}
            {onTabClosed}
            {index}
            {tabWidth}
            {onDragStart}
            {onDropOver}
          />
        {/each}
      {/if}
    </button>
    {#if scrolable}
      <div
        class="d-inline-block position-relative"
        style="height:35px; width:35px;">
      <div
      class="position-absolute"
      style="height: 18px; width: 1px; background-color: var(--tab-request-divider-line) ; top: 10px; left: 0;"
    />
        <button on:click={() => {
          tabBarScroller("right");
        }} role="button" 
        class=" btn border-0  ps-1 pe-1 py-auto h-100 w-100"  
        style=" width:20px; transform: rotate(180deg); margin: 0 !important; height:22px;">
          <div class="right-btn d-flex pt-1 pb-1 justify-content-center align-items-center"  
          style="height: 22px; width:22px;">
            <AngleRight height={"12px"} width={"24px"} />  
          </div>
        </button>
        <div
          class="position-absolute"
          style="height: 18px; width: 1px; background-color: var(--tab-request-divider-line) ; top: 10px; right: 0;"
        />
      </div>
    {/if}
    <!-- {#if tabList.length < 1}
      <div class="d-inline-flex ms-2" style="height:35px;">
        <Button
          title="New Request"
          onClick={onNewTabRequested}
          buttonClassProp={"btn border-0 ps-1 pe-1 pt-1 py-0 h-100 w-100"}
          textStyleProp="font-size: 14px;"
        />
      </div>
    {/if} -->
    <div class="d-inline-flex" style="height:35px; width:35px;">
      <button on:click={onNewTabRequested} 
      role="button" 
      class=" btn border-0 pt-1 ps-1 pe-2 py-auto h-100 w-100"  
      style=" width:20px; transform: rotate(180deg); margin: 0 !important; height:22px;">
        <div class="plus-btn d-flex pt-1 pb-1 justify-content-center align-items-center"  
        style="height: 22px; width:22px;">
          <PlusIcon height={"24px"} width={"24px"} />  
        </div>
    </button>
    </div>
    <div class="layout d-flex ms-0 my-auto me-2">
      <Dropdown
        buttonId="viewChange"
        bind:isMenuOpen={viewChange}
        horizontalPosition="left"
        minWidth={175}
        options={[
          {
            name: "Split Vertically",
            icon: SplitVerital,
            onclick: () => onChangeViewInRequest("vertical"),
          },
          {
            name: "Split Horizontally",
            icon: SplitHorizontal,
            onclick: () => onChangeViewInRequest("horizontal"),
          },
        ]}
      >
        <button
          id="viewChange"
          class="border-0 bg-transparent pt-0 rounded"
          style="height: 22px; width:24px;"
          on:click={() => {
            viewChange = !viewChange;
          }}
        >
          {#if $requestSplitterDirection === "horizontal"}
            <ViewGrid color={"var(--text-primary-400)"} height={13} />
          {:else}
            <VerticalGrid height={13} color="var(--blackColor)" />
          {/if}
        </button>
      </Dropdown>
      <Dropdown
        buttonId="moreOptions"
        bind:isMenuOpen={moreOption}
        horizontalPosition="left"
        minWidth={150}
        options={[
          {
            name: "Close all Tabs",
            icon: "",
            onclick: () => {
              tabList.map((tab) => {
                onTabClosed(tab.id, tab);
              });
            },
          },
          {
            name: "Close Selected Tab",
            icon: "",
            onclick: () => {
              let activeTab = tabList.filter((tab) => tab.isActive)[0];
              onTabClosed(activeTab.id, activeTab);
            },
          },
        ]}
      >
        <button
          id="moreOptions"
          class="border-0 bg-transparent pt-1 rounded d-none"
          on:click={() => {
            moreOption = !moreOption;
          }}
        >
          <MoreOptions height={15} />
        </button>
      </Dropdown>
    </div>
  </div>
</button>
 
<style>
  * {
    transition: all 300ms;  
  }
  .tabbar {
    height: 35px;
    background-color: var(--sparrow-black);
 
   
  }
 
  .tab-scroller::-webkit-scrollbar {
    display: none;
  }
  .right-btn:hover{
    background-color: #1E1E1E;
    border-radius: 2px;
  }
  .left-btn:hover{
    background-color: #1E1E1E;
    border-radius: 2px;
  }
  .plus-btn:hover{
    background-color: #1E1E1E;
    border-radius: 2px;
  }
  .layout:hover{
    background-color: #1E1E1E;
    border-radius: 2px;
  }
</style>
 