<script lang="ts">
  import { of, type Observable } from "rxjs";
  import { TestflowExplorerPageViewModel } from "./TestflowExplorerPage.ViewModel";
  import { TestflowExplorer } from "@sparrow/workspaces/features";
  import type { CollectionDocument } from "@app/database/database";
  import { testFlowDataStore } from "@sparrow/workspaces/features/testflow-explorer/store";
  import { onDestroy } from "svelte";
  import type { TFDataStoreType } from "@sparrow/common/types/workspace/testflow";
  import { user } from "@app/store/auth.store";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Debounce } from "@sparrow/common/utils";
  export let tab;
  const _viewModel = new TestflowExplorerPageViewModel(tab);
  let collectionList: Observable<CollectionDocument[]> =
    _viewModel.getCollectionList();

  let deleteNodeResponse = _viewModel.deleteNodesLessThanId;

  let render = false;
  let isTestFlowEmpty: boolean = false;
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
    const nodes = testflowStore?.nodes ?? [];
    const hasEmptyResponseStatus = nodes.some(
      (node) => !node.response?.status || node.response?.status === "",
    );
    if (!testflowStore || nodes.length === 0 || hasEmptyResponseStatus) {
      isTestFlowEmpty = true;
    } else {
      isTestFlowEmpty = false;
    }
  });

  let userId = "";
  const userSubscriber = user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });

  let isTestflowEditable = true;
  const activeWorkspaceSubscriber = _viewModel.activeWorkspace.subscribe(
    (_workspace) => {
      const workspaceDoc = _workspace?.toMutableJSON();
      if (workspaceDoc) {
        workspaceDoc.users?.forEach((_user) => {
          if (_user.id === userId) {
            if (_user.role !== WorkspaceRole.WORKSPACE_VIEWER) {
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
    _viewModel.updateNameWithTestFlowList as any,
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
    onRunSampleApi={_viewModel.handleSampleTestFlowRun}
    toggleHistoryDetails={_viewModel.toggleHistoryDetails}
    toggleHistoryContainer={_viewModel.toggleHistoryContainer}
    deleteNodeResponse={_viewModel.deleteNodeResponse}
    onRedrectRequest={_viewModel.redirectRequest}
    onUpdateTestFlowName={_viewModel.updateName}
    onUpdateBlockData={_viewModel.updateBlockData}
    onSaveTestflow={_viewModel.saveTestflow}
    onClearTestflow={_viewModel.clearTestFlowData}
    {isTestFlowEmpty}
    isWebApp={false}
    onSelectRequest={_viewModel.getRequestdata}
    checkRequestExistInNode={_viewModel.checkRequestExistInNode}
    onUpdateResponseState={_viewModel.updateResponseState}
  />
{/if}
