<script lang="ts">
  import {
    AddRegular,
    ChevronDownRegular,
    ChevronRightRegular,
    PlusIcon,
    TreeIcon,
    FlowChartRegular,
  } from "@sparrow/library/icons";
  import { Button, List, Tooltip } from "@sparrow/library/ui";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { angleRightV2Icon as angleRight } from "@sparrow/library/assets";
  import { TestflowListItem } from "../components";
  import type { ScrollList } from "@sparrow/library/ui/list/types";
  import {
    TFDefaultEnum,
    type TFDocumentType,
  } from "@sparrow/common/types/workspace/testflow";

  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  import {
    isTestFlowTourGuideOpen,
    currentStep,
  } from "../../../stores/guide.tour";
  import { defaultCurrentStep, isDefaultTourGuideOpen } from "../../../stores";

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
  $: isExpandTestflow =
    $isDefaultTourGuideOpen === true ? true : isExpandTestflow;
</script>

<div
  class={`d-flex flex-column  pt-0 px-1`}
  style="font-weight: 500;margin-bottom:2px; "
  id="testflow-container"
>
  <!-- 
  --  Testflow Header 
  -->
  <div
    tabindex="0"
    class="d-flex align-items-center border-radius-2 me-0 mb-0 pe-2 env-sidebar"
    style="cursor:pointer; justify-content: space-between; height:32px; "
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
    on:click={toggleExpandTestflow}
  >
    <div
      class="d-flex align-items-center"
      style="width: calc(100% - 30px);  padding-left:3px;"
    >
      <span style=" display: flex; margin-right:4px; ">
        <Button
          size="extra-small"
          customWidth={"24px"}
          type="teritiary-regular"
          startIcon={!isExpandTestflow
            ? ChevronRightRegular
            : ChevronDownRegular}
        />
      </span>

      <span
        style=" display: flex;  align-items:center; justify-content:end; width:30px; height:24px; padding:4px;"
      >
        <FlowChartRegular size="16px" color="var(--bg-ds-neutral-300)" />
      </span>
      <span style="padding:2px 4px;">
        <p
          class=" mb-0 sparrow-fs-13"
          style="font-weight: 500; font-size:12px; line-height:18px;   "
        >
          Test Flows
        </p>
      </span>
    </div>

    <Tooltip
      title={`Add ${TFDefaultEnum.NAME}`}
      placement={"bottom-center"}
      distance={13}
      show={isHovered}
      zIndex={701}
    >
      <span
        class="{loggedUserRoleInWorkspace === WorkspaceRole.WORKSPACE_VIEWER
          ? 'd-none'
          : ''} add-icon-container d-flex"
      >
        <Button
          size="extra-small"
          customWidth={"24px"}
          type="teritiary-regular"
          startIcon={AddRegular}
          onClick={(e) => {
            e.stopPropagation();
            handleCreateTestflow(e);
          }}
        />
      </span>
    </Tooltip>
  </div>

  {#if isExpandTestflow}
    <div style="flex:1;" class="overflow-auto h-100" bind:this={scrollDiv}>
      <!-- 
  --  Testflow Empty screen 
  -->
      {#if filteredflows && flows.length === 0 && !searchData}
        {#if loggedUserRoleInWorkspace !== WorkspaceRole.WORKSPACE_VIEWER}
          <div class={`pb-2 px-2`}>
            <p
              class={`add-env-desc-text mb-3 text-fs-12 mb-0 fw-normal text-center`}
              style="color: var(--text-secondary-50); font-weight:300;"
            >
              Start with basic test cases to check core functions and build a
              strong testing foundation.
            </p>

            <Button
              title={`Add ${TFDefaultEnum.NAME}`}
              size={"small"}
              type="outline-secondary"
              customWidth={"100%"}
              startIcon={AddRegular}
              disabled={loggedUserRoleInWorkspace ===
                WorkspaceRole.WORKSPACE_VIEWER}
              onClick={async () => {
                await onCreateTestflow();
                MixpanelEvent(Events.Add_New_Flow);
              }}
            />
          </div>
        {/if}
      {/if}

      <!-- 
  --  Testflow List 
  -->
      <div class="position-relative">
        {#if filteredflows?.length > 0}
          <div class="box-line"></div>
          <List
            bind:scrollList
            height={"auto"}
            overflowY={"auto"}
            classProps={"pe-0 ps-0"}
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
      </div>
      {#if filteredflows?.length === 0 && searchData}
        <p
          class="mx-1 text-fs-12 mb-0 text-center"
          style="color: var(--text-secondary-550);  font-weight:300; letter-spacing: 0.5px;"
        >
          It seems we couldn't find the result matching your search query.
        </p>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .add-icon-container {
    visibility: hidden;
  }
  .env-sidebar {
    background-color: transparent;
    border-radius: 2px;
    color: var(--text-ds-neutral-50);
  }

  .env-sidebar:hover {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
  }
  .env-sidebar:hover .add-icon-container {
    visibility: visible;
  }
  .env-sidebar:focus-visible {
    background-color: var(--bg-ds-surface-400);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }
  .env-sidebar:focus-visible .add-icon-container {
    visibility: visible;
  }
  .env-sidebar:active {
    background-color: var(--bg-ds-surface-500);
    border-radius: 4px;
  }
  .env-sidebar:active .add-icon-container {
    visibility: visible;
  }
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
    background-color: var(--bg-secondary-420);
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
  .box-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 14.6px;
    width: 1px;
    background-color: var(--bg-ds-surface-100);
    z-index: 10;
    /* height: 100px; */
  }
</style>
