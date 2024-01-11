<script lang="ts">
  import {
    SearchIcon,
    CrossIcon,
    DoubleLeftIcon,
    LeftIcon,
    RightIcon,
    DoubleRightIcon,
    ShowMoreIcon,
  } from "$lib/assets/app.asset";
  import type { CurrentTeam } from "$lib/utils/interfaces/team.interface";
  import { calculateTimeDifferenceInDays } from "$lib/utils/workspacetimeUtils";
  export let data: any;
  export let selectedTab: string;
  export let openedTeam: CurrentTeam;
  let workspacePerPage: number = 10,
    currPage = 1;
  let filterText: string = "";
  let currTeam = {
    teamId: "",
    teamName: "",
  };
  const handleFilterTextChange = (e) => {
    filterText = e.target.value;
  };
  const handleEraseSearch = () => {
    filterText = "";
  };
</script>

{#if selectedTab == "all-workspace"}
  <div class="ps-3">
    {#if $data && $data.length > 0}
      <div class={`d-flex search-input-container rounded py-2 px-2 mb-4`}>
        <SearchIcon width={14} height={14} classProp={`my-auto me-3`} />
        <input
          type="text"
          id="search-input"
          class={`bg-transparent w-100 border-0 my-auto`}
          placeholder="Search workspaces in {openedTeam.name}"
          bind:value={filterText}
          on:input={(e) => handleFilterTextChange(e)}
        />
        {#if filterText !== ""}
          <button
            class="border-0 bg-transparent ms-2"
            on:click={handleEraseSearch}
          >
            <CrossIcon color="#45494D" />
          </button>
        {/if}
      </div>
    {/if}
    <div class="table-container overflow-y-auto" style="height: 60vh;">
      <table
        class="table p-0 table-responsive bg-backgroundColor overflow-y-auto"
        data-search="true"
      >
        <thead class="position-sticky top-0">
          <tr class="">
            <th data-sortable="true" class="tab-head">Workspace</th>

            <th class="tab-head">Collections</th>
            <th class="tab-head">Last Updated</th>
            <th class="tab-head"></th>
          </tr>
        </thead>
        <tbody>
          {#if $data}
            {#each $data
              .slice()
              .reverse()
              .filter((item) => item.name.startsWith(filterText) && item.team.teamId == openedTeam.id)
              .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage) as list, index}
              <tr class="workspace-list-item cursor-pointer">
                <td class="tab-data rounded-start py-3">{list?.name}</td>

                <td class="tab-data py-3"
                  >{list?.collections?.length ? list.collections.length : 0}</td
                >
                <td class="tab-data py-3"
                  >{calculateTimeDifferenceInDays(
                    new Date(),
                    new Date(list?.createdAt),
                  )}</td
                >
                <td class="tab-data rounded-end py-3"
                  ><button
                    class="show-more-btn rounded border-0"
                    on:click={(e) => e.stopPropagation()}
                    ><ShowMoreIcon /></button
                  ></td
                >
              </tr>
            {/each}
          {/if}
        </tbody>
        {#if $data
          .slice()
          .reverse()
          .filter((item) => item.name.startsWith(filterText) && item.team.teamId == openedTeam.id)
          .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage).length > 0}
          <tfoot class="position-sticky bottom-0 z-0">
            <tr>
              <th class="tab-head"
                >showing {(currPage - 1) * workspacePerPage + 1} - {Math.min(
                  currPage * workspacePerPage,
                  $data
                    ?.filter(
                      (item) =>
                        item.name.startsWith(filterText) &&
                        item.team.teamId == openedTeam.id,
                    )
                    .slice(
                      (currPage - 1) * workspacePerPage,
                      currPage * workspacePerPage,
                    ).length,
                )} of {$data
                  ?.filter(
                    (item) =>
                      item.name.startsWith(filterText) &&
                      item.team.teamId == openedTeam.id,
                  )
                  .slice(
                    (currPage - 1) * workspacePerPage,
                    currPage * workspacePerPage,
                  ).length}
              </th>
              <th class="tab-head gap-2">
                <button
                  on:click={() => (currPage = 1)}
                  class="bg-transparent border-0"
                  ><DoubleLeftIcon
                    color={currPage === 1 ? "#313233" : "white"}
                  /></button
                >
                <button
                  on:click={() => {
                    if (currPage > 1) currPage -= 1;
                  }}
                  class="bg-transparent border-0"
                  ><LeftIcon
                    color={currPage === 1 ? "#313233" : "white"}
                  /></button
                >
                <button
                  on:click={() => {
                    if (
                      currPage <
                      Math.ceil(
                        $data?.filter(
                          (item) =>
                            item.name.startsWith(filterText) &&
                            item.team.teamId == openedTeam.id,
                        ).length / workspacePerPage,
                      )
                    )
                      currPage += 1;
                  }}
                  class="bg-transparent border-0"
                  ><RightIcon
                    color={currPage ===
                    Math.ceil(
                      $data?.filter(
                        (item) =>
                          item.name.startsWith(filterText) &&
                          item.team.teamId == openedTeam.id,
                      ).length / workspacePerPage,
                    )
                      ? "#313233"
                      : "white"}
                  /></button
                >
                <button
                  on:click={() =>
                    (currPage = Math.ceil(
                      $data?.filter(
                        (item) =>
                          item.name.startsWith(filterText) &&
                          item.team.teamId == openedTeam.id,
                      ).length / workspacePerPage,
                    ))}
                  class="bg-transparent border-0"
                  ><DoubleRightIcon
                    color={currPage ===
                    Math.ceil(
                      $data?.filter((item) => item.name.startsWith(filterText))
                        .length / workspacePerPage,
                    )
                      ? "#313233"
                      : "white"}
                  /></button
                >
              </th>
              <th class="tab-head"></th>
              <th class="tab-head"></th>
            </tr>
          </tfoot>
        {:else}
          <p class="not-found-text mt-3">No results found.</p>
        {/if}
      </table>
    </div>
  </div>
{/if}

<style>
  .not-found-text {
    color: var(--request-arc);
    font-size: 16px;
    font-weight: 400;
  }
  .table-container::-webkit-scrollbar {
    width: 2px;
  }
  .table-container::-webkit-scrollbar-thumb {
    background: #888;
  }
  .search-input-container {
    border: 1px solid var(--border-color);
    background: var(--background-color);
    width: 27vw;
    font-size: 12px;
  }
  .search-input-container > input:focus {
    outline: none;
    caret-color: var(--workspace-hover-color);
  }
  .search-input-container:focus-within {
    border: 1px solid var(--workspace-hover-color);
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
    color: #8a9299;
    background-color: transparent;
  }

  .table {
    overflow: auto;
  }
  .table thead,
  .table tfoot {
    background-color: var(--background-color);
  }

  .workspace-row:hover {
    background-color: var(--border-color);
  }
  .show-more-btn {
    background-color: transparent;
  }
  .show-more-btn:hover {
    background-color: var(--background-color);
  }
  .show-more-btn:active {
    background-color: var(--workspace-hover-color);
  }
  .show-more-btn:active .workspace-list-item {
    background-color: var(--border-color) !important;
  }
  .workspace-list-item:active {
    background-color: var(--sparrow-input-slider-button) !important;
  }

  .workspace-list-item:hover {
    cursor: pointer !important;
    background-color: var(--border-color);
  }
</style>
