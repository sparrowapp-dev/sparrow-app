<script lang="ts">
  import { CartRegular } from "@sparrow/library/icons";
  import { onMount, onDestroy } from "svelte";
  import { Search } from "@sparrow/library/forms";
  import { Button, Loader } from "@sparrow/library/ui";
  import { SparrowLogo, SparrowMarketplaceBg } from "@sparrow/common/images";
  import { WorkspaceGrid } from "@sparrow/common/components";
  import type { WorkspaceDocument } from "@app/database/database";
  import { Debounce } from "@sparrow/common/utils";

  export let loadMore = () => {};
  export let isLoading = false;
  export let onCopyLink;
  let cardType = "marketplace";
  export let workspaceList: WorkspaceDocument[] = [];
  export let isWebEnvironment;
  export let onSearchWorkspaces = (name: string, page?: number) => {};
  export let isInitialDataLoading;

  let searchInput = "";
  let scrollContainer;
  let showLoadMoreButton = false;
  export let currentPage;
  export let totalPages;
  export let isSearchMode = false;
  let showTopOverlay = false;
  let showBottomOverlay = false;
  let isSearchLoading = false;

  const debounceInstance = new Debounce();
  const debouncedSearch = debounceInstance.debounce(async (value: string) => {
    await onSearchWorkspaces(value, 1);
    isSearchLoading = false;
  }, 300);

  const handleSearch = (event: { detail: string }) => {
    searchInput = event.detail;
    isSearchLoading = true;
    debouncedSearch(searchInput);
  };

  const shouldShowLoadMore = () => {
    return currentPage < totalPages && workspaceList.length > 0 && !isLoading;
  };

  const handleScroll = () => {
    if (!scrollContainer) return;

    const scrollPosition = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight;
    const clientHeight = scrollContainer.clientHeight;
    if (scrollHeight <= clientHeight) {
      showLoadMoreButton = shouldShowLoadMore();
      return;
    }

    const scrollPercentage = scrollPosition / (scrollHeight - clientHeight);
    showTopOverlay = scrollPosition > 30;
    showBottomOverlay = scrollPercentage >= 0.5;
    showLoadMoreButton = scrollPercentage >= 0.7 && shouldShowLoadMore();
  };

  const handleLoadMoreClick = () => {
    loadMore();
  };

  $: {
    if (scrollContainer) {
      setTimeout(() => {
        handleScroll();
      }, 0);
    } else if (workspaceList.length > 0) {
      showLoadMoreButton = shouldShowLoadMore();
    }
  }

  $: if (workspaceList) {
    setTimeout(() => {
      if (scrollContainer) {
        handleScroll();
      }
    }, 100);
  }

  onMount(() => {
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll();
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
    style="gap: 24px; width: calc(100vw - 270px);
      height: calc(100vh - 45px);"
  >
    {#if isInitialDataLoading}
      <div
        class="d-flex flex-column align-items-center justify-content-center"
        style="width: 100%; height: 100%;"
      >
        <Loader loaderSize={"32px"} />
      </div>
    {:else}
      <div
        class="d-flex flex-row text-ds-font-size-24 text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-50); padding-left:17px;"
      >
        <div class="d-flex" style="padding:4px; gap: 4px;">
          <CartRegular size="24px" />
          <span>MarketPlace</span>
        </div>
      </div>
      <div class="d-flex mx-auto">
        <Search
          variant="primary-gradient"
          id="search-input"
          customWidth={"300px"}
          placeholder="Search workspaces in marketplace"
          on:input={handleSearch}
          value={searchInput}
        />
      </div>
      {#if isSearchLoading}
        <div
          class="d-flex flex-column align-items-center justify-content-center"
          style="width: 100%; height: 100%;"
        >
          <Loader loaderSize={"20px"} />
        </div>
      {:else if workspaceList.length === 0}
        <div
          class="d-flex flex-column align-items-center justify-content-center"
          style="width: 100%; height: 60%;"
        >
          <div class="container">
            <SparrowLogo width={"180px"} height={"180px"} />
          </div>
          <div>
            <span
              style="color:var(--text-ds-neutral-400); font-size: 12px; font-weight:400; text-align:center;"
            >
              {searchInput ? "No result found." : "No workspaces found."}
            </span>
          </div>
        </div>
      {:else}
        <div
          bind:this={scrollContainer}
          class="d-flex flex-wrap sparrow-thin-scrollbar"
          style="gap: 16px; padding: 24px; overflow: auto;"
          on:scroll={handleScroll}
        >
          {#if showTopOverlay}
            <div class="overlay top-overlay"></div>
          {/if}
          <div
            class="d-flex flex-row flex-wrap"
            style="gap: 16px; width: 100%;"
          >
            {#each workspaceList as workspace}
              <WorkspaceGrid
                {workspace}
                onSwitchWorkspace={() => {}}
                {onCopyLink}
                {isWebEnvironment}
                {cardType}
              />
            {/each}
          </div>
          {#if showBottomOverlay}
            <div class="overlay bottom-overlay"></div>
          {/if}
        </div>

        <!-- Show load more button with improved conditions -->
        {#if showLoadMoreButton && workspaceList.length > 0}
          <div class="load-more-container">
            <Button
              title="Load More"
              type="outline-secondary"
              buttonClassProp="text-ds-font-size-16 text-ds-font-weight-semi-bold"
              buttonStyleProp="padding: 8px 16px; margin-top: 16px;"
              onClick={handleLoadMoreClick}
              disabled={isLoading}
            />
          </div>
        {/if}
      {/if}
    {/if}
  </div>
</div>

<style>
  .overlay {
    position: sticky;
    left: 0;
    width: 100%;
    z-index: 2;
    pointer-events: none;
  }

  /* Add the requested scrollbar styling */
  .sparrow-thin-scrollbar::-webkit-scrollbar-thumb {
    background-color: var(--bg-secondary-330);
  }

  .sparrow-thin-scrollbar::-webkit-scrollbar-button {
    color: var(--bg-secondary-330);
  }

  /* Top overlay specific styles */
  .top-overlay {
    top: -24px;
    background: linear-gradient(
      to bottom,
      var(--bg-ds-surface-800) 0%,
      transparent 100%
    );
    height: 100px;
    margin-bottom: -150px;
  }

  /* Bottom overlay specific styles */
  .bottom-overlay {
    bottom: -24px;
    background: linear-gradient(
      to top,
      var(--bg-ds-surface-800) 0%,
      transparent 100%
    );
    height: 120px;
    margin-top: -130px;
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

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px 78px 24px;
  }
</style>
