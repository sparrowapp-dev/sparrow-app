<script lang="ts">
  // Document
  import type { TabDocument } from "@app/database/database";

  // ---- View Model
  import TestFlowScheduleExplorerPage from "./TestflowScheduleExplorerPage.ViewModel";

  // Component
  import { TestflowScheduleExplorer } from "@sparrow/workspaces/features";
  import { user } from "@app/store/auth.store";
  import { testflowSchedules } from "@sparrow/common/store";
  import { environmentType } from "@sparrow/common/enums";
  import { onDestroy } from "svelte";

  /**
   * folder tab document
   */
  export let tab: TabDocument;

  // ViewModel initialization
  let _viewModel;

  let activeWorkspaceSubscriber;

  let userId = "";
  let environments;
  let activeWorkspace;
  let currentWorkspaceId = "";
  let currentWorkspace;
  $: {
    console.log("ff", $environments);
  }

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
                currentWorkspace = _workspace;
                currentWorkspaceId = _workspace.get("_id");
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
  {testflow}
  {schedule}
  workspaceUsers={currentWorkspace?._data?.users || []}
  environments={$environments?.filter(
    (env) =>
      env.workspaceId === currentWorkspaceId &&
      env.type !== environmentType.GLOBAL,
  ) || []}
  onUpdateScheduleState={_viewModel.updateScheduleState}
  onScheduleRun={_viewModel.runTestflowSchedule}
/>
