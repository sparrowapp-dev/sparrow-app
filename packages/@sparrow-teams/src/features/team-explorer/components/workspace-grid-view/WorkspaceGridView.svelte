<script lang="ts">
  import {
    DoubleLeftIcon,
    DoubleRightIcon,
    LeftIcon,
    RightIcon,
  } from "@sparrow/library/assets";
  import type { WorkspaceDocument } from "@app/database/database";
  import { Button, Spinner } from "@sparrow/library/ui";
  import { WorkspaceGrid } from "@sparrow/teams/compopnents";
  import { TeamSkeleton } from "../../images";

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
  let workspacePerPage = 5;
  let filterText = "";
  let currPage = 1;

  // filters the workspaces based on the search query
  $: filteredWorkspaces = workspaces
    .filter(
      (item) =>
        typeof item.name === "string" &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort(
      (a, b) =>
        new Date(b._data.updatedAt).getTime() -
        new Date(a._data.updatedAt).getTime(),
    );

  // This will split workspaces into pages
  $: paginatedWorkspaces = (() => {
    if (currPage === 1) {
      return filteredWorkspaces.slice(0, 5);
    } else {
      const startIndex = 5 + (currPage - 2) * 6;
      return filteredWorkspaces.slice(startIndex, startIndex + 6); //will check the start index based on current page
    }
  })();

  // This will calculate the total number of pages
  $: totalPages = (() => {
    const total = filteredWorkspaces.length;
    if (total <= 5) return 1;
    return Math.ceil((total - 5) / 6) + 1;
  })();

  $: startIndex = currPage === 1 ? 1 : 5 + (currPage - 2) * 6 + 1;
  $: endIndex = Math.min(
    currPage === 1 ? 5 : startIndex + 5,
    filteredWorkspaces.length,
  );

  const setPageWithinBounds = (newPage: number) => {
    currPage = Math.max(1, Math.min(newPage, totalPages));
  };

  const handleClick = async () => {
    if (!isWorkspaceCreationInProgress) {
      isWorkspaceCreationInProgress = true;
      await onCreateNewWorkspace();
      isWorkspaceCreationInProgress = false;
    }
  };
</script>

<div class="h-100 pb-2">
  <div class="d-flex flex-column h-100">
    {#if !isGuestUser}
      <div class="sparrow-thin-scrollbar" style="flex:1; overflow:auto;">
        <div class="d-flex flex-wrap gap-3 justify-content-between row-gap-0">
          {#if searchQuery == "" && filteredWorkspaces.length === 0 && !isAdminOrOwner}
            <p class="not-found-text mx-auto mt-3">
              You don't have access to any workspace in this team.
            </p>
          {:else if searchQuery !== "" && filteredWorkspaces.length === 0}
            <span class="not-found-text mx-auto ellipsis">No result found.</span
            >
          {/if}
          {#if currPage === 1 && searchQuery === "" && isAdminOrOwner}
            <div
              class="sparrow-fs-16 col-lg-3 col-md-10 flex-grow-1 py-0 mb-4 add-new-workspace"
              style="min-height: 132px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
              on:click={handleClick}
              tabindex="0"
            >
              {#if isWorkspaceCreationInProgress}
                <span>
                  <Spinner size={`16px`} />
                </span>
              {:else}
                <span>+ Add New Workspace</span>
              {/if}
            </div>
          {/if}
          {#each paginatedWorkspaces as workspace}
            <WorkspaceGrid
              {onAddMember}
              {workspace}
              {onSwitchWorkspace}
              {isAdminOrOwner}
              {onDeleteWorkspace}
              {openInDesktop}
              {isWebEnvironment}
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
            >
              <DoubleLeftIcon
                color={currPage === 1 ? "var(--border-secondary-200)" : "white"}
              />
            </button>
            <button
              on:click={() => setPageWithinBounds(currPage - 1)}
              class="bg-transparent border-0"
            >
              <LeftIcon
                color={currPage === 1 ? "var(--border-secondary-200)" : "white"}
              />
            </button>
            <button
              on:click={() => setPageWithinBounds(currPage + 1)}
              class="bg-transparent border-0"
            >
              <RightIcon
                color={currPage === totalPages
                  ? "var(--border-secondary-200)"
                  : "white"}
              />
            </button>
            <button
              on:click={() => setPageWithinBounds(totalPages)}
              class="bg-transparent border-0"
            >
              <DoubleRightIcon
                color={currPage === totalPages
                  ? "var(--border-secondary-200)"
                  : "white"}
              />
            </button>
          </div>
        </div>
      {/if}
    {:else}
      <img
        src={TeamSkeleton}
        alt="Team-Skelton"
        width="100%"
        height="100%"
        style="padding-bottom:100px;"
      />
    {/if}
  </div>
</div>

<style>
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
    background-color: var(--bg-ds-neutral-100);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    max-width: 47.5%;
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
    background: var(--bg-ds-surface-500);
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
