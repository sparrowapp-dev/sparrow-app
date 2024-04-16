<script lang="ts">
  // ---- SVG
  import plusIcon from "$lib/assets/actionicon-normal.svg";
  import angleLeft from "$lib/assets/angleLeft.svg";
  import angleRight from "$lib/assets/angle-right.svg";

  // ---- Store
  import { collapsibleState } from "$lib/store/request-response-section";

  // ---- Interface
  import type { TabDocument } from "$lib/database/app.database";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";

  // ---- Component
  import Tab from "../req-res-section/sub-components/sub-components-header/Tab.svelte";

  // ---- Helper
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import Button from "$lib/components/buttons/Button.svelte";

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
  export let onTabClosed: (id: string, tab: NewTab) => void;
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

<div
  class="tab"
  on:drop|preventDefault={(event) => {
    onDropEvent(event);
  }}
>
  <div
    style="width:{$collapsibleState ? '100%' : '100%'}"
    class="tabbar d-flex"
    bind:offsetWidth={scrollerParent}
  >
    {#if scrollerParent <= scrollerWidth + 105}
      <div class="d-inline-block" style="height:35px; width:35px;">
        <Button
          onClick={() => {
            moveNavigation("left");
          }}
          title={""}
          buttonStartIcon={angleLeft}
          buttonStartIconStyle={"height: 13px; width: 7px"}
          buttonClassProp={"btn border-0 ps-1 pe-1 py-0 h-100 w-100"}
        />
      </div>
    {/if}
    <div
      on:dragover|preventDefault
      class=" d-inline-block tab-scroller"
      bind:offsetWidth={scrollerWidth}
      id="tab-scroller"
      style="overflow-x: auto; white-space: nowrap; max-width: calc(100% - 105px);"
    >
      {#if tabList}
        {#each tabList as tab, index (tab.id)}
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
    </div>
    {#if scrollerParent <= scrollerWidth + 105}
      <div class="d-inline-block" style="height:35px; width:35px;">
        <Button
          title=""
          onClick={() => {
            moveNavigation("right");
          }}
          buttonClassProp={"btn border-0 ps-1 pe-1 py-0 h-100 w-100"}
          buttonStartIconStyle={"height: 16px; width: 10px"}
          buttonStartIcon={angleRight}
        />
      </div>
    {/if}
    <div class="d-inline-block" style="height:35px; width:35px;">
      <Button
        title=""
        onClick={onNewTabRequested}
        buttonClassProp={"btn border-0 ps-1 pe-1 py-0 h-100 w-100"}
        buttonStartIcon={plusIcon}
      />
    </div>
  </div>
</div>

<style>
  .tabbar {
    height: 36px;
    background-color: var(--background-light);
  }

  .tab-scroller::-webkit-scrollbar {
    display: none;
  }
</style>
