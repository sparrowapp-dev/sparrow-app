<script lang="ts">
  // ---- SVG
  import { AngleRightIcon } from "@sparrow/library/icons";
  import { AngleLeftIcon } from "@sparrow/library/icons";
  import { PlusIcon } from "@sparrow/library/icons";
  import { Tooltip } from "@sparrow/library/ui";

  // ---- Interface
  import type { TabDocument } from "@app/database/database";

  // ---- Component
  import Tab from "../components/tab/Tab.svelte";
  import { Dropdown } from "@sparrow/library/ui";

  // ---- Helper
  import { tabBarScroller } from "@sparrow/common/utils/navigation";
  import { requestSplitterDirection } from "@sparrow/workspaces/features/rest-explorer/store";
  import { HelpIcon } from "@sparrow/library/assets";
  import {
    HorizontalGridIcon,
    MoreOptions,
    VerticalGridIcon,
  } from "@sparrow/library/icons";
  import { TabTypeEnum } from "@sparrow/common/types/workspace";

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

  let isTabSaved: boolean;

  export let isGuestUser = false;

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
      scrolable = tabList.length * 182 >= scrollerParent;
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
  let showContainer = false;
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
        <button
          on:click={() => {
            tabBarScroller("left");
          }}
          role="button"
          class=" btn border-0 ps-0 pe-2 py-auto h-100 w-100"
          style=" width:20px; transform: rotate(180deg); margin: 0 !important; height:2px; "
        >
          <div
            class="left-btn d-flex justify-content-center align-items-center"
            style="height: 22px; width:22px;"
          >
            <AngleLeftIcon
              height={"12px"}
              width={"24px"}
              color="var(--text-secondary-200)"
            />
          </div>
        </button>
      </div>
    {/if}
    <button
      on:dragover|preventDefault
      class=" d-inline-block tab-scroller border-0 bg-transparent"
      bind:offsetWidth={scrollerWidth}
      id="tab-scroller"
      style="overflow-x: auto; white-space: nowrap; max-width: calc(100% - 75px); "
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
        style="height:35px; width:35px;"
      >
        <div
          class="position-absolute"
          style="height: 18px; width: 1px; background-color: var(--tab-request-divider-line) ; top: 10px; left: 0;"
        />
        <button
          on:click={() => {
            tabBarScroller("right");
          }}
          role="button"
          class=" btn border-0 ps-1 pe-1 py-auto h-100 w-100"
          style=" width:20px; transform: rotate(180deg); margin: 0 !important; height:22px;"
        >
          <div
            class="right-btn d-flex pt-1 pb-1 justify-content-center align-items-center"
            style="height: 22px; width:22px;"
          >
            <AngleRightIcon
              height={"12px"}
              width={"24px"}
              color="var(--text-secondary-200)"
            />
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
      <Tooltip
        title={"Add Request"}
        placement={"bottom"}
        distance={10}
        zIndex={20}
      >
        <button
          on:click={onNewTabRequested}
          role="button"
          class=" btn border-0 pt-1 ps-1 pe-2 py-auto h-100 w-100"
          style=" width:20px; transform: rotate(180deg); margin: 0 !important; height:22px;"
        >
          <div
            class="plus-btn d-flex pt-1 pb-1 justify-content-center align-items-center"
            style="height: 22px; width:22px;"
          >
            <PlusIcon
              height={"24px"}
              width={"24px"}
              color="var(--text-secondary-200)"
            />
          </div>
        </button>
      </Tooltip>
    </div>
    <div class=" d-flex ms-auto my-auto me-2 {!tabList.length ? 'd-none' : ''}">
      {#if activeTabType === TabTypeEnum.REQUEST}
        <!-- QuickHelp Button -->
        <div>
          <button
            role="button"
            class=" btn border-0 pt-1 ps-1 pe-2 py-auto h-100 w-100"
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
            <Tooltip
              title={"Quick Help"}
              distance={10}
              placement={"bottom"}
              zIndex={10}
            >
              <div
                class="plus-btn d-flex pt-1 pb-1 justify-content-center align-items-center"
                style="height: 24px; width:24px;"
              >
                <HelpIcon
                  height={"16px"}
                  width={"16px"}
                  color={"var(--text-secondary-200)"}
                />
              </div>
            </Tooltip>
          </button>
        </div>

        <!-- Split button -->
        <div
          class="layout d-flex align-items-center ms-auto mt-1"
          style="height: 24px; "
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
              placement={"left"}
              distance={12}
              show={!viewChange}
              zIndex={10}
            >
              <button
                id="viewChange"
                class="border-0 bg-transparent pt-0 rounded"
                on:click={() => {
                  viewChange = !viewChange;
                }}
              >
                {#if $requestSplitterDirection === "horizontal"}
                  <HorizontalGridIcon
                    color={"var(--icon-secondary-200)"}
                    height={13}
                  />
                {:else}
                  <VerticalGridIcon
                    height={13}
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
              class="border-0 bg-transparent pt-1 rounded d-none"
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
    height: 35px;
    background-color: var(--sparrow-black);
  }

  .tab-scroller::-webkit-scrollbar {
    display: none;
  }
  .right-btn:hover {
    background-color: var(--tab-bar-hover);
    border-radius: 2px;
  }
  .left-btn:hover {
    background-color: var(--tab-bar-hover);
    border-radius: 2px;
  }
  .plus-btn:hover {
    background-color: var(--tab-bar-hover);
    border-radius: 2px;
  }
  .layout:hover {
    background-color: var(--tab-bar-hover);
    border-radius: 2px;
  }
</style>
