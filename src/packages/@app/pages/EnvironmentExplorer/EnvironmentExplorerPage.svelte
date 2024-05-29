<script>
  import { EnvironmentExplorer } from "@environments/features";
  import { EnvironmentExplorerViewModel } from "./EnvironmentExplorerPage.ViewModel";
  import { Debounce } from "@common/utils";
  /**
   * environment opened tab object
   */
  export let tab;
  const _viewModel = new EnvironmentExplorerViewModel(tab);
  const renameWithEnvironmentList = new Debounce().debounce(
    _viewModel.updateNameWithEnvironmentList,
    1000,
  );
  let prevTabName = "";
  $: {
    if (tab) {
      console.log(tab.name);
      if (tab?.name && prevTabName !== tab.name) {
        // _viewModel.updateNameWithEnvironmentList(tab.name);
        renameWithEnvironmentList(tab.name);
      }
      prevTabName = tab.name;
    }
  }
</script>

<EnvironmentExplorer
  bind:currentEnvironment={_viewModel.tab}
  onUpdateName={_viewModel.updateName}
  onUpdateVariable={_viewModel.updateVariables}
  onSaveEnvironment={_viewModel.saveEnvironment}
/>
