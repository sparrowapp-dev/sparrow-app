<script lang="ts">
  import { PlusIcon, TreeIcon } from "@sparrow/library/icons";
  import { List, Tooltip } from "@sparrow/library/ui";
  import { WorkspaceRole } from "@deprecate/utils/enums";
  import angleRight from "@deprecate/assets/angle-right-v2.svg";
  import { TestflowListItem } from "../components";
  import type { ScrollList } from "@sparrow/library/ui/list/types";
  import {
    TFDefaultEnum,
    type TFDocumentType,
  } from "@sparrow/common/types/workspace/testflow";

  import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  /**
   * current workspace
   */
  export let currentWorkspace;
  /**
   * testflow list
   */
  export let testflows: TFDocumentType[] = [];
  /**
   * opened testflow
   */

  /**
   * workspace access permission
   */
  export let loggedUserRoleInWorkspace: WorkspaceRole;

  /**
   * creates the testflow
   */
  export let onCreateTestflow: any;
  /**
   * opens the global testflow
   */
  export let onOpenTestflow;
  /**
   * deletes the testflow
   */
  export let onDeleteTestflow;
  /**
   * updates the testflow
   */
  export let onUpdateTestflow;

  export let searchData = "";

  export let isExpandTestflow = false;

  export let toggleExpandTestflow;

  export let activeTabId;

  let scrollList: ScrollList;
  let isHovered = false;

  const handleMouseOver = () => {
    isHovered = true;
  };

  const handleMouseOut = () => {
    isHovered = false;
  };

  let flows = [];
  const filterTestflowToWorkspace = (
    _testflows: TFDocumentType[],
    _workspaceId: string,
  ) => {
    if (_testflows && _workspaceId) {
      flows = _testflows.filter((element: TFDocumentType) => {
        return element.workspaceId === _workspaceId;
      });
    }
  };
  $: {
    if (testflows || currentWorkspace?._id) {
      filterTestflowToWorkspace(testflows, currentWorkspace?._id);
    }
  }

  async function handleCreateTestflow() {
    if (!isExpandTestflow) {
      isExpandTestflow = !isExpandTestflow;
    }
    await onCreateTestflow();
    setTimeout(() => {
      scrollToBottom();
    }, 1000);
  }

  $: filteredflows = searchData
    ? flows.filter((flow) =>
        flow.name.toLowerCase().includes(searchData.toLowerCase()),
      )
    : flows;

  let scrollDiv: HTMLElement;

  function scrollToBottom() {
    if (scrollDiv) {
      scrollDiv.scrollTo({
        top: scrollDiv.scrollHeight,
        behavior: "smooth",
      });
    }
  }
</script>

<div
  class={`d-flex flex-column  h-100 env-sidebar bg-secondary-900 pt-0 px-1`}
  style="font-weight: 500;"
>
  <!-- 
  --  Testflow Header 
  -->
  <div
    class="d-flex align-items-center rounded-1 me-0 mb-0 pe-2"
    style="cursor:pointer; justify-content: space-between; height:32px;
        background-color: {isHovered
      ? 'var(--dropdown-option-hover)'
      : 'transparent'}; "
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
    on:click={toggleExpandTestflow}
  >
    <div
      class="d-flex align-items-center ps-3 pe-1 py-1"
      style="width: calc(100% - 30px);"
    >
      <img
        src={angleRight}
        class="me-3"
        style="height:8px; width:4px; margin-right:8px; {isExpandTestflow
          ? 'transform:rotate(90deg);'
          : 'transform:rotate(0deg);'}"
        alt="angleRight"
      />
      <TreeIcon
        height={"12px"}
        width={"12px"}
        color={"var(--icon-secondary-130)"}
      />

      <p class="ms-2 mb-0 sparrow-fs-13" style="font-weight: 500;">
        Test Flows
      </p>
    </div>

    <Tooltip
      title={`Add New ${TFDefaultEnum.NAME}`}
      placement={"bottom"}
      distance={13}
      show={isHovered}
      zIndex={701}
    >
      <button
        style="height: 24px; width:24px;"
        class="{loggedUserRoleInWorkspace === WorkspaceRole.WORKSPACE_VIEWER
          ? 'd-none'
          : ''} add-icon-container border-0 rounded-1 d-flex justify-content-center align-items-center {isHovered
          ? 'testflow-active'
          : 'testflow-inactive'}"
        on:click|stopPropagation={handleCreateTestflow}
      >
        <PlusIcon
          height={"18px"}
          width={"18px"}
          color={"var( --white-color)"}
        />
      </button>
    </Tooltip>
  </div>

  {#if isExpandTestflow}
    <div
      style="flex:1;"
      class="overflow-auto h-100 mt-1 ps-2"
      bind:this={scrollDiv}
    >
      <!-- 
  --  Testflow Empty screen 
  -->
      {#if filteredflows && flows.length === 0}
        {#if loggedUserRoleInWorkspace !== WorkspaceRole.WORKSPACE_VIEWER}
          <div class={`pb-2 px-2`}>
            <p
              class={`add-env-desc-text mb-3 text-fs-12 mb-0 fw-normal text-center`}
              style="color: var(--text-secondary-50)"
            >
              Start with basic test cases to check core functions and build a
              strong testing foundation.
            </p>
            <button
              class=" w-100 add-testflow bg-transparent d-flex justify-content-center align-items-center border-radius-2"
              style="color: var(--text-secondary-100);"
              disabled={loggedUserRoleInWorkspace ===
                WorkspaceRole.WORKSPACE_VIEWER}
              on:click={async () => {
                await onCreateTestflow();
                MixpanelEvent(Events.Add_New_Flow);
              }}
            >
              <PlusIcon
                height={"22px"}
                width={"22px"}
                color={"var(--text-secondary-200)"}
              />
              <span
                style="color: var(--text-secondary-200)"
                class="ps-2 fw-bold text-fs-12"
                >Add New {TFDefaultEnum.NAME}</span
              >
            </button>
          </div>
        {/if}
      {/if}

      <!-- 
  --  Testflow List 
  -->
      {#if filteredflows?.length > 0}
        <List
          bind:scrollList
          height={"auto"}
          overflowY={"auto"}
          classProps={"pe-0"}
          style={"flex:1;"}
        >
          {#each filteredflows as flow}
            <TestflowListItem
              bind:loggedUserRoleInWorkspace
              {flow}
              {currentWorkspace}
              {onDeleteTestflow}
              {onUpdateTestflow}
              {onOpenTestflow}
              {activeTabId}
            />
          {/each}
        </List>
      {/if}
      {#if filteredflows?.length === 0 && searchData}
        <p
          class="mx-1 mb-2 mt-1 text-fs-12 mb-0 text-center"
          style="color: var(--text-secondary-550);  font-weight:300; letter-spacing: 0.5px;"
        >
          No Result Found
        </p>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .icon-default {
    display: inline;
  }

  .icon-hover {
    display: none;
  }

  .env-item:hover .icon-default {
    display: none;
  }

  .env-item:hover .icon-hover {
    display: inline;
  }

  .env-item.active .icon-default {
    display: none;
  }

  .env-item.active .icon-hover {
    display: inline;
  }

  .testflow-inactive {
    visibility: hidden;
  }
  .testflow-active {
    visibility: visible;
    background-color: transparent;
  }

  .testflow-active:hover {
    visibility: visible;
    background-color: var(--bg-tertiary-190);
  }
  .testflow-active:active {
    visibility: visible;
    background-color: var(--bg-secondary-420);
  }
  .curr-workspace {
    max-height: 20vw;
  }
  .add-env-mini-btn {
    background-color: transparent;
  }
  .add-env-mini-btn:hover {
    background-color: var(--border-color);
  }
  .add-env-mini-btn:active {
    background: var(--workspace-hover-color);
  }
  .env-item {
    padding: 6px 6px 6px 12px;
  }
  .env-item:hover {
    background-color: var(--bg-secondary-320);
  }
  .env-item.active {
    background-color: var(--bg-tertiary-600);
  }

  .env-side-tab-list {
    list-style: none;
    overflow: none;
  }

  .show-more-btn {
    margin-right: 0;
    background-color: transparent;
    visibility: hidden;
  }

  .env-item:hover .show-more-btn {
    visibility: visible;
  }

  .show-more-btn.active {
    visibility: visible;
  }
  .rename-input {
    background-color: transparent;
  }
  .rename-input:focus {
    outline: none;
    background-color: var(--border-color);
    border-bottom: 1px solid #85c2ff !important;
  }
  .add-testflow {
    border: 1px solid var(--text-secondary-300);
    border-radius: 2px;
    height: 32px;
  }
  .add-testflow:hover {
    border: 1px solid var(--border-primary-300);
    border-radius: 2px;
  }
  button:disabled {
    pointer-events: none !important;
  }
</style>
