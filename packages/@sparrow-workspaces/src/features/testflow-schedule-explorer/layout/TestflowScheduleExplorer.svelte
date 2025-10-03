<script lang="ts">
  import { Button, Toggle, Tooltip } from "@sparrow/library/ui";
  import type { Observable } from "rxjs";
  import type { Tab } from "@sparrow/common/types/workspace/tab";

  import { writable } from "svelte/store";
  import { ScheduleNavigator } from "../components";
  import { TestflowScheduleNavigatorEnum } from "../../../../../@sparrow-common/src/types/workspace/testflow-schedule-tab";
  import { Configurations, TestResults } from "../components";
  import { FlowChartRegular, LayerRegular } from "@sparrow/library/icons";

  export let tab: Observable<Tab>;
  export let testflow;
  export let onUpdateScheduleState;
  export let schedule;
  export let onScheduleRun;
  export let onDeleteTestflowScheduleHistory;
  export let onScheduleRunview;
  export let environments = [];
  export let workspaceUsers = [];
  export let onUpdateSchedule = (updatedSchedule) => {};
  export let onSaveSchedule;
  export let onRefreshSchedule;
  // export let environments;
  export let onEditTestflowSchedule;
  export let isTestflowScheduleEditable;
  export let onOpenEnvironment;
  export let onOpenTestflow;

  let scheduledEnvironment;
  $: {
    const filterEnvironment = environments?.find((env) => {
      if (env.toMutableJSON().id === schedule?.environmentId) {
        return true;
      }
    });
    scheduledEnvironment = filterEnvironment?.toMutableJSON() || {};
  }
</script>

{#if $tab.tabId}
  <div class="explorer-layout">
    <div class="explorer-header">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <p
          class="text-ds-font-size-20 text-ds-line-height-120 text-ds-font-weight-semi-bold mb-0"
        >
          {schedule?.name || ""}
        </p>
        <div class="d-flex gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="text-fs-12"> Active </span>
            <Toggle />
          </div>
          <Button
            title={"Run Now"}
            type={"primary"}
            onClick={() => {
              onScheduleRun();
            }}
          />
        </div>
      </div>
      <div class="d-flex pb-2">
        <Button
          title={testflow?.name}
          startIcon={FlowChartRegular}
          type={"link-secondary"}
          onClick={() => {
            onOpenTestflow(testflow?.id);
          }}
        />
        {#if scheduledEnvironment?.name}
          <Button
            title={scheduledEnvironment?.name || ""}
            startIcon={LayerRegular}
            type={"link-secondary"}
            onClick={() => {
              onOpenEnvironment(scheduledEnvironment?.id);
            }}
          />
        {/if}
      </div>
      <div class="mb-3">
        <ScheduleNavigator
          scheduleNavigator={$tab?.property?.testflowSchedule?.state
            ?.scheduleNavigator}
          {onUpdateScheduleState}
        />
      </div>
    </div>
    <div class="explorer-content">
      {#if $tab?.property?.testflowSchedule?.state?.scheduleNavigator === TestflowScheduleNavigatorEnum.TEST_RESULTS}
        <TestResults
          {schedule}
          {onScheduleRunview}
          {onDeleteTestflowScheduleHistory}
          {isTestflowScheduleEditable}
        />
      {:else if $tab?.property?.testflowSchedule?.state?.scheduleNavigator === TestflowScheduleNavigatorEnum.CONFIGURATION}
        <Configurations
          {schedule}
          {environments}
          {workspaceUsers}
          {onUpdateSchedule}
          {onSaveSchedule}
        />
      {/if}
    </div>
  </div>
{/if}

<style>
  .explorer-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background-color: var(--bg-ds-surface-900);
  }

  .explorer-header {
    padding: 16px 16px 0 16px;
    flex-shrink: 0;
  }

  .explorer-content {
    flex: 1;
    min-height: 0; /* Critical for nested flex scrolling */
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
