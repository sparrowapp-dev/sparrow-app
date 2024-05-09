<script>
  import { EnvironmentExplorer } from "@environments/features";
  import { EnvironmentExplorerViewModel } from "./EnvironmentExplorerPage.ViewModel";
  export let tab;
  const _viewModel = new EnvironmentExplorerViewModel(tab);
</script>

<EnvironmentExplorer
  bind:currentEnvironment={_viewModel.tab}
  onUpdateName={_viewModel.updateName}
  onUpdateVariable={_viewModel.updateVariables}
  onSaveEnvironment={_viewModel.saveEnvironment}
/>
