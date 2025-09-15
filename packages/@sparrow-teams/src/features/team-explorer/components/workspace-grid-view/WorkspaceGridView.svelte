<script lang="ts">
  import {
    DoubleLeftIcon,
    DoubleRightIcon,
    LeftIcon,
    RightIcon,
  } from "@sparrow/library/assets";
  import type { WorkspaceDocument } from "@app/database/database";
  import { Button, Spinner } from "@sparrow/library/ui";
  import { WorkspaceGrid } from "@sparrow/common/components";
  import { TeamSkeleton } from "../../images";
  import { SparrowLogo } from "@sparrow/common/icons";
  import {
    ChevronDoubleLeftRegular,
    ChevronDoubleRightRegular,
    ChevronLeftRegular,
    ChevronRightRegular,
  } from "@sparrow/library/icons";
  import { WorkspaceType } from "@sparrow/common/enums";

  export let openInDesktop: (workspaceID: string) => void;
  export let isWebEnvironment: boolean;
  export let searchQuery = "";
  export let onAddMember;
  /**
   * Array of all the workspaces from local DB
   */
  export let workspaces: WorkspaceDocument[] = [];
  /**
   * Currently active team
   */
  export let onCreateNewWorkspace;
  /**
   * Callback for switching the workspace
   */
  export let onSwitchWorkspace: (id: string) => void;
  /**
   * function to delete workspace
   */
  export let onDeleteWorkspace;
  /**
   * Checks if the current user has admin or owner privileges.
   */
  export let isAdminOrOwner: boolean;

  /**
   * Flag to check if user is guest user
   */
  export let isGuestUser = false;

  export let isWorkspaceCreationInProgress = false;
  export let onCopyLink;
  export let selectedFilter;
  export let appEdition = "MANAGED";

  let workspacePerPage = 5;
  let filterText = "";
  let currPage = 1;
  let prevPage = -1;
  let filteredWorkspaces: any[] = [];
  let prevSelectedFilter = selectedFilter;
  let prevSearchQuery = searchQuery;

  // Filter workspaces and handle pagination logic
  $: {
    const filteredResults = workspaces.filter(
      (item) =>
        typeof item.name === "string" &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const filterChanged = selectedFilter !== prevSelectedFilter;
    const searchChanged = searchQuery !== prevSearchQuery;

    // Reset to page 1 only for filter/search changes
    if (filterChanged || searchChanged) {
      currPage = 1;
      prevPage = 1;
    }

    prevSelectedFilter = selectedFilter;
    prevSearchQuery = searchQuery;

    filteredWorkspaces = filteredResults.sort(
      (a, b) =>
        new Date(b._data.updatedAt).getTime() -
        new Date(a._data.updatedAt).getTime(),
    );

    // CRITICAL: Validate current page after any workspace changes
    const total = filteredWorkspaces.length;
    const maxPages = total <= 6 ? 1 : Math.ceil((total - 6) / 6) + 1;

    // If current page exceeds available pages, adjust to last valid page
    if (currPage > maxPages && maxPages > 0) {
      currPage = maxPages;
      prevPage = maxPages;
    }

    // Handle empty workspace case
    if (total === 0) {
      currPage = 1;
      prevPage = 1;
    }
  }

  // Calculate total pages with bounds checking
  $: totalPages = (() => {
    const total = filteredWorkspaces.length;
    if (total === 0) return 1;
    if (total <= 6) return 1;
    return Math.ceil((total - 6) / 6) + 1;
  })();

  // Split workspaces into pages with validation
  $: paginatedWorkspaces = (() => {
    const total = filteredWorkspaces.length;

    if (total === 0) return [];

    // Ensure currPage is within valid bounds
    const maxPages = totalPages;
    const validPage = Math.max(1, Math.min(currPage, maxPages));

    if (validPage === 1) {
      return filteredWorkspaces.slice(0, 6);
    } else {
      const startIndex = 6 + (validPage - 2) * 6;
      return filteredWorkspaces.slice(startIndex, startIndex + 6);
    }
  })();

  // Calculate display indices with error handling
  $: startIndex = (() => {
    if (filteredWorkspaces.length === 0) return 0;
    return currPage === 1 ? 1 : 6 + (currPage - 2) * 6 + 1;
  })();

  $: endIndex = (() => {
    if (filteredWorkspaces.length === 0) return 0;
    const calculatedEnd = currPage === 1 ? 6 : startIndex + 5;
    return Math.min(calculatedEnd, filteredWorkspaces.length);
  })();

  const setPageWithinBounds = (newPage: number) => {
    const maxPages = totalPages;
    const validPage = Math.max(1, Math.min(newPage, maxPages));
    currPage = validPage;
    prevPage = validPage;
  };

  const handleClick = async () => {
    if (!isWorkspaceCreationInProgress) {
      isWorkspaceCreationInProgress = true;
      await onCreateNewWorkspace();
      isWorkspaceCreationInProgress = false;
    }
  };
</script>

<div class="h-100">
  <div class="d-flex flex-column h-100">
    {#if !isGuestUser}
      <div class="sparrow-thin-scrollbar" style="flex:1; overflow:auto;">
        <div class="d-flex flex-wrap" style="gap:16px">
          {#if searchQuery == "" && filteredWorkspaces.length === 0 && !isAdminOrOwner}
            <div class="container">
              <div class="sparrow-logo">
                <SparrowLogo />
              </div>
              <p
                style="color:var(--text-ds-neutral-400); font-size: 12px;font-weight:500;"
              >
                You don't have access to any workspace in this hub.
              </p>
            </div>
          {:else if searchQuery !== "" && filteredWorkspaces.length === 0}
            <div class="container">
              <div class="sparrow-logo">
                <SparrowLogo />
              </div>
              <p
                style="color:var(--text-ds-neutral-400); font-size: 12px;font-weight:500;"
              >
                No result found.
              </p>
            </div>
          {:else if workspaces.length === 0}
            <div class="container">
              <div class="sparrow-logo">
                <SparrowLogo />
              </div>
              {#if selectedFilter === WorkspaceType.PUBLIC}
                <p
                  style="color:var(--text-ds-neutral-400); font-size: 12px;font-weight:500;"
                >
                  Welcome to Sparrow! Explore your public workspaces here.
                </p>
              {:else if selectedFilter === WorkspaceType.PRIVATE}
                <p
                  style="color:var(--text-ds-neutral-400); font-size: 12px;font-weight:500;"
                >
                  Welcome to Sparrow! Explore your private workspaces here.
                </p>
              {:else}
                <p
                  style="color:var(--text-ds-neutral-400); font-size: 12px;font-weight:500;"
                >
                  Welcome to Sparrow! Explore your all workspaces here.
                </p>
              {/if}
            </div>
          {/if}
          <!-- {#if currPage === 1 && searchQuery === "" && isAdminOrOwner}
            <div
              class="sparrow-fs-16 col-lg-3 col-md-10 flex-grow-1 py-0 add-new-workspace"
              style="min-height: 132px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
              on:click={handleClick}
              tabindex="0"
            >
              {#if isWorkspaceCreationInProgress}
                <span>
                  <Spinner size={`16px`} />
                </span>
              {:else}
                <span
                  class="text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
                  >+ Add New Workspace</span
                >
              {/if}
            </div>
          {/if} -->

          {#each paginatedWorkspaces as workspace}
            <WorkspaceGrid
              {onAddMember}
              {workspace}
              {onSwitchWorkspace}
              {isAdminOrOwner}
              {onDeleteWorkspace}
              {openInDesktop}
              {isWebEnvironment}
              {onCopyLink}
              {appEdition}
            />
          {/each}
        </div>
      </div>
      {#if filteredWorkspaces.length > 0}
        <div class="bottom-0 d-flex justify-content-between" style="width:53%;">
          <div class="tab-head" style="width: 189.46px;">
            Showing {startIndex} - {endIndex} of {filteredWorkspaces.length}
          </div>
          <div class="tab-head tab-change">
            <button
              on:click={() => setPageWithinBounds(1)}
              class="bg-transparent border-0"
              disabled={currPage === 1}
            >
              <ChevronDoubleLeftRegular
                color={currPage === 1
                  ? "var(--bg-ds-neutral-500)"
                  : "var(--bg-ds-neutral-100)"}
              />
            </button>

            <button
              on:click={() => setPageWithinBounds(currPage - 1)}
              class="bg-transparent border-0"
              disabled={currPage === 1}
            >
              <ChevronLeftRegular
                color={currPage === 1
                  ? "var(--bg-ds-neutral-500)"
                  : "var(--bg-ds-neutral-100)"}
              />
            </button>

            <button
              on:click={() => setPageWithinBounds(currPage + 1)}
              class="bg-transparent border-0"
              disabled={currPage === totalPages}
            >
              <ChevronRightRegular
                color={currPage === totalPages
                  ? "var(--bg-ds-neutral-500)"
                  : "var(--bg-ds-neutral-100)"}
              />
            </button>

            <button
              on:click={() => setPageWithinBounds(totalPages)}
              class="bg-transparent border-0"
              disabled={currPage === totalPages}
            >
              <ChevronDoubleRightRegular
                color={currPage === totalPages
                  ? "var(--bg-ds-neutral-500)"
                  : "var(--bg-ds-neutral-100)"}
              />
            </button>
          </div>
        </div>
      {/if}
    {:else}
      <div class="container">
        <div class="sparrow-logo">
          <SparrowLogo />
        </div>
        <p
          style="color:var(--text-ds-neutral-400); font-size: 12px;font-weight:500; height:2px"
        >
          Collaborate seamlessly with your team and manage your projects
          effectively in Sparrow.
        </p>
        <p
          style="color:var(--text-ds-neutral-400); font-size: 12px;font-weight:500;"
        >
          Create an account or Sign in to access hubs, workspaces and unlock
          powerful features today!
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    padding: 5%;
    gap: 16px;
  }
  .tab-head {
    padding: 8px;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    color: var(--text-secondary-200);
    background-color: transparent;
  }
  .tab-change {
    margin-left: 26px;
  }

  :global(.add-new-workspace) {
    border: 1px dashed var(--border-ds-neutral-300);
    /* background-color: var(--bg-ds-neutral-100); */
    /* background-clip: text; */
    /* -webkit-background-clip: text; */
    /* -webkit-text-fill-color: transparent; */
    max-width: 32.8%;
    max-height: 32%;
    border-radius: 8px;
  }

  :global(.add-new-workspace.empty) {
    max-width: 80%;
  }
  :global(.add-new-workspace:hover) {
    border: 1px dashed var(--border-ds-primary-300);
    background-color: var(--bg-ds-surface-500);
    background-clip: initial;
    -webkit-background-clip: initial;
    -webkit-text-fill-color: initial;
  }
  :global(.add-new-workspace:active) {
    border: 1px dashed var(--border-ds-primary-300);
    background: var(--bg-ds-surface-600);
  }
  :global(.add-new-workspace:focus-visible) {
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
    gap: 8px;
  }
  .not-found-text {
    color: var(--request-arc);
    font-size: 16px;
    text-align: center;
  }

  @media only screen and (max-width: 1100px) {
    .search-input-container {
      width: 50vw;
    }
    .add-new-workspace {
      max-width: 100%;
    }
  }
</style>
