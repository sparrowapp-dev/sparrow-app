<script>
  import { PeopleIcon } from "$lib/assets/app.asset";
  import List from "@library/ui/list/List.svelte";
  import constants from "$lib/utils/constants";
  export let data;
  export let openTeam;

  console.log("Hello ji");
</script>

<section>
  <div class="d-flex justify-content-between p-3 pb-0">
    <h6 class="teams-heading">Recent Workspaces</h6>
  </div>
  <div class="sidebar-teams-list">
    {#if $data}
      <List max-height={"calc((100vh - 350px) / 3)"} classProps={"px-2 py-0"}>
        {#each $data.slice().reverse() as list, index}
          {#if index < constants.WORKSPACE_LIMIT}
            <!-- <div class="pb-0" on:click={() => handleOpenCollection(list)}> -->
            <div
              class=" py-2 px-3 overflow-hidden rounded justify-content-between d-flex"
            >
              <div
                class="overflow-hidden ellipsis"
                style="width: calc(100% - 30px);"
              >
                <p
                  class="mb-0 ellipsis overflow-hidden ellipsis"
                  style="font-size: 12px; font-weight:700"
                >
                  {list.name}
                </p>

                <p
                  class="team-name mb-0 title fw-bold ellipsis overflow-hidden"
                  style="font-size: 10px; color:var( --sparrow-text-color)"
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

            <!-- </div> -->
          {/if}
        {/each}
      </List>
    {/if}
  </div>
</section>
