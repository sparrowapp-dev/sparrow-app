<script lang="ts">
  import { EnvironmentExplorer } from "@sparrow/workspaces/features";
  import { EnvironmentExplorerViewModel } from "./EnvironmentExplorerPage.ViewModel";
  import { Debounce } from "@sparrow/common/utils";
  import { user } from "@app/store/auth.store";
  import type { WorkspaceDocument } from "@app/database/database";
  /**
   * environment opened tab object
   */
  export let tab;
  const _viewModel = new EnvironmentExplorerViewModel(tab);
  const renameWithEnvironmentList = new Debounce().debounce(
    _viewModel.updateNameWithEnvironmentList,
    1000,
  );

  let userId = "";
  let userRole = "";

  user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });
  /**
   * Find the role of user in active workspace
   */
  const findUserRole = async () => {
    const workspace: WorkspaceDocument = await _viewModel.getWorkspace();
    if (workspace) {
      workspace.users?.forEach((value) => {
        if (value.id === userId) {
          userRole = value.role;
        }
      });
    }
  };
  let prevTabName = "";
  $: {
    if (tab) {
      if (tab?.name && prevTabName !== tab.name) {
        // _viewModel.updateNameWithEnvironmentList(tab.name);
        renameWithEnvironmentList(tab.name);
      }
      prevTabName = tab.name;
      findUserRole();
    }
  }
</script>

<EnvironmentExplorer
  bind:userRole
  bind:currentEnvironment={_viewModel.tab}
  onUpdateName={_viewModel.updateName}
  onUpdateVariable={_viewModel.updateVariables}
  onSaveEnvironment={_viewModel.saveEnvironment}
  onFetchEnvironmentGuide={_viewModel.fetchEnvironmentGuide}
  onUpdateEnvironmentGuide={_viewModel.updateEnvironmentGuide}
/>
