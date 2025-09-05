<script lang="ts">
  import {
    DoubleLeftIcon,
    LeftIcon,
    RightIcon,
    DoubleRightIcon,
  } from "@sparrow/library/assets";
  import {
    ChevronDoubleLeftRegular,
    ChevronDoubleRightRegular,
    ChevronLeftRegular,
    ChevronRightRegular,
  } from "@sparrow/library/icons";
  import type { TeamDocument } from "@app/database/database";
  import { calculateTimeDifferenceInDays } from "../../../../utils/workspacetimeUtils";
  import { Table } from "@sparrow/teams/components";
  import { Rows } from "@sparrow/teams/components";
  import { TeamSkeleton } from "../../images";
  import { SparrowLogo } from "@sparrow/common/images";
  import { WorkspaceType } from "@sparrow/common/enums";

  export let data: any;
  export let openTeam: TeamDocument;
  export let isWebEnvironment: boolean;
  export let onSwitchWorkspace: (id: string) => void;
  export let searchQuery;
  export let onDeleteWorkspace;
  export let openInDesktop;
  export let isAdminOrOwner: boolean;
  export let isGuestUser = false;
  export let onAddMember;
  export let selectedFilter;
  export let appEdition = "MANAGED";

  let filterText = "";
  let currentSortField = "updatedAt";
  let isAscending = false;

  let workspacePerPage: number = 10,
    currPage = 1;
  const tableHeaderContent = [
    "Workspace",
    "Collections",
    "Contributors",
    "Last Updated",
    "Visibility",
    "",
    "",
  ];

  $: {
    selectedFilter;
    searchQuery;
    filterText;
    currPage = 1;
  }

  function handleSortToggle(field) {
    if (currentSortField === field) {
      isAscending = !isAscending;
    } else {
      currentSortField = field;
      isAscending = true;
    }
  }

  $: sortedData = data
    ? [...data].sort((a, b) => {
        const aValue = new Date(a._data[currentSortField]).getTime();
        const bValue = new Date(b._data[currentSortField]).getTime();
        return isAscending ? aValue - bValue : bValue - aValue;
      })
    : [];

  $: filteredAndSortedData = sortedData
    .filter((item) =>
      item.name.toLowerCase().startsWith(filterText.toLowerCase()),
    )
    .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage);

  // Calculate total pages with bounds checking
  $: totalPages = (() => {
    const total = sortedData.filter((item) =>
      item.name.toLowerCase().startsWith(filterText.toLowerCase()),
    ).length;
    if (total === 0) return 1;
    return Math.ceil(total / workspacePerPage);
  })();

  // Calculate filtered data length for pagination
  $: filteredDataLength = sortedData.filter((item) =>
    item.name.toLowerCase().startsWith(filterText.toLowerCase()),
  ).length;

  const setPageWithinBounds = (newPage: number) => {
    const maxPages = totalPages;
    const validPage = Math.max(1, Math.min(newPage, maxPages));
    currPage = validPage;
  };
</script>

<div class="h-100 d-flex flex-column">
  <div
    class="table-container sparrow-thin-scrollbar overflow-y-auto"
    style="flex:1; overflow:auto;"
  >
    {#if !isGuestUser}
      <Table
        tableClassProps="table p-0 table-responsive w-100"
        tableStyleProp="max-height: 100%; "
        dataSearch="true"
        tableHeaderClassProp="position-sticky top-0"
        tableHeaderStyleProp="background-color: var(--bg-ds-surface-900);z-index: 103;"
        contributorsCount={openTeam?.users?.length}
        headerObject={tableHeaderContent}
        onSortToggle={handleSortToggle}
        {isAscending}
      >
        <tbody class="overflow-y-auto position-relative z-0">
          {#if data}
            {#each filteredAndSortedData as list, index}
              <Rows
                {onAddMember}
                {list}
                activeTeam={openTeam}
                onOpenCollection={onSwitchWorkspace}
                {calculateTimeDifferenceInDays}
                {isAdminOrOwner}
                {onDeleteWorkspace}
                {openInDesktop}
                {isWebEnvironment}
                {appEdition}
              />
            {/each}
          {/if}
        </tbody>
      </Table>
    {/if}
    {#if isGuestUser}
      <div class="container">
        <div class="sparrow-logo pb-3">
          <SparrowLogo />
        </div>
        <p
          style="color:var(--text-ds-neutral-400); font-size: 12px; font-weight:500; height:2px"
        >
          Collaborate seamlessly with your team and manage your projects
          effectively in Sparrow.
        </p>
        <p
          style="color:var(--text-ds-neutral-400); font-size: 12px; font-weight:500;"
        >
          Create an account or Sign in to access hubs, workspaces and unlock
          powerful features today!
        </p>
      </div>
    {/if}

    {#if !isGuestUser}
      {#if searchQuery == "" && data && data?.length === 0 && !isAdminOrOwner}
        <div class="container">
          <div class="sparrow-logo pb-3">
            <SparrowLogo />
          </div>
          <p
            style="color:var(--text-ds-neutral-400); font-size: 12px;font-weight:500;"
          >
            You don't have access to any workspace in this hub.
          </p>
        </div>
      {:else if searchQuery !== "" && data
          .slice()
          .reverse()
          .filter((item) => item.name
              .toLowerCase()
              .startsWith(filterText.toLowerCase()))
          .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage).length == 0}
        <div class="container">
          <div class="sparrow-logo pb-3">
            <SparrowLogo />
          </div>
          <p
            style="color:var(--text-ds-neutral-400); font-size: 12px;font-weight:500;"
          >
            No result found.
          </p>
        </div>
      {:else if data.length === 0}
        <div class="container">
          <div class="sparrow-logo pb-3">
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
    {/if}
  </div>

  {#if data
    .slice()
    .reverse()
    .filter((item) => item.name
        .toLowerCase()
        .startsWith(filterText.toLowerCase()))
    .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage).length > 0 && !isGuestUser}
    <div class="bottom-0 d-flex justify-content-between" style="width: 53%;">
      <div class="tab-head" style="width: 189.46px;">
        Showing {(currPage - 1) * workspacePerPage + 1} - {Math.min(
          currPage * workspacePerPage,
          filteredDataLength,
        )} of {filteredDataLength}
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
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 80%;
    padding: 130px 35px 24px;
  }
  .not-found-text {
    color: var(--text-secondary-200);
    font-size: 16px;
    font-weight: 400;
    text-align: center;
  }

  .tab-data {
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    background-color: transparent;
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
    margin-left: 203px;
  }
  table {
    background-color: transparent;
  }
</style>
