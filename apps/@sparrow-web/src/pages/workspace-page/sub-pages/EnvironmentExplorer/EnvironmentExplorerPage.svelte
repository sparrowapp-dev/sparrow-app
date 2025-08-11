<script lang="ts">
  import { EnvironmentExplorer } from "@sparrow/workspaces/features";
  import { EnvironmentExplorerViewModel } from "./EnvironmentExplorerPage.ViewModel";
  import { Debounce } from "@sparrow/common/utils";
  import { user } from "@app/store/auth.store";
  import type { WorkspaceDocument } from "@app/database/database";
  import constants from "../../../../constants/constants";
  /**
   * environment opened tab object
   */
  export let tab;
  let _viewModel;
  let renameWithEnvironmentList;

  let userId = "";
  let userRole = "";

  let prevTabId = "";

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
      if (prevTabId !== tab?.tabId) {
        (async () => {
          /**
           * @description - Initialize the view model for the new http request tab
           */
          _viewModel = new EnvironmentExplorerViewModel(tab);
          renameWithEnvironmentList = new Debounce().debounce(
            _viewModel.updateNameWithEnvironmentList,
            1000,
          );
        })();
      } else if (tab?.name && prevTabName !== tab.name) {
        renameWithEnvironmentList(tab.name);
      }
      findUserRole();
      prevTabId = tab?.tabId || "";
      prevTabName = tab?.name || "";
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
  azureBlobCDN={constants.AZURE_CDN_URL}
  onGenerateVariables={_viewModel.getGenerateVariables}
  updateGeneratedVariables={_viewModel.updateGeneratedVariables}
/>
