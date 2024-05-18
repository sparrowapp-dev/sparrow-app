<script lang="ts">
  // Document
  import type { CollectionDocument, TabDocument } from "@app/database/database";
  import { onMount } from "svelte";

  // ---- View Model
  import FolderExplorerPage from "./FolderExplorerPage.ViewModel";

  // Component
  import { FolderExplorer } from "@workspaces/features";
  import type { Folder } from "@common/types/workspace";

  /**
   * folder tab document
   */
  export let tab: TabDocument;

  // ViewModel initialization
  const _viewModel = new FolderExplorerPage();

  // Local variables
  let collection: CollectionDocument;
  let folder: Folder;
  let userRoleInWorkspace: boolean;

  // Initialization of collection, folder and userRoleInWorkspace
  onMount(async () => {
    (await _viewModel.getCollectionList()).subscribe(async (collectionList) => {
      collection = await _viewModel.getCollection(tab.path?.collectionId);
      folder = await _viewModel.getFolder(collection, tab.id);
    });
    userRoleInWorkspace = await _viewModel.getUserRoleInWorspace();
  });
</script>

<FolderExplorer
  bind:tab
  bind:folder
  bind:collection
  onRename={_viewModel.handleRename}
  onCreateAPIRequest={_viewModel.handleCreateAPIRequest}
  onUpdateDescription={_viewModel.handleUpdateDescription}
  getTotalRequests={_viewModel.getTotalRequests}
  userRoleInWorkspace
/>
