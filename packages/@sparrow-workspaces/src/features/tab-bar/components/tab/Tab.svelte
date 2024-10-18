<script lang="ts">
  // ---- Icon
  import { CrossIcon as Crossicon } from "@sparrow/library/assets";
  import { BookIcon } from "@sparrow/library/assets";
  // ----

  // ---- SVG
  import { collectionNodesIcon as collectionAsset } from "@sparrow/library/assets";
  import { folderTabIcon as folderTab } from "@sparrow/library/assets";

  // ---- helper functions
  import { getMethodStyle } from "@sparrow/common/utils/conversion.helper";
  // ----

  // ---- Interface
  import { SocketIcon, StackIcon, TreeIcon } from "@sparrow/library/icons";
  import { TabTypeEnum, type Tab } from "@sparrow/common/types/workspace";
  // ----

  // ------ Props ------
  /**
   * New tab with details
   */
  export let tab: Tab;
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
  export let onTabClosed: (id: string, tab: Tab) => void;
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

  function handleMouseDown(event: MouseEvent) {
    if (event.button === 1) {
      // Check if the middle button is pressed (button code 1)
      onTabClosed(tab.id, tab);
    }
  }
</script>

<button
  draggable={true}
  on:drop={() => {
    onDropOver(index);
  }}
  on:dragstart={() => {
    onDragStart(index);
  }}
  class="d-inline-block position-relative pt-1 individual-tab bg-transparent border-0"
  style="width: {tabWidth}px; height:35px; margin-left:{index === 0
    ? '10px'
    : ''}"
  on:mousedown={handleMouseDown}
>
  <div
    class=" w-100 d-flex justify-content-between px-2 border-upper-radius"
    style="margin-left: -3px;  background-color: {tab.isActive
      ? 'var(--bg-secondary-850)'
      : 'transparent'};"
  >
    <button
      on:click={() => {
        if (!tab.isActive) {
          onTabSelected(tab.id);
        }
      }}
      class="position-relative border-0 ellipsis"
      style="width: 100%;
        text-align: left; font-weight:700; background-color:transparent;"
    >
      {#if tab.type === TabTypeEnum.REQUEST}
        <span class="text-{getMethodStyle(tab?.property?.request?.method)}">
          <span
            class={!tab.isActive ? "request-icon" : ""}
            style="font-size: 11px; height: 31px; font-weight: 500;"
            >{tab?.property?.request?.method || ""}</span
          >
        </span>
      {:else if tab.type === TabTypeEnum.FOLDER}
        <span>
          <img
            src={folderTab}
            alt="folder-tab"
            style="width: 30px;heigh:24px;margin-right:5px;"
          /></span
        >
      {:else if tab.type === TabTypeEnum.COLLECTION}
        <span>
          <img
            src={collectionAsset}
            alt="book"
            style="width: 19px;heigh:19px;margin-right:5px;"
          />
        </span>
      {:else if tab.type === TabTypeEnum.WORKSPACE}
        <span>
          <BookIcon />
        </span>
      {:else if tab.type === TabTypeEnum.WEB_SOCKET}
        <span>
          <SocketIcon
            height={"12px"}
            width={"16px"}
            color={"var(--icon-primary-300)"}
          />
        </span>
      {:else if tab.type === TabTypeEnum.ENVIRONMENT}
        <span>
          <StackIcon
            height={"14px"}
            width={"14px"}
            color={"var(--icon-secondary-130)"}
          />
        </span>
      {:else if tab.type === TabTypeEnum.TESTFLOW}
        <span>
          <TreeIcon
            height={"14px"}
            width={"14px"}
            color={"var(--icon-secondary-130)"}
          />
        </span>
      {/if}
      <span
        class="font-weight-normal ms-1 text-fs-12 {!tab.isActive
          ? 'request-text'
          : ''}"
        style={`color:  var(--text-secondary-100)`}
      >
        {tab.name}
      </span>
    </button>
    {#if (tab?.type === TabTypeEnum.REQUEST || tab?.type === TabTypeEnum.WEB_SOCKET || tab?.type === TabTypeEnum.ENVIRONMENT || tab?.type === TabTypeEnum.TESTFLOW) && !tab?.isSaved}
      {#if tab?.source !== "SPEC" || !tab?.activeSync || tab?.isDeleted}
        <span
          class="my-auto mx-1 opacity-1"
          style="height: 6px; aspect-ratio: 1; background-color: var(--tab-unsave-icon); border-radius: 50%;"
        />
      {/if}
    {/if}

    <button
      class="cross-icon-btn {// toggle cross icon for inactive tabs
      !tab.isActive
        ? 'inactive-close-btn'
        : ''} btn d-flex align-items-center px-1"
      on:click={() => {
        onTabClosed(tab.id, tab);
      }}
      style="overflow:hidden; height: 18px; width:22px; margin-top:7px; margin-bottom:6px;"
    >
      <Crossicon />
    </button>
    {#if !tab.isActive}
      <div
        class="position-absolute"
        style="height: 18px; width: 1px; background-color: var(--tab-request-divider-line) ; top: 10px; right: 0;"
      />
    {/if}
  </div></button
>

<style>
  * {
    transition: all 100ms;
  }
  .border-upper-radius {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }
  .individual-tab:hover .inactive-close-btn {
    opacity: 1 !important;
  }
  .inactive-close-btn {
    opacity: 0 !important;
  }

  .request-icon {
    font-weight: 400 !important;
  }
  .individual-tab:hover .request-icon {
    color: inherit !important;
  }
  .request-text {
    font-weight: 400;
    color: var(--text-secondary-100) !important;
  }
  .individual-tab:hover .request-text {
    color: var(--text-secondary-100) !important;
  }

  .cross-icon-btn:hover {
    background-color: var(--text-tertiary-300);
    border-radius: 2px;
  }
  .ellipsis {
    color: var(--text-secondary-100);
  }
  .ellipsis:hover {
    color: var(--text-secondary-100);
  }
</style>
