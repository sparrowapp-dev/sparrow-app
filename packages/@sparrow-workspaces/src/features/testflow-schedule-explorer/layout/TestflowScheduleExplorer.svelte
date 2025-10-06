<script lang="ts">
  import { Button, Toggle, Tooltip } from "@sparrow/library/ui";
  import type { Observable } from "rxjs";
  import type { Tab } from "@sparrow/common/types/workspace/tab";

  import { writable } from "svelte/store";
  import { ScheduleNavigator } from "../components";
  import { TestflowScheduleNavigatorEnum } from "../../../../../@sparrow-common/src/types/workspace/testflow-schedule-tab";
  import { Configurations, TestResults } from "../components";
  import {
    ArrowClockWiseRegular,
    FlowChartRegular,
    LayerRegular,
  } from "@sparrow/library/icons";
  import {
    startLoading,
    stopLoading,
    loadingState,
  } from "@sparrow/common/store";
  import {
    planContentDisable,
    TimeISOExtractor,
    FormatDays,
  } from "@sparrow/common/utils";

  export let tab: Observable<Tab>;
  export let testflow;
  export let onUpdateScheduleState;
  export let schedule;
  export let onScheduleRun;
  export let onDeleteTestflowScheduleHistory;
  export let onScheduleRunview;
  export let onRefreshSchedule;
  export let onEditTestflowSchedule;
  export let isTestflowScheduleEditable;
  export let onOpenEnvironment;
  export let onOpenTestflow;
  export let environments = [];
  export let workspaceUsers = [];
  export let onUpdateSchedule = (updatedSchedule) => {};
  export let onSaveSchedule;

  const extractTimeFromISOString = new TimeISOExtractor()
    .extractTimeFromISOString;

  const formatDaysInstance = new FormatDays();

  let scheduledEnvironment;
  $: {
    const filterEnvironment = environments?.find((env) => {
      if (env.toMutableJSON().id === schedule?.environmentId) {
        return true;
      }
    });
    scheduledEnvironment = filterEnvironment?.toMutableJSON() || {};
  }

  let description = "";

  $: {
    if (schedule.runConfiguration) {
      const config = schedule.runConfiguration;
      if (!schedule.isActive) {
        description = "Paused";
      } else if (config.runCycle === "once" && config.executeAt) {
        const date = new Date(config.executeAt);
        description = `Run once on ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
      } else if (config.runCycle === "hourly" && config.intervalHours) {
        description = `Run every ${config.intervalHours} hour${config.intervalHours > 1 ? "s" : ""}`;
      } else if (config.runCycle === "daily" && config.time) {
        description = `Run everyday at ${extractTimeFromISOString(config.time)}`;
      } else if (config.runCycle === "weekly" && config.days && config.time) {
        const dayNames = formatDaysInstance.formatDays(config.days);
        description = `Run every ${dayNames} at ${extractTimeFromISOString(config.time)}`;
      }
    }
  }
</script>

{#if $tab.tabId}
  <div
    class="d-flex mock-history-explorer-layout h-100"
    style="background-color: var(--bg-ds-surface-900);"
  >
    <div class="w-100 d-flex flex-column h-100 p-3 pb-0">
      <div class="d-flex justify-content-between align-items-center">
        <p
          class="text-ds-font-size-20 text-ds-line-height-120 text-ds-font-weight-semi-bold mb-0"
        >
          {schedule?.name || ""}
        </p>
        <div class="d-flex gap-2">
          {#if isTestflowScheduleEditable}
            <div class="d-flex align-items-center gap-2">
              <Toggle
                isActive={schedule?.isActive || false}
                label="Active"
                fontWeight="500"
                onChange={() => {
                  onEditTestflowSchedule(!schedule?.isActive);
                }}
              />
            </div>
            <Button
              title={"Run Now"}
              type={"primary"}
              loader={$loadingState.get("schedule-run-" + schedule?.id)}
              disable={$loadingState.get("schedule-run-" + schedule?.id)}
              onClick={async () => {
                startLoading("schedule-run-" + schedule?.id);
                await onScheduleRun();
                stopLoading("schedule-run-" + schedule?.id);
              }}
            />
          {/if}
          <Button
            title={""}
            startIcon={ArrowClockWiseRegular}
            type={"secondary"}
            loader={$loadingState.get("schedule-refresh-" + schedule?.id)}
            disable={$loadingState.get("schedule-refresh-" + schedule?.id)}
            onClick={async () => {
              startLoading("schedule-refresh-" + schedule?.id);
              await onRefreshSchedule();
              stopLoading("schedule-refresh-" + schedule?.id);
            }}
          />
        </div>
      </div>
      <div class="d-flex pb-2">
        <Button
          title={testflow?.name}
          startIcon={FlowChartRegular}
          type={"link-secondary"}
          size={"extra-small"}
          onClick={() => {
            onOpenTestflow(testflow?._id);
          }}
        />
        {#if scheduledEnvironment?.name}
          <div class="d-flex gap-2 align-items-center">
            <span
              class="dot"
              style="transform: translateX(12px) translateY(2px);"
            ></span>
            <Button
              title={scheduledEnvironment?.name || ""}
              startIcon={LayerRegular}
              type={"link-secondary"}
              size={"extra-small"}
              onClick={() => {
                onOpenEnvironment(scheduledEnvironment?.id);
              }}
            />
          </div>
        {/if}
        {#if description}
          <div class="d-flex gap-2 align-items-center pt-1">
            <span class="dot"></span>
            <p
              class="text-fs-12 mb-0"
              style="color: var(--text-ds-neutral-200)"
            >
              {description || ""}
            </p>
          </div>
        {/if}
      </div>
      <div>
        <ScheduleNavigator
          scheduleNavigator={$tab?.property?.testflowSchedule?.state
            ?.scheduleNavigator}
          {onUpdateScheduleState}
        />
      </div>
      <div style="flex:1; overflow:auto;">
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
            isSaved={$tab?.isSaved}
          />
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .dot {
    height: 4px;
    width: 4px;
    background-color: var(--text-ds-neutral-200);
    border-radius: 50%;
  }
</style>
