<script lang="ts">
  // ---- SVG
  import { AngleRightIcon } from "@sparrow/library/icons";
  import { AngleLeftIcon } from "@sparrow/library/icons";
  import { PlusIcon } from "@sparrow/library/icons";
  import { Button, Tooltip } from "@sparrow/library/ui";

  // ---- Interface
  import type { TabDocument } from "@app/database/database";

  // ---- Component
  import Tab from "../components/tab/Tab.svelte";
  import { Dropdown } from "@sparrow/library/ui";

  // ---- Helper
  import { tabBarScroller } from "@sparrow/common/utils/navigation";
  import {
    tabsSplitterDirection,
    isChatbotOpenInCurrTab,
  } from "../../../stores";
  import { HelpIcon } from "@sparrow/library/assets";
  import {
    HorizontalGridIcon,
    MoreOptions,
    VerticalGridIcon,
  } from "@sparrow/library/icons";
  import { TabTypeEnum } from "@sparrow/common/types/workspace/tab";

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

  export let onDoubleClick: (tab) => void;

  export let onClickCloseOtherTabs: (tabList: [], tabId: string) => void;
  export let onClickDuplicateTab: (tabId: string) => void;
  export let onClickForceCloseTabs: (tabList: [], tabId: string) => void;

  let isTabSaved: boolean;

  let activeTabType: string;

  const getActiveTabType = (tabList) => {
    for (const tab of tabList) {
      if (tab.isActive) {
        activeTabType = tab.type;
        isTabSaved = tab?.isSaved; // Assign the type to the variable
        break; // Exit loop since we found the active tab
      }
    }
    return activeTabType;
  };

  $: {
    if (tabList) {
      scrolable = tabList.length * 200 >= scrollerParent;

      getActiveTabType(tabList);
    }
  }

  export let onUpdateCollectionGuide: (query, isActive) => void;
  export let onFetchCollectionGuide: (query) => void;

  let tabWidth: number = 182;
  let scrolable: boolean = false;
  let scrollerParent: number;
  let scrollerWidth: number;
  let moreOption: boolean = false;
  let viewChange: boolean = false;
</script>

<button
  class="tab border-0 ps-0 py-0 pe-3 w-100 d-flex"
  style="cursor: default; background-color:var(--bg-ds-surface-700); height:36px; padding-left:2px; padding-right:2px;"
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
      <div
        class="d-inline-block my-auto pe-1 position-relative"
        style="height:24px;"
      >
        <button
          on:click={() => {
            tabBarScroller("left");
          }}
          role="button"
          class="layout p-0 d-flex align-items-center justify-content-center border-radius-2 border-0"
          style="width:24px; transform: rotate(180deg); background-color: transparent; height:24px;"
        >
          <AngleLeftIcon
            height={"12px"}
            width={"12px"}
            color="var(--text-secondary-200)"
          />
        </button>
      </div>
    {/if}
    <button
      on:dragover|preventDefault
      class=" d-inline-block tab-scroller p-0 border-0 bg-transparent"
      bind:offsetWidth={scrollerWidth}
      id="tab-scroller"
      style="overflow-x: auto; white-space: nowrap; max-width: calc(100% - 75px); height:36px"
    >
      {#if tabList}
        {#each tabList as tab, index (tab.tabId)}
          <Tab
            {tab}
            {onTabSelected}
            {onTabClosed}
            listLength={tabList.length}
            {index}
            {tabWidth}
            {onDragStart}
            {onDropOver}
            {onDoubleClick}
            {onClickCloseOtherTabs}
            {onClickForceCloseTabs}
            {onClickDuplicateTab}
          />
        {/each}
      {/if}
    </button>
    {#if scrolable}
      <div
        class="d-inline-block my-auto position-relative"
        style="height:24px;"
      >
        <button
          on:click={() => {
            tabBarScroller("right");
          }}
          role="button"
          class="layout d-flex p-0 align-items-center justify-content-center border-radius-2 border-0"
          style="width:24px; transform: rotate(180deg); background-color: transparent; height:24px;"
        >
          <AngleRightIcon
            height={"12px"}
            width={"12px"}
            color="var(--text-secondary-200)"
          />
        </button>
      </div>
    {/if}

    <div
      class="d-flex align-items-center justify-content-center my-auto"
      style="height: 24px; gap:8px;  padding:4px 8px; "
    >
      {#if tabList.length <= 0}
        <span> </span>
      {/if}
      <Tooltip
        title={"New Request"}
        placement={"bottom-center"}
        distance={10}
        zIndex={20}
      >
        <Button
          type="teritiary-regular"
          startIcon={PlusIcon}
          onClick={onNewTabRequested}
          size="small"
        />
      </Tooltip>
    </div>
    <div class="d-flex ms-auto my-auto {!tabList.length ? 'd-none' : ''}">
      {#if activeTabType === TabTypeEnum.REQUEST}
        <!-- QuickHelp Button -->
        <div
          class="d-flex align-items-center ms-auto ps-1"
          style="height: 24px;"
        >
          <Tooltip
            title={"Quick Help"}
            distance={10}
            placement={"bottom-center"}
            zIndex={10}
          >
            <button
              role="button"
              class="layout border-0 p-0 border-radius-2 d-flex align-items-center justify-content-center"
              style="height: 24px; width:24px; background-color: transparent;"
              on:click={async () => {
                const event = await onFetchCollectionGuide({
                  id: "collection-guide",
                });
                const guideData = event?.getLatest().toMutableJSON();
                if (guideData?.isActive === false) {
                  onUpdateCollectionGuide(
                    {
                      id: "collection-guide",
                    },
                    true,
                  );
                } else {
                  onUpdateCollectionGuide(
                    {
                      id: "collection-guide",
                    },
                    false,
                  );
                }
              }}
            >
              <HelpIcon
                height={"16px"}
                width={"16px"}
                color={"var(--text-secondary-200)"}
              />
            </button>
          </Tooltip>
        </div>
      {/if}
      {#if !$isChatbotOpenInCurrTab && (activeTabType === TabTypeEnum.REQUEST || activeTabType === TabTypeEnum.SAVED_REQUEST)}
        <!-- Split button -->
        <div
          class="d-flex align-items-center ms-auto ps-1"
          style="height: 24px;"
        >
          <Dropdown
            buttonId="viewChange"
            bind:isMenuOpen={viewChange}
            horizontalPosition="left"
            minWidth={175}
            options={[
              {
                name: "Split Vertically",
                icon: VerticalGridIcon,
                iconColor: "var(--icon-primary-300)",
                color: "var(--text-secondary-100)",
                iconSize: "13px",
                onclick: () => onChangeViewInRequest("vertical"),
              },
              {
                name: "Split Horizontally",
                icon: HorizontalGridIcon,
                iconColor: "var(--icon-primary-300)",
                color: "var(--text-secondary-100)",
                iconSize: "12px",
                onclick: () => onChangeViewInRequest("horizontal"),
              },
            ]}
          >
            <Tooltip
              title={"Layout"}
              placement={"left-center"}
              distance={12}
              show={!viewChange}
              zIndex={10}
            >
              <button
                id="viewChange"
                class="border-0 p-0 pt-0 border-radius-2 d-flex align-items-center justify-content-center layout"
                style="background-color: transparent; height:24px; width:24px;"
                on:click={() => {
                  viewChange = !viewChange;
                }}
              >
                {#if $tabsSplitterDirection === "horizontal"}
                  <HorizontalGridIcon
                    color={"var(--icon-secondary-200)"}
                    height={12}
                  />
                {:else}
                  <VerticalGridIcon
                    height={12}
                    color="var(--icon-secondary-200)"
                  />
                {/if}
              </button>
            </Tooltip>
          </Dropdown>

          <Dropdown
            buttonId="moreOptions"
            bind:isMenuOpen={moreOption}
            horizontalPosition="left"
            minWidth={150}
            options={[]}
          >
            <button
              id="moreOptions"
              class="border-0 bg-transparent p-0 rounded d-none"
              on:click={() => {
                moreOption = !moreOption;
              }}
            >
              <MoreOptions height={15} />
            </button>
          </Dropdown>
        </div>
      {/if}
    </div>
  </div>
</button>

<style>
  * {
    transition: all 300ms;
  }
  .tabbar {
    height: 100%;
    background-color: var(--sparrow-black);
  }

  .tab-scroller::-webkit-scrollbar {
    display: none;
  }
  .layout:hover {
    background-color: var(--tab-bar-hover) !important;
  }
</style>
