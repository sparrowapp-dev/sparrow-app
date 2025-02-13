<script lang="ts">
  // ---- Icon
  import { CrossIcon, CrossIcon as Crossicon } from "@sparrow/library/assets";
  import { BookIcon } from "@sparrow/library/assets";
  import { CrossIcon2 } from "@sparrow/library/icons";
  // ----

  // ---- SVG
  import { collectionNodesIcon as collectionAsset } from "@sparrow/library/assets";
  import { folderTabIcon as folderTab } from "@sparrow/library/assets";

  // ---- helper functions
  import { getMethodStyle } from "@sparrow/common/utils/conversion.helper";
  // ----

  // ---- Interface
  import {
    CrossIconV2,
    GraphIcon,
    SocketIcon,
    SocketIoIcon,
    StackIcon,
    TreeIcon,
  } from "@sparrow/library/icons";
  import { TabTypeEnum } from "@sparrow/common/types/workspace/tab";
  import { type Tab } from "@sparrow/common/types/workspace/tab";
  import { Badge, Spinner } from "@sparrow/library/ui";
  // ----

  // ------ Props ------
  /**
   * New tab with details
   */
  export let tab: Tab;
  /**
   * Width of each tab
   */
  export let tabWidth: number = 176;
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

  export let loader;

  function handleMouseDown(event: MouseEvent) {
    if (event.button === 1) {
      // Check if the middle button is pressed (button code 1)
      onTabClosed(tab.id, tab);
    }
  }
  let hideBadge = false;
</script>

<button
  draggable={true}
  on:drop={() => {
    onDropOver(index);
  }}
  on:dragstart={() => {
    onDragStart(index);
  }}
  class="badge-container tab-container {tab.isActive
    ? 'active'
    : ''} d-inline-block pt-1 individual-tab"
  style="width: {tabWidth}px; height:36px;  padding-left:1px; justify-content:center; margin-left:{index ===
  0
    ? '4px'
    : ''}"
  on:mousedown={handleMouseDown}
>
  {#if !tab.isActive}
    <div
      class="position-absolute divider"
      style="height: 28px; width: 1px; background-color: var(--bg-ds-surface-100); top: 3px; left: 1px;"
    />
  {/if}

  <div
    class="tab-item w-100 d-flex justify-content-between px-2 border-upper-radius h-100 align-items-center"
    style="margin-left: -1px;  background-color: {tab.isActive
      ? 'var(--bg-ds-surface-900)'
      : ''}; border-top : {tab.isActive
      ? '2px solid var(--bg-ds-primary-400)'
      : ''};  "
  >
    <button
      tabindex={1}
      on:click={() => {
        if (!tab.isActive) {
          onTabSelected(tab.id);
        }
      }}
      class="position-relative p-0 border-0 ellipsis"
      style="width: 100%;
        text-align: left; font-weight:500;  background-color:transparent;"
    >
      {#if loader}
        <Spinner size={`16px`} />
      {:else if tab.type === TabTypeEnum.REQUEST}
        <span class="text-{getMethodStyle(tab?.property?.request?.method)}">
          <span
            class={!tab.isActive ? "request-icon" : ""}
            style="font-size: 11px; height: 32px; font-weight: 500;"
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
      {:else if tab.type === TabTypeEnum.SOCKET_IO}
        <span>
          <SocketIoIcon
            height={"14px"}
            width={"14px"}
            color={"var(--icon-primary-300)"}
          />
        </span>
      {:else if tab.type === TabTypeEnum.GRAPHQL}
        <span>
          <GraphIcon
            height={"14px"}
            width={"14px"}
            color={"var(--icon-danger-1100)"}
          />
        </span>
      {/if}
      <span
        class=" ms-1 text-fs-12 {!tab.isActive ? 'request-text' : ''}"
        style={`font-weight:500; font-size:12px; line-height:18px;  color:  var(--text-ds-neutral-300)`}
      >
        {tab.name}
      </span>
    </button>
    {#if (tab?.type === TabTypeEnum.REQUEST || tab?.type === TabTypeEnum.WEB_SOCKET || tab?.type === TabTypeEnum.SOCKET_IO || tab?.type === TabTypeEnum.GRAPHQL || tab?.type === TabTypeEnum.ENVIRONMENT || tab?.type === TabTypeEnum.TESTFLOW) && !tab?.isSaved}
      <div class="badge-container badge">
        {#if tab?.source !== "SPEC" || !tab?.activeSync || tab?.isDeleted}
          <Badge type="dot" variant="danger" size="medium" />
        {/if}
      </div>
    {/if}

    <button
      class="cross-icon-btn p-0 align-items-center justify-content-center {// toggle cross icon for inactive tabs
      !tab.isActive ? 'inactive-close-btn' : ''} btn"
      on:click={() => {
        onTabClosed(tab.id, tab);
      }}
      style="overflow:hidden; height: 18px; width:18px;"
    >
      <CrossIcon2
        height={"16px"}
        width={"16px"}
        color={"var(--bg-ds-neutral-50)"}
      />
    </button>
  </div></button
>

<style>
  * {
    transition: all 100ms;
  }
  .badge-container:hover .badge {
    display: none;
  }
  .badge-container:hover .divider {
    display: none;
  }
  .tab-container:active .badge {
    display: none;
  }
  .badge-container:focus .cross-icon-btn {
    display: none;
  }
  .badge-container:hover .cross-icon-btn {
    display: flex;
  }

  .tab-container {
    background-color: var(--bg-ds-surface-700);
    border: 0px;
  }
  .tab-container:focus-visible {
    outline: none;
    border-radius: 4px;
    border: 2px solid var(--bg-ds-primary-300);
    background-color: var(--bg-ds-surface-700);
  }

  .tab-container {
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: var(--bg-ds-neutral-300);
    position: relative;
  }

  .tab-item:hover {
    background-color: var(--bg-ds-surface-300);
  }

  .tab-item:active {
    background-color: var(--bg-ds-surface-500) !important;
  }

  .tab-container {
    background-color: var(--bg-ds-surface-700);
    border: 0px;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    position: relative;
    display: inline-block;
  }

  .tab-container:hover::before {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: transparent;
    left: -11px;
    border-bottom-right-radius: 8px;
    box-shadow: 8px 0 0 0 var(--bg-ds-surface-300);
    top: 24px;
    z-index: 0;
  }
  .tab-container:active::before {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: transparent;
    left: -11px;
    border-bottom-right-radius: 8px;
    box-shadow: 8px 0 0 0 var(--bg-ds-surface-500);
    top: 24px;
    z-index: 0;
  }
  .tab-container.active:active::before {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: transparent;
    left: -11px;
    border-bottom-right-radius: 8px;
    box-shadow: 8px 0 0 0 var(--bg-ds-surface-500);
    top: 24px;
    display: inline-block;
    z-index: 1;
  }
  .tab-container.active::before {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: transparent;
    left: -11px;
    border-bottom-right-radius: 8px;
    box-shadow: 8px 0 0 0 var(--bg-ds-surface-900);
    top: 24px;
    display: inline-block;
    z-index: 1;
  }

  .tab-container.active:active::after {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: transparent;
    right: -6px;
    border-bottom-left-radius: 8px;
    box-shadow: -8px 0 0 0 var(--bg-ds-surface-500);
    top: 18px; /* Match the top value with ::before */
    z-index: 1;
  }
  .tab-container.active::after {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: transparent;
    right: -6px;
    border-bottom-left-radius: 8px;
    box-shadow: -8px 0 0 0 var(--bg-ds-surface-900);
    top: 18px; /* Match the top value with ::before */
    z-index: 1;
  }

  .tab-container:hover::after {
    content: "";
    position: absolute; /* This was missing */
    width: 12px;
    height: 12px;
    background-color: transparent;
    right: -11px;
    border-bottom-left-radius: 8px;
    box-shadow: -8px 0 0 0 var(--bg-ds-surface-300);
    top: 24px;
    z-index: 1;
  }
  .tab-container:active::after {
    content: "";
    position: absolute; /* This was missing */
    width: 12px;
    height: 12px;
    background-color: transparent;
    right: -11px;
    border-bottom-left-radius: 8px;
    box-shadow: -8px 0 0 0 var(--bg-ds-surface-500);
    top: 24px;
  }
  .tab-container.active::after {
    content: "";
    position: absolute; /* This was missing */
    width: 12px;
    height: 12px;
    background-color: transparent;
    right: -11px;
    border-bottom-left-radius: 8px;
    box-shadow: -8px 0 0 0 var(--bg-ds-surface-900);
    top: 24px;
  }
  .tab-container:focus::before,
  .tab-container:focus::after {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    box-shadow: none;
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
    font-weight: 500 !important;
  }
  .individual-tab:hover .request-icon {
    /* color: inherit !important; */
  }
  .request-text {
    font-weight: 500 !important;
    color: var(--text-ds-neutral-300) !important;
  }
  .individual-tab:hover .request-text {
    color: var(--text-ds-neutral-300) !important;
  }
  .cross-icon-btn {
    display: flex;
  }
  .cross-icon-btn:hover {
    display: flex;
    background-color: var(--text-tertiary-300);
    border-radius: 2px;
  }
  .ellipsis {
    color: var(--text-ds-neutral-300);
  }
  .ellipsis:hover {
    color: var(--text-ds-neutral-300);
  }
</style>
