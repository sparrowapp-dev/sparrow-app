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

  export let tabList: TabDocument[] = [];
  export let onNewTabRequested: () => void;
  export let onTabClosed: (id: string, tab: NewTab) => void;
  export let onDropEvent: (event: Event) => void;
  export let onDragStart: (index: number) => void;
  export let onDropOver: (index: number) => void;
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

  const handleDropOver = (event: Event) => {
    event.preventDefault();
  };
</script>

<div
  class="tab"
  on:drop={(event) => {
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
      on:dragover={(event) => {
        handleDropOver(event);
      }}
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
        on:click={onNewTabRequested}
      >
        <img src={plusIcon} alt="" />
      </button>
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
