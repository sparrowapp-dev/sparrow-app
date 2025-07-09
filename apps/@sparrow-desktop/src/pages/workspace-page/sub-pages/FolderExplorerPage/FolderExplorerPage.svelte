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
  import { Debounce } from "@sparrow/common/utils";

  /**
   * folder tab document
   */
  export let tab: TabDocument;

  // ViewModel initialization
  let _viewModel;

  let userId = "";
  let userRole = "";

  // Local variables
  let collection: CollectionDocument;
  let folder: Folder;
  let prevTabId = "";

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

  let prevTabName = "";

  let renameWithCollectionList;

  /**
   * Reacts whenever the collection tab changes.
   */
  $: {
    if (tab) {
      if (prevTabId !== tab?.tabId) {
        (async () => {
          /**
           * @description - Initialize the view model for the new http request tab
           */
          _viewModel = new FolderExplorerPage(tab);
          (await _viewModel.getCollectionList()).subscribe(
            async (collectionList) => {
              collection = await _viewModel.getCollection(
                tab.path?.collectionId,
              );
              folder = await _viewModel.getFolder(collection, tab.id);
            },
          );

          /**
           * produces delay to update name of a collection.
           */
          renameWithCollectionList = new Debounce().debounce(
            _viewModel.updateNameWithCollectionList as any,
            1000,
          );
          findUserRole();
          prevTabId = tab?.tabId;
        })();
      } else if (tab?.name && prevTabName !== tab.name) {
        renameWithCollectionList(tab.name);
        prevTabName = tab.name;
      }
    }
  }
</script>

<FolderExplorer
  isWebApp={false}
  {userRole}
  tab={_viewModel.tab}
  bind:folder
  bind:collection
  onUpdateName={_viewModel.updateFolderName}
  onItemCreated={_viewModel.handleCreateItem}
  onUpdateDescription={_viewModel.updateFolderDescription}
  onSaveFolder={_viewModel.saveFolder}
  getTotalRequests={_viewModel.getTotalRequests}
/>
