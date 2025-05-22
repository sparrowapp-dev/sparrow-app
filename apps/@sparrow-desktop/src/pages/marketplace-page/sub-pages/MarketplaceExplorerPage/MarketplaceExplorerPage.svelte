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
  onMount(async () => {
    await _viewModel.fetchPublicWorkpsace();
  });
</script>

<MarketplaceExplorer workspaceList={$workspaceList} />

<style lang="scss">
</style>
