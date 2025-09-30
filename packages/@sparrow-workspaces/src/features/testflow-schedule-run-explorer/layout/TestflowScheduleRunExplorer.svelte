<script lang="ts">
  import ScheduleRunNavigator from "../components/schedule-navigator/ScheduleRunNavigator.svelte";
  import type { Observable } from "rxjs";
  import type { Tab } from "@sparrow/common/types/workspace/tab";
  import { Button, Toggle } from "@sparrow/library/ui";
  export let tab: Observable<Tab>;
  export let onUpdateScheduleState;
  export let onScheduleRun: () => void;
</script>

<div
  class="d-flex mock-history-explorer-layout h-100"
  style="background-color: var(--bg-ds-surface-900);"
>
  <div class="w-100 d-flex flex-column h-100 p-3 pb-0">
    <div class="d-flex justify-content-between align-items-center">
      <p
        class="text-ds-font-size-20 text-ds-line-height-120 text-ds-font-weight-semi-bold mb-0"
      >
        {$tab?.property?.testflowScheduleRun?.scheduleName || ""}
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
    <div class="d-flex">
      <span class="text-fs-10">
        {$tab?.property?.testflowScheduleRun?.testflowName}
      </span>
    </div>
    <div>
      <ScheduleRunNavigator
        scheduleNavigator={$tab?.property?.testflowScheduleRun?.state
          ?.scheduleNavigator}
        {onUpdateScheduleState}
      />
    </div>
  </div>
</div>

<style>
</style>
