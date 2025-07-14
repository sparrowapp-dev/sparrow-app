<script lang="ts">
  import { RecentPublicWorkspaces } from "@sparrow/marketplace/features";
  import MarketplaceExplorerPage from "./sub-pages/MarketplaceExplorerPage/MarketplaceExplorerPage.svelte";
  import MarketplacePageViewModel from "./MarketplacePage.ViewModel";
  import { Motion } from "svelte-motion";
  import { pagesMotion } from "@app/constants";
  const _viewModel = new MarketplacePageViewModel();
  const recentPublicWorkspaces = _viewModel.recentPublicWorkspaces;
</script>

<Motion {...pagesMotion} let:motion>
  <div class="h-100" use:motion>
    <div class="d-flex h-100" style="flex: 1">
      <MarketplaceExplorerPage />
      <RecentPublicWorkspaces
        recentPublicWorkspaces={$recentPublicWorkspaces}
        onSwitchWorkspace={_viewModel.addAndSwitchWorkspace}
      />
    </div>
  </div>
</Motion>

<style lang="scss">
</style>
