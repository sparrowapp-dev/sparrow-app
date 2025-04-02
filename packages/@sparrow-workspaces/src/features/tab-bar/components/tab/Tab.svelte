<script lang="ts">
  // ---- Icon
  import {
    Collection,
    CrossIcon,
    CrossIcon as Crossicon,
    folderIcon,
  } from "@sparrow/library/assets";
  import { BookIcon } from "@sparrow/library/assets";
  // ----

  // ---- SVG
  import { folderIcon3 } from "@sparrow/library/assets";
  // ---- helper functions
  import { getMethodStyle } from "@sparrow/common/utils/conversion.helper";
  // ----

  // ---- Interface
  import {
    CrossIcon2,
    CrossIconV2,
    GraphIcon,
    SocketIcon,
    SocketIoIcon,
    StackIcon,
    TreeIcon,
    DismissCircleRegular,
    CopyRegular,
  } from "@sparrow/library/icons";
  import {
    TabPersistenceTypeEnum,
    TabTypeEnum,
  } from "@sparrow/common/types/workspace/tab";
  import { type Tab } from "@sparrow/common/types/workspace/tab";
  import { Badge, Spinner, Options, Dropdown } from "@sparrow/library/ui";
  import { SvelteComponent } from "svelte";
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
   *
   *
   */
  export let loader;
  export let onDropOver: (index: number) => void;

  export let listLength;
  export let onDoubleClick: (tab: Tab) => void;
  export let onRightClick: (tab: Tab) => void;
  export let onClickCloseOtherTabs: (tabId: string) => void;
  export let onClickForceCloseTabs: (tabId: string) => void;
  export let onClickDuplicateTab: (tabId: string) => void;
  let noOfColumns = 200;
  let showTabControlMenu = false;

  function handleMouseDown(event: MouseEvent) {
    if (event.button === 1) {
      // Check if the middle button is pressed (button code 1)
      onTabClosed(tab.id, tab);
    }
  }
  const handleDoubleClick = (tab: Tab) => {
    onDoubleClick(tab);
  };

  let mouseX = 0;
  let mouseY = 0;
  const handleRightClick = (event: MouseEvent, tab: Tab) => {
    showTabControlMenu = !showTabControlMenu;
    mouseX = event.clientX;
    mouseY = event.clientY;

    const tabbarElement = document.querySelector(".tabbar") as HTMLElement;

    if (tabbarElement) {
      const navbarElement = tabbarElement.querySelector(".navbar");
      if (navbarElement) {
        navbarElement.remove();
        // showTabControlMenu = true;
      } else {
        showTabControlMenu = true;
      }
    }
  };
</script>

<button
  draggable={true}
  on:drop={() => {
    onDropOver(index);
  }}
  on:dragstart={() => {
    onDragStart(index);
  }}
  tabindex="0"
  class=" badge-container tab-container d-inline-block p-0 position-relative pt-1 individual-tab"
  style="width: {tabWidth}px; height:35px; margin-left:{index === 0
    ? '4px'
    : ''}"
  on:mousedown={handleMouseDown}
  on:dblclick={() => handleDoubleClick(tab)}
  on:contextmenu|preventDefault={(event) => handleRightClick(event, tab)}
>
  <!-- <Dropdown>
  </Dropdown> -->
  {#if showTabControlMenu}
    <Options
      isTabMenu={true}
      xAxis={mouseX}
      yAxis={[mouseY, mouseY + 20]}
      zIndex={500}
      menuItems={[
        {
          onClick: () => {
            onTabClosed(tab.id, tab);
          },
          displayText: "Close Tab",
          disabled: false,
          hidden: false,
          icon: DismissCircleRegular,
        },
        {
          onClick: () => {
            onClickCloseOtherTabs(tab.id);
          },
          displayText: "Close Other Tabs",
          disabled: false,
          hidden: false,
        },
        {
          onClick: () => {
            onClickCloseOtherTabs("");
          },
          displayText: "Close All Tabs",
          hidden: false,
        },
        {
          onClick: () => {
            onClickForceCloseTabs(tab.id);
          },
          displayText: "Force Close Other Tabs",
          hidden: false,
        },
        {
          onClick: () => {
            onClickForceCloseTabs("");
          },
          displayText: "Force Close All Tabs",
          hidden: false,
        },
        {
          onClick: () => {
            onClickDuplicateTab(tab.id);
          },
          displayText: "Duplicate Tab",
          hidden: !["REQUEST", "WEBSOCKET", "SOCKETIO", "GRAPHQL"].includes(
            tab.type,
          ),
          icon: CopyRegular,
        },
      ]}
      {noOfColumns}
    />
  {/if}

  <div
    on:click={() => {
      if (!tab.isActive) {
        onTabSelected(tab.id);
      }
    }}
    tabindex="-1"
    class="tab-item w-100 d-flex justify-content-between px-2 border-upper-radius h-100 align-items-center"
    style="   background-color: {tab.isActive
      ? 'var(--bg-ds-surface-900) !important'
      : 'transparent'};  border-top : {tab.isActive
      ? tab?.persistence === TabPersistenceTypeEnum.TEMPORARY
        ? '2px solid var(--bg-ds-neutral-300)'
        : '2px solid var(--bg-primary-400)'
      : '2px solid transparent'};"
  >
    <button
      tabindex="-1"
      class="position-relative p-0 border-0 ellipsis"
      style="width: 100%;
        text-align: left; font-weight:700; background-color:transparent;"
    >
      {#if loader}
        <Spinner size={"16px"} />
      {:else if tab.type === TabTypeEnum.REQUEST}
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
            src={folderIcon3}
            alt="folder-tab"
            style="width: 16px;heigh:16px;margin-right:5px;"
          /></span
        >
      {:else if tab.type === TabTypeEnum.COLLECTION}
        <span>
          <img
            src={Collection}
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
            color={"var(--bg-ds-primary-400)"}
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
            color={"var(--icon-ds-success-300)"}
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
      {:else if tab.type === TabTypeEnum.SAVED_REQUEST}
        <span>
          <!-- <GraphIcon
            height={"14px"}
            width={"14px"}
            color={"var(--icon-danger-1100)"}
          /> -->
          <span
            class="text-fs-12"
            style={Number(
              tab?.property?.savedRequest?.responseStatus.split(" ")[0],
            ) >= 200 &&
            Number(tab?.property?.savedRequest?.responseStatus.split(" ")[0]) <
              300
              ? "color:var(--text-ds-success-300);"
              : "color:var(--text-ds-danger-300);"}
          >
            {tab?.property?.savedRequest?.responseStatus.split(" ")[0]}
          </span>
        </span>
      {/if}
      <span
        class=" ms-1 text-fs-12 {!tab.isActive ? 'request-text' : ''}"
        style={`font-weight:500; font-size:12px; line-height:18px;  color:  var(--text-ds-neutral-300); font-style: ${tab?.persistence === TabPersistenceTypeEnum.TEMPORARY ? "italic" : ""};`}
      >
        {tab.name}
      </span>
    </button>
    <div style="align-items:center; justify-content:center;">
      {#if (tab?.type === TabTypeEnum.REQUEST || tab?.type === TabTypeEnum.FOLDER || tab?.type === TabTypeEnum.COLLECTION || tab?.type === TabTypeEnum.SAVED_REQUEST || tab?.type === TabTypeEnum.WEB_SOCKET || tab?.type === TabTypeEnum.SOCKET_IO || tab?.type === TabTypeEnum.GRAPHQL || tab?.type === TabTypeEnum.ENVIRONMENT || tab?.type === TabTypeEnum.TESTFLOW) && !tab?.isSaved}
        <div
          class="badge-container badge"
          style="width:18px ; height:18px ; align-items:center; justify-content:center;"
        >
          {#if tab?.source !== "SPEC" || !tab?.activeSync || tab?.isDeleted}
            <Badge type="dot" variant="danger" size="medium" />
          {/if}
        </div>
      {/if}

      <button
        class="cross-icon-btn p-0 align-items-center justify-content-center {// toggle cross icon for inactive tabs
        !tab.isActive ? 'inactive-close-btn' : ''} btn"
        on:click={(e) => {
          e.stopPropagation();
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
    </div>
    {#if !tab.isActive && listLength - 1 !== index}
      <div
        class="edgeLine position-absolute"
        style="height: 18px; width: 1px; background-color: var(--tab-request-divider-line) ; top: 10px; right: 0;"
      />
    {/if}
  </div></button
>
<svelte:window
  on:click={() => {
    showTabControlMenu = false;
  }}
/>

<style>
  * {
    transition: all 100ms;
  }
  .badge {
    display: flex;
  }
  .badge-container:hover .badge {
    display: none;
  }
  .badge-container:hover .divider {
    display: none;
  }
  .badge-container:hover .edgeLine {
    display: none;
  }

  .badge-container:focus .cross-icon-btn {
    display: none;
  }
  .badge-container:hover .cross-icon-btn {
    display: flex;
  }
  .cross-icon-btn {
    display: none;
  }
  .tab-item {
    margin-left: -1px;
  }
  .tab-item:hover {
    background-color: var(--bg-ds-surface-300) !important;
  }
  .tab-item:active {
    background-color: var(--bg-ds-surface-500) !important;
  }
  .tab-container {
    background-color: transparent;
    /* border: 2px solid transparent; */
    border: 0px;
  }
  .tab-container:focus-visible {
    border-radius: 4px;
    outline: none;
    border: 2px solid var(--bg-ds-primary-300);
    background-color: var(--bg-ds-surface-700);
  }
  .tab-container:focus-visible .tab-item {
    margin-left: 0px;
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
    font-weight: 500 !important;
    color: var(--text-ds-neutral-300) !important;
  }
  .individual-tab:hover .request-text {
    color: var(--text-ds-neutral-300) !important;
  }

  .cross-icon-btn:hover {
    /* background-color: var(--text-tertiary-300); */
    /* border-radius: 2px; */
  }
  .ellipsis {
    color: var(--text-ds-neutral-300);
    font-size: 12px;
  }
</style>
