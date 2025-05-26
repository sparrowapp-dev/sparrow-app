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
  const _viewModel = new MockHistoryExplorerPage(tab);

  let userId = "";

  // Local variables
  let collection: CollectionDocument;

  // Initialization of collection, folder and userRoleInWorkspace
  onMount(async () => {
    (await _viewModel.getCollectionList()).subscribe(async (collectionList) => {
      collection = await _viewModel.getCollection(tab.path?.collectionId);
    });
  });

  user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });
</script>

<MockHistoryExplorer
  tab={_viewModel.tab}
  bind:collection
  fetchCollection={_viewModel.getCollectionByIdAndWorkspace}
/>
