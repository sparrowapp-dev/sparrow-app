<script lang="ts">
  import { of, type Observable } from "rxjs";
  import { TestflowExplorerPageViewModel } from "./TestflowExplorerPage.ViewModel";
  import { TestflowExplorer } from "@workspaces/features/testflow-explorer";
  import type { CollectionDocument } from "@app/database/database";
  import { testFlowDataStore } from "@workspaces/features/testflow-explorer/store";
  import { onDestroy } from "svelte";
  import type { TFDataStoreType } from "@common/types/workspace/testflow";
  import { user } from "$lib/store";
  import { WorkspaceRole } from "$lib/utils/enums";
  import { Debounce } from "@common/utils";
  export let tab;
  const _viewModel = new TestflowExplorerPageViewModel(tab);
  let collectionList: Observable<CollectionDocument[]> =
    _viewModel.getCollectionList();

    let deleteNodeResponse = _viewModel.deleteNodesLessThanId;

  let render = false;
  const sub = _viewModel.tab.subscribe((val) => {
    if (val?.tabId) {
      render = true;
    }
  });
  let testflowStore: TFDataStoreType;
  testFlowDataStore.subscribe((val) => {
    if (val) {
      testflowStore = val.get(tab?.tabId) as TFDataStoreType;
    }
  });

  let userId = "";
  const userSubscriber = user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });

  let isTestflowEditable = false;
  const activeWorkspaceSubscriber = _viewModel.activeWorkspace.subscribe(
    (_workspace) => {
      const workspaceDoc = _workspace?.toMutableJSON();
      if (workspaceDoc) {
        workspaceDoc.users?.forEach((_user) => {
          if (_user.id === userId) {
            if (
              _user.role === WorkspaceRole.WORKSPACE_ADMIN ||
              _user.role === WorkspaceRole.WORKSPACE_EDITOR
            ) {
              isTestflowEditable = true;
            } else {
              isTestflowEditable = false;
            }
          }
        });
      }
    },
  );
  onDestroy(() => {
    sub.unsubscribe();
    activeWorkspaceSubscriber.unsubscribe();
    userSubscriber();
  });

  const renameWithTestFlowList = new Debounce().debounce(
    _viewModel.updateNameWithTestFlowList,
    1000,
  );

  let prevTabName = "";
  $: {
    if (tab) {
      if (tab?.name && prevTabName !== tab?.name) {
        renameWithTestFlowList(tab.name);
      }
      prevTabName = tab.name;
    }
  }
</script>

{#if render}
  <TestflowExplorer
    tab={_viewModel.tab}
    environmentVariables={{}}
    {isTestflowEditable}
    {testflowStore}
    onUpdateNodes={_viewModel.updateNodes}
    onUpdateEdges={_viewModel.updateEdges}
    {collectionList}
    onClickRun={_viewModel.handleTestFlowRun}
    toggleHistoryDetails={_viewModel.toggleHistoryDetails}
    toggleHistoryContainer={_viewModel.toggleHistoryContainer}
    deleteNodeResponse={_viewModel.deleteNodeResponse}
    onRedrectRequest={_viewModel.redirectRequest}
    onUpdateTestFlowName={_viewModel.updateName}
    onSaveTestflow={_viewModel.saveTestflow}
  />
{/if}
