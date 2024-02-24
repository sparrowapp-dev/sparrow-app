<script lang="ts">
  import WorkspaceGrid from "../workspace-grid/WorkspaceGrid.svelte";
  import {
    CrossIcon,
    DoubleLeftIcon,
    DoubleRightIcon,
    LeftIcon,
    RightIcon,
    SearchIcon,
  } from "$lib/assets/app.asset";
  import type { CurrentTeam, Team } from "$lib/utils/interfaces";
  import type {
    TeamDocument,
    WorkspaceDocument,
  } from "$lib/database/app.database";
  import Button from "$lib/components/buttons/Button.svelte";
  import { TeamViewModel } from "../../../../pages/Teams/team.viewModel";
  import type { Observable } from "rxjs";

  export let userId: string;
  export let currActiveTeam: CurrentTeam;
  export let handleWorkspaceTab: any;
  export let activeSideBarTabMethods: any;
  export let handleCreateWorkspace: any;
  export let workspaces: WorkspaceDocument[] = [];
  export let handleWorkspaceSwitch: any;
  export let openTeam: Team;
  export let workspaceUnderCreation = false;

  const _viewModel = new TeamViewModel();
  const openTeamObservable: Observable<TeamDocument> = _viewModel.openTeam;

  let filterText = "";
  let workspacePerPage = 5;
  let currPage = 1;
  let isAdminOrOwner: boolean;

  openTeamObservable.subscribe((openTeam) => {
    currPage = 1;
    if (!(openTeam?.admins?.includes(userId) || openTeam?.owner == userId)) {
      workspacePerPage = 6;
      isAdminOrOwner = false;
    } else {
      workspacePerPage = 5;
      isAdminOrOwner = true;
    }
  });

  const handleFilterTextChange = (e) => {
    filterText = e.target.value;
  };
  const handleEraseSearch = () => {
    filterText = "";
  };
</script>

<div class="p-2">
  {#if workspaces && workspaces.slice().reverse().length > 0}
    <div class={`d-flex search-input-container rounded py-2 px-2 mb-4`}>
      <SearchIcon width={14} height={14} classProp={`my-auto me-3`} />
      <input
        type="text"
        id="search-input"
        class={`bg-transparent w-100 border-0 my-auto`}
        placeholder="Search workspaces in {openTeam?.name}"
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
  <div>
    <div
      class="d-flex flex-wrap gap-5 row-gap-0 overflow-y-auto sparrow-thin-scrollbar"
      style="max-height: 59vh; height: auto;"
    >
      {#if filterText !== "" && workspaces
          .slice()
          .reverse()
          .filter((item) => item.name
              .toLowerCase()
              .includes(filterText.toLowerCase())).length == 0}
        <span class="not-found-text mx-auto ellipsis">No results found.</span>
      {/if}
      {#if currPage === 1 && filterText === "" && (openTeam?.admins?.includes(userId) || openTeam?.owner == userId)}
        <Button
          disable={workspaceUnderCreation}
          loader={workspaceUnderCreation}
          title={`+ Add New Workspace`}
          type="other"
          buttonClassProp={`rounded sparrow-fs-16 col-lg-5 col-md-10 flex-grow-1 py-0 mb-4 add-new-workspace`}
          onClick={handleCreateWorkspace}
        />
      {/if}
      {#each workspaces
        .slice()
        .reverse()
        .filter((item) => typeof item.name === "string" && item.name
              .toLowerCase()
              .includes(filterText.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice((currPage - 1) * workspacePerPage - (currPage > 1 ? 1 : 0), currPage * workspacePerPage - (currPage > 1 ? 1 : 0)) as workspace, index}
        <WorkspaceGrid
          {isAdminOrOwner}
          {workspace}
          {handleWorkspaceSwitch}
          {currActiveTeam}
          {openTeam}
          {handleWorkspaceTab}
          {activeSideBarTabMethods}
        />
      {/each}
    </div>
    {#if !workspaces || workspaces
        .slice()
        .reverse()
        .filter((item) => typeof item.name === "string" && item.name
              .toLowerCase()
              .includes(filterText.toLowerCase())).length > 0}
      <div
        class="justify-content-between bottom-0 position-absolute w-75 bg-backgroundColor d-flex"
      >
        <div class="tab-head">
          showing {(currPage - 1) * workspacePerPage + (currPage == 1 ? 1 : 0)} -
          {Math.min(
            currPage * workspacePerPage - (currPage > 1 ? 1 : 0),
            workspaces
              .slice()
              .reverse()
              ?.filter(
                (item) =>
                  typeof item.name === "string" &&
                  item.name.toLowerCase().startsWith(filterText.toLowerCase()),
              ).length,
          )} of {workspaces
            .slice()
            .reverse()
            ?.filter(
              (item) =>
                typeof item.name === "string" &&
                item.name?.toLowerCase().startsWith(filterText.toLowerCase()),
            ).length}
        </div>
        <div class="tab-head tab-change">
          <button
            on:click={() => (
              (currPage = 1),
              (workspacePerPage = currPage > 1 || !isAdminOrOwner ? 6 : 5)
            )}
            class="bg-transparent border-0"
            ><DoubleLeftIcon
              color={currPage === 1 ? "#313233" : "white"}
            /></button
          >
          <button
            on:click={() => {
              if (currPage > 1) currPage -= 1;
              workspacePerPage = currPage > 1 || !isAdminOrOwner ? 6 : 5;
            }}
            class="bg-transparent border-0"
            ><LeftIcon color={currPage === 1 ? "#313233" : "white"} /></button
          >
          <button
            disabled={workspaces
              .slice()
              .reverse()
              ?.filter(
                (item) =>
                  typeof item.name === "string" &&
                  item.name?.toLowerCase().startsWith(filterText.toLowerCase()),
              ).length %
              6 ===
              0 &&
            currPage ===
              Math.ceil(
                workspaces
                  .slice()
                  .reverse()
                  ?.filter(
                    (item) =>
                      typeof item.name === "string" &&
                      item.name
                        .toLowerCase()
                        .startsWith(filterText.toLowerCase()),
                  ).length / workspacePerPage,
              )
              ? true
              : false}
            on:click={() => {
              if (
                currPage <
                Math.ceil(
                  workspaces
                    .slice()
                    .reverse()
                    ?.filter(
                      (item) =>
                        typeof item.name === "string" &&
                        item.name
                          .toLowerCase()
                          .startsWith(filterText.toLowerCase()),
                    ).length / workspacePerPage,
                )
              )
                currPage += 1;
              workspacePerPage = currPage > 1 || !isAdminOrOwner ? 6 : 5;
            }}
            class="bg-transparent border-0"
            ><RightIcon
              color={currPage ===
              Math.ceil(
                workspaces
                  .slice()
                  .reverse()
                  ?.filter(
                    (item) =>
                      typeof item.name === "string" &&
                      item.name
                        .toLowerCase()
                        .startsWith(filterText.toLowerCase()),
                  ).length / workspacePerPage,
              )
                ? "#313233"
                : "white"}
            /></button
          >
          <button
            on:click={() => {
              currPage = Math.ceil(
                workspaces
                  .slice()
                  .reverse()
                  ?.filter(
                    (item) =>
                      typeof item.name === "string" &&
                      item.name
                        .toLowerCase()
                        .startsWith(filterText.toLowerCase()),
                  ).length / workspacePerPage,
              );
              if (
                workspaces
                  .slice()
                  .reverse()
                  ?.filter(
                    (item) =>
                      typeof item.name === "string" &&
                      item.name
                        ?.toLowerCase()
                        .startsWith(filterText.toLowerCase()),
                  ).length %
                  6 !==
                0
              ) {
                workspacePerPage = currPage > 1 || !isAdminOrOwner ? 6 : 5;
              }
              if (
                currPage - 1 ===
                Math.ceil(
                  workspaces
                    .slice()
                    .reverse()
                    ?.filter(
                      (item) =>
                        typeof item.name === "string" &&
                        item.name
                          .toLowerCase()
                          .startsWith(filterText.toLowerCase()),
                    ).length / workspacePerPage,
                )
              ) {
                currPage -= 1;
              }
            }}
            class="bg-transparent border-0"
            ><DoubleRightIcon
              color={currPage ===
              Math.ceil(
                workspaces
                  .slice()
                  .reverse()
                  ?.filter(
                    (item) =>
                      typeof item.name === "string" &&
                      item.name
                        .toLowerCase()
                        .startsWith(filterText.toLowerCase()),
                  ).length / workspacePerPage,
              )
                ? "#313233"
                : "white"}
            /></button
          >
        </div>
        <div></div>
      </div>
    {/if}
  </div>
</div>

<style>
  .tab-head {
    padding: 8px;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    color: #8a9299;
    background-color: transparent;
  }
  .tab-change {
    margin-right: 120px;
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

  :global(.add-new-workspace) {
    border: 2px dashed var(--gradiant-2, #6147ff);
    background: var(
      --gradiant-2,
      linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%)
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    max-width: 47.5%;
    max-height: 32%;
  }

  :global(.add-new-workspace.empty) {
    max-width: 80%;
  }
  :global(.add-new-workspace:hover) {
    border: 2px dashed var(--workspace-hover-color);
    background: var(--dull-background-color);
    color: var(--workspace-hover-color);
    background-clip: initial;
    -webkit-background-clip: initial;
    -webkit-text-fill-color: initial;
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
