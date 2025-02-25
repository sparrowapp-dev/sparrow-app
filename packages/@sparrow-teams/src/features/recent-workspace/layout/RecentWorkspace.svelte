<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Observable } from "rxjs";
  import { PeopleIcon } from "@sparrow/library/assets";
  import { List } from "@sparrow/library/ui";
  import { PeopleRegular } from "@sparrow/library/icons";

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

<div class="d-flex justify-content-between pb-0">
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
            tabindex="0"
            class="recentWorkspace-tab"
            on:click={() => OnWorkspaceSwitch(list._id)}
          >
            <div
              class="w-100 py-2 px-3 overflow-hidden rounded justify-content-between d-flex workspace-list-data"
            >
              <div
                class="overflow-hidden ellipsis"
                style="width: 100%; height:22["
              >
                <p
                  class="list-name mb-0 ellipsis overflow-hidden ellipsis"
                  style="font-size: 12px; font-weight:500; line-height:18px; color:var(--text-ds-neutral-50);"
                >
                  {list?.name || ""}
                </p>
                <p
                  class="team-name mb-0 title fw-bold ellipsis overflow-hidden"
                  style="font-size: 12px; border-radius:0; font-weight:400; line-height:18px;"
                >
                  {list?.team?.teamName || ""}
                </p>
              </div>

              <span class={`${list.users.length <= 1 && "d-none"} my-2 me-1`}>
                <PeopleRegular size={"16px"} />
              </span>
            </div>
          </div>
        {/if}
      {/each}
    </List>
  {/if}
</div>
<hr
  class=" pb-0"
  style="margin-left: 10px; margin-top:12px; margin-bottom:12px;"
/>

<style>
  /* Previous styles remain the same */
  .sidebar-workspace-list::-webkit-scrollbar-thumb {
    background-color: var(--bg-secondary-330);
  }

  .sidebar-workspace-list::-webkit-scrollbar-button {
    color: var(--bg-secondary-330);
  }

  .recentWorkspace-tab {
    background-color: transparent;
    border: 2px solid transparent;
  }
  .recentWorkspace-tab:hover {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
  }
  .recentWorkspace-tab:focus-visible {
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
  }
  .recentWorkspace-tab:active {
    background-color: var(--bg-ds-surface-500);
    border-radius: 4px;
  }

  .workspace-heading {
    padding: 6px;
    padding-left: 15px;
    font-size: 14px;
    font-weight: 400;
    line-height: 20.02px;
    color: var(--text-ds-neutral-300);
    margin-bottom: 0;
  }
  .workspace-list-data {
    height: 48px;
    border-radius: 4px;
    padding: 4px;
    padding-left: 10px;
    margin-bottom: 2px;
  }
  .workspace-list-data:hover {
    background-color: var(--bg-ds-surface-400);
    cursor: pointer;
  }

  .workspace-list-data:active {
    background-color: var(--bg-ds-surface-500);
    cursor: pointer;
  }

  .title {
    width: calc(100% - 40px);
    text-align: left;
    color: red;
  }

  .team-name {
    align-self: stretch !important;
    font-weight: 400 !important;
    color: var(--text-ds-neutral-200);
  }
</style>
