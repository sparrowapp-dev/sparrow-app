<script lang="ts">
  /**
   * @deprecated referes to teams store
   * import { openedTeam } from "@deprecate/store";
   **/
  import { navigate } from "svelte-navigator";
  import { PeopleIcon } from "@deprecate/assets/app.asset";
  import constants from "@deprecate/utils/constants";
  import { List } from "@sparrow/library/ui";
  import type { Team } from "@deprecate/utils/interfaces";
  export let openTeam: Team;
  export let data: any;
  export let handleWorkspaceSwitch: any,
    handleWorkspaceTab: any,
    activeSideBarTabMethods: any;
  /**
   * @deprecated referes to teams store
   * let currOpenedTeam: any;
   * const openedTeamSubscribe = openedTeam.subscribe((value) => {
   *   if (value) currOpenedTeam = value;
   * });
   * onDestroy(() => {
   *   openedTeamSubscribe();
   * });
   **/
  const handleOpenCollection = (workspace: any) => {
    handleWorkspaceSwitch(
      workspace._id,
      workspace.name,
      workspace.team.teamId,
      workspace.team.teamName,
      openTeam.logo,
    );
    handleWorkspaceTab(workspace._id, workspace.name, workspace.description);
    navigate("/dashboard/collections");
    activeSideBarTabMethods.updateActiveTab("collections");
  };
</script>

<section>
  <h6 class="teams-heading p-3 mb-0">Recent Workspace</h6>
  {#if $data}
    <List height={"calc((100vh - 230px) / 3)"} classProps={"px-3 py-0"}>
      {#each $data.slice().reverse() as list, index}
        {#if index < constants.WORKSPACE_LIMIT}
          <div class="pb-0" on:click={() => handleOpenCollection(list)}>
            <div
              class="recent-workspace-item py-1 px-2 overflow-hidden rounded justify-content-between d-flex"
            >
              <div
                class="overflow-hidden ellipsis"
                style="width: calc(100% - 30px);"
              >
                <p
                  class="mb-0 recent-workspace ellipsis overflow-hidden ellipsis"
                >
                  {list.name}
                </p>
                <span class="team-name ellipsis overflow-hidden"
                  >{list?.team?.teamName}</span
                >
              </div>
              <PeopleIcon
                color={openTeam?.teamId == list.team.teamId
                  ? "var(--sparrow-text-color)"
                  : "var(--defaultcolor)"}
                classProp={`${list.users.length <= 1 && "d-none"} my-auto me-1`}
              />
            </div>
          </div>
        {/if}
      {/each}
    </List>
  {/if}
</section>

<style>
  .teams-heading {
    font-size: 14px;
    font-weight: 700;
    line-height: 21px;
    overflow: auto;
  }
  .recent-workspace {
    font-size: 12px;
    color: #f5f5f5;
  }
  .recent-workspace-item:hover {
    background-color: var(--border-color);
    cursor: pointer;
  }
  .team-name {
    color: var(--request-arc);
  }
</style>
