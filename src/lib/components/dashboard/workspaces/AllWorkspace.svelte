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
  import { ShowMoreOptions, UserProfileList } from "$lib/components";
  import type { TeamDocument } from "$lib/database/app.database";
  import { WorkspaceMemberRole } from "$lib/utils/enums";
  import type { CurrentTeam } from "$lib/utils/interfaces/team.interface";
  import { calculateTimeDifferenceInDays } from "$lib/utils/workspacetimeUtils";
  import type { Observable } from "rxjs";
  import { navigate } from "svelte-navigator";
  import Table from "../../table/Table.svelte";
  import Rows from "../rows/Rows.svelte";

  export let userId: string;
  export let data: any;
  export let selectedTab: string;
  export let openedTeam: CurrentTeam;
  export let handleWorkspaceSwitch: any;
  export let activeSideBarTabMethods: any;
  export let handleWorkspaceTab: any;
  export let currOpenedTeamRxDoc: Observable<TeamDocument>;
  export let userType;

  let isShowMoreVisible = undefined;
  let workspacePerPage: number = 10,
    currPage = 1;
  let filterText: string = "";
  let containerRef;
  let pos = { x: 0, y: 0 };
  let showMenu: boolean = false;
  const tableHeaderContent = [
    "Workspace",
    "Collections",
    "Contributors",
    "Last Updated",
    "",
  ];
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
      visible: true,
    },
    {
      onClick: (e) => {
        e.stopPropagation();
      },
      displayText: "Add Members",
      disabled: false,
      visible:
        $currOpenedTeamRxDoc?._data?.admins?.includes(userId) ||
        $currOpenedTeamRxDoc?._data?.owner == userId,
    },
    {
      onClick: (e) => {
        e.stopPropagation();
      },
      displayText: "Delete",
      disabled: false,
      visible:
        $currOpenedTeamRxDoc?._data?.admins?.includes(userId) ||
        $currOpenedTeamRxDoc?._data?.owner == userId,
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
      const containerRect = containerRef?.getBoundingClientRect();
      const mouseX = e.clientX - (containerRect?.left || 0);
      const mouseY = e.clientY - (containerRect?.top || 0);
      pos = { x: mouseX, y: mouseY + 20 };
      showMenu = true;
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
      style="max-height: calc(100vh - 355px); height: auto;"
    >
      <Table
        tableClassProps="table p-0 table-responsive bg-backgroundColor w-100"
        tableStyleProp="max-height: 100%;"
        dataSearch="true"
        tableHeaderClassProp="position-sticky bg-backgroundColor top-0 z-2"
        tableHeaderStyleProp={"background-color: var(--background-color) !important;"}
        contributorsCount={$currOpenedTeamRxDoc?._data?.users?.length}
        headerObject={tableHeaderContent}
      >
        <tbody class="overflow-y-auto position-relative z-0">
          {#if $data}
            {#each $data
              .slice()
              .reverse()
              .filter((item) => item.name
                    .toLowerCase()
                    .startsWith(filterText.toLowerCase()) && item.team.teamId == openedTeam.id)
              .sort((a, b) => a.name.localeCompare(b.name))
              .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage) as list, index}
              <Rows
                {list}
                {currOpenedTeamRxDoc}
                {handleOpenCollection}
                {calculateTimeDifferenceInDays}
                {WorkspaceMemberRole}
                {userType}
              />
            {/each}
          {/if}
        </tbody>
      </Table>

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

    {#if $data
      .slice()
      .reverse()
      .filter((item) => item.name
            .toLowerCase()
            .startsWith(filterText.toLowerCase()) && item.team.teamId == openedTeam.id)
      .slice((currPage - 1) * workspacePerPage, currPage * workspacePerPage).length > 0}
      <table class="w-100">
        <tfoot class="bottom-0">
          <tr class="d-flex justify-content-between">
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
            <th class="tab-head" style="">
              <button
                on:click={() => (currPage = 1)}
                class="bg-transparent border-0"
                ><DoubleLeftIcon
                  color={currPage === 1 ? "var(--border-color)" : "white"}
                /></button
              >
              <button
                on:click={() => {
                  if (currPage > 1) currPage -= 1;
                }}
                class="bg-transparent border-0"
                ><LeftIcon
                  color={currPage === 1 ? "var(--border-color)" : "white"}
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
                    ? "var(--border-color)"
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
                    ? "var(--border-color)"
                    : "white"}
                /></button
              >
            </th>
            <th class="tab-head px-5 ms-5"></th>
          </tr>
        </tfoot>
      </table>
    {/if}
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
  table {
    background-color: transparent;
  }
</style>
