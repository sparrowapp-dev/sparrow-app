<!-- <Marketpl -->

<!-- <MarketplaceEx -->
<script lang="ts">
  import { MarketplaceExplorer } from "@sparrow/marketplace/features";
  import MarketplaceExplorerViewModel from "./MarketplaceExplorerPage.ViewModel";
  import { onMount } from "svelte";
  import type { WorkspaceDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  const _viewModel = new MarketplaceExplorerViewModel();
  const workspaceList: Observable<WorkspaceDocument[]> =
    _viewModel.publicWorkspaces;
  let currentPage = 1;
  let isLoading = false;

  const loadMore = async () => {
    isLoading = true;
    currentPage += 1;
    await _viewModel.fetchPublicWorkpsace(currentPage);
  };
  onMount(async () => {
    isLoading = true;
    await _viewModel.fetchPublicWorkpsace(currentPage);
    isLoading = false;
  });
  $:{
    console.log("ddd",currentPage);
  }
</script>

<MarketplaceExplorer
  workspaceList={$workspaceList}
  {loadMore}
  {currentPage}
  {isLoading}
/>

<style lang="scss">
</style>
