<script lang="ts">
  import { CartRegular } from "@sparrow/library/icons";
  import { onMount, onDestroy } from "svelte";
  import { Search } from "@sparrow/library/forms";
  import { Button } from "@sparrow/library/ui";
  import { SparrowMarketplaceBg } from "@sparrow/common/images";
  import { WorkspaceGrid } from "@sparrow/common/components";
  import type { WorkspaceDocument } from "@app/database/database";

  // Mock handlers
  const mockHandlers = {
    onAddMember: () => {},
    onSwitchWorkspace: () => {},
    onDeleteWorkspace: () => {},
    openInDesktop: () => {},
    onCopyLink: () => {},
  };
  export let loadMore = () => {};
  export let isLoading = false;
  let cardType = "marketplace";
  export let workspaceList: WorkspaceDocument[] = [];

  let scrollContainer;
  let showLoadMoreButton = false;

  // Function to check scroll position
  const handleScroll = () => {
    if (!scrollContainer) return;

    const scrollPosition = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight;
    const clientHeight = scrollContainer.clientHeight;

    // Show button when scrolled halfway through content
    const scrollPercentage = scrollPosition / (scrollHeight - clientHeight);
    showLoadMoreButton = scrollPercentage >= 0.5;
  };

  onMount(() => {
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }
  });

  onDestroy(() => {
    if (scrollContainer) {
      scrollContainer.removeEventListener("scroll", handleScroll);
    }
  });
</script>

<div class="d-flex flex-row justify-content-between image-wrapper">
  <img src={SparrowMarketplaceBg} alt="Marketplace Background" class="bg-img" />
  <div
    class="d-flex flex-column flex-grow-1 content"
    style="gap: 24px; width: 100%;
      height: calc(100vh - 45px);"
  >
    <div
      class="d-flex flex-row text-ds-font-size-24 text-ds-font-weight-semi-bold"
      style="color: var(--text-ds-neutral-50); padding-left:21px; gap: 4px;"
    >
      <CartRegular size="24px" />
      <span>MarketPlace</span>
    </div>
    <div class="d-flex mx-auto">
      <Search
        variant="primary"
        id="search-input"
        customWidth={"300px"}
        placeholder="Search workspaces in marketplace"
      />
    </div>
    <div
      bind:this={scrollContainer}
      class="d-flex flex-wrap sparrow-thin-scrollbar"
      style="gap: 16px; padding: 24px; overflow: auto;"
    >
      <div class="overlay top-overlay"></div>
      {#if workspaceList.length === 0}
        <div
          class="d-flex flex-column align-items-center justify-content-center"
          style="width: 100%; height: 100%;"
        >
          <span class="text-ds-font-size-16 text-ds-font-weight-semi-bold">
            No workspaces found
          </span>
        </div>
      {:else}
        <div class="d-flex flex-row flex-wrap" style="gap: 16px; width: 100%;">
          {#each workspaceList as workspace}
            <WorkspaceGrid
              {workspace}
              onAddMember={mockHandlers.onAddMember}
              onSwitchWorkspace={mockHandlers.onSwitchWorkspace}
              isAdminOrOwner={true}
              onDeleteWorkspace={mockHandlers.onDeleteWorkspace}
              openInDesktop={mockHandlers.openInDesktop}
              isWebEnvironment={true}
              onCopyLink={mockHandlers.onCopyLink}
              {cardType}
            />
          {/each}
        </div>
      {/if}
      <div class="overlay bottom-overlay"></div>
    </div>
    <!-- Only show the button when scrolled halfway -->
    {#if showLoadMoreButton}
      <div class="load-more-container">
        <Button
          title="Load More"
          type="outline-secondary"
          buttonClassProp="text-ds-font-size-16 text-ds-font-weight-semi-bold"
          buttonStyleProp="padding: 8px 16px; margin-top: 16px;"
          onClick={loadMore}
          disabled={isLoading}
        >
          {#if isLoading}
            <div class="spinner-border spinner-border-sm me-2" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            Loading...
          {:else}
            Load More
          {/if}
        </Button>
      </div>
    {/if}
  </div>
</div>

<style>
  .overlay {
    position: sticky;
    left: 0;
    width: 100%;
    height: 150px;
    z-index: 2;
    pointer-events: none;
  }

  /* Top overlay specific styles */
  .top-overlay {
    top: -24px;
    background: linear-gradient(
      to bottom,
      var(--bg-ds-surface-900) 0%,
      transparent 100%
    );
    margin-bottom: -150px;
  }

  /* Bottom overlay specific styles */
  .bottom-overlay {
    bottom: -24px;
    background: linear-gradient(
      to top,
      var(--bg-ds-surface-900) 0%,
      transparent 100%
    );
    margin-top: -150px;
  }
  .image-wrapper {
    position: relative;
    overflow: hidden;
  }
  .bg-img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }
  .content {
    position: relative;
    z-index: 1;
  }
  .load-more-container {
    position: absolute;
    width: 100%;
    display: flex;
    justify-content: center;
    bottom: 16px;
    z-index: 100;
  }
</style>
