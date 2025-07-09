<script lang="ts">
  // Document
  import type { CollectionDocument, TabDocument } from "@app/database/database";
  import { onMount } from "svelte";

  // ---- View Model
  import MockHistoryExplorerPage from "./MockHistoryExplorerPage.ViewModel";

  // Component
  import { MockHistoryExplorer } from "@sparrow/workspaces/features";
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
          _viewModel = new MockHistoryExplorerPage(tab);
          (await _viewModel.getCollectionList()).subscribe(
            async (collectionList) => {
              collection = await _viewModel.getCollection(
                tab.path?.collectionId,
              );
            },
          );

          prevTabId = tab?.tabId;
        })();
      } else if (tab?.name && prevTabName !== tab.name) {
        prevTabName = tab.name;
      }
    }
  }
</script>

<MockHistoryExplorer
  tab={_viewModel.tab}
  bind:collection
  fetchCollection={_viewModel.getCollectionByIdAndWorkspace}
/>
