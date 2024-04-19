<script lang="ts">
  import { Route } from "svelte-navigator";
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { onMount } from "svelte";

  import {
    collectionRightPanelWidth,
    collectionLeftPanelWidth,
    collapsibleState,
  } from "$lib/store";

  import CollectionsViewModel from "./Collections.ViewModel";

  import RestExplorer from "../RestExplorer/RestExplorer.svelte";
  import CollectionList from "$lib/components/collections/collections-list/CollectionList.svelte";
  import type {
    CollectionDocument,
    EnvironmentDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import type { Observable } from "rxjs";

  const _viewModel = new CollectionsViewModel();
  _viewModel.syncCollectionsWithBackend();

  let currentWorkspace: Observable<WorkspaceDocument> =
    _viewModel.getActiveWorkspace();
  let collectionList: Observable<CollectionDocument[]> =
    _viewModel.getCollectionList();
  let environmentList: Observable<EnvironmentDocument[]> =
    _viewModel.getEnvironmentList();
</script>

<Splitpanes
  on:resize={(e) => {
    collectionLeftPanelWidth.set(e.detail[0].size);
    collectionRightPanelWidth.set(e.detail[1].size);
  }}
>
  <Pane size={$collapsibleState ? 0 : $collectionLeftPanelWidth}>
    <!-- TODO: Add new collection list component -->
    <CollectionList
      {collectionList}
      {environmentList}
      onCreateCollection={_viewModel.handleCreateCollection}
      onCreateApiRequest={_viewModel.handleCreateApiRequest}
      onCreateRequestInCollection={_viewModel.handleCreateRequestInCollection}
      onCreateRequestInFolder={_viewModel.handleCreateRequestInFolder}
      onCreateFolderInCollection={_viewModel.handleCreateFolderInCollection}
      onDeleteCollection={_viewModel.handleDeleteCollection}
      onDeleteFolder={_viewModel.handleDeleteFolder}
      onDeleteRequest={_viewModel.handleDeleteRequest}
      onRenameCollection={_viewModel.handleRenameCollection}
      onRenameFolder={_viewModel.handleRenameFolder}
      onRenameRequest={_viewModel.handleRenameRequest}
      onOpenRequestOnTab={_viewModel.handleOpenRequestOnTab}
      onBranchSwitch={_viewModel.handleBranchSwitch}
      onImportCurl={_viewModel.handleImportCurl}
      onImportCollection={_viewModel.handleImportCollection}
      onInputDataChange={_viewModel.handleInputDataChange}
      onUploadFile={_viewModel.uploadFormFile}
      onExtractGitBranch={_viewModel.extractGitBranch}
      onRefetchCollection={_viewModel.handleRefetchCollection}
      onSearchCollection={_viewModel.handleSearchCollection}
      getActiveTab={_viewModel.getActiveTab}
      getUserRoleInWorkspace={_viewModel.getUserRoleInWorspace}
      {currentWorkspace}
    />
  </Pane>
  <Pane size={$collapsibleState ? 100 : $collectionRightPanelWidth}>
    Tabs
    <br />
    <Route>
      <RestExplorer />
    </Route>
  </Pane>
</Splitpanes>

<style>
</style>
