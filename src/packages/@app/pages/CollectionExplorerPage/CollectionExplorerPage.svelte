<script lang="ts">
  // Document
  import type { CollectionDocument, TabDocument } from "@app/database/database";
  import { onDestroy, onMount } from "svelte";

  // ---- View Model
  import CollectionExplorerPage from "./CollectionExplorerPage.ViewModel";

  // Component
  import { CollectionExplorer } from "@workspaces/features";
  import type { Observable } from "rxjs";

  // Exports
  export let tab: TabDocument;

  // ViewModel initialization
  const _viewModel = new CollectionExplorerPage(tab);

  // Local variables
  let collection: CollectionDocument;
  let userRoleInWorkspace: boolean;

  // Initialization of collection and userRoleInWorkspace
  onMount(async () => {
    (await _viewModel.getCollectionList()).subscribe(
      async (_collectionList) => {
        collection = await _viewModel.getCollection(tab.id);
      },
    );
    userRoleInWorkspace = await _viewModel.getUserRoleInWorspace();
  });
</script>

<CollectionExplorer
  bind:tab
  bind:collection
  bind:userRoleInWorkspace
  onUpdateDescription={_viewModel.handleUpdateDescription}
  onCreateAPIRequest={_viewModel.handleCreateRequest}
  onCollectionSynced={_viewModel.handleSyncCollection}
  onRename={_viewModel.handleRename}
  onCollectionRefetched={_viewModel.handleRefetchCollection}
  onBranchChanged={_viewModel.handleBranchChanged}
  getLastUpdatedAndCount={_viewModel.getLastUpdatedAndCount}
/>
