<script lang="ts">
  import { TestflowScheduleRunExplorePage } from "./TestflowScheduleRunExplorePage";
  import { TestflowScheduleRunExplorer } from "@sparrow/workspaces/features";
  import { user } from "@app/store/auth.store";
  import type { TabDocument } from "@app/database/database";

  export let tab: TabDocument;
  let _viewModel: any;
  let prevTabId = "";
  let prevTabName = "";
  let userId = "";

  user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });

  $: {
    if (tab) {
      if (prevTabId !== tab?.tabId) {
        // Initialize new view model
        _viewModel = new TestflowScheduleRunExplorePage(tab);
      } else if (tab?.name && prevTabName !== tab.name) {
        // handle tab name change if needed
      }
      prevTabName = tab?.name || "";
      prevTabId = tab?.tabId || "";
    }
  }
</script>

<div>
  {#if _viewModel}
    <TestflowScheduleRunExplorer
      tab={_viewModel.tab}
      onUpdateScheduleState={_viewModel.updateScheduleState}
      onScheduleRun={_viewModel.runTestflowSingleSchedule}
    />
  {/if}
</div>
