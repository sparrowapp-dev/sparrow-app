<script lang="ts">
  import {
    SearchIcon,
    CrossIcon,
    DoubleLeftIcon,
    LeftIcon,
    RightIcon,
    DoubleRightIcon,
  } from "$lib/assets/app.asset";
  import { calculateTimeDifferenceInDays } from "$lib/utils/workspacetimeUtils";
  export let data: any;
  export let selectedTab: string;
  let workspacePerPage: number = 10,
    currPage = 1;
  let filterText: string = "";

  const handleFilterTextChange = (e) => {
    filterText = e.target.value;
  };
  const handleEraseSearch = () => {
    filterText = "";
  };
</script>

{#if selectedTab == "all-workspace"}
  <div class="ps-3">
    <div class={`d-flex search-input-container rounded py-2 px-2 mb-4`}>
      <SearchIcon width={14} height={14} classProp={`my-auto me-3`} />
      <input
        type="text"
        id="search-input"
        class={`bg-transparent w-100 border-0 my-auto`}
        placeholder="Search workspaces in John’s Team"
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
    <div class="table-container overflow-y-auto" style="height: 60vh;">
      <table
        class="table p-0 table-responsive bg-backgroundColor overflow-y-auto"
        data-search="true"
      >
        <thead class="position-sticky top-0 z-3">
          <tr>
            <th data-sortable="true" class="tab-head">Workspace</th>

            <th class="tab-head">Collections</th>
            <th class="tab-head">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {#if $data}
            {#each $data
              .slice()
              .reverse()
              .filter((item) => item.name.startsWith(filterText))
              .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage) as list, index}
              <tr>
                <td class="tab-data py-3">{list?.name}</td>

                <td class="tab-data py-3"
                  >{list?.collections?.length ? list.collections.length : 0}</td
                >
                <td class="tab-data py-3"
                  >{calculateTimeDifferenceInDays(
                    new Date(),
                    new Date(list?.createdAt),
                  )}</td
                >
              </tr>
            {/each}
          {/if}
        </tbody>
        <tfoot class="position-sticky bottom-0 z-3">
          <tr>
            <th class="tab-head"
              >showing {(currPage - 1) * workspacePerPage + 1} - {Math.min(
                currPage * workspacePerPage,
                $data?.filter((item) => item.name.startsWith(filterText))
                  .length,
              )} of {$data?.filter((item) => item.name.startsWith(filterText))
                .length}
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
                      $data?.filter((item) => item.name.startsWith(filterText))
                        .length / workspacePerPage,
                    )
                  )
                    currPage += 1;
                }}
                class="bg-transparent border-0"
                ><RightIcon
                  color={currPage ===
                  Math.ceil(
                    $data?.filter((item) => item.name.startsWith(filterText))
                      .length / workspacePerPage,
                  )
                    ? "#313233"
                    : "white"}
                /></button
              >
              <button
                on:click={() =>
                  (currPage = Math.ceil(
                    $data?.filter((item) => item.name.startsWith(filterText))
                      .length / workspacePerPage,
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
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
{/if}

<style>
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
  .search-input-container:focus-within svg {
    visibility: hidden;
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
</style>
