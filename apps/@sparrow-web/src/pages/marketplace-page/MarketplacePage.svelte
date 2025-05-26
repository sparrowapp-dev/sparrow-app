<script lang="ts">
  import { RecentPublicWorkspaces } from "@sparrow/marketplace/features";
  import MarketplaceExplorerPage from "./sub-pages/MarketplaceExplorerPage/MarketplaceExplorerPage.svelte";
</script>

<div class="d-flex" style="">
  <MarketplaceExplorerPage />
  <div style="width: 270px; background-color: var(--bg-ds-surface-800)">
    <RecentPublicWorkspaces />
  </div>
</div>

<style lang="scss">
</style>
