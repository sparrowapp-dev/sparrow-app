<script lang="ts">
  // ---- Icon
  import Crossicon from "$lib/assets/crossicon.svelte";
  import BookIcon from "$lib/assets/book.svelte";
  // ----

  // ---- SVG
  import collectionAsset from "$lib/assets/collection-nodes.svg";
  import folderTab from "$lib/assets/folder-tab.svg";
  // ----

  // ---- Enum
  import { ItemType } from "$lib/utils/enums/item-type.enum";
  // ----

  // ---- helper functions
  import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  // ----

  // ---- Interface
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  // ----

  // ------ Props ------
  /**
   * New tab with details
   * @type {NewTab}
   */
  export let tab: NewTab;
  /**
   * Width of each tab
   */
  export let tabWidth: number;
  /**
   * Index of particular tab
   */
  export let index: number;
  /**
   * Callback function for tab selected
   * @param id - Tab ID
   */
  export let onTabSelected: (id: string) => void;
  /**
   * Callback function for tab closed
   * @param id - Tab ID
   * @param tab - New Tab
   */
  export let onTabClosed: (id: string, tab: NewTab) => void;
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

  function handleMouseDown(event) {
    if (event.button === 1) {
      // Check if the middle button is pressed (button code 1)
      onTabClosed(tab.id, tab);
    }
  }
</script>

<div
  draggable={true}
  on:drop={() => {
    onDropOver(index);
  }}
  on:dragstart={() => {
    onDragStart(index);
  }}
  class="d-inline-block position-relative pt-1 individual-tab"
  style="width: {tabWidth}px; height:35px; margin-left:{index === 0
    ? '10px'
    : ''}"
  on:mousedown={handleMouseDown}
>
  <div
    class="w-100 d-flex justify-content-between ps-2 border-upper-radius"
    style="margin-left: -3px; background-color: {tab.isActive
      ? 'var(--background-color)'
      : 'transparent'}"
  >
    <button
      on:click={() => {
        if (!tab.isActive) {
          onTabSelected(tab.id);
        }
      }}
      class="position-relative border-0 ellipsis"
      style="    width: 80%;
       text-align: left; background-color:transparent;"
    >
      {#if tab.type === ItemType.REQUEST}
        <span
          class="text-{getMethodStyle(tab.property.request.method)}"
          style="font-size: 10px; height: 31px; "
          >{tab.property.request.method || ""}</span
        >
      {:else if tab.type === ItemType.FOLDER}
        <span>
          <img
            src={folderTab}
            alt="folder-tab"
            style="width: 30px;heigh:24px;margin-right:5px;"
          /></span
        >
      {:else if tab.type === ItemType.COLLECTION}
        <span>
          <img
            src={collectionAsset}
            alt="book"
            style="width: 19px;heigh:19px;margin-right:5px;"
          />
        </span>
      {:else if tab.type === ItemType.WORKSPACE}
        <span>
          <BookIcon />
        </span>
      {/if}
      <span
        class="font-weight-normal"
        style={`font-size: 12px; font-family: Roboto; color: ${
          tab.isActive ? "#fff;" : "#8A9299;"
        }`}
      >
        {tab.name}
      </span>
      {#if tab?.property?.request && !tab?.isSaved}
        {#if tab?.source !== "SPEC" || !tab?.activeSync || tab?.isDeleted}
          <span
            class="position-absolute"
            style="right:0; top:6px; height:4px; width:4px; background-color:#FF7878; border-radius: 50%;"
          />
        {/if}
      {/if}
    </button>

    <button
      class="{tab.isActive
        ? 'active-close-btn'
        : 'inactive-close-btn'} btn border-0 d-flex align-items-center"
      on:click={() => {
        onTabClosed(tab.id, tab);
      }}
      style="overflow:hidden; height:31px;"
    >
      <Crossicon color={tab.isActive ? "#fff" : "#8A9299"} />
    </button>
  </div>
  {#if !tab.isActive}
    <div
      class="position-absolute"
      style="height:23px; width: 0.5px; background-color: grey; top:7px; right: 0;"
    />
  {/if}
</div>

<style>
  .border-upper-radius {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    overflow: hidden;
  }
  .individual-tab:hover .inactive-close-btn {
    opacity: 1 !important;
  }
  .inactive-close-btn {
    opacity: 0 !important;
  }
</style>
