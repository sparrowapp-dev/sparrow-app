<script lang="ts">
  import {
    DoubleLeftIcon,
    DoubleRightIcon,
    LeftIcon,
    RightIcon,
  } from "$lib/assets/app.asset";
  import type { Team } from "$lib/utils/interfaces";
  import type { WorkspaceDocument } from "@app/database/database";
  import Button from "@library/ui/button/Button.svelte";
  import { WorkspaceGrid } from "@teams/common/compopnents";

  /**
   * Id of current user
   */
  export let userId: string;
  /**
   * Array of all the workspaces from local DB
   */
  export let workspaces: WorkspaceDocument[] = [];
  /**
   * Currently active team
   */
  export let openTeam: Team;
  /**
   * Callback for creating new workspace
   */
  export let onCreateNewWorkspace;
  /**
   * Callback for switching the workspace
   */
  export let onSwitchWorkspace: (id: string) => void;

  let filterText = "";
  let workspacePerPage = 5;
  let currPage = 1;
  let isAdminOrOwner: boolean;
</script>

<div class="h-100 pb-2">
  <div class="d-flex flex-column h-100">
    <div class="sparrow-thin-scrollbar" style="flex:1; overflow:auto;">
      <div class="d-flex flex-wrap gap-5 justify-content-between row-gap-0">
        {#if filterText !== "" && workspaces
            .slice()
            .reverse()
            .filter((item) => item.name
                .toLowerCase()
                .includes(filterText.toLowerCase())).length == 0}
          <span class="not-found-text mx-auto ellipsis">No results found.</span>
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
            {workspace}
            {onSwitchWorkspace}
            isAdminOrOwner={true}
          />
        {/each}
        {#if currPage === 1 && filterText === "" && (openTeam?.admins?.includes(userId) || openTeam?.owner == userId)}
          <Button
            title={`+ Add New Workspace`}
            type="other"
            buttonClassProp={`sparrow-fs-16 col-lg-5 col-md-10 flex-grow-1 py-0 mb-4 add-new-workspace`}
            buttonStyleProp={"min-height: 132px;"}
            onClick={onCreateNewWorkspace}
          />
          <!-- update later the above width -->
        {/if}
      </div>
    </div>
    {#if !workspaces || workspaces
        .slice()
        .reverse()
        .filter((item) => typeof item.name === "string" && item.name
              .toLowerCase()
              .includes(filterText.toLowerCase())).length > 0}
      <div class="justify-content-between bottom-0 w-75 d-flex">
        <div class="tab-head">
          Showing {(currPage - 1) * workspacePerPage + (currPage == 1 ? 1 : 0)} -
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
              color={currPage === 1 ? "var(--border-secondary-200)" : "white"}
            /></button
          >
          <button
            on:click={() => {
              if (currPage > 1) currPage -= 1;
              workspacePerPage = currPage > 1 || !isAdminOrOwner ? 6 : 5;
            }}
            class="bg-transparent border-0"
            ><LeftIcon
              color={currPage === 1 ? "var(--border-secondary-200)" : "white"}
            /></button
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
                ? "var(--border-secondary-200)"
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
                ? "var(--border-secondary-200)"
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
    color: var(--text-secondary-200);
    background-color: transparent;
  }
  .tab-change {
    margin-left: 170px;
  }

  :global(.add-new-workspace) {
    border: 2px dashed var(--gradiant-2, var(--border-primary-300));
    background: var(
      --gradiant-2,
      linear-gradient(270deg, var(--bg-primary-300) -1.72%, #1193f0 100%)
    );
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
    border: 2px dashed var(--border-primary-300);
    background: var(--bg-tertiary-600);
    color: var(--text-primary-300);
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
