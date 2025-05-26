<!-- <Marketpl -->

<!-- <MarketplaceEx -->
<script lang="ts">
  import { MarketplaceExplorer } from "@sparrow/marketplace/features";
  import MarketplaceExplorerViewModel from "./MarketplaceExplorerPage.ViewModel";
  import { onMount } from "svelte";
  import type { WorkspaceDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  const _viewModel = new MarketplaceExplorerViewModel();

  let currentPage = 1;
  let isLoading = false;
  let totalPages = 0;
  let workspaces: WorkspaceDocument[] = [];

  const loadMore = async () => {
    isLoading = true;
    currentPage += 1;
    const result = await _viewModel.fetchPublicWorkpsace(currentPage);
    // Store the fetched workspaces
    if (result?.isSuccessful && result?.data?.data?.workspaces) {
      workspaces = [...workspaces, ...result.data.data.workspaces];
      totalPages = result.data.data.totalPages;
    }
    isLoading = false;
  };
  onMount(async () => {
    isLoading = true;
    const result = await _viewModel.fetchPublicWorkpsace(currentPage);
    // Store the initial workspaces
    if (result?.isSuccessful && result?.data?.data?.workspaces) {
      workspaces = result.data.data.workspaces;
      totalPages = result.data.data.totalPages;
    }
    isLoading = false;
  });
</script>

<MarketplaceExplorer
  workspaceList={workspaces}
  {loadMore}
  {currentPage}
  {isLoading}
  {totalPages}
/>

<style lang="scss">
</style>
