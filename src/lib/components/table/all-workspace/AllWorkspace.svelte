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
  import { ShowMoreOptions } from "$lib/components";
  import type { CurrentTeam } from "$lib/utils/interfaces/team.interface";
  import { calculateTimeDifferenceInDays } from "$lib/utils/workspacetimeUtils";
  import { navigate } from "svelte-navigator";
  export let data: any;
  export let selectedTab: string;
  export let openedTeam: CurrentTeam,
    handleWorkspaceSwitch: any,
    activeSideBarTabMethods: any,
    handleWorkspaceTab: any;
  let isShowMoreVisible = undefined;
  let workspacePerPage: number = 10,
    currPage = 1;
  let filterText: string = "";
  const handleOpenCollection = (workspace) => {
    handleWorkspaceSwitch(
      workspace._id,
      workspace.name,
      openedTeam.id,
      openedTeam.name,
      openedTeam.base64String,
    );
    handleWorkspaceTab(workspace._id, workspace.name, workspace.description);
    navigate("/dashboard/collections");
    activeSideBarTabMethods.updateActiveTab("collections");
  };
  const handleShowMore = (index) => {
    isShowMoreVisible = index;
  };
  const closeShowMore = () => {
    isShowMoreVisible = undefined;
  };

  const menuItems = (workspace, index) => [
    {
      onClick: () => {
        handleOpenCollection(workspace);
        handleShowMore(index);
      },
      displayText: "Open Workspace",
      disabled: false,
    },
    {
      onClick: (e) => {
        e.stopPropagation();
      },
      displayText: "Rename Request",
      disabled: false,
    },
    {
      onClick: (e) => {
        e.stopPropagation();
      },
      displayText: "Delete",
      disabled: false,
    },
  ];

  const handleFilterTextChange = (e) => {
    filterText = e.target.value;
  };
  const handleEraseSearch = () => {
    filterText = "";
  };
  const rightClickContextMenu = (e, index) => {
    e.preventDefault();

    setTimeout(() => {
      isShowMoreVisible = index;
    }, 100);
  };
</script>

<svelte:window
  on:click={closeShowMore}
  on:contextmenu|preventDefault={closeShowMore}
/>
{#if selectedTab == "all-workspace"}
  <div class="ps-3">
    {#if $data && $data
        .slice()
        .filter((item) => item.team.teamId == openedTeam.id).length > 0}
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
    <div
      class="table-container sparrow-thin-scrollbar overflow-y-auto"
      style="max-height: 60vh; height: auto;"
    >
      <table
        class="table p-0 table-responsive bg-backgroundColor w-100"
        style="max-height: 100%;"
        data-search="true"
      >
        <thead
          class="position-sticky workspace-table-heading bg-backgroundColor top-0 z-2"
        >
          <tr class="">
            <th data-sortable="true" class="tab-head">Workspace</th>

            <th class="tab-head">Collections</th>
            <th class="tab-head">Last Updated</th>
            <th class="tab-head"></th>
          </tr>
        </thead>
        <tbody class="overflow-y-auto position-relative">
          {#if $data}
            {#each $data
              .slice()
              .reverse()
              .filter((item) => item.name
                    .toLowerCase()
                    .startsWith(filterText.toLowerCase()) && item.team.teamId == openedTeam.id)
              .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage) as list, index}
              <ShowMoreOptions
                showMenu={isShowMoreVisible == index}
                menuItems={menuItems(list, index)}
                rightDistance={9}
                topDistance={index * 8 + 3}
              />
              <tr
                class="workspace-list-item cursor-pointer overflow-hidden ellipsis w-100"
                on:contextmenu|preventDefault={(e) =>
                  rightClickContextMenu(e, index)}
                on:click={(e) => {
                  e.stopPropagation();
                  !isShowMoreVisible
                    ? handleOpenCollection(list)
                    : isShowMoreVisible && handleShowMore(index);
                }}
              >
                <td
                  style="max-width: 15vw; padding-right: 10px;"
                  class="tab-data rounded-start py-3 overflow-hidden ellipsis"
                  >{list?.name}</td
                >

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
                    on:click={(e) => {
                      handleShowMore(
                        isShowMoreVisible == index ? undefined : index,
                      );
                      e.stopPropagation();
                    }}><ShowMoreIcon /></button
                  ></td
                >
              </tr>
            {/each}
          {/if}
        </tbody>
        {#if $data
          .slice()
          .reverse()
          .filter((item) => item.name
                .toLowerCase()
                .startsWith(filterText.toLowerCase()) && item.team.teamId == openedTeam.id)
          .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage).length > 0}
          <tfoot class="position-sticky bottom-0">
            <tr>
              <th class="tab-head"
                >showing {(currPage - 1) * workspacePerPage + 1} - {Math.min(
                  currPage * workspacePerPage,
                  $data?.filter(
                    (item) =>
                      item.name
                        .toLowerCase()
                        .startsWith(filterText.toLowerCase()) &&
                      item.team.teamId == openedTeam.id,
                  ).length,
                )} of {$data?.filter(
                  (item) =>
                    item.name
                      .toLowerCase()
                      .startsWith(filterText.toLowerCase()) &&
                    item.team.teamId == openedTeam.id,
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
                            item.name
                              .toLowerCase()
                              .startsWith(filterText.toLowerCase()) &&
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
                          item.name
                            .toLowerCase()
                            .startsWith(filterText.toLowerCase()) &&
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
                          item.name
                            .toLowerCase()
                            .startsWith(filterText.toLowerCase()) &&
                          item.team.teamId == openedTeam.id,
                      ).length / workspacePerPage,
                    ))}
                  class="bg-transparent border-0"
                  ><DoubleRightIcon
                    color={currPage ===
                    Math.ceil(
                      $data?.filter(
                        (item) =>
                          item.name
                            .toLowerCase()
                            .startsWith(filterText.toLowerCase()) &&
                          item.team.teamId == openedTeam.id,
                      ).length / workspacePerPage,
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
        {/if}
      </table>
      {#if $data && $data
          .slice()
          .filter((item) => item.team.teamId == openedTeam.id).length == 0}
        <p class="not-found-text mt-3">Add Workspaces to this team</p>
      {:else if filterText !== "" && $data
          .slice()
          .reverse()
          .filter((item) => item.name
                .toLowerCase()
                .startsWith(filterText.toLowerCase()) && item.team.teamId == openedTeam.id)
          .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage).length == 0}
        <p class="not-found-text mt-3">No results found.</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .not-found-text {
    color: var(--request-arc);
    font-size: 16px;
    font-weight: 400;
    text-align: center;
  }

  .workspace-table-heading {
    background-color: var(--background-color) !important;
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

  .show-more-btn:active .workspace-list-item:active {
    background-color: red !important;
  }
  .workspace-list-item:active {
    background-color: var(--sparrow-input-slider-button) !important;
  }

  .workspace-list-item:hover {
    cursor: pointer !important;
    background-color: var(--border-color);
  }
</style>
