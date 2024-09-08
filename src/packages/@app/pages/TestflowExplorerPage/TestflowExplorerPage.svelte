<script lang="ts">
  import { TestflowExplorerPageViewModel } from "./TestflowExplorerPage.ViewModel";
  import { TestflowExplorer } from "@workspaces/features/testflow-explorer";
  export let tab;
  const _viewModel = new TestflowExplorerPageViewModel(tab);
</script>

<TestflowExplorer />
