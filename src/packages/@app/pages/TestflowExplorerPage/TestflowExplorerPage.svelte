<script lang="ts">
  import { TestflowExplorerPageViewModel } from "./TestflowExplorerPage.ViewModel";
  import { TestflowExplorer } from "@workspaces/features/testflow-explorer";
  export let tab;
  const _viewModel = new TestflowExplorerPageViewModel(tab);

  let render = false;
  const sub = _viewModel.tab.subscribe((val) => {
    if (val?.tabId) {
      render = true;
    }
  });
</script>

{#if render}
  <TestflowExplorer
    tab={_viewModel.tab}
    onUpdateNodes={_viewModel.updateNodes}
    onUpdateEdges={_viewModel.updateEdges}
  />
{/if}
