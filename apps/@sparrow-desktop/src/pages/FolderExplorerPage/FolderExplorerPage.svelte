<script lang="ts">
  // Document
  import type {
    CollectionDocument,
    TabDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import { onMount } from "svelte";

  // ---- View Model
  import FolderExplorerPage from "./FolderExplorerPage.ViewModel";

  // Component
  import { FolderExplorer } from "@sparrow/workspaces/features";
  import type { Folder } from "@sparrow/common/types/workspace";
  import { user } from "@app/store/auth.store";

  /**
   * folder tab document
   */
  export let tab: TabDocument;

  // ViewModel initialization
  const _viewModel = new FolderExplorerPage();

  let userId = "";
  let userRole = "";

  // Local variables
  let collection: CollectionDocument;
  let folder: Folder;

  // Initialization of collection, folder and userRoleInWorkspace
  onMount(async () => {
    (await _viewModel.getCollectionList()).subscribe(async (collectionList) => {
      collection = await _viewModel.getCollection(tab.path?.collectionId);
      folder = await _viewModel.getFolder(collection, tab.id);
    });
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

<FolderExplorer
  bind:userRole
  bind:tab
  bind:folder
  bind:collection
  onRename={_viewModel.handleRename}
  onCreateAPIRequest={_viewModel.handleCreateAPIRequest}
  onUpdateDescription={_viewModel.handleUpdateDescription}
  getTotalRequests={_viewModel.getTotalRequests}
/>
