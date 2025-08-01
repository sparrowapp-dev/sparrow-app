<script lang="ts">
  import { of, type Observable } from "rxjs";
  import { TestflowExplorerPageViewModel } from "./TestflowExplorerPage.ViewModel";
  import { TestflowExplorer } from "@sparrow/workspaces/features";
  import type {
    CollectionDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import { testFlowDataStore } from "@sparrow/workspaces/features/testflow-explorer/store";
  import { onDestroy, onMount, tick } from "svelte";
  import type { TFDataStoreType } from "@sparrow/common/types/workspace/testflow";
  import { isGuestUserActive, user } from "@app/store/auth.store";
  import {
    environmentType,
    ResponseMessage,
    WorkspaceRole,
  } from "@sparrow/common/enums";
  import { Debounce } from "@sparrow/common/utils";
  import constants from "@app/constants/constants";
  import { captureEvent } from "@app/utils/posthog/posthogConfig";
  export let tab;
  export let teamDetails;
  export let upgradePlanModel;
  let _viewModel;
  let collectionList: Observable<CollectionDocument[]>;

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
  let currentTestflowCount: number = 1;
  let testflowBlocksPlanModalOpen: boolean = false;
  let runHistoryPlanModalOpen: boolean = false;
  let selectiveRunTestflow: boolean = false;
  let selectiveRunModalOpen: boolean = false;
  let planLimitRunHistoryCount: number = 5;

  let environments;
  let activeWorkspace;

  isGuestUserActive.subscribe((value) => {
    isGuestUser = value;
  });

  let collectionListDocument = [];
  let collectionsSubscriber;

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

  let sub;

  const handleBlockLimitTestflow = async () => {
    const planlimits = await _viewModel?.userLimitBlockPerTestflow();
    if (planlimits) {
      planLimitTestFlowBlocks = planlimits?.blocksPerTestflow?.value || 5;
      planLimitTestflow = planlimits?.testflowPerWorkspace?.value || 3;
      selectiveRunTestflow = planlimits?.selectiveTestflowRun?.active || false;
      planLimitRunHistoryCount = planlimits?.testflowRunHistory?.value || 5;
    }
  };

  let testflowStoreMap;

  $: {
    testflowStore = testflowStoreMap?.get(tab?.tabId) as TFDataStoreType;
    const nodes = testflowStore?.nodes ?? [];
    const hasEmptyResponseStatus = nodes.some(
      (node) => !node.response?.status || node.response?.status === "",
    );
    if (!testflowStore || nodes.length === 0 || hasEmptyResponseStatus) {
      isTestFlowEmpty = true;
    } else {
      isTestFlowEmpty = false;
    }
    handleBlockLimitTestflow();
  }

  testFlowDataStore.subscribe((_testflowStoreMap) => {
    if (_testflowStoreMap) {
      testflowStoreMap = _testflowStoreMap;
    }
  });

  const userSubscriber = user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });

  let activeWorkspaceSubscriber;

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
    sub?.unsubscribe();
    activeWorkspaceSubscriber.unsubscribe();
    userSubscriber();
  });

  let renameWithTestFlowList;
  const handleTestflowCount = async () => {
    const data = await _viewModel?.fetchCountofTestFlow();
    currentTestflowCount = data;
  };

  let prevTabName = "";
  let prevTabId = "";
  $: {
    if (tab) {
      if (prevTabId !== tab?.tabId) {
        (async () => {
          /**
           * @description - Initialize the view model for the new http request tab
           */

          _viewModel = new TestflowExplorerPageViewModel(tab);
          collectionList = _viewModel.getCollectionList();
          environments = _viewModel.environments;
          activeWorkspace = _viewModel.activeWorkspace;

          render = true;

          collectionsSubscriber = collectionList.subscribe(async (value) => {
            if (value) {
              collectionListDocument = value?.filter(
                (value) => value.workspaceId === tab?.path?.workspaceId,
              );
            }
          });

          activeWorkspaceSubscriber = activeWorkspace.subscribe(
            (_workspace) => {
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
            },
          );

          renameWithTestFlowList = new Debounce().debounce(
            _viewModel.updateNameWithTestFlowList as any,
            1000,
          );
          handleBlockLimitTestflow();
        })();
      } else if (tab?.name && prevTabName !== tab?.name) {
        renameWithTestFlowList(tab.name);
      }
      prevTabId = tab?.tabId || "";
      prevTabName = tab?.name || "";
      findUserRole();
    }
  }

  $: {
    if (environmentId || $environments || currentWorkspaceId) {
      refreshEnvironment();
    }
    handleTestflowCount();
  }
  const handleEventOnClickQuestionMark = () => {
    captureEvent("documentation_link_clicked", {
      component: "TestFlowExplorer",
      targetUrl: constants.TESTFLOW_DOCS_URL,
    });
  };

  const handleRequestOwner = async () => {
    if ($activeWorkspace?._data?.team?.teamId) {
      await _viewModel.requestToUpgradePlan(
        $activeWorkspace?._data?.team?.teamId,
      );
      testflowBlocksPlanModalOpen = false;
      runHistoryPlanModalOpen = false;
      selectiveRunModalOpen = false;
    }
  };

  const handleRedirectAdminPanel = async () => {
    if ($activeWorkspace?._data?.team?.teamId) {
      await _viewModel.handleRedirectToAdminPanel(
        $activeWorkspace?._data?.team?.teamId,
      );
      testflowBlocksPlanModalOpen = false;
      runHistoryPlanModalOpen = false;
      selectiveRunModalOpen = false;
    }
  };

  const handleSaveTestflow = async () => {
    const response = await _viewModel.saveTestflow();
    if (response?.message === ResponseMessage.PLAN_LIMIT_MESSAGE) {
      upgradePlanModel = true;
    }
  };

  onMount(() => {
    handleBlockLimitTestflow();
    collectionsSubscriber.unsubscribe();
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
    {collectionListDocument}
    onClickRun={_viewModel.handleTestFlowRun}
    onRunSampleApi={_viewModel.handleSampleTestFlowRun}
    toggleHistoryDetails={_viewModel.toggleHistoryDetails}
    toggleHistoryContainer={_viewModel.toggleHistoryContainer}
    deleteNodeResponse={_viewModel.deleteNodeResponse}
    onRedrectRequest={_viewModel.redirectRequest}
    onUpdateTestFlowName={_viewModel.updateName}
    onUpdateBlockData={_viewModel.updateBlockData}
    onSaveTestflow={handleSaveTestflow}
    onClickStop={_viewModel.handleStopApis}
    onClearTestflow={_viewModel.clearTestFlowData}
    {isTestFlowEmpty}
    {isGuestUser}
    isWebApp={true}
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
    {planLimitRunHistoryCount}
    testflowCount={currentTestflowCount}
    {teamDetails}
    bind:testflowBlocksPlanModalOpen
    bind:runHistoryPlanModalOpen
    bind:selectiveRunModalOpen
    handleRedirectToAdminPanel={handleRedirectAdminPanel}
    {handleRequestOwner}
    {selectiveRunTestflow}
    handleContactSales={_viewModel.handleContactSales}
    onChangeSeletedAuthValue={_viewModel.parseAuthHeader}
  />
{/if}
