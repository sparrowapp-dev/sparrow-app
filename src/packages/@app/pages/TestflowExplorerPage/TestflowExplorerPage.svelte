<script lang="ts">
  import type { Observable } from "rxjs";
  import { TestflowExplorerPageViewModel } from "./TestflowExplorerPage.ViewModel";
  import { TestflowExplorer } from "@workspaces/features/testflow-explorer";
  import type { CollectionDocument } from "@app/database/database";
  import { testFlowDataStore } from "@workspaces/features/socket-explorer/store/testflow";
  export let tab;
  const _viewModel = new TestflowExplorerPageViewModel(tab);
  let collectionList: Observable<CollectionDocument[]> =
    _viewModel.getCollectionList();

  let render = false;
  const sub = _viewModel.tab.subscribe((val) => {
    if (val?.tabId) {
      render = true;
    }
  });
  let testflowStore;
  testFlowDataStore.subscribe((val) => {
    if (val) {
      testflowStore = val.get(tab?.tabId);
      console.log(testflowStore, "TF");
    }
  });
</script>

{#if render}
  <TestflowExplorer
    tab={_viewModel.tab}
    {testflowStore}
    onUpdateNodes={_viewModel.updateNodes}
    onUpdateEdges={_viewModel.updateEdges}
    {collectionList}
    onClickRun={_viewModel.handleTestFlowRun}
    toggleHistoryDetails={_viewModel.toggleHistoryDetails}
    toggleHistoryContainer={_viewModel.toggleHistoryContainer}
  />
{/if}
