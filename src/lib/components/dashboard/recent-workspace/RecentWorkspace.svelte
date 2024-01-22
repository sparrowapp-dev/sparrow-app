<script lang="ts">
  import { openedTeam } from "$lib/store";
  import { navigate } from "svelte-navigator";
  import { onDestroy } from "svelte";
  import { PeopleIcon } from "$lib/assets/app.asset";
  import constants from "$lib/utils/constants";
  export let data: any;
  export let handleWorkspaceSwitch: any,
    handleWorkspaceTab: any,
    activeSideBarTabMethods: any;
  let currOpenedTeam: any;
  const openedTeamSubscribe = openedTeam.subscribe((value) => {
    if (value) currOpenedTeam = value;
  });
  onDestroy(() => {
    openedTeamSubscribe();
  });
  const handleOpenCollection = (workspace: any) => {
    handleWorkspaceSwitch(
      workspace._id,
      workspace.name,
      workspace.team.teamId,
      workspace.team.teamName,
      currOpenedTeam.base64String,
    );
    handleWorkspaceTab(workspace._id, workspace.name, workspace.description);
    navigate("/dashboard/collections");
    activeSideBarTabMethods.updateActiveTab("collections");
  };
</script>

<section class="p-1">
  <h6 class="teams-heading">Recent Workspace</h6>
  {#if $data}
    {#each $data.slice().reverse() as list, index}
      {#if index < constants.WORKSPACE_LIMIT}
        <div class="pb-1" on:click={() => handleOpenCollection(list)}>
          <div
            class="recent-workspace-item p-1 overflow-hidden ps-2 rounded justify-content-between d-flex"
          >
            <div class="overflow-hidden ellipsis">
              <p class="mb-0 recent-workspace ellipsis overflow-hidden">
                {list.name}
              </p>
              <span class="team-name ellipsis overflow-hidden"
                >{list.team.teamName ? list.team.teamName : ""}</span
              >
            </div>
            <PeopleIcon
              color={currOpenedTeam.id == list.team.teamId
                ? "#8A9299"
                : "#45494D"}
              classProp={`${list.users.length <= 1 && "d-none"} my-auto me-1`}
            />
          </div>
        </div>
      {/if}
    {/each}
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
