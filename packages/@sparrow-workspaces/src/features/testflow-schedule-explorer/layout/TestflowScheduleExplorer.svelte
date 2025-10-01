<script lang="ts">
  import { Button, Toggle, Tooltip } from "@sparrow/library/ui";
  import type { Observable } from "rxjs";
  import type { Tab } from "@sparrow/common/types/workspace/tab";

  import { writable } from "svelte/store";
  import { ScheduleNavigator } from "../components";
  import { TestflowScheduleNavigatorEnum } from "../../../../../@sparrow-common/src/types/workspace/testflow-schedule-tab";
  import { Configurations } from "../components";
  import TestResults from "../components/test-results/TestResults.svelte";

  export let tab: Observable<Tab>;
  export let testflow;
  export let onUpdateScheduleState;
  export let schedule;
  export let onScheduleRun;
  export let environments = [];
  export let workspaceUsers = [];
  export let onUpdateSchedule = (updatedSchedule) => {};
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
      <div class="d-flex mb-2">
        <span class="text-fs-10">
          {testflow?.name}
        </span>
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
        <TestResults {schedule} />
      {:else if $tab?.property?.testflowSchedule?.state?.scheduleNavigator === TestflowScheduleNavigatorEnum.CONFIGURATION}
        <Configurations
          {schedule}
          {environments}
          {workspaceUsers}
          {onUpdateSchedule}
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

  /* Utility classes */
  .mb-2 {
    margin-bottom: 0.5rem;
  }

  .mb-3 {
    margin-bottom: 1rem;
  }

  .d-flex {
    display: flex;
  }

  .justify-content-between {
    justify-content: space-between;
  }

  .align-items-center {
    align-items: center;
  }

  .gap-2 {
    gap: 0.5rem;
  }
</style>
