<!-- <Marketpl -->

<!-- <MarketplaceEx -->
<script lang="ts">
  import { MarketplaceExplorer } from "@sparrow/marketplace/features";
  import MarketplaceExplorerViewModel from "./MarketplaceExplorerPage.ViewModel";
  import { onMount } from "svelte";
  import type { WorkspaceDocument } from "@app/database/database";
  import { copyToClipBoard } from "@sparrow/common/utils";
  import constants from "@app/constants/constants";
  import type { Observable } from "rxjs";
  const _viewModel = new MarketplaceExplorerViewModel();

  let currentPage = 1;
  let isLoading = false;
  let totalPages = 0;
  let workspaces: WorkspaceDocument[] = [];
  let isWebEnvironment = false;
  let isSearchMode = false;
  let currentSearchTerm = "";
  let isInitialDataLoading = false;

  const loadMore = async () => {
    isLoading = true;
    currentPage += 1;

    let result;
    if (isSearchMode && currentSearchTerm) {
      result = await _viewModel.searchPublicWorkspaces(
        currentSearchTerm,
        currentPage,
      );
    } else {
      result = await _viewModel.fetchPublicWorkpsace(currentPage);
    }

    if (result?.isSuccessful && result?.data?.data?.workspaces) {
      workspaces = [...workspaces, ...result.data.data.workspaces];
      totalPages = result.data.data.totalPages;
    }

    isLoading = false;
  };

  const handleSearch = async (query: string, page: number = 1) => {
    isLoading = true;
    currentSearchTerm = query.trim();

    if (currentSearchTerm) {
      isSearchMode = true;
      currentPage = page;

      const result = await _viewModel.searchPublicWorkspaces(
        currentSearchTerm,
        page,
      );
      if (result?.isSuccessful && result?.data?.data?.workspaces) {
        workspaces = result.data.data.workspaces;
        totalPages = result.data.data.totalPages;
      } else {
        workspaces = [];
        totalPages = 0;
      }
    } else {
      isSearchMode = false;
      currentPage = 1;
      currentSearchTerm = "";
      await loadInitialWorkspaces();
    }

    isLoading = false;
  };

  const loadInitialWorkspaces = async () => {
    isLoading = true;
    const result = await _viewModel.fetchPublicWorkpsace(currentPage);
    // Store the initial workspaces
    if (result?.isSuccessful && result?.data?.data?.workspaces) {
      workspaces = result.data.data.workspaces;
      totalPages = result.data.data.totalPages;
    }
    isLoading = false;
  };

  onMount(async () => {
    isInitialDataLoading = true;
    await loadInitialWorkspaces();
    isInitialDataLoading = false;
  });

  const handleCopyPublicWorkspaceLink = async (workspaceId: string) => {
    await copyToClipBoard(
      `${constants.SPARROW_WEB_APP_URL}/app/collections?workspaceId=${workspaceId}`,
    );
  };
  const handleSwitchWorkspace = (workspaceId: string) => {
    // Find the workspace data by ID
    const workspaceData = workspaces.find(
      (workspace) => workspace._id === workspaceId,
    );

    if (workspaceData) {
      // Call the ViewModel function and pass the workspace data
      _viewModel.addAndSwitchWorkspace(workspaceData);
    } else {
      console.error(`Workspace with ID ${workspaceId} not found.`);
    }
  };
</script>

<MarketplaceExplorer
  workspaceList={workspaces}
  {loadMore}
  {currentPage}
  {isLoading}
  {totalPages}
  onSwitchWorkspace={handleSwitchWorkspace}
  onCopyLink={handleCopyPublicWorkspaceLink}
  {isWebEnvironment}
  {isSearchMode}
  onSearchWorkspaces={handleSearch}
  {isInitialDataLoading}
/>

<style lang="scss">
</style>
