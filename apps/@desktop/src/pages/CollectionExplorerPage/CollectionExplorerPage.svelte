<script lang="ts">
  // Document
  import type {
    CollectionDocument,
    TabDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import { onMount } from "svelte";

  // ---- View Model
  import CollectionExplorerPage from "./CollectionExplorerPage.ViewModel";

  // Component
  import { CollectionExplorer } from "@sparrow/workspaces/features";
  import type { Observable } from "rxjs";
  import { user } from "@app/store/auth.store";

  // Exports
  export let tab: TabDocument;

  // ViewModel initialization
  const _viewModel = new CollectionExplorerPage(tab);

  let userId = "";
  let userRole = "";

  // Local variables
  let collection: CollectionDocument;

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
        userRole = value.role as string;
      }
    });
  };
  onMount(() => {
    findUserRole();
  });
</script>

<CollectionExplorer
  {userRole}
  bind:tab
  bind:collection
  onUpdateDescription={_viewModel.handleUpdateDescription}
  onCreateAPIRequest={_viewModel.handleCreateRequest}
  onCollectionSynced={_viewModel.handleSyncCollection}
  onRename={_viewModel.handleRename}
  onCollectionRefetched={_viewModel.handleRefetchCollection}
  onBranchChanged={_viewModel.handleBranchChanged}
  getLastUpdatedAndCount={_viewModel.getLastUpdatedAndCount}
/>
