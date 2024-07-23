<script lang="ts">
  // Document
  import type {
    CollectionDocument,
    TabDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import { onDestroy, onMount } from "svelte";

  // ---- View Model
  import CollectionExplorerPage from "./CollectionExplorerPage.ViewModel";

  // Component
  import { CollectionExplorer } from "@workspaces/features";
  import type { Observable } from "rxjs";
  import { user } from "$lib/store";

  // Exports
  export let tab: TabDocument;

  // ViewModel initialization
  const _viewModel = new CollectionExplorerPage(tab);

  let userId = "";
  let userRole = "";

  // Local variables
  let collection: CollectionDocument;
  let userRoleInWorkspace: boolean;

  // Initialization of collection and userRoleInWorkspace
  onMount(async () => {
    (await _viewModel.getCollectionList()).subscribe(
      async (_collectionList) => {
        const response = await _viewModel.getCollection(tab.id);
        if (response) {
          collection = response?.toMutableJSON();
        }
      },
    );
    userRoleInWorkspace = await _viewModel.getUserRoleInWorspace();
  });

  user.subscribe((value) => {
    if (value) {
      userId = value._id;
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
        userRole = value.role;
      }
    });
  };
  onMount(() => {
    findUserRole();
  });
</script>

<CollectionExplorer
  bind:userRole
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
