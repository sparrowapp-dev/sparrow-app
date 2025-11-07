<script lang="ts">
  import { TestflowDataSetExplorer } from "@sparrow/workspaces/features";
  import type { TabDocument } from "@app/database/database";
  import { TestflowDataSetExplorerPageViewModel } from "./TestflowDataSetExplorerePage.ViewModel";

  export let tab: TabDocument;

  let prevTabId = "";
  let _viewModel: TestflowDataSetExplorerPageViewModel | null = null;

  $: if (tab && prevTabId !== tab?.tabId) {
    // Initialize the ViewModel whenever the tab changes
    _viewModel = new TestflowDataSetExplorerPageViewModel(tab);
    prevTabId = tab?.tabId || "";
  }
</script>

{#if tab}
  <TestflowDataSetExplorer tab={_viewModel.tab} isWebapp={false} />
{/if}
