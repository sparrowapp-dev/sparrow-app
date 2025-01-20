<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Observable } from "rxjs";
  import { PeopleIcon } from "@sparrow/library/assets";
  import { List } from "@sparrow/library/ui";

  export let data: Observable<any[]>;
  export let openTeam: any | null = null;
  export let OnWorkspaceSwitch: (id: string) => void;

  let workspaces: any[] = [];
  let subscription: any;

  // Subscribe to the Observable when it's passed in
  if (data && typeof data.subscribe === "function") {
    subscription = data.subscribe({
      next: (newData) => {
        workspaces = newData ? newData.slice() : [];
        workspaces.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      },
      error: (err) => {
        console.error("Error fetching workspaces:", err);
        workspaces = [];
      },
    });
  }

  // Ensure subscription is cleaned up
  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  // Get top 5 workspaces
  $: topFiveWorkspaces = workspaces.slice(0, 5);
</script>

<div class="d-flex justify-content-between p-3 pb-0">
  <h6 class="workspace-heading">Recent Workspaces</h6>
</div>

<div class="sidebar-workspace-list" style="flex:1; overflow:auto;">
  {#if workspaces.length === 0}
    <div class="text-center py-3">No recent workspaces</div>
  {:else}
    <List height={"100%"} overflowY={"auto"} classProps={"px-1 py-0"}>
      {#each topFiveWorkspaces as list, index}
        {#if index < 5}
          <div
            class="recentWorkspace-tab"
            on:click={() => OnWorkspaceSwitch(list._id)}
          >
            <div
              class="w-100 py-2 px-3 overflow-hidden rounded justify-content-between d-flex workspace-list-data"
            >
              <div
                class="overflow-hidden ellipsis rounded"
                style="width: 100%;"
              >
                <p
                  class="list-name mb-0 ellipsis overflow-hidden ellipsis"
                  style="font-size: 12px; font-weight:700"
                >
                  {list?.name || ""}
                </p>
                <p
                  class="team-name mb-0 title fw-bold ellipsis overflow-hidden"
                  style="font-size: 12px; color:var(--sparrow-text-color)"
                >
                  {list?.team?.teamName || ""}
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

<style>
  /* Previous styles remain the same */
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
