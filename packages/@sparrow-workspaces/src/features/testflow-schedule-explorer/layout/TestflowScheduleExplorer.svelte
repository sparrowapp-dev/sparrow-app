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
          Testflow Schedule
        </p>
        <div class="d-flex gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="text-fs-12"> Active </span>
            <Toggle />
          </div>
          <Button title={"Run Now"} type={"primary"} onClick={() => {}} />
        </div>
      </div>
      <div class="d-flex">
        <span class="text-fs-10">
          {testflow?.name}
        </span>
      </div>
      <div>
        <ScheduleNavigator
          scheduleNavigator={$tab?.property?.testflowSchedule?.state
            ?.scheduleNavigator}
          {onUpdateScheduleState}
        />
      </div>
      <div>
        {#if $tab?.property?.testflowSchedule?.state?.scheduleNavigator === TestflowScheduleNavigatorEnum.TEST_RESULTS}
          <TestResults />
        {:else if $tab?.property?.testflowSchedule?.state?.scheduleNavigator === TestflowScheduleNavigatorEnum.CONFIGURATION}
          <Configurations />
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
</style>
