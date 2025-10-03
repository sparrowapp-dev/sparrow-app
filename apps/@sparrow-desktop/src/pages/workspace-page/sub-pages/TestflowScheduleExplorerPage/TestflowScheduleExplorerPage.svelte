<script lang="ts">
  // Document
  import type { TabDocument } from "@app/database/database";

  // ---- View Model
  import TestFlowScheduleExplorerPage from "./TestflowScheduleExplorerPage.ViewModel";

  // Component
  import { TestflowScheduleExplorer } from "@sparrow/workspaces/features";
  import { user } from "@app/store/auth.store";
  import { testflowSchedules } from "@sparrow/common/store";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { onDestroy } from "svelte";

  /**
   * folder tab document
   */
  export let tab: TabDocument;

  // ViewModel initialization
  let _viewModel;

  let userId = "";

  user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });

  let prevTabId = "";
  let prevTabName = "";

  let testflowObserver;
  let testflowSubscriber;
  let testflow;

  let testflowScheduleStoreMap;

  let testflowScheduleStore;

  testflowSchedules.subscribe((_testflowScheduleStoreMap) => {
    if (_testflowScheduleStoreMap) {
      testflowScheduleStoreMap = _testflowScheduleStoreMap;
    }
  });

  let schedule;

  $: {
    testflowScheduleStore = testflowScheduleStoreMap?.get(
      tab?.path?.testflowId,
    );
    schedule = testflowScheduleStore?.find((schedule) => {
      if (schedule.id === tab?.id) {
        return true;
      }
    });
  }
  let environments;
  let activeWorkspace;
  let activeWorkspaceSubscriber;
  let isTestflowScheduleEditable;
  $: {
    if (tab) {
      if (prevTabId !== tab?.tabId) {
        (async () => {
          /**
           * @description - Initialize the view model for the new http request tab
           */
          _viewModel = new TestFlowScheduleExplorerPage(tab);
          testflowScheduleStore = testflowScheduleStoreMap?.get(tab?.id);
          testflowObserver = _viewModel.getTestflowObserver(
            tab?.path?.testflowId as string,
          );
          testflowSubscriber = testflowObserver?.subscribe((data) => {
            testflow = data?.toMutableJSON();
          });
          environments = _viewModel.environments;

          activeWorkspace = _viewModel.activeWorkspace;
          activeWorkspaceSubscriber = activeWorkspace.subscribe(
            (_workspace) => {
              const workspaceDoc = _workspace?.toMutableJSON();

              if (workspaceDoc) {
                workspaceDoc.users?.forEach((_user) => {
                  if (_user.id === userId) {
                    if (_user.role !== WorkspaceRole.WORKSPACE_VIEWER) {
                      isTestflowScheduleEditable = true;
                    } else {
                      isTestflowScheduleEditable = false;
                    }
                  }
                });
              }
            },
          );
        })();
      } else if (tab?.name && prevTabName !== tab.name) {
      }
      prevTabName = tab?.name || "";
      prevTabId = tab?.tabId || "";
    }
  }

  onDestroy(() => {
    activeWorkspaceSubscriber.unsubscribe();
  });
</script>

<TestflowScheduleExplorer
  tab={_viewModel.tab}
  environments={$environments || []}
  {testflow}
  {schedule}
  {isTestflowScheduleEditable}
  onUpdateScheduleState={_viewModel.updateScheduleState}
  onScheduleRun={_viewModel.runTestflowSchedule}
  onDeleteTestflowScheduleHistory={_viewModel.deleteTestflowScheduleHistory}
  onScheduleRunview={_viewModel.handleCreateTestflowSingleScheduleTab}
  onRefreshSchedule={_viewModel.refreshTestflowSchedule}
  onEditTestflowSchedule={_viewModel.editTestflowSchedule}
  onOpenTestflow={_viewModel.handleOpenTestflow}
  onOpenEnvironment={_viewModel.handleOpenEnvironment}
/>
