<script lang="ts">
  import { TestflowDataSetExplorer } from "@sparrow/workspaces/features";
  import type { TabDocument, WorkspaceDocument } from "@app/database/database";
  import { TestflowDataSetExplorerPageViewModel } from "./TestflowDataSetExplorerePage.ViewModel";
  import type { TestflowViewModel } from "../../Testflow.ViewModel";
  import { TestflowExplorerPageViewModel } from "../TestflowExplorerPage/TestflowExplorerPage.ViewModel";
  import { user } from "@app/store/auth.store";
  import { WorkspaceRole } from "@sparrow/common/enums";

  export let tab: TabDocument;

  let prevTabId = "";
  let _viewModel: TestflowDataSetExplorerPageViewModel | null = null;
  let userId: string;
  let userRole: string = "";
  user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });
  const findUserRole = async () => {
    const workspace: WorkspaceDocument = await _viewModel.getWorkspaceById(
      tab?.path.workspaceId,
    );
    workspace.users?.forEach((value) => {
      if (value.id === userId) {
        userRole = value.role as string;
      }
    });
  };

  $: {
    if (tab && prevTabId !== tab?.tabId) {
      _viewModel = new TestflowDataSetExplorerPageViewModel(tab);
      prevTabId = tab?.tabId || "";
      findUserRole();
    }
  }
</script>

{#if tab && _viewModel}
  <TestflowDataSetExplorer
    bind:tab={_viewModel.tab}
    isWebApp={false}
    onUpdateName={_viewModel.updateName}
    onRenameDataset={_viewModel.renameTestDataSet}
    onSaveDataset={_viewModel.saveDataset}
    isWorkspaceViewer={userRole === WorkspaceRole.WORKSPACE_VIEWER}
  />
{/if}
