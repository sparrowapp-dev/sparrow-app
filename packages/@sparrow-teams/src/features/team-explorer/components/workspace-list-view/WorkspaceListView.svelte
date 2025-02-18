<script lang="ts">
  import {
    DoubleLeftIcon,
    LeftIcon,
    RightIcon,
    DoubleRightIcon,
  } from "@sparrow/library/assets";
  import type { TeamDocument } from "@app/database/database";
  import { calculateTimeDifferenceInDays } from "../../../../utils/workspacetimeUtils";
  import { Table } from "@sparrow/teams/components";
  import { Rows } from "@sparrow/teams/compopnents";
  import { TeamSkeleton } from "../../images";
  import { RequestIcon } from "@sparrow/library/icons";
  import Request from "../../../../../../@sparrow-library/src/icons/Request.svelte";

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

  let filterText = "";
    let currentSortField = "updatedAt"; // Default sort field
  let isAscending = false; // Default sort order (descending)
  
  


  let workspacePerPage: number = 10,
    currPage = 1;
  const tableHeaderContent = [
    "Workspace",
    "Collections",
    "Contributors",
    "Last Updated",
    "",
    "",
  ];

  function handleSortToggle(field) {
    if (currentSortField === field) {
      // If clicking on the same field, toggle the direction
      isAscending = !isAscending;
    } else {
      // If clicking on a new field, set it as current and default to ascending
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
      item.name.toLowerCase().startsWith(filterText.toLowerCase())
    )
    .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage);
</script>

<div class="h-100 d-flex flex-column pb-2">
  <div
    class="table-container sparrow-thin-scrollbar overflow-y-auto"
    style="flex:1; overflow:auto;"
  >
    {#if !isGuestUser}
       <Table
  tableClassProps="table p-0 table-responsive w-100"
  tableStyleProp="max-height: 100%; "
  dataSearch="true"
  tableHeaderClassProp="position-sticky top-0 z-2"
  contributorsCount={openTeam?.users?.length}
  headerObject={tableHeaderContent}    
  onSortToggle={handleSortToggle}
  currentSortField={currentSortField}
  isAscending={isAscending}
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
        />
      {/each}
    {/if}
  </tbody>
</Table>
    {/if}
    {#if isGuestUser}
      <table
        class={`table p-0 table-responsive w-100`}
        style={`max-height: 100%;`}
      >
        <thead class={`position-sticky top-0 z-2`}>
          <tr>
            {#each tableHeaderContent as heading}
              <th class={`tab-head`}>{heading}</th>
            {/each}
          </tr>
        </thead>
      </table>
      <div>
        <img
          src={TeamSkeleton}
          alt="Team-Skelton"
          width="100%"
          height="100%"
          style=""
        />
      </div>
    {/if}

    {#if !isGuestUser}
      {#if searchQuery == "" && data && data?.length === 0}
        <p class="not-found-text mt-3">
          {isAdminOrOwner
            ? "Add Workspaces to this team."
            : "You don't have access to any workspace in this team."}
        </p>
      {:else if searchQuery !== "" && data
          .slice()
          .reverse()
          .filter((item) => item.name
              .toLowerCase()
              .startsWith(filterText.toLowerCase()))
          .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage).length == 0}
        <p class="not-found-text mt-3">No result found.</p>
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
    <table class="bottom-0" style="width: 53%;">
      <tfoot>
        <tr class="d-flex justify-content-between">
          <th class="tab-head" style=""
            >Showing {(currPage - 1) * workspacePerPage + 1} - {Math.min(
              currPage * workspacePerPage,
              data?.filter((item) =>
                item.name.toLowerCase().startsWith(filterText.toLowerCase()),
              ).length,
            )} of {data?.filter((item) =>
              item.name.toLowerCase().startsWith(filterText.toLowerCase()),
            ).length}
          </th>
          <th class="tab-head tab-change" style="">
            <button
              on:click={() => (currPage = 1)}
              class="bg-transparent border-0"
              ><DoubleLeftIcon
                color={currPage === 1 ? "var(--border-secondary-200)" : "white"}
              /></button
            >
            <button
              on:click={() => {
                if (currPage > 1) currPage -= 1;
              }}
              class="bg-transparent border-0"
              ><LeftIcon
                color={currPage === 1 ? "var(--border-secondary-200)" : "white"}
              /></button
            >
            <button
              on:click={() => {
                if (
                  currPage <
                  Math.ceil(
                    data?.filter((item) =>
                      item.name
                        .toLowerCase()
                        .startsWith(filterText.toLowerCase()),
                    ).length / workspacePerPage,
                  )
                )
                  currPage += 1;
              }}
              class="bg-transparent border-0"
              ><RightIcon
                color={currPage ===
                Math.ceil(
                  data?.filter((item) =>
                    item.name
                      .toLowerCase()
                      .startsWith(filterText.toLowerCase()),
                  ).length / workspacePerPage,
                )
                  ? "var(--border-secondary-200)"
                  : "white"}
              /></button
            >
            <button
              on:click={() =>
                (currPage = Math.ceil(
                  data?.filter((item) =>
                    item.name
                      .toLowerCase()
                      .startsWith(filterText.toLowerCase()),
                  ).length / workspacePerPage,
                ))}
              class="bg-transparent border-0"
              ><DoubleRightIcon
                color={currPage ===
                Math.ceil(
                  data?.filter((item) =>
                    item.name
                      .toLowerCase()
                      .startsWith(filterText.toLowerCase()),
                  ).length / workspacePerPage,
                )
                  ? "var(--border-secondary-200)"
                  : "white"}
              /></button
            >
          </th>
          <!-- <th class="tab-head px-0 ms-0"></th> -->
        </tr>
      </tfoot>
    </table>
  {/if}
</div>

<style>
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
