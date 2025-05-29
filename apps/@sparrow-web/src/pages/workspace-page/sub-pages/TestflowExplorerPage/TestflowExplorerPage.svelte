<script lang="ts">
  import { of, type Observable } from "rxjs";
  import { TestflowExplorerPageViewModel } from "./TestflowExplorerPage.ViewModel";
  import { TestflowExplorer } from "@sparrow/workspaces/features";
  import type {
    CollectionDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import { testFlowDataStore } from "@sparrow/workspaces/features/testflow-explorer/store";
  import { onDestroy, onMount } from "svelte";
  import type { TFDataStoreType } from "@sparrow/common/types/workspace/testflow";
  import { isGuestUserActive, user } from "@app/store/auth.store";
  import { environmentType, WorkspaceRole } from "@sparrow/common/enums";
  import { Debounce } from "@sparrow/common/utils";
  import constants from "@app/constants/constants";
  import { captureEvent } from "@app/utils/posthog/posthogConfig";
  export let tab;
  const _viewModel = new TestflowExplorerPageViewModel(tab);
  let collectionList: Observable<CollectionDocument[]> =
    _viewModel.getCollectionList();

  let deleteNodeResponse = _viewModel.deleteNodesLessThanId;
  let userId = "";
  let userRole = "";
  let render = false;
  let isTestFlowEmpty: boolean = false;
  let testflowStore: TFDataStoreType;
  let isTestflowEditable = true;
  let environmentVariables;
  let environmentId: string;
  let isGuestUser = false;
  let currentWorkspaceId = "";
  let currentWorkspace;
  let planLimitTestFlowBlocks: number = 5;
  let planLimitTestflow: number = 3;

  const environments = _viewModel.environments;
  const activeWorkspace = _viewModel.activeWorkspace;

  isGuestUserActive.subscribe((value) => {
    isGuestUser = value;
  });

  /**
   * @description - refreshes the environment everytime workspace changes
   */
  const refreshEnvironment = () => {
    if ($environments && currentWorkspaceId) {
      if ($environments?.length > 0) {
        const filteredEnv = $environments
          .filter((elem) => {
            return elem.workspaceId === currentWorkspaceId;
          })
          .filter((elem) => {
            if (
              elem.type === environmentType.GLOBAL ||
              elem.id === environmentId
            ) {
              return true;
            }
          });
        if (filteredEnv?.length > 0) {
          let envs = [];
          filteredEnv.forEach((elem) => {
            environmentVariables = {
              local: filteredEnv[1],
              global: filteredEnv[0],
              filtered: [],
            };

            const temp = elem.toMutableJSON();
            temp.variable.forEach((variable) => {
              if (variable.key && variable.checked) {
                envs.unshift({
                  key: variable.key,
                  value: variable.value,
                  type: temp.type === environmentType.GLOBAL ? "G" : "E",
                  environment: temp.name,
                });
              }
            });
            environmentVariables.filtered = envs;
          });
        }
      }
    }
  };

  const sub = _viewModel.tab.subscribe((val) => {
    if (val?.tabId) {
      render = true;
    }
  });

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

  const userSubscriber = user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });

  const activeWorkspaceSubscriber = activeWorkspace.subscribe((_workspace) => {
    const workspaceDoc = _workspace?.toMutableJSON();

    if (workspaceDoc) {
      currentWorkspace = _workspace;
      currentWorkspaceId = _workspace.get("_id");
      environmentId = _workspace.get("environmentId");
    }

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
  });

  /**
   * Find the role of user in active workspace
   */
  const findUserRole = async () => {
    const workspace: WorkspaceDocument = await _viewModel.getWorkspaceById(
      tab.path.workspaceId,
    );
    workspace.users?.forEach((value) => {
      if (value.id === userId) {
        userRole = value.role as string;
      }
    });
  };

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
      findUserRole();
    }

    if (environmentId || $environments || currentWorkspaceId) {
      refreshEnvironment();
    }
  }
  const handleEventOnClickQuestionMark = () => {
    captureEvent("documentation_link_clicked", {
      component: "TestFlowExplorer",
      targetUrl: constants.TESTFLOW_DOCS_URL,
    });
  };

  const handleBlockLimitTestflow = async (WorkspaceId: string) => {
    const planlimits = await _viewModel.userLimitBlockPerTestflow(WorkspaceId);
    if (planlimits) {
      planLimitTestFlowBlocks = planlimits?.blocksPerTestflow?.value || 5;
      planLimitTestflow = planlimits?.testflowPerWorkspace?.value || 3;
    }
  };

  onMount(() => {
    if (currentWorkspaceId) {
      handleBlockLimitTestflow(currentWorkspaceId);
    }
  });
</script>

{#if render}
  <TestflowExplorer
    tab={_viewModel.tab}
    {environmentVariables}
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
    isWebApp={true}
    onClickStop={_viewModel.handleStopApis}
    onClearTestflow={_viewModel.clearTestFlowData}
    {isTestFlowEmpty}
    onSelectRequest={_viewModel.getRequestdata}
    checkRequestExistInNode={_viewModel.checkRequestExistInNode}
    onUpdateEnvironment={_viewModel.updateEnvironment}
    {userRole}
    runSingleNode={_viewModel.handleSingleTestFlowNodeRun}
    onPreviewExpression={_viewModel.handlePreviewExpression}
    redirectDocsTestflow={_viewModel.redirectDocsTestflow}
    {handleEventOnClickQuestionMark}
    {planLimitTestFlowBlocks}
    {planLimitTestflow}
    testflowCount={_viewModel.fetchCountofTestFlow()}
  />
{/if}
