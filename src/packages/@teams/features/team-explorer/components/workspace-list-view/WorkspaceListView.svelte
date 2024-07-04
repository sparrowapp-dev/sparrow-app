<script lang="ts">
  import {
    DoubleLeftIcon,
    LeftIcon,
    RightIcon,
    DoubleRightIcon,
  } from "$lib/assets/app.asset";
  import type { TeamDocument } from "@app/database/database";
  import { calculateTimeDifferenceInDays } from "$lib/utils/workspacetimeUtils";
  import { Table } from "@library/ui";
  import { Rows } from "@teams/common/compopnents";

  export let data: any;
  export let userType = "";
  export let openTeam: TeamDocument;
  export let onSwitchWorkspace: (id: string) => void;

  export let searchQuery;

  let workspacePerPage: number = 10,
    currPage = 1;
  const tableHeaderContent = [
    "Workspace",
    "Collections",
    "Contributors",
    "Last Updated",
    "",
  ];
</script>

<div class=" h-100 d-flex flex-column pb-2">
  <div
    class="table-container sparrow-thin-scrollbar overflow-y-auto"
    style="flex:1; overflow:auto;"
  >
    <Table
      tableClassProps="table p-0 table-responsive w-100"
      tableStyleProp="max-height: 100%;"
      dataSearch="true"
      tableHeaderClassProp="position-sticky top-0 z-2"
      contributorsCount={openTeam?.users?.length}
      headerObject={tableHeaderContent}
    >
      <tbody class="overflow-y-auto position-relative z-0">
        {#if data}
          {#each data
            .slice()
            .reverse()
            .filter((item) => item.name
                .toLowerCase()
                .startsWith(searchQuery.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage) as list, index}
            <Rows
              {list}
              activeTeam={openTeam}
              onOpenCollection={onSwitchWorkspace}
              {calculateTimeDifferenceInDays}
              {userType}
            />
          {/each}
        {/if}
      </tbody>
    </Table>

    {#if  searchQuery == "" && data && data?.length === 0}
      <p class="not-found-text mt-3">Add Workspaces to this team</p>
    {:else if searchQuery !== "" && data
        .slice()
        .reverse()
        .filter((item) => item.name
            .toLowerCase()
            .startsWith(searchQuery.toLowerCase()))
        .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage).length == 0}
      <p class="not-found-text mt-3">No results found.</p>
    {/if}
  </div>

  {#if data
    .slice()
    .reverse()
    .filter((item) => item.name
        .toLowerCase()
        .startsWith(searchQuery.toLowerCase()))
    .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage).length > 0}
    <table class="w-75 bottom-0">
      <tfoot>
        <tr class="d-flex justify-content-between">
          <th class="tab-head"
            >Showing {(currPage - 1) * workspacePerPage + 1} - {Math.min(
              currPage * workspacePerPage,
              data?.filter((item) =>
                item.name.toLowerCase().startsWith(searchQuery.toLowerCase()),
              ).length,
            )} of {data?.filter((item) =>
              item.name.toLowerCase().startsWith(searchQuery.toLowerCase()),
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
                        .startsWith(searchQuery.toLowerCase()),
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
                      .startsWith(searchQuery.toLowerCase()),
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
                      .startsWith(searchQuery.toLowerCase()),
                  ).length / workspacePerPage,
                ))}
              class="bg-transparent border-0"
              ><DoubleRightIcon
                color={currPage ===
                Math.ceil(
                  data?.filter((item) =>
                    item.name
                      .toLowerCase()
                      .startsWith(searchQuery.toLowerCase()),
                  ).length / workspacePerPage,
                )
                  ? "var(--border-secondary-200)"
                  : "white"}
              /></button
            >
          </th>
          <!-- <th class="tab-head px-0 ms-0"></th> -->
          <div></div>
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
    margin-left: 170px;
  }
  table {
    background-color: transparent;
  }
</style>
