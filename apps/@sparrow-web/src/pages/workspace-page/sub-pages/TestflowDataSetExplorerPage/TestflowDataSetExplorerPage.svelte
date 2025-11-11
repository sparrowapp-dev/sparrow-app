<script lang="ts">
  import { TestflowDataSetExplorer } from "@sparrow/workspaces/features";
  import type { TabDocument } from "src/database/database";
  import { TestflowDataSetExplorerPageViewModel } from "./TestflowDataSetExplorerePage.ViewModel";
  import { TestflowExplorerPageViewModel } from "../TestflowExplorerPage/TestflowExplorerPage.ViewModel";

  export let tab: TabDocument;

  let prevTabId = "";
  let _viewModel: TestflowDataSetExplorerPageViewModel | null = null;

  $: {
    if (tab && prevTabId !== tab?.tabId) {
      _viewModel = new TestflowDataSetExplorerPageViewModel(tab);
      prevTabId = tab?.tabId || "";
    }
  }
</script>

{#if tab && _viewModel}
  <TestflowDataSetExplorer
    bind:tab={_viewModel.tab}
    isWebApp={true}
    onUpdateName={_viewModel.updateName}
    onRenameDataset={_viewModel.renameTestDataSet}
    onSaveDataset={_viewModel.saveDataset}
  />
{/if}
