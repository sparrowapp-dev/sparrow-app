<script lang="ts">
  // Document
  import type { TabDocument } from "@app/database/database";

  // ---- View Model
  import TestFlowScheduleExplorerPage from "./TestflowScheduleExplorerPage.ViewModel";

  // Component
  import { TestflowScheduleExplorer } from "@sparrow/workspaces/features";
  import { user } from "@app/store/auth.store";

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
  $: {
    if (tab) {
      if (prevTabId !== tab?.tabId) {
        (async () => {
          /**
           * @description - Initialize the view model for the new http request tab
           */
          _viewModel = new TestFlowScheduleExplorerPage(tab);
          testflowObserver = _viewModel.getTestflowObserver(
            tab?.path?.testflowId as string,
          );
          testflowSubscriber = testflowObserver?.subscribe((data) => {
            testflow = data?.toMutableJSON();
          });
        })();
      } else if (tab?.name && prevTabName !== tab.name) {
      }
      prevTabName = tab?.name || "";
      prevTabId = tab?.tabId || "";
    }
  }
</script>

<TestflowScheduleExplorer
  tab={_viewModel.tab}
  {testflow}
  onUpdateScheduleState={_viewModel.updateScheduleState}
/>
