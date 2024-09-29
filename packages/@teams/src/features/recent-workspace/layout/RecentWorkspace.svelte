<script lang="ts">
  import { PeopleIcon } from "@deprecate/assets/app.asset";
  import { List } from "@sparrow/library/ui";
  import constants from "@app/constants/constants";
  export let data;
  export let openTeam;
  export let OnWorkspaceSwitch;
</script>

<!-- <section class="d-flex flex-column h-100"> -->
<div class="d-flex justify-content-between p-3 pb-0">
  <h6 class="workspace-heading">Recent Workspaces</h6>
</div>
<div class="sidebar-workspace-list" style="flex:1; overflow:auto;">
  {#if $data}
    <List height={"100%"} overflowY={"auto"} classProps={"px-1 py-0"}>
      {#each $data.slice().reverse() as list, index}
        {#if index < constants.WORKSPACE_LIMIT}
          <div
            class="recentWorkspace-tab"
            on:click={() => OnWorkspaceSwitch(list._id)}
          >
            <div
              class=" w-100 py-2 px-3 overflow-hidden rounded justify-content-between d-flex workspace-list-data"
            >
              <div
                class="overflow-hidden ellipsis rounded"
                style="width: 100%;"
              >
                <p
                  class="list-name mb-0 ellipsis overflow-hidden ellipsis"
                  style="font-size: 12px; font-weight:700"
                >
                  {list.name}
                </p>

                <p
                  class="team-name mb-0 title fw-bold ellipsis overflow-hidden"
                  style="font-size: 12px; color:var( --sparrow-text-color)"
                >
                  {list?.team?.teamName}
                </p>
              </div>

              <PeopleIcon
                color={openTeam?.teamId !== list.team.teamId
                  ? "var(--sparrow-text-color)"
                  : "var(--defaultcolor)"}
                classProp={`${list.users.length <= 1 && "d-none"} my-2 me-1`}
              />
            </div>
          </div>
        {/if}
      {/each}
    </List>
  {/if}
</div>

<!-- </section> -->

<style>
  .sidebar-workspace-list::-webkit-scrollbar-thumb {
    background-color: var(--bg-secondary-330);
  }

  .sidebar-workspace-list::-webkit-scrollbar-button {
    color: var(--bg-secondary-330);
  }

  .workspace-heading {
    margin-left: 5px;
    font-size: 14px;
    font-weight: 600;
    line-height: 21px;
  }
  .workspace-list-data:hover {
    background-color: var(--bg-tertiary-750);
    cursor: pointer;
  }
  .workspace-list-data:active {
    background-color: var(--bg-secondary-320);
    cursor: pointer;
  }

  .title {
    width: calc(100% - 40px);
    text-align: left;
  }

  .team-name {
    align-self: stretch !important;
    font-weight: 400 !important;
  }
</style>
