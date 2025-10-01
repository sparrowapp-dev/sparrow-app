<script lang="ts">
  import { TestflowScheduleRVExplorePage } from "./TestflowScheduleRVExplorerPage.ViewModel";
  import { user } from "@app/store/auth.store";
  import type { TabDocument } from "@app/database/database";
  import { TestflowScheduleRVExplorer } from "@sparrow/workspaces/features";

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
        _viewModel = new TestflowScheduleRVExplorePage(tab);
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
    <TestflowScheduleRVExplorer tab={_viewModel.tab} />
  {/if}
</div>
