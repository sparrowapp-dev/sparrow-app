<script lang="ts">
  import { RecentPublicWorkspaces } from "@sparrow/marketplace/features";
  import MarketplaceExplorerPage from "./sub-pages/MarketplaceExplorerPage/MarketplaceExplorerPage.svelte";
  import MarketplacePageViewModel from "./MarketplacePage.ViewModel";
  const _viewModel = new MarketplacePageViewModel();
  const recentPublicWorkspaces = _viewModel.recentPublicWorkspaces;
</script>

<div class="d-flex" style="">
  <MarketplaceExplorerPage />
  <div style="width: 270px; background-color: var(--bg-ds-surface-800)">
    <RecentPublicWorkspaces
      recentPublicWorkspaces={$recentPublicWorkspaces}
      onSwitchWorkspace={_viewModel.addAndSwitchWorkspace}
    />
  </div>
</div>

<style lang="scss">
</style>
