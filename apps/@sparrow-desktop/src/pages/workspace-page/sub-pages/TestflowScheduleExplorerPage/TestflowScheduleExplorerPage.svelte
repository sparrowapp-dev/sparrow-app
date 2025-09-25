<script lang="ts">
  // Document
  import type { CollectionDocument, TabDocument } from "@app/database/database";
  import { onMount } from "svelte";

  // ---- View Model
  import TestFlowScheduleExplorerPage from "./TestflowScheduleExplorerPage.ViewModel";

  // Component
  import {
    MockHistoryExplorer,
    TestflowScheduleExplorer,
  } from "@sparrow/workspaces/features";
  import { user } from "@app/store/auth.store";

  /**
   * folder tab document
   */
  export let tab: TabDocument;

  // ViewModel initialization
  let _viewModel;

  let userId = "";

  // Local variables
  let collection: CollectionDocument;

  // Initialization of collection, folder and userRoleInWorkspace

  user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });

  let prevTabId = "";
  let prevTabName = "";

  $: {
    if (tab) {
      if (prevTabId !== tab?.tabId) {
        (async () => {
          /**
           * @description - Initialize the view model for the new http request tab
           */
          _viewModel = new TestFlowScheduleExplorerPage(tab);
          (await _viewModel.getCollectionList()).subscribe(
            async (collectionList) => {
              collection = await _viewModel.getCollection(
                tab.path?.collectionId,
              );
            },
          );
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
  bind:collection
  fetchCollection={_viewModel.getCollectionByIdAndWorkspace}
  onUpdateScheduleState={_viewModel.updateScheduleState}
/>
