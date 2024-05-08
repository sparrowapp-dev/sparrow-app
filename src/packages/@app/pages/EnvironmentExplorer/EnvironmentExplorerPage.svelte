<script>
  import { EnvironmentExplorer } from "@environments/features";
  import { EnvironmentExplorerViewModel } from "./EnvironmentExplorerPage.ViewModel";
  export let tab;
  const _viewModel = new EnvironmentExplorerViewModel(tab);
</script>

{tab.name}

<!-- <EnvironmentExplorer bind:tab={_viewModel.tab} /> -->
