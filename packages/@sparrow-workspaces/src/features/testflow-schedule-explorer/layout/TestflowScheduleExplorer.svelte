<script lang="ts">
  import { Button, Modal, Spinner, Toggle, Tooltip } from "@sparrow/library/ui";
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
  export let userRole;
  export let onValidateTestflowRun;

  let scheduleRunValidateData: {
    hasLocalhostUrls?: boolean;
    hasFormdataFiles?: boolean;
  };

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

  let isScheduleExpired = false;
  $: {
    if (schedule?.runConfiguration?.runCycle === "once") {
      const pastCron = schedule?.cronExpression;
      if (pastCron) {
        const parts = pastCron.trim().split(/\s+/);

        let second = parseInt(parts[0], 10);
        let minute = parseInt(parts[1], 10);
        let hour = parseInt(parts[2], 10);
        let day = parseInt(parts[3], 10);
        let month = parseInt(parts[4], 10) - 1;

        // Start from the past time
        let now = new Date();
        let next = new Date(
          Date.UTC(now.getUTCFullYear(), month, day, hour, minute, second, 0),
        );

        // If the past time is in the past, keep adding interval until it's in the future
        if (next <= now) {
          isScheduleExpired = true;
        } else {
          isScheduleExpired = false;
        }
      } else {
        isScheduleExpired = true;
      }
    }
  }

  let isRunScheduleModalOpen = false;
</script>

{#if $tab.tabId}
  <div
    class="d-flex mock-history-explorer-layout h-100"
    style="background-color: var(--bg-ds-surface-900);"
  >
    <div class="w-100 d-flex flex-column h-100 p-3 pb-0">
      <div class="d-flex justify-content-between align-items-center">
        <p
          class="ellipsis text-ds-font-size-20 text-ds-line-height-120 text-ds-font-weight-semi-bold mb-0"
          style="padding-right: 30%;"
        >
          {schedule?.name || ""}
        </p>
        <div class="d-flex gap-2">
          {#if isTestflowScheduleEditable}
            <div
              class="d-flex align-items-center gap-2"
              style={isScheduleExpired
                ? "pointer-events: none; opacity: 0.7;"
                : ""}
            >
              {#if $loadingState.get("schedule-status-" + schedule?.id)}
                <Spinner size={"14px"} />
              {:else}
                <Toggle
                  isActive={isScheduleExpired
                    ? false
                    : schedule?.isActive || false}
                  label={isScheduleExpired
                    ? "expired"
                    : schedule?.isActive
                      ? "Active"
                      : "Inactive"}
                  fontWeight="500"
                  onChange={async () => {
                    startLoading("schedule-status-" + schedule?.id);
                    await onEditTestflowSchedule(!schedule?.isActive);
                    stopLoading("schedule-status-" + schedule?.id);
                  }}
                />
              {/if}
            </div>
            <Tooltip
              title={"Run Scheduled Flow Now"}
              placement={"top-center"}
              size="small"
            >
              <Button
              title={"Run Now"}
                type={"primary"}
                loader={$loadingState.get("schedule-run-" + schedule?.id)}
                disable={$loadingState.get("schedule-run-" + schedule?.id)}
                onClick={async () => {
                  startLoading("schedule-run-" + schedule?.id);
                  scheduleRunValidateData = await onValidateTestflowRun();
                  if (
                    scheduleRunValidateData?.hasLocalhostUrls ||
                    scheduleRunValidateData?.hasFormdataFiles
                  ) {
                    isRunScheduleModalOpen = true;
                  } else {
                    await onScheduleRun();
                  }
                  stopLoading("schedule-run-" + schedule?.id);
                }}
                loaderText={"Running"}
              />
            </Tooltip>
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
      <div class="d-flex pb-3">
        {#if testflow?.name}
          <Button
            title={testflow?.name?.length > 30
              ? testflow?.name?.slice(0, 30) + "..."
              : testflow?.name || ""}
            startIcon={FlowChartRegular}
            type={"link-secondary"}
            size={"extra-small"}
            onClick={() => {
              onOpenTestflow(testflow?._id);
            }}
          />
        {/if}
        {#if scheduledEnvironment?.name}
          <div class="d-flex gap-2 align-items-center">
            <span
              class="dot"
              style="transform: translateX(12px) translateY(2px);"
            ></span>
            <Button
              title={scheduledEnvironment?.name?.length > 30
                ? scheduledEnvironment?.name?.slice(0, 30) + "..."
                : scheduledEnvironment?.name || ""}
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
              {isScheduleExpired ? "Expired" : description || ""}
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
            {userRole}
          />
        {/if}
      </div>
    </div>
  </div>
{/if}

<Modal
  title={"Run Schedule"}
  zIndex={1000}
  isOpen={isRunScheduleModalOpen}
  width={"35%"}
  handleModalState={() => {
    isRunScheduleModalOpen = false;
  }}
>
  <div class="mt-2 mb-4">
    {#if scheduleRunValidateData?.hasLocalhostUrls && scheduleRunValidateData?.hasFormdataFiles}
      <p
        class="text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium mb-3"
        style="color: var(--text-ds-neutral-100);"
      >
        The schedule <b>“{schedule?.name || ""}”</b> contains APIs that may not execute
        on the cloud. It includes local-only endpoints and form-data file uploads,
        which cannot be accessed during scheduled execution.
      </p>
    {:else if scheduleRunValidateData?.hasFormdataFiles}
      <p
        class="text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium mb-3"
        style="color: var(--text-ds-neutral-100);"
      >
        The schedule <b>“{schedule?.name || ""}”</b> includes form-data file uploads
        that can’t be executed on the cloud. Please remove or replace them before
        proceeding.
      </p>
    {:else if scheduleRunValidateData?.hasLocalhostUrls}
      <p
        class="text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium mb-3"
        style="color: var(--text-ds-neutral-100);"
      >
        The schedule <b>“{schedule?.name || ""}”</b> contains local APIs that will
        not execute on the cloud. To ensure all tests run successfully, deploy the
        APIs before running.
      </p>
    {:else}
      <p
        class="text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium mb-3"
        style="color: var(--text-ds-neutral-100);"
      >
        Something went wrong while validating the testflow before running the
        schedule.
      </p>
    {/if}
  </div>
  <div class="d-flex justify-content-end gap-2">
    <Button
      title={"Cancel"}
      textClassProp={"fs-6"}
      size={"medium"}
      customWidth={"95px"}
      type={"secondary"}
      onClick={() => {
        isRunScheduleModalOpen = false;
      }}
    ></Button>
    <Button
      title={"Run Anyway"}
      size={"medium"}
      textClassProp={"fs-6"}
      type={"primary"}
      customWidth={"155px"}
      onClick={async () => {
        isRunScheduleModalOpen = false;
        startLoading("schedule-run-" + schedule?.id);
        await onScheduleRun();
        stopLoading("schedule-run-" + schedule?.id);
      }}
    ></Button>
  </div>
</Modal>

<style>
  .dot {
    height: 4px;
    width: 4px;
    background-color: var(--text-ds-neutral-200);
    border-radius: 50%;
  }
</style>
